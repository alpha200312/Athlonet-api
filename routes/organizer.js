const express = require('express');
const router = express.Router();
const Organization = require('../models/organization');

// Add a new organization
router.post('/add', async (req, res) => {
  try {
    const { name, type, address, contactEmail } = req.body;

    // Validate required fields
    if (!name || !type || !contactEmail) {
      return res.status(400).json({ message: 'Name, type, and contact email are required' });
    }

    // Create and save new organization
    const newOrganization = new Organization({
      name,
      type,
      address,
      contactEmail
    });

    await newOrganization.save();
    res.status(201).json({ message: 'Organization added successfully', organization: newOrganization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all organizations
router.get('/all', async (req, res) => {
    try {
      const organizations = await Organization.find();
      res.status(200).json(organizations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  

module.exports = router;
