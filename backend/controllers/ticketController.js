import Ticket from "../models/ticketModel.js";
import { sendEmail } from "../utils/mailer.js";

// controllers/ticketController.js
export const createTicket = async (req, res) => {
  const { subject, message } = req.body;
  const ticket = new Ticket({
    user: req.user._id,
    subject,
    messages: [{ sender: req.user._id, message, isAdmin: false }],
  });
  const createdTicket = await ticket.save();
  res.status(201).json(createdTicket);
};

export const replyToTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (ticket) {
    const newMessage = {
      sender: req.user._id,
      message: req.body.message,
      isAdmin: req.user.isAdmin,
    };

    ticket.messages.push(newMessage);
    await ticket.save();

    // Notify User if the Admin is the one replying
    if (req.user.isAdmin) {
      await sendEmail("TICKET_RESPONSE", ticket.user.email, {
        userName: ticket.user.name,
        subject: ticket.subject,
        messageSnippet: req.body.message.substring(0, 100), // Only send a preview
        ticketId: ticket._id,
      });
    }

    res.json(ticket);
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
};

// Get all tickets for the logged-in user
export const getMyTickets = async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json(tickets);
};

// Get all tickets (Admin only)
export const getAllTickets = async (req, res) => {
  const tickets = await Ticket.find({})
    .populate("user", "name email")
    .sort({ updatedAt: -1 });
  res.json(tickets);
};

// Get single ticket by ID
export const getTicketById = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
};

// Optional: Close a ticket
export const closeTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (ticket) {
    ticket.status = "closed";
    await ticket.save();
    res.json({ message: "Ticket marked as resolved" });
  } else {
    res.status(404).json({ message: "Ticket not found" });
  }
};
