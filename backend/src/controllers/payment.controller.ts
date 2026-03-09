import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

// @desc    Create Stripe payment intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        apartment: {
          include: {
            landlord: true,
          },
        },
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

    // Verify user owns the booking
    if (booking.renterId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Not authorized",
          code: "FORBIDDEN",
        },
      });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Payment already completed",
          code: "PAYMENT_EXISTS",
        },
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(booking.totalPrice) * 100), // Convert to cents
      currency: "usd",
      metadata: {
        bookingId: booking.id,
        apartmentId: booking.apartmentId,
        renterId: booking.renterId,
        landlordId: booking.apartment.landlordId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create or update payment record
    const payment = existingPayment
      ? await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            transactionId: paymentIntent.id,
            status: "PENDING",
          },
        })
      : await prisma.payment.create({
          data: {
            bookingId,
            amount: booking.totalPrice,
            currency: "USD",
            paymentMethod: "STRIPE",
            transactionId: paymentIntent.id,
            status: "PENDING",
          },
        });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      },
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error creating payment intent",
        code: "PAYMENT_ERROR",
      },
    });
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/v1/payments/webhook/stripe
// @access  Public (Stripe)
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Helper: Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  // Update payment status
  await prisma.payment.update({
    where: { bookingId },
    data: {
      status: "COMPLETED",
      paymentDate: new Date(),
    },
  });

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  // TODO: Send confirmation email
  console.log(`Payment successful for booking: ${bookingId}`);
}

// Helper: Handle failed payment
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  // Update payment status
  await prisma.payment.update({
    where: { bookingId },
    data: { status: "FAILED" },
  });

  // TODO: Send failure notification
  console.log(`Payment failed for booking: ${bookingId}`);
}
