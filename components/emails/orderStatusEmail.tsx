import * as React from "react";

interface OrderStatusEmailProps {
  customerName: string;
  orderNumber: string;
  statusTitle: string; // e.g., "Your order has shipped"
  statusDescription: string;
  accentColor?: string; // e.g., "#000000" or "#d9534f" for cancellation
  items: any[];
  total: number;
  shippingAddress: any;
  trackingNumber?: string;
}

export const OrderStatusEmail: React.FC<OrderStatusEmailProps> = ({
  customerName,
  orderNumber,
  statusTitle,
  statusDescription,
  accentColor = "#000000",
  items,
  total,
  shippingAddress,
  trackingNumber,
}) => {
  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "40px 20px", backgroundColor: "#ffffff", color: "#000000" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", borderBottom: "2px solid #eee", paddingBottom: "20px", marginBottom: "30px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", letterSpacing: "2px" }}>GLOBAL EDGE</h2>
      </div>

      {/* Hero Status Section */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 16px 0", textTransform: "uppercase", lineHeight: "1.2" }}>
          {statusTitle}
        </h1>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#444", margin: 0 }}>
          Hi {customerName}, <br />
          {statusDescription}
        </p>
        
        {trackingNumber && (
          <div style={{ marginTop: "24px" }}>
            <a href={`https://track-your-package.com/${trackingNumber}`} 
               style={{ backgroundColor: "#000", color: "#fff", padding: "12px 24px", textDecoration: "none", fontWeight: "bold", fontSize: "14px", display: "inline-block", borderRadius: "2px" }}>
              TRACK YOUR ORDER
            </a>
          </div>
        )}
      </div>

      {/* Order Details Summary */}
      <div style={{ borderTop: "1px solid #000", paddingTop: "20px" }}>
        <p style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "20px" }}>
          Order Summary — #{orderNumber}
        </p>
        
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
            <span>{item.quantity}x {item.name} {item.size ? `(${item.size})` : ""}</span>
            <span style={{ fontWeight: "600" }}>AED {item.totalPrice.toFixed(2)}</span>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #eee", marginTop: "15px", paddingTop: "15px", display: "flex", justifyContent: "space-between", fontWeight: "900", fontSize: "18px" }}>
          <span>TOTAL</span>
          <span>AED {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #eee" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#888" }}>Delivering To</h4>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
          <strong>{shippingAddress.fullName}</strong><br />
          {shippingAddress.street}, {shippingAddress.city}<br />
          {shippingAddress.emirate}, UAE
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <p style={{ fontSize: "11px", color: "#999", letterSpacing: "0.5px" }}>
          &copy; {new Date().getFullYear()} GLOBAL EDGE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
};