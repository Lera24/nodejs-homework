const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

const { SENDGRIDCODE } = process.env;

sgMail.setApiKey(SENDGRIDCODE);

const sendEmail = async (data) => {
    try {
        const email = { ...data, from: "bedulinavalera21@gmail.com" }
        await sgMail.send(email);
        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = sendEmail;