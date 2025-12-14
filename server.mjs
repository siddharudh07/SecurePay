import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
let PORT = Number(process.env.PORT || 4000);

// Configurable timings
const OTP_TTL_MS = Number(
  process.env.OTP_TTL_MINUTES ? Number(process.env.OTP_TTL_MINUTES) * 60_000 : 5 * 60_000
);
const OTP_RESEND_COOLDOWN_MS = Number(
  process.env.OTP_RESEND_COOLDOWN_SEC ? Number(process.env.OTP_RESEND_COOLDOWN_SEC) * 1000 : 30_000
);

app.use(cors());
app.use(express.json());

// In-memory OTP store: { [email]: { otp, expiresAt } }
const otpStore = new Map();

// Track last send time per email for cooldowns
const lastSentAt = new Map();

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createTransporter() {
  // Supports generic SMTP using .env, falls back to Ethereal for testing
  const url = process.env.SMTP_URL;
  if (url) {
    return nodemailer.createTransport(url);
  }
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Using Ethereal test SMTP. Login:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailKey = String(email).toLowerCase();

    // Cooldown check
    const last = lastSentAt.get(emailKey) || 0;
    const now = Date.now();
    const remaining = OTP_RESEND_COOLDOWN_MS - (now - last);
    if (remaining > 0) {
      return res.status(429).json({ error: 'Please wait before requesting another OTP', cooldownMs: remaining });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_TTL_MS;
    otpStore.set(emailKey, { otp, expiresAt });

    const transporter = await createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@securepay.local';

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: 'Your SecurePay OTP',
      text: `Your OTP is ${otp}. It expires in ${Math.floor(OTP_TTL_MS/60000)} minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in ${Math.floor(OTP_TTL_MS/60000)} minutes.</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl?.(info) || null;
    if (previewUrl) console.log('Preview OTP email:', previewUrl);
    lastSentAt.set(emailKey, Date.now());
    return res.json({ ok: true, previewUrl, cooldownSec: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000) });
  } catch (err) {
    console.error('send-otp error', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ error: 'OTP not found. Please request again.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'OTP expired. Please request again.' });
  }
  if (String(record.otp) !== String(otp)) return res.status(400).json({ error: 'Invalid OTP' });

  // success, delete to prevent reuse
  otpStore.delete(email.toLowerCase());
  return res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

function startServer(port) {
  const server = app.listen(port, () => {
    PORT = port;
    console.log(`OTP server running on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, trying ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error', err);
      process.exit(1);
    }
  });
}

startServer(PORT);


