// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./BST.sol";

/**
 * @title PropertyRegistry with BST Integration
 * @dev Registry for tokenized properties on BaseStay platform
 * Requires BST token staking for hosts to list properties
 */
contract PropertyRegistry is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    BaseStayToken public bstToken;
    
    struct Property {
        uint256 tokenId;
        address owner;
        string metadataURI; // IPFS metadata
        uint256 pricePerNight; // in USDC (6 decimals)
        bool isActive;
        uint256 createdAt;
        uint256 bstStakeAmount; // BST staked for this property
    }
    
    // State variables
    uint256 private _nextTokenId = 1;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerProperties;
    mapping(address => uint256) public totalStakedBST;
    
    // Platform fees and rewards
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public minBSTStakePerProperty = 1000 * 10**18; // 1000 BST per property
    
    // Events
    event PropertyListed(
        uint256 indexed tokenId,
        address indexed owner,
        string metadataURI,
        uint256 pricePerNight,
        uint256 bstStaked
    );
    event PropertyUpdated(uint256 indexed tokenId, uint256 pricePerNight);
    event PropertyDeactivated(uint256 indexed tokenId);
    event BSTStakeIncreased(uint256 indexed tokenId, uint256 additionalStake);
    
    constructor(address _bstTokenAddress) ERC721("BaseStay Property", "BSP") {
        bstToken = BaseStayToken(_bstTokenAddress);
    }
    
    /**
     * @dev List a new property (requires BST staking)
     */
    function listProperty(
        string memory metadataURI,
        uint256 pricePerNight,
        uint256 bstStakeAmount
    ) external nonReentrant {
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        require(pricePerNight > 0, "Price must be greater than 0");
        require(bstStakeAmount >= minBSTStakePerProperty, "Insufficient BST stake");
        
        // Verify host has qualified BST stake
        require(
            bstToken.isQualifiedHost(msg.sender), 
            "Must be qualified BST host"
        );
        
        // Transfer BST stake to this contract
        require(
            bstToken.transferFrom(msg.sender, address(this), bstStakeAmount),
            "BST transfer failed"
        );
        
        uint256 tokenId = _nextTokenId++;
        
        // Create property
        properties[tokenId] = Property({
            tokenId: tokenId,
            owner: msg.sender,
            metadataURI: metadataURI,
            pricePerNight: pricePerNight,
            isActive: true,
            createdAt: block.timestamp,
            bstStakeAmount: bstStakeAmount
        });
        
        // Update tracking
        ownerProperties[msg.sender].push(tokenId);
        totalStakedBST[msg.sender] += bstStakeAmount;
        
        // Mint property NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit PropertyListed(tokenId, msg.sender, metadataURI, pricePerNight, bstStakeAmount);
    }
    
    /**
     * @dev Update property price
     */
    function updatePropertyPrice(uint256 tokenId, uint256 newPrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(newPrice > 0, "Price must be greater than 0");
        
        properties[tokenId].pricePerNight = newPrice;
        
        emit PropertyUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Deactivate property and unstake BST
     */
    function deactivateProperty(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(properties[tokenId].isActive, "Property already inactive");
        
        Property storage property = properties[tokenId];
        property.isActive = false;
        
        // Return BST stake
        uint256 stakeAmount = property.bstStakeAmount;
        totalStakedBST[msg.sender] -= stakeAmount;
        property.bstStakeAmount = 0;
        
        require(
            bstToken.transfer(msg.sender, stakeAmount),
            "BST transfer failed"
        );
        
        emit PropertyDeactivated(tokenId);
    }
    
    /**
     * @dev Increase BST stake for property (for better visibility/rewards)
     */
    function increaseBSTStake(uint256 tokenId, uint256 additionalStake) external {
        require(ownerOf(tokenId) == msg.sender, "Not property owner");
        require(properties[tokenId].isActive, "Property not active");
        require(additionalStake > 0, "Stake amount must be positive");
        
        // Transfer additional BST
        require(
            bstToken.transferFrom(msg.sender, address(this), additionalStake),
            "BST transfer failed"
        );
        
        // Update stake amounts
        properties[tokenId].bstStakeAmount += additionalStake;
        totalStakedBST[msg.sender] += additionalStake;
        
        emit BSTStakeIncreased(tokenId, additionalStake);
    }
    
    /**
     * @dev Get all active properties
     */
    function getActiveProperties() external view returns (uint256[] memory) {
        uint256[] memory activeTokenIds = new uint256[](_nextTokenId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (properties[i].isActive) {
                activeTokenIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeTokenIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get properties owned by address
     */
    function getOwnerProperties(address owner) external view returns (uint256[] memory) {
        return ownerProperties[owner];
    }
    
    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId];
    }
    
    /**
     * @dev Calculate property visibility boost based on BST stake
     */
    function getVisibilityBoost(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Property does not exist");
        
        uint256 stakeAmount = properties[tokenId].bstStakeAmount;
        
        // Visibility boost tiers
        if (stakeAmount >= 10000 * 10**18) return 300; // 3x boost for 10k+ BST
        if (stakeAmount >= 5000 * 10**18) return 200;  // 2x boost for 5k+ BST
        if (stakeAmount >= 2000 * 10**18) return 150;  // 1.5x boost for 2k+ BST
        
        return 100; // 1x (normal) for minimum stake
    }
    
    // Admin functions
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    function setMinBSTStake(uint256 newMinStake) external onlyOwner {
        minBSTStakePerProperty = newMinStake;
    }
    
    function setBSTToken(address newBSTAddress) external onlyOwner {
        bstToken = BaseStayToken(newBSTAddress);
    }
    
    // Emergency functions
    function emergencyWithdrawBST() external onlyOwner {
        uint256 balance = bstToken.balanceOf(address(this));
        require(bstToken.transfer(owner(), balance), "Transfer failed");
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
