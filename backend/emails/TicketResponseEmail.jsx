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

export const TicketResponseEmail = ({
  userName,
  subject,
  messageSnippet,
  ticketId,
}) => (
  <Html>
    <Body style={mainStyle}>
      <Container style={containerStyle}>
        <Section style={logoSection}>
          <Text style={logoText}>Olú The Maker</Text>
        </Section>
        <Hr style={hrStyle} />
        <Heading style={h1Style}>New Correspondence.</Heading>
        <Text style={refStyle}>INQUIRY: {subject}</Text>
        <Section style={messageSection}>
          <Text style={itemStyle}>
            The Atelier has responded to your inquiry:
          </Text>
          <Text style={textStyle}>"{messageSnippet}..."</Text>
        </Section>
        <Section style={btnSection}>
          <Link
            href={`${process.env.FRONTEND_URL}/profile`}
            style={buttonStyle}
          >
            View Correspondence
          </Link>
        </Section>
        <Text style={footerStyle}>DIRECT CONCIERGE SERVICE</Text>
      </Container>
    </Body>
  </Html>
);

// Reuse your existing styles here (mainStyle, containerStyle, h1Style, etc.)
const mainStyle = { backgroundColor: "#f9f7f2", padding: "40px 0" };
const containerStyle = {
  backgroundColor: "#ffffff",
  padding: "40px",
  border: "1px solid #1a1a1a10",
};
const h1Style = {
  fontFamily: "serif",
  fontStyle: "italic",
  fontSize: "28px",
  color: "#1a1a1a",
};
const textStyle = {
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "1.6",
  color: "#1a1a1a",
  opacity: "0.7",
};
const refStyle = {
  fontSize: "9px",
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
const logoSection = { textAlign: "center", paddingBottom: "20px" };
const logoText = {
  fontSize: "24px",
  fontFamily: "serif",
  fontStyle: "italic",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: "#1a1a1a",
};
const hrStyle = { borderTop: "1px solid #1a1a1a10", margin: "32px 0" };
const btnSection = { textAlign: "center", marginTop: "30px" };
const messageSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f9f7f2",
  borderLeft: "2px solid #1a1a1a",
};
const itemStyle = {
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: "bold",
  marginBottom: "12px",
};
const footerStyle = {
  fontSize: "8px",
  letterSpacing: "0.4em",
  textAlign: "center",
  marginTop: "40px",
  opacity: "0.4",
};
