import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: true, // ✅ Enable JSON parsing!
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (req.headers.authorization !== `Bearer ${process.env.API_KEY}`) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  const { email, code } = req.body; // ✅ Now req.body is populated!

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
  from: `OTP Service <${process.env.SMTP_USER}>`,
  to: email,
  subject: "🔐 Your Verification Code is Here!",
  html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
              color: #ffffff; 
              padding: 30px; 
              border-radius: 12px;
              text-align: center;">

      <h1 style="margin-bottom: 10px; font-size: 28px;">🔐 Secure Verification</h1>
      <p style="font-size: 16px; opacity: 0.85;">
        Hey there! We received a request to verify your email.  
        Enter the code below to proceed:
      </p>

      <div style="
          background: rgba(255,255,255,0.1);
          border: 2px solid #4CAF50;
          padding: 15px;
          margin: 25px auto;
          width: fit-content;
          font-size: 32px; 
          font-weight: bold;
          border-radius: 10px;
          letter-spacing: 4px;
          box-shadow: 0px 0px 15px #4CAF50;
          color: #4CAF50;">
          ${code}
      </div>

      <p style="font-size: 14px; opacity: 0.85;">
        This code will expire in <strong>5 minutes</strong>.  
        If you didn’t request this, please ignore the message.
      </p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid rgba(255,255,255,0.2);">

      <p style="font-size: 12px; opacity: 0.6;">
        © ${new Date().getFullYear()} OTP Service — Securing your world, one code at a time 😎
      </p>

  </div>
  `,
};


    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification code sent successfully ✅" });

  } catch (error) {
    console.error("Email failed:", error);
    res.status(500).json({ message: "Failed to send email ❌" });
  }
}
