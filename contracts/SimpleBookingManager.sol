// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SimplePropertyRegistry.sol";

/**
 * @title Simple Booking Manager
 * @dev Handle bookings with USDC payments only, platform takes 5% fee
 */
contract SimpleBookingManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    SimplePropertyRegistry public propertyRegistry;
    IERC20 public usdcToken; // USDC on Base
    
    struct Booking {
        uint256 bookingId;
        uint256 propertyId;
        address guest;
        address host;
        uint256 checkInDate;
        uint256 checkOutDate;
        uint256 totalAmount; // Total USDC paid by guest (6 decimals)
        uint256 hostAmount; // Amount after platform fee
        uint256 platformFee; // Platform fee taken
        BookingStatus status;
        uint256 createdAt;
    }
    
    enum BookingStatus {
        Active,
        Completed,
        Cancelled,
        Refunded
    }
    
    // State variables
    uint256 private _nextBookingId = 1;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public guestBookings;
    mapping(address => uint256[]) public hostBookings;
    mapping(uint256 => uint256[]) public propertyBookings; // propertyId => bookingIds[]
    
    // Platform settings
    uint256 public platformFee = 500; // 5% in basis points
    address public feeCollector;
    uint256 public constant PLATFORM_FEE_MAX = 1000; // Max 10%
    
    // Events
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed propertyId,
        address indexed guest,
        address host,
        uint256 totalAmount,
        uint256 checkInDate,
        uint256 checkOutDate
    );
    event BookingCompleted(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId, uint256 refundAmount);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);
    
    constructor(
        address _propertyRegistry,
        address _usdcToken,
        address _feeCollector
    ) {
        propertyRegistry = SimplePropertyRegistry(_propertyRegistry);
        usdcToken = IERC20(_usdcToken);
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Create a new booking with USDC payment
     */
    function createBooking(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 totalAmount
    ) external nonReentrant returns (uint256) {
        // Validate inputs
        require(checkInDate > block.timestamp, "Check-in must be in future");
        require(checkOutDate > checkInDate, "Check-out must be after check-in");
        require(totalAmount > 0, "Amount must be greater than 0");
        
        // Get property info
        SimplePropertyRegistry.Property memory property = propertyRegistry.getProperty(propertyId);
        require(property.isActive, "Property not active");
        require(property.owner != msg.sender, "Cannot book own property");
        
        // Calculate nights and verify pricing
        uint256 nights = (checkOutDate - checkInDate) / 86400; // seconds in a day
        require(nights > 0, "Minimum 1 night stay");
        
        uint256 expectedAmount = property.pricePerNight * nights;
        require(totalAmount >= expectedAmount, "Insufficient payment amount");
        
        // Calculate platform fee
        uint256 platformFeeAmount = (totalAmount * platformFee) / 10000;
        uint256 hostAmount = totalAmount - platformFeeAmount;
        
        // Transfer USDC from guest
        usdcToken.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        // Create booking
        uint256 bookingId = _nextBookingId++;
        bookings[bookingId] = Booking({
            bookingId: bookingId,
            propertyId: propertyId,
            guest: msg.sender,
            host: property.owner,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            totalAmount: totalAmount,
            hostAmount: hostAmount,
            platformFee: platformFeeAmount,
            status: BookingStatus.Active,
            createdAt: block.timestamp
        });
        
        // Track bookings
        guestBookings[msg.sender].push(bookingId);
        hostBookings[property.owner].push(bookingId);
        propertyBookings[propertyId].push(bookingId);
        
        emit BookingCreated(
            bookingId,
            propertyId,
            msg.sender,
            property.owner,
            totalAmount,
            checkInDate,
            checkOutDate
        );
        
        return bookingId;
    }
    
    /**
     * @dev Complete booking after checkout (auto or manual)
     */
    function completeBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(booking.bookingId != 0, "Booking does not exist");
        require(booking.status == BookingStatus.Active, "Booking not active");
        require(
            msg.sender == booking.host || 
            msg.sender == booking.guest || 
            msg.sender == owner(),
            "Not authorized"
        );
        require(block.timestamp >= booking.checkOutDate, "Checkout date not reached");
        
        // Transfer payments
        usdcToken.safeTransfer(booking.host, booking.hostAmount);
        usdcToken.safeTransfer(feeCollector, booking.platformFee);
        
        // Update status
        booking.status = BookingStatus.Completed;
        
        emit BookingCompleted(bookingId);
    }
    
    /**
     * @dev Cancel booking (before check-in only)
     */
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(booking.bookingId != 0, "Booking does not exist");
        require(booking.status == BookingStatus.Active, "Booking not active");
        require(
            msg.sender == booking.guest || 
            msg.sender == booking.host ||
            msg.sender == owner(),
            "Not authorized"
        );
        require(block.timestamp < booking.checkInDate, "Cannot cancel after check-in");
        
        // Calculate refund (full refund if cancelled 24h+ before check-in)
        uint256 refundAmount;
        if (block.timestamp + 86400 < booking.checkInDate) {
            // Full refund if cancelled 24+ hours before
            refundAmount = booking.totalAmount;
        } else {
            // 50% refund if cancelled within 24 hours
            refundAmount = booking.totalAmount / 2;
            // Send remaining to host
            uint256 hostCompensation = booking.totalAmount - refundAmount;
            uint256 hostCompensationAfterFee = hostCompensation - (hostCompensation * platformFee / 10000);
            uint256 platformFeeFromCancellation = hostCompensation - hostCompensationAfterFee;
            
            usdcToken.safeTransfer(booking.host, hostCompensationAfterFee);
            usdcToken.safeTransfer(feeCollector, platformFeeFromCancellation);
        }
        
        // Refund to guest
        if (refundAmount > 0) {
            usdcToken.safeTransfer(booking.guest, refundAmount);
        }
        
        // Update status
        booking.status = BookingStatus.Cancelled;
        
        emit BookingCancelled(bookingId, refundAmount);
    }
    
    /**
     * @dev Get booking details
     */
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        require(bookings[bookingId].bookingId != 0, "Booking does not exist");
        return bookings[bookingId];
    }
    
    /**
     * @dev Get guest's bookings
     */
    function getGuestBookings(address guest) external view returns (uint256[] memory) {
        return guestBookings[guest];
    }
    
    /**
     * @dev Get host's bookings
     */
    function getHostBookings(address host) external view returns (uint256[] memory) {
        return hostBookings[host];
    }
    
    /**
     * @dev Get property's bookings
     */
    function getPropertyBookings(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyBookings[propertyId];
    }
    
    /**
     * @dev Check if property is available for dates
     */
    function isPropertyAvailable(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate
    ) external view returns (bool) {
        uint256[] memory bookingIds = propertyBookings[propertyId];
        
        for (uint i = 0; i < bookingIds.length; i++) {
            Booking memory booking = bookings[bookingIds[i]];
            
            // Skip non-active bookings
            if (booking.status != BookingStatus.Active) continue;
            
            // Check for date conflicts
            if (
                (checkInDate >= booking.checkInDate && checkInDate < booking.checkOutDate) ||
                (checkOutDate > booking.checkInDate && checkOutDate <= booking.checkOutDate) ||
                (checkInDate <= booking.checkInDate && checkOutDate >= booking.checkOutDate)
            ) {
                return false; // Conflict found
            }
        }
        
        return true; // No conflicts
    }
    
    // ============= ADMIN FUNCTIONS =============
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= PLATFORM_FEE_MAX, "Fee cannot exceed maximum");
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
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        if (balance > 0) {
            usdcToken.safeTransfer(owner(), balance);
        }
    }
    
    // ============= VIEW FUNCTIONS =============
    
    function totalBookings() external view returns (uint256) {
        return _nextBookingId - 1;
    }
    
    function getContractInfo() external view returns (
        address propertyRegistryAddress,
        address usdcTokenAddress,
        uint256 platformFeePercent,
        address feeCollectorAddress,
        uint256 totalBookings
    ) {
        return (
            address(propertyRegistry),
            address(usdcToken),
            platformFee,
            feeCollector,
            _nextBookingId - 1
        );
    }
}
