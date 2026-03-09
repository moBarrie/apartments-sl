import { Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

// @desc    Get all apartments with filtering
// @route   GET /api/v1/apartments
// @access  Public
export const getApartments = async (req: AuthRequest, res: Response) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      amenities,
      sort = "newest",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.ApartmentWhereInput = {
      status: "ACTIVE",
      ...(city && { city: city as string }),
      ...(minPrice && {
        pricePerNight: { gte: parseFloat(minPrice as string) },
      }),
      ...(maxPrice && {
        pricePerNight: { lte: parseFloat(maxPrice as string) },
      }),
      ...(bedrooms && { bedrooms: parseInt(bedrooms as string) }),
      ...(bathrooms && { bathrooms: parseInt(bathrooms as string) }),
      ...(amenities && {
        amenities: {
          some: {
            amenityId: {
              in: (amenities as string).split(","),
            },
          },
        },
      }),
    };

    // Build orderBy clause
    let orderBy: Prisma.ApartmentOrderByWithRelationInput = {};
    switch (sort) {
      case "price_asc":
        orderBy = { pricePerNight: "asc" };
        break;
      case "price_desc":
        orderBy = { pricePerNight: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get apartments and total count
    const [apartments, total] = await Promise.all([
      prisma.apartment.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
            take: 1,
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          landlord: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              landlordProfile: {
                select: {
                  isVerified: true,
                  rating: true,
                },
              },
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
    console.error("Get apartments error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching apartments",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Get single apartment by ID
// @route   GET /api/v1/apartments/:id
// @access  Public
export const getApartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            landlordProfile: {
              select: {
                businessName: true,
                isVerified: true,
                rating: true,
                totalProperties: true,
              },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!apartment) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Apartment not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Increment view count
    await prisma.apartment.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      data: { apartment },
    });
  } catch (error) {
    console.error("Get apartment error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching apartment",
        code: "FETCH_ERROR",
      },
    });
  }
};

// @desc    Create new apartment
// @route   POST /api/v1/apartments
// @access  Private (Landlord)
export const createApartment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      pricePerNight,
      pricePerMonth,
      city,
      neighborhood,
      address,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      maxGuests,
      propertyType,
      squareMeters,
      amenities,
      images,
    } = req.body;

    // Create apartment
    const apartment = await prisma.apartment.create({
      data: {
        landlordId: req.user!.id,
        title,
        description,
        pricePerNight,
        pricePerMonth,
        city,
        neighborhood,
        address,
        latitude,
        longitude,
        bedrooms,
        bathrooms,
        maxGuests,
        propertyType,
        squareMeters,
        status: "PENDING", // Admin approval required
        ...(amenities && {
          amenities: {
            create: amenities.map((amenityId: string) => ({
              amenityId,
            })),
          },
        }),
        ...(images && {
          images: {
            create: images.map((img: any, index: number) => ({
              imageUrl: img.url,
              isFeatured: index === 0,
              displayOrder: index,
            })),
          },
        }),
      },
      include: {
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    // Update landlord's total properties count
    await prisma.landlordProfile.update({
      where: { userId: req.user!.id },
      data: { totalProperties: { increment: 1 } },
    });

    res.status(201).json({
      success: true,
      data: { apartment },
    });
  } catch (error) {
    console.error("Create apartment error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error creating apartment",
        code: "CREATE_ERROR",
      },
    });
  }
};

// @desc    Update apartment
// @route   PUT /api/v1/apartments/:id
// @access  Private (Landlord - owner only)
export const updateApartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if apartment exists and belongs to user
    const existingApartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!existingApartment) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Apartment not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Check ownership (unless admin)
    if (
      existingApartment.landlordId !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized to update this apartment",
          code: "FORBIDDEN",
        },
      });
    }

    // Update apartment
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: req.body,
      include: {
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { apartment: updatedApartment },
    });
  } catch (error) {
    console.error("Update apartment error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error updating apartment",
        code: "UPDATE_ERROR",
      },
    });
  }
};

// @desc    Delete apartment
// @route   DELETE /api/v1/apartments/:id
// @access  Private (Landlord - owner only)
export const deleteApartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Apartment not found",
          code: "NOT_FOUND",
        },
      });
    }

    // Check ownership
    if (apartment.landlordId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized to delete this apartment",
          code: "FORBIDDEN",
        },
      });
    }

    await prisma.apartment.delete({
      where: { id },
    });

    // Decrement landlord's total properties
    await prisma.landlordProfile.update({
      where: { userId: apartment.landlordId },
      data: { totalProperties: { decrement: 1 } },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete apartment error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error deleting apartment",
        code: "DELETE_ERROR",
      },
    });
  }
};

// @desc    Get apartment availability
// @route   GET /api/v1/apartments/:id/availability
// @access  Public
export const getApartmentAvailability = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Get booked dates
    const bookings = await prisma.booking.findMany({
      where: {
        apartmentId: id,
        status: { in: ["CONFIRMED", "PENDING"] },
        ...(startDate &&
          endDate && {
            OR: [
              {
                checkinDate: {
                  lte: new Date(endDate as string),
                  gte: new Date(startDate as string),
                },
              },
              {
                checkoutDate: {
                  lte: new Date(endDate as string),
                  gte: new Date(startDate as string),
                },
              },
            ],
          }),
      },
      select: {
        checkinDate: true,
        checkoutDate: true,
      },
    });

    // Get blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        apartmentId: id,
        ...(startDate &&
          endDate && {
            blockedDate: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }),
      },
      select: {
        blockedDate: true,
        reason: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        blockedDates,
      },
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching availability",
        code: "FETCH_ERROR",
      },
    });
  }
};
