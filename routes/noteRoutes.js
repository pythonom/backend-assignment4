const express = require("express");
const mongoose = require("mongoose");

const Note = require("../models/Note");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Protect every route in this file
router.use(protect);

// ======================================
// 1. Note Creation
// POST /api/notes
// ======================================

router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required.",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user._id,
    });

    res.status(201).json({
      message: "Note created successfully.",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================
// 2. GET ALL MY NOTES
// GET /api/notes
// ======================================

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: notes.length,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================
// 3. GET SINGLE NOTE
// GET /api/notes/:id
// ======================================

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    res.status(200).json({
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================
// 4. UPDATE NOTE
// PUT /api/notes/:id
// ======================================

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid note ID.",
      });
    }

    const { title, content } = req.body;

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty.",
        });
      }

      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          message: "Content cannot be empty.",
        });
      }

      updates.content = content.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a title or content to update.",
      });
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    res.status(200).json({
      message: "Note updated successfully.",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================
// 5. DELETE NOTE
// DELETE /api/notes/:id
// ======================================

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found.",
      });
    }

    res.status(200).json({
      message: "Note deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
