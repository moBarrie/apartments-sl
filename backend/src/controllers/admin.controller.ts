import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalApartments,
      totalBookings,
      totalRevenue,
      pendingApartments,
      activeBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.apartment.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.apartment.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          apartment: {
            select: {
              title: true,
              city: true,
            },
          },
          renter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // City breakdown
    const apartmentsByCity = await prisma.apartment.groupBy({
      by: ["city"],
      _count: { id: true },
      where: { status: "ACTIVE" },
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalApartments,
          totalBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
          pendingApartments,
          activeBookings,
        },
        apartmentsByCity,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching dashboard stats",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = role ? { role: role as any } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          landlordProfile: {
            select: {
              totalProperties: true,
              isVerified: true,
              subscriptionTier: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching users",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Get all apartments (for admin review)
// @route   GET /api/v1/admin/apartments
// @access  Private (Admin)
export const getAllApartments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, city, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status && { status: status as any }),
      ...(city && { city: city as string }),
    };

    const [apartments, total] = await Promise.all([
      prisma.apartment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
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
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.apartment.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        apartments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all apartments error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching apartments",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Update apartment status (approve/reject)
// @route   PATCH /api/v1/admin/apartments/:id/status
// @access  Private (Admin)
export const updateApartmentStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "REJECTED", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid status",
          code: "INVALID_STATUS",
        },
      });
    }

    const apartment = await prisma.apartment.update({
      where: { id },
      data: { status },
      include: {
        landlord: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email notification to landlord

    res.status(200).json({
      success: true,
      data: { apartment },
    });
  } catch (error) {
    console.error("Update apartment status error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error updating apartment status",
        code: "UPDATE_ERROR",
      },
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/v1/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status: status as any } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          apartment: {
            select: {
              id: true,
              title: true,
              city: true,
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
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
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching bookings",
        code: "FETCH_ERROR",
      },
    });
  }
};
