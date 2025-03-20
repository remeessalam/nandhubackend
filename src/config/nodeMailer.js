const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, body, name }) => {
  try {
    // Check if required fields are provided
    if (!to || !subject || !body || !name) {
      throw new Error("Missing required fields: to, subject, body, name");
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // Email options
    const mailOptions = {
      from: `${name} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};

module.exports = sendEmail;
