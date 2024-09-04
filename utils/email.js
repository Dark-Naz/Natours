const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      username: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // secure: false,
    // logger: true,
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Confidence Chinaza <hello@dark.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
