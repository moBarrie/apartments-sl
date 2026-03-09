import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// @desc    Create review for completed booking
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const {
      bookingId,
      apartmentId,
      rating,
      cleanlinessRating,
      accuracyRating,
      locationRating,
      valueRating,
      comment,
    } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Rating must be between 1 and 5",
          code: "INVALID_RATING",
        },
      });
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.renterId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized to review this booking",
          code: "FORBIDDEN",
        },
      });
    }

    // Check if booking is completed
    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Can only review completed bookings",
          code: "INVALID_STATUS",
        },
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Review already exists for this booking",
          code: "REVIEW_EXISTS",
        },
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        apartmentId,
        reviewerId: req.user!.id,
        rating,
        cleanlinessRating,
        accuracyRating,
        locationRating,
        valueRating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update apartment rating
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { reviews: true },
    });

    if (apartment) {
      const totalReviews = apartment.reviews.length;
      const avgRating =
        apartment.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      await prisma.apartment.update({
        where: { id: apartmentId },
        data: {
          rating: avgRating,
          reviewCount: totalReviews,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error creating review",
        code: "CREATE_ERROR",
      },
    });
  }
};

// @desc    Get reviews for an apartment
// @route   GET /api/v1/reviews/apartment/:apartmentId
// @access  Public
export const getApartmentReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { apartmentId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: {
          apartmentId,
          isVisible: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: { apartmentId, isVisible: true },
      }),
      prisma.review.aggregate({
        where: { apartmentId, isVisible: true },
        _avg: {
          rating: true,
          cleanlinessRating: true,
          accuracyRating: true,
          locationRating: true,
          valueRating: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        stats: {
          averageRating: stats._avg.rating || 0,
          averageCleanliness: stats._avg.cleanlinessRating || 0,
          averageAccuracy: stats._avg.accuracyRating || 0,
          averageLocation: stats._avg.locationRating || 0,
          averageValue: stats._avg.valueRating || 0,
          totalReviews: total,
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching reviews",
        code: "FETCH_ERROR",
      },
    });
  }
};
