// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BaseStay (BS) Token - Essential Features
 * @dev Simple BS token with staking, utility discounts, and membership tiers
 */
contract BaseStayToken is ERC20, Ownable, ReentrancyGuard {
    
    // ============= TOKEN BASICS =============
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion BS
    uint256 public constant MIN_HOST_STAKE = 1000 * 10**18; // 1000 BS minimum for hosts
    
    // ============= 1. STAKING SYSTEM =============
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod; // 0 = flexible, 30/90/365 days = locked
        uint256 rewardMultiplier; // 100 = 1x, 110 = 1.1x, 125 = 1.25x, 150 = 1.5x
    }
    
    mapping(address => Stake[]) public userStakes;
    mapping(address => bool) public isQualifiedHost;
    mapping(address => uint256) public totalStaked;
    
    uint256 public totalStakedSupply;
    uint256 public baseRewardRate = 500; // 5% APY base rate
    
    // ============= 2. UTILITY FEATURES =============
    
    // Fee Discounts (based on holdings)
    uint256[] public discountThresholds = [1000, 5000, 10000, 50000, 100000];
    uint256[] public discountRates = [5, 10, 15, 25, 50]; // % discount
    
    // Booking Cashback
    mapping(address => uint256) public totalBookingVolume;
    mapping(address => uint256) public cashbackEarned;
    uint256 public cashbackRate = 200; // 2% cashback in BS tokens
    
    // ============= 3. MEMBERSHIP TIERS =============
    mapping(address => uint256) public loyaltyPoints;
    mapping(address => uint256) public membershipTier; // 0=Basic, 1=Silver, 2=Gold, 3=Platinum
    mapping(address => uint256) public joinTimestamp;
    
    // ============= EVENTS =============
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BookingCashback(address indexed user, uint256 bookingAmount, uint256 cashback);
    event MembershipTierUpdated(address indexed user, uint256 newTier);
    
    constructor() ERC20("BaseStay", "BS") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    // ============= 1. STAKING FUNCTIONS =============
    
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(
            lockPeriod == 0 || lockPeriod == 30 || lockPeriod == 90 || lockPeriod == 365,
            "Invalid lock period: use 0, 30, 90, or 365 days"
        );
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Calculate reward multiplier based on lock period
        uint256 multiplier = 100; // 1x for flexible (0 days)
        if (lockPeriod == 30) multiplier = 110; // 1.1x for 30 days
        else if (lockPeriod == 90) multiplier = 125; // 1.25x for 90 days
        else if (lockPeriod == 365) multiplier = 150; // 1.5x for 1 year
        
        // Add stake
        userStakes[msg.sender].push(Stake({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriod,
            rewardMultiplier: multiplier
        }));
        
        totalStaked[msg.sender] += amount;
        totalStakedSupply += amount;
        
        // Check host qualification (1000+ BS)
        if (totalStaked[msg.sender] >= MIN_HOST_STAKE) {
            isQualifiedHost[msg.sender] = true;
        }
        
        _updateMembershipTier(msg.sender);
        
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.amount > 0, "Stake already withdrawn");
        
        // Check lock period
        if (userStake.lockPeriod > 0) {
            require(
                block.timestamp >= userStake.timestamp + (userStake.lockPeriod * 1 days),
                "Stake is still locked"
            );
        }
        
        uint256 amount = userStake.amount;
        userStake.amount = 0;
        
        totalStaked[msg.sender] -= amount;
        totalStakedSupply -= amount;
        
        // Check host qualification
        if (totalStaked[msg.sender] < MIN_HOST_STAKE) {
            isQualifiedHost[msg.sender] = false;
        }
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, amount);
        
        _updateMembershipTier(msg.sender);
        
        emit Unstaked(msg.sender, amount);
    }
    
    function claimStakingRewards() external nonReentrant {
        uint256 totalRewards = calculateStakingRewards(msg.sender);
        require(totalRewards > 0, "No rewards available");
        
        // Update timestamps to prevent double claiming
        for (uint i = 0; i < userStakes[msg.sender].length; i++) {
            if (userStakes[msg.sender][i].amount > 0) {
                userStakes[msg.sender][i].timestamp = block.timestamp;
            }
        }
        
        _mint(msg.sender, totalRewards);
        emit RewardsClaimed(msg.sender, totalRewards);
    }
    
    function calculateStakingRewards(address user) public view returns (uint256) {
        uint256 totalRewards = 0;
        
        for (uint i = 0; i < userStakes[user].length; i++) {
            Stake memory userStake = userStakes[user][i];
            if (userStake.amount > 0) {
                uint256 stakingTime = block.timestamp - userStake.timestamp;
                uint256 baseReward = (userStake.amount * baseRewardRate * stakingTime) / (365 days * 10000);
                uint256 multipliedReward = (baseReward * userStake.rewardMultiplier) / 100;
                totalRewards += multipliedReward;
            }
        }
        
        return totalRewards;
    }
    
    // ============= 2. UTILITY FUNCTIONS =============
    
    function recordBooking(address user, uint256 bookingAmount) external onlyOwner {
        totalBookingVolume[user] += bookingAmount;
        
        // Calculate cashback in BS tokens (2% of booking)
        uint256 cashback = (bookingAmount * cashbackRate) / 10000;
        cashbackEarned[user] += cashback;
        
        _mint(user, cashback);
        
        // Add loyalty points (1 point per $1 spent)
        loyaltyPoints[user] += bookingAmount / 100;
        
        _updateMembershipTier(user);
        
        emit BookingCashback(user, bookingAmount, cashback);
    }
    
    function getFeeDiscount(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        
        // Check balance-based discounts
        for (uint i = discountThresholds.length; i > 0; i--) {
            if (balance >= discountThresholds[i-1] * 10**18) {
                uint256 baseDiscount = discountRates[i-1];
                
                // Membership tier bonus (5% extra per tier)
                uint256 tierBonus = membershipTier[user] * 5;
                
                return baseDiscount + tierBonus;
            }
        }
        
        return 0;
    }
    
    // ============= 3. MEMBERSHIP TIER FUNCTIONS =============
    
    function _updateMembershipTier(address user) internal {
        uint256 balance = balanceOf(user);
        uint256 staked = totalStaked[user];
        uint256 points = loyaltyPoints[user];
        uint256 timeHeld = block.timestamp - joinTimestamp[user];
        
        if (joinTimestamp[user] == 0) {
            joinTimestamp[user] = block.timestamp;
        }
        
        // Calculate tier score based on multiple factors
        uint256 score = 0;
        score += balance / (10000 * 10**18); // Balance score
        score += staked / (5000 * 10**18); // Staking score  
        score += points / 10000; // Loyalty points score
        score += timeHeld / (90 days); // Time holding score
        
        uint256 oldTier = membershipTier[user];
        
        if (score >= 10) membershipTier[user] = 3; // Platinum
        else if (score >= 5) membershipTier[user] = 2; // Gold
        else if (score >= 2) membershipTier[user] = 1; // Silver
        else membershipTier[user] = 0; // Basic
        
        if (membershipTier[user] != oldTier) {
            emit MembershipTierUpdated(user, membershipTier[user]);
        }
    }
    
    function getMembershipTierName(address user) external view returns (string memory) {
        uint256 tier = membershipTier[user];
        if (tier == 3) return "Platinum";
        if (tier == 2) return "Gold";
        if (tier == 1) return "Silver";
        return "Basic";
    }
    
    // ============= VIEW FUNCTIONS =============
    
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }
    
    function getUserInfo(address user) external view returns (
        uint256 balance,
        uint256 stakedAmount,
        uint256 pendingRewards,
        bool hostQualified,
        uint256 memberTier,
        string memory tierName,
        uint256 feeDiscount,
        uint256 totalCashback
    ) {
        return (
            balanceOf(user),
            totalStaked[user],
            calculateStakingRewards(user),
            isQualifiedHost[user],
            membershipTier[user],
            this.getMembershipTierName(user),
            this.getFeeDiscount(user),
            cashbackEarned[user]
        );
    }
    
    function getTokenStats() external view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 totalStaked,
        uint256 baseReward,
        uint256 minHostStake
    ) {
        return (
            name(),
            symbol(), 
            totalSupply(),
            totalStakedSupply,
            baseRewardRate,
            MIN_HOST_STAKE
        );
    }
}
