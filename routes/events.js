const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const mongoose=require("mongoose");
const Competition = require("../models/competition");

// 1. Add a new event (competition)
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      description,
      sport,
      organizer,
      teams,
      startDate,
      endDate,
      location,
      isPrivate,
      notifications,
      status,
    } = req.body;

    // Basic Validation
    if (!name || !sport || !organizer || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCompetition = new Competition({
      name,
      description,
      sport,
      organizer,
      teams,
      startDate,
      endDate,
      location,
      isPrivate,
      notifications,
      status,
    });

    await newCompetition.save();
    res.status(201).json({ message: "Event added successfully", event: newCompetition });
  } catch (error) {
    res.status(500).json({ message: "Error adding event", error: error.message });
  }
});

// 2. Get all events
router.get("/all", async (req, res) => {
  try {
    const events = await Competition.find().populate("organizer");
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
});
// Get competitions by organizer ID
router.get("/organizer/:organizerId", async (req, res) => {
    try {
        let { organizerId } = req.params;
        organizerId = organizerId.trim(); // Remove any extra whitespace or newline

        if (!mongoose.Types.ObjectId.isValid(organizerId)) {
            return res.status(400).json({ message: "Invalid organizer ID" });
        }

        const competitions = await Competition.find({ organizer: new mongoose.Types.ObjectId(organizerId) })
            .populate("organizer");

        if (competitions.length === 0) {
            return res.status(404).json({ message: "No competitions found for this organizer" });
        }

        res.status(200).json({ competitions });
    } catch (error) {
        console.error("Error fetching competitions:", error);
        res.status(500).json({ message: "Error fetching competitions", error: error.message });
    }
});
  

module.exports = router;
