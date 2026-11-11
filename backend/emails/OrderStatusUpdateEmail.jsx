import React from "react";
import { Html, Body, Container, Text, Heading, Hr, Section, Link, Preview } from "@react-email/components";

const labels = {
  pending: "Order received",
  processing: "In preparation",
  ready_for_dispatch: "Ready for dispatch",
  shipped: "On its way",
  completed: "Delivered",
  cancelled: "Cancelled",
  manual_review: "Under review",
};

export const OrderStatusUpdateEmail = ({ orderId, customerName, status, note, trackingNumber, trackingUrl }) => (
  <Html>
    <Preview>Your Olú The Maker order has been updated.</Preview>
    <Body style={{ backgroundColor: "#f9f7f2", padding: "40px 0", fontFamily: "Georgia, serif" }}>
      <Container style={{ backgroundColor: "#fff", maxWidth: "560px", margin: "0 auto", padding: "40px", border: "1px solid #1a1a1a10" }}>
        <Text style={{ textAlign: "center", fontSize: "24px", fontStyle: "italic", margin: "0 0 28px" }}>Olú The Maker</Text>
        <Hr style={{ borderColor: "#1a1a1a15" }} />
        <Heading style={{ fontSize: "28px", fontWeight: 400, fontStyle: "italic", color: "#1a1a1a" }}>Your order has moved forward.</Heading>
        <Text style={{ fontSize: "14px", lineHeight: 1.7, color: "#333" }}>Hello {customerName}, the fulfilment status for your order has been updated.</Text>
        <Section style={{ backgroundColor: "#f9f7f2", padding: "22px", borderLeft: "2px solid #1a1a1a" }}>
          <Text style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px" }}>Order reference</Text>
          <Text style={{ fontFamily: "monospace", fontSize: "12px", margin: "0 0 18px" }}>{orderId}</Text>
          <Text style={{ fontSize: "18px", fontStyle: "italic", margin: 0 }}>{labels[status] || status}</Text>
          {trackingNumber ? <Text style={{ fontSize: "12px", marginBottom: 0 }}>Tracking number: {trackingNumber}</Text> : null}
        </Section>
        {note ? <Text style={{ fontSize: "13px", lineHeight: 1.7 }}>A note from our team: {note}</Text> : null}
        {trackingUrl ? <Section style={{ textAlign: "center", margin: "28px 0" }}><Link href={trackingUrl} style={{ backgroundColor: "#1a1a1a", color: "#fff", padding: "14px 24px", fontSize: "10px", letterSpacing: "0.2em", textDecoration: "none", textTransform: "uppercase" }}>Track your delivery</Link></Section> : null}
        <Hr style={{ borderColor: "#1a1a1a15", marginTop: "28px" }} />
        <Text style={{ fontSize: "11px", lineHeight: 1.6, color: "#666" }}>If you have any questions, please contact our studio and include your order reference.</Text>
        <Text style={{ textAlign: "center", fontSize: "9px", letterSpacing: "0.3em", color: "#999" }}>OLÚ THE MAKER</Text>
      </Container>
    </Body>
  </Html>
);

export default OrderStatusUpdateEmail;
