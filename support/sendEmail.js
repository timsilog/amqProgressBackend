require('dotenv').config({ path: `${__dirname}/../.env` })
const nodemailer = require('nodemailer');

async function main() {
  // Generate test SMTP service account 

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    // port: 587,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SUPPORT_EMAIL,
      pass: process.env.SUPPORT_PW
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.SUPPORT_EMAIL,
    to: "timjose3@gmail.com",
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);