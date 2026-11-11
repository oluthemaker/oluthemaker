import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Section,
  Link,
  Preview,
} from "@react-email/components";
import * as React from "react";

export const PaymentReminderEmail = ({
  name,
  orderId,
  paymentLink,
  totalPrice,
  currency = "NGN",
}) => {
  const formattedTotal = new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: currency === "NGN" ? 0 : 2 }).format(totalPrice);
  return (
  <Html>
    <Preview>
      Action Required: Complete your commission for order {orderId}
    </Preview>
    <Body style={mainStyle}>
      <Container style={containerStyle}>
        <Section style={logoSection}>
          <Text style={logoText}>
            Olú{" "}
            <span style={{ fontStyle: "normal", fontWeight: "400" }}>
              The Maker
            </span>
          </Text>
        </Section>

        <Hr style={hrStyle} />
        <Heading style={h1Style}>Pending Authentication.</Heading>

        <Text style={textStyle}>Dear {name || "Client"},</Text>

        <Text style={textStyle}>
          Our records indicate that the commission for reference{" "}
          <strong style={highlightStyle}>{orderId}</strong> is currently
          awaiting payment authentication.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailsText}>TOTAL VALUE: {formattedTotal}</Text>
          <Text style={detailsText}>STATUS: AWAITING FUNDS</Text>
        </Section>

        <Text style={textStyle}>
          To ensure your place in the studio schedule and begin the making
          process, please finalize the transaction using the secure link below.
        </Text>

        <Section style={btnSection}>
          <Link href={paymentLink} style={buttonStyle}>
            Complete Payment
          </Link>
        </Section>

        <Hr style={hrStyle} />

        <Text style={footerStyle}>
          This link will take you directly to your saved commission details. If
          you have already completed this transaction, please disregard this
          notice.
        </Text>

        <Text style={studioFooter}>OLU THE MAKER — LONDON STUDIO</Text>
      </Container>
    </Body>
  </Html>
  );
};

// --- ATELIER STYLES ---

const mainStyle = {
  backgroundColor: "#f9f7f2",
  fontFamily: "serif",
  padding: "40px 0",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  border: "1px solid #1a1a1a10",
  maxWidth: "600px",
};

const h1Style = {
  fontFamily: "serif",
  fontStyle: "italic",
  fontSize: "28px",
  fontWeight: "400",
  color: "#1a1a1a",
  marginBottom: "30px",
};

const textStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#1a1a1a",
  marginBottom: "20px",
};

const highlightStyle = {
  color: "#1a1a1a",
  fontWeight: "bold",
};

const detailsBox = {
  backgroundColor: "#f9f7f2",
  padding: "20px",
  marginBottom: "20px",
  borderLeft: "2px solid #1a1a1a",
};

const detailsText = {
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  margin: "5px 0",
  color: "#1a1a1a",
};

const btnSection = {
  textAlign: "center",
  marginTop: "30px",
  marginBottom: "30px",
};

const buttonStyle = {
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "15px 30px",
  textTransform: "uppercase",
  fontSize: "10px",
  letterSpacing: "0.3em",
  textDecoration: "none",
  fontWeight: "bold",
  display: "inline-block",
};

const hrStyle = {
  borderTop: "1px solid #1a1a1a10",
  margin: "30px 0",
};

const footerStyle = {
  fontSize: "12px",
  color: "#1a1a1a",
  fontStyle: "italic",
  opacity: "0.6",
  marginBottom: "20px",
};

const studioFooter = {
  fontSize: "9px",
  letterSpacing: "0.4em",
  textAlign: "center",
  color: "#1a1a1a",
  opacity: "0.4",
};

const logoSection = {
  textAlign: "center",
  paddingBottom: "20px",
};

const logoText = {
  fontSize: "24px",
  fontFamily: "serif",
  fontStyle: "italic",
  fontWeight: "bold",
  letterSpacing: "-0.05em",
  textTransform: "uppercase",
  color: "#1a1a1a",
};

export default PaymentReminderEmail;
