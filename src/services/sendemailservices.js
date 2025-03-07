const nodemailer = require('nodemailer');
const sendForgotCode = async (email, otp, uname) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password,
        },
    });

    const forgotPasswordUrl = process.env.forgotPasswordUrl;
    const forgotPasswordLink = `${forgotPasswordUrl}?otp=${otp}&email=${email}`;
    console.log("Forgot password url is...", forgotPasswordLink);


    let mailOptions = {
        from: `NodeKidos  <${process.env.Email_From}>`,
        to: email,
        subject: 'Vibes Lanka - Reset Password',
        html: `
        <div style="
        width=100%; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family: Arial, sans-serif; line-height: 1.6;
        padding: 45px 30px 60px; background: #f4f7ff;  background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat; background-size: cover; background-position: top center; color: #333;">
         <h2 style="color: #0044cc;">Hi ${uname}!</h2>
            <p>Welcome to <strong>Vibes Lanka Reset Portal</strong>!</p>
            <p>Here is the link to reset your account:</p>
              <a href="${forgotPasswordLink}" style="display:inline-block; color: #ffffff; background-color: #002149; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-size: 18px;">
              Reset Your Password
            </a>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>Thank you for joining us!</p>
            <p style="margin-top: 20px;">Best Regards,<strong>Vibes Lanka Team</strong></p>
            <hr style="margin-top: 20px; border: none; border-top: 1px solid #ccc;" />
            <small style="color: #ffffff;">If you did not request this code, please ignore this email.</small>
        </div>

        <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 10px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
          border-bottom: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 10px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
            Powered by <a href="https://www.instagram.com/nodekidos/" target="_blank" style="display: inline-block; margin-left: 8px;"> NodeKidos </a>
        </p>
        <p style="margin: 0; margin-top: 12px; color: #434343;">
          Copyright © ${new Date().getFullYear()} NodeKidos. All rights reserved.
        </p>
      </footer>
    `,
    };

    const response = await transporter.sendMail(mailOptions)
    if (response) {
        console.log("Inside mailing..", response.response);
        return 'OTP Sent'
    }
    else return 'Error'
}

module.exports = {
    sendForgotCode
}