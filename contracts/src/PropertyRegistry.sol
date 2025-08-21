// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title PropertyRegistry - NFT-based property registration for BaseStay
/// @notice Each property is represented as an NFT with metadata stored on IPFS
contract PropertyRegistry is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    
    struct Property {
        string ipfsHash;
        address owner;
        uint256 pricePerNight; // in USDC (6 decimals)
        bool isActive;
        uint256 createdAt;
        string location;
        uint8 maxGuests;
        string[] amenities;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerProperties;
    
    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsHash,
        uint256 pricePerNight
    );
    
    event PropertyUpdated(uint256 indexed tokenId, string ipfsHash, uint256 pricePerNight);
    event PropertyStatusChanged(uint256 indexed tokenId, bool isActive);
    
    constructor() ERC721("BaseStay Property", "BSP") Ownable(msg.sender) {}
    
    /// @notice Register a new property as an NFT
    /// @param ipfsHash IPFS hash containing property metadata and images
    /// @param pricePerNight Price per night in USDC (6 decimals)
    /// @param location Property location string
    /// @param maxGuests Maximum number of guests
    /// @param amenities Array of amenity strings
    function registerProperty(
        string memory ipfsHash,
        uint256 pricePerNight,
        string memory location,
        uint8 maxGuests,
        string[] memory amenities
    ) external nonReentrant returns (uint256) {
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        
        _mint(msg.sender, tokenId);
        
        properties[tokenId] = Property({
            ipfsHash: ipfsHash,
            owner: msg.sender,
            pricePerNight: pricePerNight,
            isActive: true,
            createdAt: block.timestamp,
            location: location,
            maxGuests: maxGuests,
            amenities: amenities
        });
        
        ownerProperties[msg.sender].push(tokenId);
        
        emit PropertyRegistered(tokenId, msg.sender, ipfsHash, pricePerNight);
        
        return tokenId;
    }
    
    /// @notice Update property information (only owner)
    function updateProperty(
        uint256 tokenId,
        string memory ipfsHash,
        uint256 pricePerNight
    ) external {
        require(_ownerOf(tokenId) == msg.sender, "Not property owner");
        
        properties[tokenId].ipfsHash = ipfsHash;
        properties[tokenId].pricePerNight = pricePerNight;
        
        emit PropertyUpdated(tokenId, ipfsHash, pricePerNight);
    }
    
    /// @notice Toggle property active status
    function setPropertyStatus(uint256 tokenId, bool isActive) external {
        require(_ownerOf(tokenId) == msg.sender, "Not property owner");
        
        properties[tokenId].isActive = isActive;
        
        emit PropertyStatusChanged(tokenId, isActive);
    }
    
    /// @notice Get property details
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId];
    }
    
    /// @notice Get all properties owned by an address
    function getOwnerProperties(address owner) external view returns (uint256[] memory) {
        return ownerProperties[owner];
    }
    
    /// @notice Get total number of properties
    function totalProperties() external view returns (uint256) {
        return _tokenIds;
    }
    
    /// @notice Check if property exists and is active
    function isPropertyActive(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId) && properties[tokenId].isActive;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds;
    }
    
    /// @notice Override transfer to update owner mapping
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Update property owner
        if (from != to && to != address(0)) {
            properties[tokenId].owner = to;
            
            // Update owner mappings
            if (from != address(0)) {
                uint256[] storage fromProperties = ownerProperties[from];
                for (uint i = 0; i < fromProperties.length; i++) {
                    if (fromProperties[i] == tokenId) {
                        fromProperties[i] = fromProperties[fromProperties.length - 1];
                        fromProperties.pop();
                        break;
                    }
                }
            }
            
            ownerProperties[to].push(tokenId);
        }
        
        return super._update(to, tokenId, auth);
    }
}
