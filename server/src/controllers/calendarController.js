import CalendarEvent from "../models/CalendarEvent.js";

const toResponse = (event) => ({
  id: event._id,
  title: event.title,
  date: event.date,
  type: event.type,
  createdAt: event.createdAt,
});

// GET /api/calendar/upcoming — returns next 10 future events
export const getUpcomingEvents = async (_req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const events = await CalendarEvent.find({ date: { $gte: now } })
      .sort({ date: 1 })
      .limit(10);
    return res.status(200).json({ events: events.map(toResponse) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events.", error: error.message });
  }
};

// POST /api/calendar — admin creates event
export const createEvent = async (req, res) => {
  try {
    const { title, date, type } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required." });
    }
    const event = await CalendarEvent.create({
      title,
      date: new Date(date),
      type: type || "event",
      createdBy: req.user._id,
    });
    return res.status(201).json({ message: "Event created.", event: toResponse(event) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create event.", error: error.message });
  }
};

// DELETE /api/calendar/:id — admin deletes event
export const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    await event.deleteOne();
    return res.status(200).json({ message: "Event deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete event.", error: error.message });
  }
};
