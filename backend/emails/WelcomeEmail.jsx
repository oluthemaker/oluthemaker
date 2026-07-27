// emails/WelcomeEmail.jsx
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
import React from "react";

export const WelcomeEmail = ({ name }) => (
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

        <Heading style={h1Style}>The Olú The Maker Experience Awaits.</Heading>
        <Text style={textStyle}>Welcome, {name}.</Text>
        <Text style={textStyle}>
          You have successfully registered your access to Olu THE MAKER. This is
          a space for commissions and high-end digital assets.
        </Text>
        <Section style={btnSection}>
          <Link href="https://oluthemaker.com/store" style={buttonStyle}>
            Enter the Archive
          </Link>
        </Section>
        <Hr style={hrStyle} />
        <Text style={footerStyle}>OLU THE MAKER — COMMISSIONED SHOES</Text>
      </Container>
    </Body>
  </Html>
);

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

const btnSection = {
  textAlign: "center",
  marginTop: "32px",
  marginBottom: "32px",
};

const hrStyle = {
  borderTop: "1px solid #1a1a1a10",
  margin: "20px 0",
};

const itemStyle = {
  fontSize: "12px",
  color: "#1a1a1a",
  margin: "10px 0",
  fontFamily: "sans-serif",
};

const smallTextStyle = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#1a1a1a",
  opacity: "0.5",
  fontStyle: "italic",
};

// Add these to your styles object
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
