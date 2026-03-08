import * as React from "react";

interface NewsletterWelcomeEmailProps {
  couponCode: string;
  discountValue: number;
  expiresAt?: string;
}

export const NewsletterWelcomeEmail: React.FC<NewsletterWelcomeEmailProps> = ({
  couponCode,
  discountValue,
  expiresAt,
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://globaledge.ae';

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px", backgroundColor: "#ffffff" }}>
      {/* Brand Logo */}
      <div style={{ textAlign: "center", paddingBottom: "30px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "900", letterSpacing: "-0.5px" }}>GLOBAL EDGE</h2>
      </div>

      {/* Welcome Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0", color: "#1B3022" }}>Welcome to the Family!</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "16px" }}>
          Thank you for subscribing to our newsletter
        </p>
      </div>

      {/* Message */}
      <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#444" }}>
        <p>
          As a thank you for joining our community, here's an exclusive discount just for you!
        </p>
      </div>

      {/* Coupon Box */}
      <div style={{ 
        background: "linear-gradient(135deg, #1B3022 0%, #2d4a36 100%)", 
        borderRadius: "16px", 
        padding: "40px 30px", 
        textAlign: "center",
        marginBottom: "30px",
      }}>
        <p style={{ color: "#9DBE91", fontSize: "14px", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "2px" }}>
          Your Exclusive Code
        </p>
        <div style={{ 
          fontSize: "36px", 
          fontWeight: "bold", 
          color: "#ffffff",
          letterSpacing: "4px",
          marginBottom: "15px",
          fontFamily: "monospace",
        }}>
          {couponCode}
        </div>
        <div style={{ 
          fontSize: "24px", 
          color: "#9DBE91",
          fontWeight: "600",
        }}>
          {discountValue}% OFF
        </div>
        {expiresAt && (
          <p style={{ color: "#9DBE91", fontSize: "12px", margin: "15px 0 0 0", opacity: 0.8 }}>
            Valid until {new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Shop Now Button */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <a 
          href={`${baseUrl}/shop`}
          style={{
            display: "inline-block",
            backgroundColor: "#9DBE91",
            color: "#ffffff",
            padding: "16px 48px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          Shop Now & Save
        </a>
      </div>

      {/* Instructions */}
      <div style={{ 
        backgroundColor: "#F4F5F2", 
        borderRadius: "12px", 
        padding: "20px",
        marginBottom: "30px",
      }}>
        <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "#1B3022" }}>
          How to use your code:
        </p>
        <ol style={{ margin: 0, paddingLeft: "20px", color: "#5A6B5E", fontSize: "14px", lineHeight: "1.8" }}>
          <li>Browse our collection and add items to your cart</li>
          <li>Go to checkout and enter your coupon code</li>
          <li>Enjoy your exclusive {discountValue}% discount!</li>
        </ol>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        paddingTop: "30px", 
        borderTop: "1px solid #eee",
        color: "#999",
        fontSize: "12px",
      }}>
        <p style={{ margin: "0 0 10px 0" }}>
          You received this email because you subscribed to our newsletter.
        </p>
        <p style={{ margin: 0 }}>
          <a href={`${baseUrl}/unsubscribe`} style={{ color: "#9DBE91", textDecoration: "underline" }}>
            Unsubscribe
          </a>
          {" | "}
          <a href={baseUrl} style={{ color: "#9DBE91", textDecoration: "underline" }}>
            Visit Website
          </a>
        </p>
        <p style={{ margin: "15px 0 0 0" }}>
          © {new Date().getFullYear()} Global Edge. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default NewsletterWelcomeEmail;
