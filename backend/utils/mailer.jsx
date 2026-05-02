import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import dotenv from "dotenv";
dotenv.config();

// Import all templates
import { WelcomeEmail } from "../emails/WelcomeEmail.jsx";
import { ResetPasswordEmail } from "../emails/ResetPasswordEmail.jsx";
import { OrderConfirmedEmail } from "../emails/OrderConfirmedEmail.jsx";
import PaymentReminderEmail from "../emails/PaymentReminderEmail.jsx";
import { TicketResponseEmail } from "../emails/TicketResponseEmail.jsx";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Olú The Maker <info@oluthemaker.com>";

export const sendEmail = async (type, to, data) => {
  let subject, component;

  switch (type) {
    case "WELCOME":
      subject = "The Studio Awaits.";
      component = <WelcomeEmail name={data.name} />;
      break;
    case "RESET_PASSWORD":
      subject = "Security Credentials.";
      component = <ResetPasswordEmail resetLink={data.resetLink} />;
      break;
    case "ORDER_CONFIRMED":
      subject = `Commission Authenticated: ${data.orderId}`;
      component = (
        <OrderConfirmedEmail
          orderId={data.orderId}
          totalPrice={data.totalPrice}
          items={data.items}
        />
      );
      break;
    case "PAYMENT_REMINDER":
      subject = `Pending Authentication: ${data.orderId}`;
      component = (
        <PaymentReminderEmail
          name={data.name}
          orderId={data.orderId}
          totalPrice={data.totalPrice}
          paymentLink={data.paymentLink}
        />
      );
      break;
    case "TICKET_RESPONSE":
      subject = "Correspondence Updated.";
      component = (
        <TicketResponseEmail
          userName={data.userName}
          subject={data.subject}
          messageSnippet={data.messageSnippet}
          ticketId={data.ticketId}
        />
      );
      break;
    default:
      console.error(`❌ Mailer Error: Unknown email type "${type}"`);
      return null;
  }
  try {
    // Note: It's safer to await the render, especially if you ever use Tailwind in your emails
    const html = await render(component);

    const { data: responseData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return null;
    }

    console.log("✅ Email sent successfully:", responseData);
    return responseData;
  } catch (err) {
    console.error("❌ Mailer Execution Error:", err);
    return null;
  }
};
