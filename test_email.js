const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ammarxs.dev@gmail.com",
    pass: "qiby fqxo lzbi wqth",
  },
});

async function test() {
  console.log("Sending test email...");
  try {
    const res = await transporter.sendMail({
      from: '"Brioinc Test" <ammarxs.dev@gmail.com>',
      to: "ammarxs.dev@gmail.com",
      subject: "Test Email from Brioinc",
      text: "This is a test email.",
    });
    console.log("Email sent successfully!", res);
  } catch (err) {
    console.error("Nodemailer Error:", err);
  }
}

test();
