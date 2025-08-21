// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/PropertyRegistry.sol";
import "../src/BookingManager.sol";
import "../src/ReviewSystem.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract BaseStayTest is Test {
    PropertyRegistry public propertyRegistry;
    BookingManager public bookingManager;
    ReviewSystem public reviewSystem;
    MockUSDC public usdc;
    
    address public owner;
    address public host;
    address public guest;
    
    function setUp() public {
        owner = address(this);
        host = makeAddr("host");
        guest = makeAddr("guest");
        
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy contracts
        propertyRegistry = new PropertyRegistry();
        bookingManager = new BookingManager(address(propertyRegistry), address(usdc));
        reviewSystem = new ReviewSystem(address(bookingManager));
        
        // Give USDC to guest
        usdc.transfer(guest, 10000 * 10**6); // 10k USDC
    }
    
    function testRegisterProperty() public {
        vm.prank(host);
        
        string[] memory amenities = new string[](2);
        amenities[0] = "WiFi";
        amenities[1] = "Kitchen";
        
        uint256 tokenId = propertyRegistry.registerProperty(
            "QmTestHash",
            150 * 10**6, // $150 USDC per night
            "San Francisco, CA",
            4, // max guests
            amenities
        );
        
        assertEq(tokenId, 1);
        assertEq(propertyRegistry.ownerOf(tokenId), host);
        
        PropertyRegistry.Property memory property = propertyRegistry.getProperty(tokenId);
        assertEq(property.pricePerNight, 150 * 10**6);
        assertEq(property.location, "San Francisco, CA");
        assertTrue(property.isActive);
    }
    
    function testCreateBooking() public {
        // First register a property
        vm.prank(host);
        string[] memory amenities = new string[](1);
        amenities[0] = "WiFi";
        
        uint256 propertyId = propertyRegistry.registerProperty(
            "QmTestHash",
            150 * 10**6,
            "San Francisco, CA",
            4,
            amenities
        );
        
        // Guest creates booking
        vm.prank(guest);
        usdc.approve(address(bookingManager), 1000 * 10**6);
        
        uint256 checkIn = block.timestamp + 1 days;
        uint256 checkOut = checkIn + 1 days;
        
        uint256 bookingId = bookingManager.createBooking(
            propertyId,
            checkIn,
            checkOut,
            "Looking forward to staying!"
        );
        
        assertEq(bookingId, 1);
        
        BookingManager.Booking memory booking = bookingManager.getBooking(bookingId);
        assertEq(booking.guest, guest);
        assertEq(booking.host, host);
        assertEq(booking.propertyId, propertyId);
        assertEq(uint(booking.status), uint(BookingManager.BookingStatus.Pending));
    }
    
    function testCompleteBookingFlow() public {
        // Register property
        vm.prank(host);
        string[] memory amenities = new string[](1);
        amenities[0] = "WiFi";
        
        uint256 propertyId = propertyRegistry.registerProperty(
            "QmTestHash",
            150 * 10**6,
            "San Francisco, CA",
            4,
            amenities
        );
        
        // Create booking
        vm.prank(guest);
        usdc.approve(address(bookingManager), 1000 * 10**6);
        
        uint256 checkIn = block.timestamp + 1 days;
        uint256 checkOut = checkIn + 1 days;
        
        uint256 bookingId = bookingManager.createBooking(
            propertyId,
            checkIn,
            checkOut,
            "Test booking"
        );
        
        // Host confirms booking
        vm.prank(host);
        bookingManager.confirmBooking(bookingId);
        
        // Fast forward to check-in time
        vm.warp(checkIn);
        
        // Guest checks in
        vm.prank(guest);
        bookingManager.checkIn(bookingId);
        
        // Fast forward to check-out time
        vm.warp(checkOut);
        
        // Guest checks out
        vm.prank(guest);
        bookingManager.checkOut(bookingId);
        
        // Verify final status
        BookingManager.Booking memory booking = bookingManager.getBooking(bookingId);
        assertEq(uint(booking.status), uint(BookingManager.BookingStatus.CheckedOut));
    }
    
    function testReviewSystem() public {
        // Setup complete booking first
        vm.prank(host);
        string[] memory amenities = new string[](1);
        amenities[0] = "WiFi";
        
        uint256 propertyId = propertyRegistry.registerProperty(
            "QmTestHash",
            150 * 10**6,
            "San Francisco, CA",
            4,
            amenities
        );
        
        vm.prank(guest);
        usdc.approve(address(bookingManager), 1000 * 10**6);
        
        uint256 checkIn = block.timestamp + 1 days;
        uint256 checkOut = checkIn + 1 days;
        
        uint256 bookingId = bookingManager.createBooking(
            propertyId,
            checkIn,
            checkOut,
            "Test booking"
        );
        
        // Complete booking flow
        vm.prank(host);
        bookingManager.confirmBooking(bookingId);
        
        vm.warp(checkIn);
        vm.prank(guest);
        bookingManager.checkIn(bookingId);
        
        vm.warp(checkOut);
        vm.prank(guest);
        bookingManager.checkOut(bookingId);
        
        // Guest reviews host
        vm.prank(guest);
        uint256 reviewId = reviewSystem.createReview(
            bookingId,
            5,
            "Excellent host and property!"
        );
        
        assertEq(reviewId, 1);
        
        ReviewSystem.Review memory review = reviewSystem.getReview(reviewId);
        assertEq(review.rating, 5);
        assertEq(review.reviewer, guest);
        assertEq(review.reviewee, host);
        assertTrue(review.isGuestReview);
        
        // Check average rating
        (uint256 average, uint256 count) = reviewSystem.getUserAverageRating(host);
        assertEq(average, 500); // 5.00 * 100
        assertEq(count, 1);
    }
}
