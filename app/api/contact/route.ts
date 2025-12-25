import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactEmailTemplate } from "@/components/emails/contact-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Send email to admin/business
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Contact Form <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "delivered@resend.dev",
      subject: `New Contact Form Submission from ${name}`,
      react: ContactEmailTemplate({
        name,
        email,
        phone,
        message,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Contact Form <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for contacting us!",
      react: ContactEmailTemplate({
        name,
        email,
        phone,
        message,
        isConfirmation: true,
      }),
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
