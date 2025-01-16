const express = require('express');
const router = express.Router();
const Organization = require('../models/organization');
const bcryptjs = require('bcryptjs');

// Add a new organization
router.post('/add', async (req, res) => {
  try {
    const { name, type, address, contactEmail, password } = req.body;

    if (!name || !type || !contactEmail || !password) {
      return res.status(400).json({ message: 'Name, type, contact email, and password are required' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newOrganization = new Organization({
      name,
      type,
      address,
      contactEmail,
      password: hashedPassword
    });

    await newOrganization.save();
    res.status(201).json({ message: 'Organization added successfully', organization: newOrganization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Organization login
router.post('/login', async (req, res) => {
  try {
    const { contactEmail, password } = req.body;

    if (!contactEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const organization = await Organization.findOne({ contactEmail });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isPasswordValid = await bcryptjs.compare(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, message: 'Login successful', organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Get all organizations
router.get('/all', async (req, res) => {
  try {
    // Retrieve only verified organizations
    const organizations = await Organization.find({ isVerified: true });
    res.status(200).json({ success: true, organizations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  
  
  

module.exports = router;
