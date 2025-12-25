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
  if (isConfirmation) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            backgroundColor: "#3056D3",
            padding: "30px",
            textAlign: "center" as const,
            borderRadius: "8px 8px 0 0",
          }}
        >
          <h1 style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>
            Thank You for Contacting Us!
          </h1>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "#f8f9fa",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
            Hi <strong>{name}</strong>,
          </p>

          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
            Thank you for reaching out to us! We have received your message and
            will get back to you as soon as possible.
          </p>

          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "20px",
              borderRadius: "8px",
              margin: "20px 0",
              border: "1px solid #e9ecef",
            }}
          >
            <h3
              style={{
                color: "#3056D3",
                marginTop: 0,
                borderBottom: "1px solid #e9ecef",
                paddingBottom: "10px",
              }}
            >
              Your Message Details:
            </h3>
            <p style={{ margin: "10px 0", color: "#666" }}>
              <strong>Message:</strong>
            </p>
            <p
              style={{
                margin: "10px 0",
                color: "#333",
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
                whiteSpace: "pre-wrap" as const,
              }}
            >
              {message}
            </p>
          </div>

          <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
            If you have any urgent inquiries, feel free to contact us directly.
          </p>

          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <p style={{ fontSize: "14px", color: "#999", margin: 0 }}>
              Best regards,
              <br />
              <strong style={{ color: "#333" }}>The Team</strong>
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center" as const, marginTop: "20px" }}>
          <p style={{ fontSize: "12px", color: "#999" }}>
            This is an automated message. Please do not reply directly to this
            email.
          </p>
        </div>
      </div>
    );
  }

  // Admin notification email
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          backgroundColor: "#3056D3",
          padding: "30px",
          textAlign: "center" as const,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>
          New Contact Form Submission
        </h1>
      </div>

      <div
        style={{
          padding: "30px",
          backgroundColor: "#f8f9fa",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
          You have received a new message from your website contact form.
        </p>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              color: "#3056D3",
              marginTop: 0,
              borderBottom: "1px solid #e9ecef",
              paddingBottom: "10px",
            }}
          >
            Contact Details:
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#666",
                    width: "100px",
                  }}
                >
                  <strong>Name:</strong>
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#333",
                  }}
                >
                  {name}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#666",
                  }}
                >
                  <strong>Email:</strong>
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#333",
                  }}
                >
                  <a href={`mailto:${email}`} style={{ color: "#3056D3" }}>
                    {email}
                  </a>
                </td>
              </tr>
              {phone && (
                <tr>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#666",
                    }}
                  >
                    <strong>Phone:</strong>
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#333",
                    }}
                  >
                    <a href={`tel:${phone}`} style={{ color: "#3056D3" }}>
                      {phone}
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              color: "#3056D3",
              marginTop: 0,
              borderBottom: "1px solid #e9ecef",
              paddingBottom: "10px",
            }}
          >
            Message:
          </h3>
          <p
            style={{
              margin: "10px 0",
              color: "#333",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap" as const,
            }}
          >
            {message}
          </p>
        </div>

        <div style={{ textAlign: "center" as const, marginTop: "20px" }}>
          <a
            href={`mailto:${email}`}
            style={{
              display: "inline-block",
              backgroundColor: "#3056D3",
              color: "#ffffff",
              padding: "12px 30px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Reply to {name}
          </a>
        </div>
      </div>

      <div style={{ textAlign: "center" as const, marginTop: "20px" }}>
        <p style={{ fontSize: "12px", color: "#999" }}>
          Sent from your website contact form •{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
