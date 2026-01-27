import * as React from "react";

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
}

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  emirate?: string;
  country?: string;
  phone?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
}) => {
  const brandBlack = "#000000";

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px", backgroundColor: "#ffffff" }}>
      {/* Brand Logo Placeholder */}
      <div style={{ textAlign: "center", paddingBottom: "30px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "900", letterSpacing: "-0.5px" }}>GLOBAL EDGE</h2>
      </div>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0" }}>Order Confirmed</h1>
        <p style={{ color: "#666", margin: 0 }}>Order #{orderNumber} • {orderDate}</p>
      </div>

      <p style={{ fontSize: "16px" }}>Hi {customerName},</p>
      <p style={{ color: "#444", lineHeight: "1.6" }}>Your order is being prepared for shipment. We'll notify you as soon as it's on its way.</p>

      {/* Item List */}
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "30px 0" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th style={{ textAlign: "left", padding: "10px 0", fontSize: "12px", textTransform: "uppercase" }}>Item</th>
            <th style={{ textAlign: "right", padding: "10px 0", fontSize: "12px", textTransform: "uppercase" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "20px 0" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ""}</div>
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "14px" }}>AED {item.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginLeft: "auto", width: "100%", maxWidth: "250px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
          <span>Subtotal</span>
          <span>AED {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
          <span>Shipping</span>
          <span>AED {shipping.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", paddingTop: "15px", borderTop: "2px solid #000", fontWeight: "bold", fontSize: "18px" }}>
          <span>Total</span>
          <span>AED {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Info Box */}
      <div style={{ marginTop: "40px", padding: "25px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Shipping To</h4>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", color: "#333" }}>
          {shippingAddress.fullName}<br />
          {shippingAddress.street}, {shippingAddress.city}<br />
          {shippingAddress.emirate}, UAE
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "50px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <p style={{ fontSize: "12px", color: "#999" }}>
          Questions? Contact us at support@globaledgeshop.com
        </p>
      </div>
    </div>
  );
};