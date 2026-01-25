import { NextResponse } from "next/server";
import { Resend } from "resend";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      orderNumber,
      orderDate,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      shippingAddress,
      paymentMethod,
    } = body;

    // Validation
    if (!customerEmail || !orderNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Global Edge";

    // Send order confirmation email to customer
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || `${appName} <onboarding@resend.dev>`,
      to: customerEmail,
      subject: `Order Confirmed - ${orderNumber} | ${appName}`,
      react: (
        <OrderConfirmationEmail
          customerName={customerName || "Valued Customer"}
          orderNumber={orderNumber}
          orderDate={orderDate || new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          discount={discount}
          total={total}
          shippingAddress={shippingAddress}
          paymentMethod={paymentMethod}
        />
      ),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send order confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Order confirmation email sent", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order confirmation email API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
