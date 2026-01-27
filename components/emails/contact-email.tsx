import * as React from "react";

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
  isConfirmation?: boolean;
}

export const ContactEmailTemplate: React.FC<ContactEmailTemplateProps> = ({
  name,
  email,
  phone,
  message,
  isConfirmation = false,
}) => {
  const brandBlack = "#111827"; // Deep slate/black from site
  const brandAccent = "#374151"; 
  
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", color: brandBlack }}>
      {/* Header */}
      <div style={{ backgroundColor: brandBlack, padding: "40px 20px", textAlign: "center" }}>
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: "22px", letterSpacing: "1px", textTransform: "uppercase" }}>
          {isConfirmation ? "Message Received" : "New Inquiry"}
        </h1>
      </div>

      <div style={{ padding: "40px 30px", border: "1px solid #eeeeee", borderTop: "none" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
          Hi <strong>{name}</strong>,
        </p>
        <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#4b5563" }}>
          {isConfirmation 
            ? "Thank you for reaching out to Global Edge. Our team has received your inquiry and will respond shortly."
            : "You have received a new message through the website contact form."}
        </p>

        <div style={{ margin: "30px 0", padding: "20px", borderLeft: `3px solid ${brandBlack}`, backgroundColor: "#f9fafb" }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: brandBlack, margin: "0 0 10px 0" }}>Details</h3>
          <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Email:</strong> {email}</p>
          {phone && <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Phone:</strong> {phone}</p>}
          <p style={{ marginTop: "15px", fontSize: "14px", fontWeight: "bold" }}>Message:</p>
          <p style={{ fontSize: "14px", color: "#374151", fontStyle: "italic", lineHeight: "1.5" }}>"{message}"</p>
        </div>

        {!isConfirmation && (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <a href={`mailto:${email}`} style={{ backgroundColor: brandBlack, color: "#ffffff", padding: "12px 25px", textDecoration: "none", fontSize: "14px", fontWeight: "bold", borderRadius: "2px" }}>
              REPLY TO CUSTOMER
            </a>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af", fontSize: "12px" }}>
        © {new Date().getFullYear()} Global Edge. All rights reserved.
      </div>
    </div>
  );
};