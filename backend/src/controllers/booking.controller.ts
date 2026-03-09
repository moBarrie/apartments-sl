import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

const PLATFORM_FEE_PERCENTAGE = 0.12; // 12%
const SERVICE_FEE_PERCENTAGE = 0.05; // 5%

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      apartmentId,
      checkinDate,
      checkoutDate,
      guestsCount,
      specialRequests,
    } = req.body;

    // Validate dates
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin < today) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Check-in date cannot be in the past",
          code: "INVALID_DATE",
        },
      });
    }

    if (checkout <= checkin) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Check-out date must be after check-in date",
          code: "INVALID_DATE",
        },
      });
    }

    // Get apartment
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment || apartment.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        error: {
          message: "Apartment not available",
          code: "NOT_AVAILABLE",
        },
      });
    }

    // Check if apartment is available for these dates
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        apartmentId,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          {
            checkinDate: { lte: checkout },
            checkoutDate: { gte: checkin },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Apartment is not available for selected dates",
          code: "NOT_AVAILABLE",
        },
      });
    }

    // Check blocked dates
    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        apartmentId,
        blockedDate: {
          gte: checkin,
          lte: checkout,
        },
      },
    });

    if (blockedDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Selected dates include blocked dates",
          code: "DATES_BLOCKED",
        },
      });
    }

    // Calculate pricing
    const nights = Math.ceil(
      (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24),
    );
    const subtotal = Number(apartment.pricePerNight) * nights;
    const platformFee = subtotal * PLATFORM_FEE_PERCENTAGE;
    const serviceFee = subtotal * SERVICE_FEE_PERCENTAGE;
    const totalPrice = subtotal + serviceFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        apartmentId,
        renterId: req.user!.id,
        checkinDate: checkin,
        checkoutDate: checkout,
        guestsCount,
        totalPrice,
        platformFee,
        serviceFee,
        specialRequests,
        status: "PENDING",
      },
      include: {
        apartment: {
          include: {
            images: { take: 1 },
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error creating booking",
        code: "CREATE_ERROR",
      },
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      renterId: req.user!.id,
      ...(status && { status: status as any }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          apartment: {
            include: {
              images: { take: 1 },
              landlord: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          payment: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching bookings",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        apartment: {
          include: {
            images: true,
            landlord: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Booking not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Check authorization
    const apartment = await prisma.apartment.findUnique({
      where: { id: booking.apartmentId },
    });

    if (
      booking.renterId !== req.user!.id &&
      apartment?.landlordId !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized to view this booking",
          code: "FORBIDDEN",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching booking",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Cancel booking
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Booking not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Check authorization
    if (booking.renterId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized to cancel this booking",
          code: "FORBIDDEN",
        },
      });
    }

    // Check if booking can be cancelled
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Booking cannot be cancelled",
          code: "INVALID_STATUS",
        },
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
    });

    // TODO: Process refund if payment was made

    res.status(200).json({
      success: true,
      data: { booking: updatedBooking },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error cancelling booking",
        code: "CANCEL_ERROR",
      },
    });
  }
};
