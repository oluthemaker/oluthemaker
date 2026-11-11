// emails/OrderConfirmedEmail.jsx
import React from "react";
import {
  Html,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Section,
  Link,
} from "@react-email/components";

export const OrderConfirmedEmail = ({ orderId, totalPrice, currency = "NGN", manualReview = false, items, shippingPrice = 0, shippingZone }) => {
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  });
  return (
  <Html>
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

        <Heading style={h1Style}>{manualReview ? "Payment Received — Order Under Review." : "Commission Authenticated."}</Heading>
        <Text style={refStyle}>REFERENCE: {orderId}</Text>
        <Section style={summarySection}>
          {items.map((item) => (
            <Text key={item._id?.toString?.() || item.product?.toString?.() || item.name} style={itemStyle}>
              {item.name} (QTY: {item.qty}) — {formatter.format(item.price)}
            </Text>
          ))}
        </Section>
        <Hr style={hrStyle} />
        {shippingZone?.name ? <Text style={textStyle}>Delivery zone: {shippingZone.name}</Text> : null}
        <Text style={textStyle}>Delivery: {formatter.format(shippingPrice)}</Text>
        <Text style={totalStyle}>Total Value: {formatter.format(totalPrice)}</Text>
        <Text style={textStyle}>
          {manualReview
            ? "Your payment was received successfully. We are reviewing stock availability and will contact you shortly with the next steps."
            : "Your specifications have been logged. We will notify you as the commission progresses."}
        </Text>
        <Section style={btnSection}>
          <Link
            href={`${process.env.FRONTEND_URL}/store`}
            style={buttonStyle}
          >
            Continue Shopping
          </Link>
        </Section>
      </Container>
    </Body>
  </Html>
  );
};

const mainStyle = { backgroundColor: "#f9f7f2", padding: "40px 0" };
const containerStyle = {
  backgroundColor: "#ffffff",
  padding: "40px",
  border: "1px solid #1a1a1a10",
};
const h1Style = {
  fontFamily: "serif",
  fontStyle: "italic",
  fontSize: "32px",
  color: "#1a1a1a",
};
const textStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#1a1a1a",
  opacity: "0.8",
};
const refStyle = {
  fontSize: "10px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  fontWeight: "bold",
  margin: "20px 0",
};
const buttonStyle = {
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "12px 24px",
  textTransform: "uppercase",
  fontSize: "10px",
  letterSpacing: "0.2em",
  textDecoration: "none",
};
const footerStyle = {
  fontSize: "9px",
  letterSpacing: "0.4em",
  textAlign: "center",
  marginTop: "40px",
  opacity: "0.4",
};

const summarySection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f9f7f2",
  borderLeft: "2px solid #1a1a1a",
};

const itemStyle = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#1a1a1a",
  margin: "8px 0",
};

const totalStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1a1a1a",
  marginTop: "24px",
  marginBottom: "24px",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
};

const hrStyle = {
  borderTop: "1px solid #1a1a1a10",
  margin: "32px 0",
};

const btnSection = {
  textAlign: "center",
  marginTop: "30px",
  marginBottom: "30px",
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
