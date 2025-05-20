// Main backend server for Manhit Exim Pvt. Ltd.
// Handles contact and job application forms, sending all submissions to your email.

const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads (resumes)
const upload = multer({ dest: 'uploads/' }); // Make sure to create an 'uploads' folder

// Helper function to send email via Resend API
async function sendEmail({ to, subject, html, attachments }) {
  const data = {
    from: process.env.MAIL_USER,
    to: [to],
    subject,
    html,
  };
  // Resend API does not support attachments directly; for file attachments, use SendGrid/Mailgun or store file and send link
  // If you want to send a download link for resumes, upload to a storage service and include the link in the email body
  try {
    await axios.post(
      'https://api.resend.com/emails',
      data,
      {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (err) {
    console.error('Email send error:', err.response?.data || err.message);
    return false;
  }
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, course, message } = req.body;
  if (!name || !email || !phone || !course || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // Send email
  const html = `
    <b>Name:</b> ${name}<br>
    <b>Email:</b> ${email}<br>
    <b>Phone:</b> ${phone}<br>
    <b>Course:</b> ${course}<br>
    <b>Message:</b> ${message}
  `;
  const sent = await sendEmail({
    to: process.env.MAIL_TO,
    subject: 'New Contact Form Submission',
    html,
  });
  if (sent) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
  
});

// Job application endpoint (with resume upload)
app.post('/api/job-application', upload.single('resume'), async (req, res) => {
  const { name, email, phone, whatsapp, experience, qualification, job_title } = req.body;
  const resume = req.file;
  if (!name || !email || !phone || !whatsapp || !experience || !qualification || !job_title) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // For attachment, upload to a storage service and include the link in the email
  let resumeLink = '';
  if (resume) {
    // In production, upload to S3/Drive/etc. Here, just show file path (not accessible from web)
    resumeLink = `<br><b>Resume File:</b> ${resume.originalname} (stored at: ${resume.path})`;
  }
  const html = `
    <b>Job Title:</b> ${job_title}<br>
    <b>Name:</b> ${name}<br>
    <b>Email:</b> ${email}<br>
    <b>Phone:</b> ${phone}<br>
    <b>WhatsApp:</b> ${whatsapp}<br>
    <b>Experience:</b> ${experience}<br>
    <b>Qualification:</b> ${qualification}<br>
    ${resumeLink}
  `;
  const sent = await sendEmail({
    to: process.env.MAIL_TO,
    subject: 'New Job Application',
    html,
  });
  if (sent) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

// Registration endpoint (send welcome email)
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // Save user to DB here if needed
  // Send welcome email
  const html = `
    <b>Welcome, ${name}!</b><br>
    Thank you for registering.<br>
    <b>Email:</b> ${email}<br>
    <b>Phone:</b> ${phone}
  `;
  const sent = await sendEmail({
    to: email,
    subject: 'Registration Successful',
    html,
  });
  if (sent) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

// Forgot password endpoint (send reset code)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  // Generate a simple reset token (for demo; use a secure token in production)
  const resetToken = Math.random().toString(36).substr(2, 8);
  // Save resetToken to DB for the user here if needed
  const html = `
    <b>Password Reset Request</b><br>
    Your password reset code is: <b>${resetToken}</b>
  `;
  const sent = await sendEmail({
    to: email,
    subject: 'Password Reset',
    html,
  });
  if (sent) {
    res.json({ success: true, resetToken }); // In production, don't send token in response
  } else {
    res.status(500).json({ success: false, error: 'Failed to send reset email.' });
  }
});

// Reset password endpoint (no email sent, just update DB)
app.post('/api/reset-password', async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // Check resetToken in DB and update password here
  // For demo, just return success
  res.json({ success: true });
});

// Optional: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});