// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PropertyRegistry.sol";

/// @title BookingManager - Manages all bookings for BaseStay platform
/// @notice Handles booking creation, cancellation, and state management
contract BookingManager is Ownable, ReentrancyGuard {
    PropertyRegistry public immutable propertyRegistry;
    IERC20 public immutable usdc;
    
    enum BookingStatus {
        Pending,
        Confirmed,
        CheckedIn,
        CheckedOut,
        Cancelled,
        Disputed
    }
    
    struct Booking {
        uint256 propertyId;
        address guest;
        address host;
        uint256 checkInDate;
        uint256 checkOutDate;
        uint256 totalPrice;
        uint256 platformFee;
        BookingStatus status;
        uint256 createdAt;
        string guestMessage;
    }
    
    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => uint256[]) public propertyBookings; // propertyId => bookingIds
    mapping(address => uint256[]) public guestBookings; // guest => bookingIds
    mapping(address => uint256[]) public hostBookings; // host => bookingIds
    
    uint256 private _bookingIds;
    uint256 public platformFeeRate = 250; // 2.5% (basis points)
    uint256 public constant MAX_PLATFORM_FEE = 500; // 5% max
    
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed propertyId,
        address indexed guest,
        address host,
        uint256 checkInDate,
        uint256 checkOutDate,
        uint256 totalPrice
    );
    
    event BookingConfirmed(uint256 indexed bookingId);
    event BookingCancelled(uint256 indexed bookingId, address cancelledBy);
    event BookingCheckedIn(uint256 indexed bookingId);
    event BookingCheckedOut(uint256 indexed bookingId);
    event PlatformFeeUpdated(uint256 newFeeRate);
    
    constructor(address _propertyRegistry, address _usdc) Ownable(msg.sender) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
        usdc = IERC20(_usdc);
    }
    
    /// @notice Create a new booking
    /// @param propertyId The property to book
    /// @param checkInDate Check-in timestamp
    /// @param checkOutDate Check-out timestamp
    /// @param guestMessage Optional message from guest
    function createBooking(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate,
        string memory guestMessage
    ) external nonReentrant returns (uint256) {
        require(propertyRegistry.isPropertyActive(propertyId), "Property not active");
        require(checkInDate > block.timestamp, "Check-in must be future");
        require(checkOutDate > checkInDate, "Invalid date range");
        require(!isPropertyBooked(propertyId, checkInDate, checkOutDate), "Property already booked");
        
        PropertyRegistry.Property memory property = propertyRegistry.getProperty(propertyId);
        require(property.owner != msg.sender, "Cannot book own property");
        
        uint256 nights = (checkOutDate - checkInDate) / 86400; // seconds in a day
        uint256 totalPrice = nights * property.pricePerNight;
        uint256 platformFee = (totalPrice * platformFeeRate) / 10000;
        
        // Transfer USDC from guest (total + platform fee)
        require(usdc.transferFrom(msg.sender, address(this), totalPrice + platformFee), "USDC transfer failed");
        
        _bookingIds++;
        uint256 bookingId = _bookingIds;
        
        bookings[bookingId] = Booking({
            propertyId: propertyId,
            guest: msg.sender,
            host: property.owner,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            totalPrice: totalPrice,
            platformFee: platformFee,
            status: BookingStatus.Pending,
            createdAt: block.timestamp,
            guestMessage: guestMessage
        });
        
        propertyBookings[propertyId].push(bookingId);
        guestBookings[msg.sender].push(bookingId);
        hostBookings[property.owner].push(bookingId);
        
        emit BookingCreated(
            bookingId,
            propertyId,
            msg.sender,
            property.owner,
            checkInDate,
            checkOutDate,
            totalPrice
        );
        
        return bookingId;
    }
    
    /// @notice Confirm a booking (host only)
    function confirmBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.host == msg.sender, "Only host can confirm");
        require(booking.status == BookingStatus.Pending, "Invalid status");
        
        booking.status = BookingStatus.Confirmed;
        
        emit BookingConfirmed(bookingId);
    }
    
    /// @notice Cancel a booking
    function cancelBooking(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(
            booking.guest == msg.sender || booking.host == msg.sender,
            "Not authorized"
        );
        require(
            booking.status == BookingStatus.Pending || 
            booking.status == BookingStatus.Confirmed,
            "Cannot cancel"
        );
        
        booking.status = BookingStatus.Cancelled;
        
        // Refund logic based on cancellation policy
        uint256 refundAmount = calculateRefund(bookingId);
        if (refundAmount > 0) {
            require(usdc.transfer(booking.guest, refundAmount), "Refund failed");
        }
        
        // Return remaining to host if any
        uint256 hostAmount = booking.totalPrice - refundAmount;
        if (hostAmount > 0) {
            require(usdc.transfer(booking.host, hostAmount), "Host payment failed");
        }
        
        emit BookingCancelled(bookingId, msg.sender);
    }
    
    /// @notice Check in to property (guest only)
    function checkIn(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.guest == msg.sender, "Only guest can check in");
        require(booking.status == BookingStatus.Confirmed, "Booking not confirmed");
        require(
            block.timestamp >= booking.checkInDate && 
            block.timestamp <= booking.checkInDate + 86400, // 24h window
            "Outside check-in window"
        );
        
        booking.status = BookingStatus.CheckedIn;
        
        emit BookingCheckedIn(bookingId);
    }
    
    /// @notice Check out from property
    function checkOut(uint256 bookingId) external nonReentrant {
        Booking storage booking = bookings[bookingId];
        require(
            booking.guest == msg.sender || booking.host == msg.sender,
            "Not authorized"
        );
        require(booking.status == BookingStatus.CheckedIn, "Not checked in");
        
        booking.status = BookingStatus.CheckedOut;
        
        // Release payment to host
        require(usdc.transfer(booking.host, booking.totalPrice), "Host payment failed");
        
        emit BookingCheckedOut(bookingId);
    }
    
    /// @notice Check if property is available for given dates
    function isPropertyAvailable(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate
    ) external view returns (bool) {
        return !isPropertyBooked(propertyId, checkInDate, checkOutDate);
    }
    
    /// @notice Get booking details
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }
    
    /// @notice Get bookings for a property
    function getPropertyBookings(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyBookings[propertyId];
    }
    
    /// @notice Get bookings for a guest
    function getGuestBookings(address guest) external view returns (uint256[] memory) {
        return guestBookings[guest];
    }
    
    /// @notice Get bookings for a host
    function getHostBookings(address host) external view returns (uint256[] memory) {
        return hostBookings[host];
    }
    
    /// @notice Update platform fee (owner only)
    function updatePlatformFee(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_PLATFORM_FEE, "Fee too high");
        platformFeeRate = newFeeRate;
        emit PlatformFeeUpdated(newFeeRate);
    }
    
    /// @notice Withdraw platform fees (owner only)
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(usdc.transfer(msg.sender, balance), "Withdrawal failed");
    }
    
    /// @dev Check if property is booked during given period
    function isPropertyBooked(
        uint256 propertyId,
        uint256 checkInDate,
        uint256 checkOutDate
    ) internal view returns (bool) {
        uint256[] memory bookingIds = propertyBookings[propertyId];
        
        for (uint i = 0; i < bookingIds.length; i++) {
            Booking memory booking = bookings[bookingIds[i]];
            
            if (booking.status == BookingStatus.Confirmed || 
                booking.status == BookingStatus.CheckedIn ||
                booking.status == BookingStatus.Pending) {
                
                // Check for overlap
                if (checkInDate < booking.checkOutDate && checkOutDate > booking.checkInDate) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /// @dev Calculate refund amount based on cancellation timing
    function calculateRefund(uint256 bookingId) internal view returns (uint256) {
        Booking memory booking = bookings[bookingId];
        uint256 timeUntilCheckIn = booking.checkInDate - block.timestamp;
        
        // Cancellation policy: 
        // - More than 7 days: 95% refund
        // - 3-7 days: 50% refund
        // - Less than 3 days: 10% refund
        
        if (timeUntilCheckIn >= 7 days) {
            return (booking.totalPrice * 95) / 100;
        } else if (timeUntilCheckIn >= 3 days) {
            return (booking.totalPrice * 50) / 100;
        } else {
            return (booking.totalPrice * 10) / 100;
        }
    }
}
