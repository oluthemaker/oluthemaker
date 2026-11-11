import React from "react";
import { Html, Body, Container, Text, Heading, Hr, Preview } from "@react-email/components";

export const OrderLookupCodeEmail = ({ customerName, orderReference, code }) => (
  <Html>
    <Preview>Your secure Olú The Maker order access code.</Preview>
    <Body style={{ backgroundColor: "#f9f7f2", padding: "40px 0", fontFamily: "Georgia, serif" }}>
      <Container style={{ backgroundColor: "#fff", maxWidth: "560px", margin: "0 auto", padding: "40px", border: "1px solid #1a1a1a10" }}>
        <Text style={{ textAlign: "center", fontSize: "24px", fontStyle: "italic", margin: "0 0 28px" }}>Olú The Maker</Text>
        <Hr style={{ borderColor: "#1a1a1a15" }} />
        <Heading style={{ fontSize: "28px", fontWeight: 400, fontStyle: "italic", color: "#1a1a1a" }}>Your order, securely within reach.</Heading>
        <Text style={{ fontSize: "14px", lineHeight: 1.7, color: "#333" }}>Hello {customerName || "there"}. Use this one-time code to view the order associated with reference {orderReference}.</Text>
        <Text style={{ textAlign: "center", fontFamily: "monospace", fontSize: "34px", letterSpacing: "0.35em", padding: "20px", backgroundColor: "#f9f7f2" }}>{code}</Text>
        <Text style={{ fontSize: "12px", lineHeight: 1.7, color: "#666" }}>This code expires in 10 minutes and can only be used once. If you did not request it, you can ignore this email.</Text>
        <Hr style={{ borderColor: "#1a1a1a15", marginTop: "28px" }} />
        <Text style={{ textAlign: "center", fontSize: "9px", letterSpacing: "0.3em", color: "#999" }}>OLÚ THE MAKER</Text>
      </Container>
    </Body>
  </Html>
);

export default OrderLookupCodeEmail;
