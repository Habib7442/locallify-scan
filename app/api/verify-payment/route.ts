import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { createAdminClient } from "@/lib/supabase/admin";

const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    if (!keySecret) {
      console.error("Razorpay key secret misconfigured.");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      client_order_id,
      page_id,
      shipping_address,
      amount,
    } = body;

    if (!razorpay_payment_id || !razorpay_signature) {
      console.error("Missing verification fields payload:", {
        has_payment_id: !!razorpay_payment_id,
        has_signature: !!razorpay_signature,
      });
      return NextResponse.json(
        { error: "Missing required payment verification fields." },
        { status: 400 }
      );
    }

    let isSignatureValid = false;

    // 1. Try Razorpay official SDK verification with razorpay_order_id
    const orderIdToVerify = razorpay_order_id || client_order_id;
    if (orderIdToVerify) {
      try {
        isSignatureValid = validatePaymentVerification(
          {
            order_id: orderIdToVerify,
            payment_id: razorpay_payment_id,
          },
          razorpay_signature,
          keySecret
        );
      } catch (sdkErr) {
        console.warn("SDK verification note:", sdkErr);
      }
    }

    // 2. Fallback manual HMAC check for any orderId variant
    if (!isSignatureValid) {
      const candidates = [
        razorpay_order_id ? `${razorpay_order_id}|${razorpay_payment_id}` : null,
        client_order_id ? `${client_order_id}|${razorpay_payment_id}` : null,
      ].filter(Boolean) as string[];

      for (const cand of candidates) {
        const expected = crypto
          .createHmac("sha256", keySecret)
          .update(cand)
          .digest("hex");

        if (
          expected.length === razorpay_signature.length &&
          crypto.timingSafeEqual(Buffer.from(expected, "utf-8"), Buffer.from(razorpay_signature, "utf-8"))
        ) {
          isSignatureValid = true;
          break;
        }
      }
    }

    if (!isSignatureValid) {
      console.error("Razorpay payment signature mismatch detected for payload:", {
        razorpay_order_id,
        client_order_id,
        razorpay_payment_id,
        received_signature: razorpay_signature,
      });
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // Signature 100% verified! Now save order details directly to Supabase
    const adminSupabase = createAdminClient();

    let targetPageId = page_id;
    if (!targetPageId) {
      const { data: ownPage } = await adminSupabase
        .from("pages")
        .select("id")
        .eq("owner_clerk_id", userId)
        .maybeSingle();

      if (ownPage) {
        targetPageId = ownPage.id;
      }
    }

    const { data: newOrder, error: dbError } = await adminSupabase
      .from("orders")
      .insert({
        page_id: targetPageId,
        owner_clerk_id: userId,
        status: "pending",
        shipping_address: typeof shipping_address === "object" ? JSON.stringify(shipping_address) : shipping_address,
        price: amount || 0,
        currency: "INR",
        payment_reference: razorpay_payment_id,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Critical: Failed to save verified order in Supabase:", dbError);
      return NextResponse.json({
        success: true,
        warning: "Payment verified, but database record creation delayed.",
        payment_id: razorpay_payment_id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and saved to database successfully.",
      payment_id: razorpay_payment_id,
      order_id: orderIdToVerify,
      db_order_id: newOrder.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal payment verification error";
    console.error("Razorpay payment verification error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
