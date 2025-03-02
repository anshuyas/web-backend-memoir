const { JournalEntry } = require("../models");

// Get all journal entries for a user
exports.getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure authentication is in place
    const entries = await JournalEntry.findAll({
      where: { userId },
      order: [["date", "DESC"]], // Sort by latest date
    });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
};

// Add a new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { date, mood, content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!date || !mood || !content) {
      return res.status(400).json({ message: "Date, mood, and content are required" });
    }

    const newEntry = await JournalEntry.create({ userId, date, mood, content });
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ message: "Error creating journal entry" });
  }
};
