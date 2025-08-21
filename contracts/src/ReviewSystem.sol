// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BookingManager.sol";

/// @title ReviewSystem - Manages reviews and ratings for BaseStay
/// @notice Allows guests and hosts to review each other after completed bookings
contract ReviewSystem is Ownable, ReentrancyGuard {
    BookingManager public immutable bookingManager;
    
    struct Review {
        uint256 bookingId;
        address reviewer;
        address reviewee;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 createdAt;
        bool isGuestReview; // true if guest reviewing host, false if host reviewing guest
    }
    
    mapping(uint256 => Review) public reviews;
    mapping(uint256 => bool) public bookingReviewedByGuest;
    mapping(uint256 => bool) public bookingReviewedByHost;
    mapping(address => uint256[]) public userReviews; // All reviews for a user (as reviewee)
    mapping(uint256 => uint256[]) public propertyReviews; // Reviews for a property
    
    uint256 private _reviewIds;
    
    event ReviewCreated(
        uint256 indexed reviewId,
        uint256 indexed bookingId,
        address indexed reviewer,
        address reviewee,
        uint8 rating
    );
    
    event ReviewUpdated(uint256 indexed reviewId, uint8 rating, string comment);
    
    constructor(address _bookingManager) Ownable(msg.sender) {
        bookingManager = BookingManager(_bookingManager);
    }
    
    /// @notice Create a review for a completed booking
    /// @param bookingId The booking ID to review
    /// @param rating Rating from 1-5 stars
    /// @param comment Review comment
    function createReview(
        uint256 bookingId,
        uint8 rating,
        string memory comment
    ) external nonReentrant returns (uint256) {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        
        BookingManager.Booking memory booking = bookingManager.getBooking(bookingId);
        require(booking.status == BookingManager.BookingStatus.CheckedOut, "Booking not completed");
        require(
            booking.guest == msg.sender || booking.host == msg.sender,
            "Not authorized to review"
        );
        
        bool isGuestReview = booking.guest == msg.sender;
        
        // Check if already reviewed
        if (isGuestReview) {
            require(!bookingReviewedByGuest[bookingId], "Already reviewed by guest");
            bookingReviewedByGuest[bookingId] = true;
        } else {
            require(!bookingReviewedByHost[bookingId], "Already reviewed by host");
            bookingReviewedByHost[bookingId] = true;
        }
        
        _reviewIds++;
        uint256 reviewId = _reviewIds;
        
        address reviewee = isGuestReview ? booking.host : booking.guest;
        
        reviews[reviewId] = Review({
            bookingId: bookingId,
            reviewer: msg.sender,
            reviewee: reviewee,
            rating: rating,
            comment: comment,
            createdAt: block.timestamp,
            isGuestReview: isGuestReview
        });
        
        userReviews[reviewee].push(reviewId);
        
        // If guest review, add to property reviews
        if (isGuestReview) {
            propertyReviews[booking.propertyId].push(reviewId);
        }
        
        emit ReviewCreated(reviewId, bookingId, msg.sender, reviewee, rating);
        
        return reviewId;
    }
    
    /// @notice Update an existing review (within 7 days)
    function updateReview(
        uint256 reviewId,
        uint8 rating,
        string memory comment
    ) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        
        Review storage review = reviews[reviewId];
        require(review.reviewer == msg.sender, "Not review owner");
        require(block.timestamp <= review.createdAt + 7 days, "Update period expired");
        
        review.rating = rating;
        review.comment = comment;
        
        emit ReviewUpdated(reviewId, rating, comment);
    }
    
    /// @notice Get review details
    function getReview(uint256 reviewId) external view returns (Review memory) {
        return reviews[reviewId];
    }
    
    /// @notice Get all reviews for a user
    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }
    
    /// @notice Get all reviews for a property
    function getPropertyReviews(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyReviews[propertyId];
    }
    
    /// @notice Get average rating for a user
    function getUserAverageRating(address user) external view returns (uint256 average, uint256 count) {
        uint256[] memory reviewIds = userReviews[user];
        if (reviewIds.length == 0) {
            return (0, 0);
        }
        
        uint256 totalRating = 0;
        count = reviewIds.length;
        
        for (uint i = 0; i < count; i++) {
            totalRating += reviews[reviewIds[i]].rating;
        }
        
        average = (totalRating * 100) / count; // Return average * 100 for precision
    }
    
    /// @notice Get average rating for a property
    function getPropertyAverageRating(uint256 propertyId) external view returns (uint256 average, uint256 count) {
        uint256[] memory reviewIds = propertyReviews[propertyId];
        if (reviewIds.length == 0) {
            return (0, 0);
        }
        
        uint256 totalRating = 0;
        count = reviewIds.length;
        
        for (uint i = 0; i < count; i++) {
            totalRating += reviews[reviewIds[i]].rating;
        }
        
        average = (totalRating * 100) / count; // Return average * 100 for precision
    }
    
    /// @notice Check if booking can be reviewed by user
    function canReview(uint256 bookingId, address user) external view returns (bool) {
        BookingManager.Booking memory booking = bookingManager.getBooking(bookingId);
        
        if (booking.status != BookingManager.BookingStatus.CheckedOut) {
            return false;
        }
        
        if (booking.guest == user) {
            return !bookingReviewedByGuest[bookingId];
        } else if (booking.host == user) {
            return !bookingReviewedByHost[bookingId];
        }
        
        return false;
    }
    
    /// @notice Get review statistics for a user
    function getUserReviewStats(address user) external view returns (
        uint256 totalReviews,
        uint256 averageRating,
        uint256 fiveStars,
        uint256 fourStars,
        uint256 threeStars,
        uint256 twoStars,
        uint256 oneStar
    ) {
        uint256[] memory reviewIds = userReviews[user];
        totalReviews = reviewIds.length;
        
        if (totalReviews == 0) {
            return (0, 0, 0, 0, 0, 0, 0);
        }
        
        uint256 totalRating = 0;
        
        for (uint i = 0; i < totalReviews; i++) {
            uint8 rating = reviews[reviewIds[i]].rating;
            totalRating += rating;
            
            if (rating == 5) fiveStars++;
            else if (rating == 4) fourStars++;
            else if (rating == 3) threeStars++;
            else if (rating == 2) twoStars++;
            else if (rating == 1) oneStar++;
        }
        
        averageRating = (totalRating * 100) / totalReviews;
    }
}
