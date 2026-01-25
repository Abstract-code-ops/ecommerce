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
  tax,
  discount = 0,
  total,
  shippingAddress,
  paymentMethod,
}) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Global Edge";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#3056D3",
          padding: "30px",
          textAlign: "center" as const,
        }}
      >
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: "28px" }}>
          Order Confirmed! 🎉
        </h1>
        <p style={{ color: "#e0e7ff", margin: "10px 0 0 0", fontSize: "16px" }}>
          Thank you for your order
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: "30px", backgroundColor: "#f8f9fa" }}>
        <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", margin: "0 0 20px 0" }}>
          Hi <strong>{customerName}</strong>,
        </p>

        <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6", margin: "0 0 25px 0" }}>
          Thank you for shopping with {appName}! We&apos;ve received your order and it&apos;s being processed.
        </p>

        {/* Order Details Box */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #e9ecef",
              paddingBottom: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Order Number</p>
              <p style={{ margin: "5px 0 0 0", color: "#3056D3", fontSize: "18px", fontWeight: "bold" }}>
                {orderNumber}
              </p>
            </div>
            <div style={{ textAlign: "right" as const }}>
              <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>Order Date</p>
              <p style={{ margin: "5px 0 0 0", color: "#333", fontSize: "16px" }}>
                {orderDate}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <h3
            style={{
              color: "#333",
              marginTop: 0,
              marginBottom: "15px",
              fontSize: "16px",
            }}
          >
            Order Items
          </h3>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 0",
                borderBottom: index < items.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0", fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                  {item.name}
                </p>
                {(item.size || item.color) && (
                  <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "12px" }}>
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " | "}
                    {item.color && `Color: ${item.color}`}
                  </p>
                )}
                <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "12px" }}>
                  Qty: {item.quantity} × AED {item.unitPrice.toFixed(2)}
                </p>
              </div>
              <p style={{ margin: "0", fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                AED {item.totalPrice.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            marginBottom: "25px",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0, marginBottom: "15px", fontSize: "16px" }}>
            Order Summary
          </h3>

          <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "10px", marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>Subtotal</span>
              <span style={{ color: "#333", fontSize: "14px" }}>AED {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>Shipping</span>
              <span style={{ color: "#333", fontSize: "14px" }}>AED {shipping.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#22c55e", fontSize: "14px" }}>Discount</span>
                <span style={{ color: "#22c55e", fontSize: "14px" }}>-AED {discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#333", fontSize: "18px", fontWeight: "bold" }}>Total</span>
            <span style={{ color: "#3056D3", fontSize: "18px", fontWeight: "bold" }}>
              AED {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
            marginBottom: "25px",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0, marginBottom: "15px", fontSize: "16px" }}>
            Shipping Address
          </h3>
          <p style={{ margin: "0", color: "#333", fontSize: "14px", lineHeight: "1.6" }}>
            {shippingAddress.fullName}
            <br />
            {shippingAddress.street}
            <br />
            {shippingAddress.city}
            {shippingAddress.emirate && `, ${shippingAddress.emirate}`}
            <br />
            {shippingAddress.country || "UAE"}
            {shippingAddress.phone && (
              <>
                <br />
                Phone: {shippingAddress.phone}
              </>
            )}
          </p>
        </div>

        {/* Payment Method */}
        {paymentMethod && (
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
              marginBottom: "25px",
            }}
          >
            <h3 style={{ color: "#333", marginTop: 0, marginBottom: "10px", fontSize: "16px" }}>
              Payment Method
            </h3>
            <p style={{ margin: "0", color: "#333", fontSize: "14px" }}>
              {paymentMethod}
            </p>
          </div>
        )}

        {/* What's Next */}
        <div
          style={{
            backgroundColor: "#e0f2fe",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        >
          <h3 style={{ color: "#0369a1", marginTop: 0, marginBottom: "10px", fontSize: "16px" }}>
            What&apos;s Next?
          </h3>
          <ul style={{ margin: "0", paddingLeft: "20px", color: "#333", fontSize: "14px", lineHeight: "1.8" }}>
            <li>We&apos;ll send you a shipping confirmation email when your order ships.</li>
            <li>You can track your order status in your account.</li>
            <li>Estimated delivery: 3-5 business days.</li>
          </ul>
        </div>

        {/* Help Section */}
        <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: "0" }}>
          Questions about your order? Reply to this email or contact our support team.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "25px",
          textAlign: "center" as const,
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 10px 0" }}>
          {appName}
        </p>
        <p style={{ color: "#64748b", fontSize: "12px", margin: "0" }}>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};
