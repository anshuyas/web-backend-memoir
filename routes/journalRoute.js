import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import JournalEntry from "../model/JournalEntry.js";
import sanitizeHtml from "sanitize-html";
import { Sequelize } from "sequelize";

const router = express.Router();

// Helper function to map moods to scores
const mapMoodToScore = (mood) => {
  const moodMap = { Happy: 5, Content: 4, Neutral: 3, Sad: 2, Depressed: 1 };
  return moodMap[mood] || 3; // Default to neutral
};

// Validate UUID format (prevents invalid ID errors)
const isValidUUID = (id) => /^[0-9a-fA-F-]{36}$/.test(id);

// Fetch milestones & achievements
router.get("/milestones", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(400).json({ success: false, error: "Invalid user ID." });
    }

    // Check if the JournalEntry table exists
    const tableExists = await JournalEntry.describe();
    if (!tableExists) {
      return res.status(500).json({ success: false, error: "Database table not found." });
    }

    const totalEntries = await JournalEntry.count({ where: { userId: req.user.userId } });

    const milestones = [];
    if (totalEntries >= 10) milestones.push({ description: "Wrote 10 journal entries!" });
    if (totalEntries >= 50) milestones.push({ description: "Wrote 50 journal entries!" });
    if (totalEntries >= 100) milestones.push({ description: "Wrote 100 journal entries!" });

    res.json({ success: true, milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ success: false, error: "Database error. Please try again later." });
  }
});

// Get mood trends over time
router.get("/mood-trends", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(400).json({ success: false, error: "Invalid user ID." });
    }

    const entries = await JournalEntry.findAll({
      where: { userId: req.user.userId },
      attributes: ["createdAt", "mood"],
      order: [["createdAt", "ASC"]],
    });

    const moodTrends = entries
      .map((entry) => ({
        date: entry.createdAt ? entry.createdAt.toISOString().split("T")[0] : null,
        moodScore: mapMoodToScore(entry.mood),
      }))
      .filter((entry) => entry.date !== null);

    res.json({ success: true, moodTrends });
  } catch (error) {
    console.error("Error fetching mood trends:", error);
    res.status(500).json({ success: false, error: "Database error. Please try again later." });
  }
});

// Create a new journal entry
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, mood, date } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: User ID missing." });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    const plainTextContent = sanitizeHtml(content, {
      allowedTags: ["b", "i", "em", "strong", "p", "br"],
      allowedAttributes: {},
    });

    const newEntry = await JournalEntry.create({
      userId: req.user.userId,
      title,
      content: plainTextContent,
      mood: mood || "Neutral",
      date: date || new Date().toISOString().split("T")[0],
    });

    res.status(201).json({ success: true, message: "Journal entry created successfully.", entry: newEntry });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({ success: false, error: "Failed to create journal entry." });
  }
});

// Fetch all journal entries for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: User ID missing." });
    }

    const entries = await JournalEntry.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ success: false, error: "Failed to fetch journal entries." });
  }
});

// Fetch recent journal entries (last 5 entries)
router.get("/recent", authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized: User ID missing." });
    }

    const entries = await JournalEntry.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    res.json({ success: true, entries: entries || [] });
  } catch (error) {
    console.error("Error fetching recent journal entries:", error);
    res.status(500).json({ success: false, error: "Failed to fetch recent journal entries." });
  }
});

// Fetch a single journal entry by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid journal entry ID." });
    }

    const entry = await JournalEntry.findOne({
      where: { id, userId: req.user.userId },
    });

    if (!entry) {
      return res.status(404).json({ success: false, error: "Entry not found." });
    }

    res.json({ success: true, entry });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({ success: false, error: "Failed to fetch journal entry." });
  }
});

// Update a journal entry
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid journal entry ID." });
    }

    const entry = await JournalEntry.findOne({ where: { id, userId: req.user.userId } });

    if (!entry) {
      return res.status(404).json({ success: false, error: "Entry not found." });
    }

    const updatedContent = content
      ? sanitizeHtml(content, { allowedTags: ["b", "i", "em", "strong", "p", "br"], allowedAttributes: {} })
      : entry.content;

    await entry.update({ title, content: updatedContent, mood });

    res.json({ success: true, message: "Entry updated successfully.", entry });
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ success: false, error: "Failed to update journal entry." });
  }
});

// Delete a journal entry
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid journal entry ID." });
    }

    const entry = await JournalEntry.findOne({ where: { id, userId: req.user.userId } });

    if (!entry) {
      return res.status(404).json({ success: false, error: "Entry not found." });
    }

    await entry.destroy();
    res.json({ success: true, message: "Entry deleted successfully." });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ success: false, error: "Failed to delete journal entry." });
  }
});

export default router;