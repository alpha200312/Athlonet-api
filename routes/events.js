const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const mongoose=require("mongoose");
const auth=require("../middleware/user_jwt");

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
// router.get("/organizer/:organizerId",auth,
//    async (req, res) => {
//     try {
//       const userId=req.user.id;

//         let { organizerId } = req.params;
//         organizerId = organizerId.trim(); // Remove any extra whitespace or newline

//         if (!mongoose.Types.ObjectId.isValid(organizerId)) {
//             return res.status(400).json({ message: "Invalid organizer ID" });
//         }

//         const competitions = await Competition.find({
//           organizer: new mongoose.Types.ObjectId(organizerId),
//           participants: { $ne: userId }, // Exclude competitions the user has joined
//       }).populate("organizer");

//         if (competitions.length === 0) {
//             return res.status(404).json({ message: "No competitions found for this organizer" });
//         }

//         res.status(200).json({ success:true,competitions });
//     } catch (error) {
//         console.error("Error fetching competitions:", error);
//         res.status(500).json({ message: "Error fetching competitions", error: error.message });
//     }
// });
  

router.get("/organizer/:organizerId", async (req, res) => {
  try {
    const { organizerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ success: false, message: "Invalid organizer ID" });
    }

    const competitions = await Competition.find({ organizer: organizerId }).populate("organizer");

    res.status(200).json({ success: true, competitions });
  } catch (error) {
    console.error("Error fetching competitions by organizer:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.put('/edit/:id', async (req, res) => {
  try {
    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedCompetition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    res.status(200).json({ success: true, competition: updatedCompetition });
  } catch (error) {
    console.error('Error updating competition:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/myCompetitions',auth, async (req, res) => {
  try {
      const userId = req.user.id; // ✅ Get user from auth middleware

      const competitions = await Competition.find({ participants: userId }).populate("organizer");

      res.status(200).json({ success: true, competitions });
  } catch (error) {
      console.error("Error fetching joined competitions:", error);
      res.status(500).json({ message: "Error fetching competitions", error: error.message });
  }
});
router.post('/join/:competitionId', auth, async (req, res) => {
  try {
    console.log("inside the comptetion for verfication")
      const { competitionId } = req.params;
      console.log(competitionId +" competion id");

      const userId = req.user.id; // ✅ Get user from authentication middleware
       console.log(userId+"user id")
      const competition = await Competition.findById(competitionId);

      if (!competition) {
          return res.status(404).json({ success: false, message: 'Competition not found' });
      }

      // Check if user already joined
      if (competition.participants.includes(userId)) {
          return res.status(400).json({ success: false, message: 'Already joined this competition' });
      }

      // Add user to participants
      competition.participants.push(userId);
      await competition.save();

      res.json({ success: true, message: 'Joined competition successfully', competition });
  } catch (error) {
      console.error("Error joining competition:", error);
      res.status(500).json({ success: false, message: "Error joining competition", error: error.message });
  }
});


// POST: Add an announcement to a competition
router.post('/announcement/:competitionId',  async (req, res) => {
  const { competitionId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, message: 'Announcement text is required' });
  }

  try {
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    competition.announcements.push({ text });
    await competition.save();

    res.status(200).json({
      success: true,
      message: 'Announcement added successfully',
      announcements: competition.announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding announcement',
      error: error.message
    });
  }
});

// GET: Fetch announcements for a competition
router.get('/announcement/:competitionId', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.competitionId).select('announcements');
    console.log("inside announcements log" + competition);
    
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    res.status(200).json({
      success: true,
      announcements: competition.announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});


module.exports = router;
