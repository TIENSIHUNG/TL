const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data,req,res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MP,
      }
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"HEY 👻" <binlung44qn@gmail.email>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.htm
    });
    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ message: "Email sent successfully" });
    
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = sendEmail;
