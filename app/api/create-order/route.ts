import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    if (!keyId || !keySecret) {
      console.error("Razorpay key configuration missing");
      return NextResponse.json({ error: "Payment gateway misconfigured." }, { status: 500 });
    }

    const body = await request.json();
    const baseAmount = Number(body.baseAmount);

    if (isNaN(baseAmount) || baseAmount < 1) {
      return NextResponse.json({ error: "Invalid amount. Minimum ₹1 required." }, { status: 400 });
    }

    // Dynamic Shipping Fee: FREE (₹0) for Silchar local delivery, flat ₹50 for other cities
    const isSilchar = body.city && String(body.city).trim().toLowerCase().includes("silchar");
    const shippingFee = isSilchar ? 0 : 50;

    // Subtotal = baseAmount + shippingFee
    const subtotal = baseAmount + shippingFee;
    // 18% GST on subtotal
    const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmountInRupees = subtotal + gstAmount;
    const totalAmountInPaise = Math.round(totalAmountInRupees * 100);

    if (totalAmountInPaise < 100) {
      return NextResponse.json({ error: "Amount must be at least ₹1 (100 paise)." }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create Primary Razorpay Order with EXACT Total Amount (including 18% GST)
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const order = await instance.orders.create({
      amount: totalAmountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId,
        productId: body.productId || "custom",
        baseAmount: baseAmount.toString(),
        shippingFee: shippingFee.toString(),
        isSilchar: isSilchar ? "true" : "false",
        gstAmount: gstAmount.toString(),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: totalAmountInPaise,
      currency: "INR",
      baseAmount,
      shippingFee,
      isSilchar,
      gstAmount,
      totalAmount: totalAmountInRupees,
      key: keyId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal order creation error";
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
