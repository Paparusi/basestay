// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title Simple Property Registry
 * @dev Registry for properties on BaseStay platform with USDC payments only
 */
contract SimplePropertyRegistry is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    struct Property {
        uint256 tokenId;
        address owner;
        string metadataURI; // IPFS metadata
        uint256 pricePerNight; // in USDC (6 decimals)
        bool isActive;
        uint256 createdAt;
    }
    
    // State variables
    uint256 private _nextTokenId = 1;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerProperties;
    
    // Platform fees
    uint256 public platformFee = 500; // 5% in basis points (500/10000)
    address public feeCollector;
    
    // Events
    event PropertyListed(
        uint256 indexed tokenId,
        address indexed owner,
        string metadataURI,
        uint256 pricePerNight
    );
    event PropertyUpdated(uint256 indexed tokenId, uint256 pricePerNight);
    event PropertyDeactivated(uint256 indexed tokenId);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
    
    constructor(address _feeCollector) ERC721("BaseStay Property", "BSP") {
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev List a new property (simplified - no BST staking required)
     */
    function listProperty(
        string memory metadataURI,
        uint256 pricePerNight
    ) external nonReentrant returns (uint256) {
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        require(pricePerNight > 0, "Price must be greater than 0");
        
        uint256 tokenId = _nextTokenId++;
        
        // Mint the property NFT to the owner
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Create property record
        properties[tokenId] = Property({
            tokenId: tokenId,
            owner: msg.sender,
            metadataURI: metadataURI,
            pricePerNight: pricePerNight,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Track owner's properties
        ownerProperties[msg.sender].push(tokenId);
        
        emit PropertyListed(tokenId, msg.sender, metadataURI, pricePerNight);
        
        return tokenId;
    }
    
    /**
     * @dev Update property price
     */
    function updatePropertyPrice(uint256 tokenId, uint256 newPrice) external {
        require(_exists(tokenId), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(newPrice > 0, "Price must be greater than 0");
        require(properties[tokenId].isActive, "Property not active");
        
        properties[tokenId].pricePerNight = newPrice;
        emit PropertyUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Deactivate property
     */
    function deactivateProperty(uint256 tokenId) external {
        require(_exists(tokenId), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(properties[tokenId].isActive, "Property already inactive");
        
        properties[tokenId].isActive = false;
        emit PropertyDeactivated(tokenId);
    }
    
    /**
     * @dev Reactivate property
     */
    function reactivateProperty(uint256 tokenId) external {
        require(_exists(tokenId), "Property does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(!properties[tokenId].isActive, "Property already active");
        
        properties[tokenId].isActive = true;
    }
    
    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId];
    }
    
    /**
     * @dev Get all properties owned by an address
     */
    function getOwnerProperties(address owner) external view returns (uint256[] memory) {
        return ownerProperties[owner];
    }
    
    /**
     * @dev Get all active properties (limited to avoid gas issues)
     */
    function getActiveProperties(uint256 offset, uint256 limit) 
        external view returns (Property[] memory activeProps, uint256 total) {
        
        // First count active properties
        uint256 activeCount = 0;
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (properties[i].isActive) {
                activeCount++;
            }
        }
        
        // Determine actual limit
        if (limit == 0 || limit > 50) limit = 50; // Max 50 per call
        if (offset >= activeCount) return (new Property[](0), activeCount);
        
        uint256 resultSize = activeCount - offset;
        if (resultSize > limit) resultSize = limit;
        
        activeProps = new Property[](resultSize);
        uint256 currentIndex = 0;
        uint256 found = 0;
        
        for (uint256 i = 1; i < _nextTokenId && found < offset + resultSize; i++) {
            if (properties[i].isActive) {
                if (currentIndex >= offset) {
                    activeProps[found - offset] = properties[i];
                }
                currentIndex++;
                if (currentIndex > offset) found++;
            }
        }
        
        return (activeProps, activeCount);
    }
    
    /**
     * @dev Calculate platform fee for a booking
     */
    function calculatePlatformFee(uint256 totalAmount) external view returns (uint256) {
        return (totalAmount * platformFee) / 10000;
    }
    
    // ============= ADMIN FUNCTIONS =============
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }
    
    /**
     * @dev Update fee collector address (only owner)
     */
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid collector address");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }
    
    // ============= VIEW FUNCTIONS =============
    
    function totalProperties() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function getContractInfo() external view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 platformFeePercent,
        address feeCollectorAddress
    ) {
        return (
            name(),
            symbol(),
            _nextTokenId - 1,
            platformFee,
            feeCollector
        );
    }
    
    // ============= REQUIRED OVERRIDES =============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
