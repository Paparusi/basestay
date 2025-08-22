// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BaseStay Token (BST)
 * @dev Native utility token for BaseStay decentralized booking platform
 * 
 * Token Features:
 * - Host Staking: Hosts must hold minimum 1000 BST to list properties
 * - Booking Rewards: Users earn BST for bookings and reviews
 * - Governance: BST holders vote on platform parameters
 * - Fee Discounts: BST holders get reduced platform fees
 * - Yield Farming: Stake BST to earn rewards
 */
contract BaseStayToken is ERC20, ERC20Burnable, Ownable, Pausable {
    // Token constants
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 billion BST
    uint256 public constant MIN_HOST_STAKE = 1000 * 10**18; // 1000 BST minimum for hosts
    
    // Staking and rewards
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => bool) public isQualifiedHost;
    
    // Platform integration
    mapping(address => bool) public authorizedContracts;
    
    // Rewards and distribution
    uint256 public rewardRate = 100; // 1% APY (100 basis points)
    uint256 public hostRewardMultiplier = 150; // 1.5x rewards for hosts
    
    // Events
    event HostStaked(address indexed host, uint256 amount);
    event HostUnstaked(address indexed host, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BookingReward(address indexed user, uint256 amount);
    event ReviewReward(address indexed user, uint256 amount);
    
    constructor() ERC20("BaseStay Token", "BST") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Host staking mechanism
     * Hosts must stake minimum BST to list properties
     */
    function stakeForHost(uint256 amount) external {
        require(amount >= MIN_HOST_STAKE, "Insufficient stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient BST balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking records
        stakedBalance[msg.sender] += amount;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        // Qualify as host if meeting minimum
        if (stakedBalance[msg.sender] >= MIN_HOST_STAKE) {
            isQualifiedHost[msg.sender] = true;
        }
        
        emit HostStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake BST tokens (with cooldown period)
     */
    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Check if remaining stake keeps host qualification
        uint256 remainingStake = stakedBalance[msg.sender] - amount;
        if (remainingStake < MIN_HOST_STAKE) {
            isQualifiedHost[msg.sender] = false;
        }
        
        // Update records and transfer back
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit HostUnstaked(msg.sender, amount);
    }
    
    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards available");
        
        lastRewardClaim[msg.sender] = block.timestamp;
        
        // Mint rewards (inflation controlled)
        _mint(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Calculate pending rewards for user
     */
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        
        uint256 timePeriod = block.timestamp - lastRewardClaim[user];
        uint256 baseReward = (stakedBalance[user] * rewardRate * timePeriod) / (365 days * 10000);
        
        // Host bonus
        if (isQualifiedHost[user]) {
            baseReward = (baseReward * hostRewardMultiplier) / 100;
        }
        
        return baseReward;
    }
    
    /**
     * @dev Reward users for bookings (called by BookingManager)
     */
    function rewardBooking(address user, uint256 bookingValue) external onlyAuthorizedContract {
        // 0.1% of booking value in BST rewards
        uint256 reward = (bookingValue * 10) / 10000;
        _mint(user, reward);
        
        emit BookingReward(user, reward);
    }
    
    /**
     * @dev Reward users for reviews (called by ReviewSystem)
     */
    function rewardReview(address reviewer) external onlyAuthorizedContract {
        uint256 reward = 10 * 10**18; // 10 BST per review
        _mint(reviewer, reward);
        
        emit ReviewReward(reviewer, reward);
    }
    
    /**
     * @dev Get discount rate based on BST holdings
     * Returns discount in basis points (e.g., 50 = 0.5% discount)
     */
    function getDiscountRate(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        
        if (balance >= 100000 * 10**18) return 200; // 2% discount for 100k+ BST
        if (balance >= 10000 * 10**18) return 100;  // 1% discount for 10k+ BST
        if (balance >= 1000 * 10**18) return 50;    // 0.5% discount for 1k+ BST
        
        return 0;
    }
    
    // Admin functions
    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }
    
    function setHostRewardMultiplier(uint256 multiplier) external onlyOwner {
        hostRewardMultiplier = multiplier;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Modifiers
    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "Unauthorized contract");
        _;
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
