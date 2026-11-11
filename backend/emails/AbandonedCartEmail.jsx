import React from "react";
import { Html, Body, Container, Text, Heading, Hr, Section, Link } from "@react-email/components";

export const AbandonedCartEmail = ({ customerName, items, recoveryUrl, unsubscribeUrl, reminderNumber }) => (
  <Html>
    <Body style={{ backgroundColor: "#f9f7f2", padding: "36px 0", fontFamily: "Arial, sans-serif", color: "#1a1a1a" }}>
      <Container style={{ backgroundColor: "#fff", maxWidth: "560px", padding: "36px", border: "1px solid #1a1a1a10" }}>
        <Text style={{ textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "23px", letterSpacing: "-1px" }}>Olú The Maker</Text>
        <Hr style={{ borderColor: "#e8e4dc", margin: "28px 0" }} />
        <Heading style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "30px" }}>
          {reminderNumber === 1 ? "Your selection is waiting." : "A final note about your selection."}
        </Heading>
        <Text style={{ fontSize: "14px", lineHeight: 1.7 }}>Hello {customerName || "there"}, you left a few pieces in your selection. If you would still like them, you can return to your checkout below.</Text>
        <Section style={{ backgroundColor: "#f9f7f2", padding: "18px 22px", margin: "26px 0" }}>
          {items.map((item, index) => <Text key={`${item.productId}-${index}`} style={{ fontSize: "12px", lineHeight: 1.7, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.name} · QTY {item.qty}</Text>)}
        </Section>
        <Section style={{ textAlign: "center", margin: "30px 0" }}>
          <Link href={recoveryUrl} style={{ backgroundColor: "#1a1a1a", color: "#fff", padding: "14px 24px", textDecoration: "none", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Return to your selection</Link>
        </Section>
        <Text style={{ fontSize: "11px", lineHeight: 1.7, color: "#777" }}>This reminder was sent because you asked us to email you about an unfinished checkout. Items and availability may change before you complete your order.</Text>
        <Text style={{ fontSize: "11px", lineHeight: 1.7, color: "#777" }}>We will not send more than two reminders for this checkout. <Link href={unsubscribeUrl} style={{ color: "#555" }}>Unsubscribe from these reminders</Link>.</Text>
      </Container>
    </Body>
  </Html>
);
