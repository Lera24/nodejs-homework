const express = require('express');
const { User } = require('../../models/user');
const router = express.Router();
const { authenticate, upload } = require('../../middlewares');
const path = require("path");
const fs = require("fs/promises");
const { NotFound, BadRequest } = require("http-errors");
const sendEmail = require("../../utils/sendEmail");

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");

router.get("/logout", authenticate, async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });
    res.status(204).send();
})

router.get("/current", authenticate, async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
        user: {
            email,
            subscription
        }
    })
})

router.patch('/avatars', authenticate, upload.single('avatar'), async (req, res) => {
    const { path: tempUpload, originalname } = req.file;
    const { _id: id } = req.user;
    const imageName = `${id}_${originalname}`;
    try {
        const resultUpload = path.join(avatarsDir, imageName);
        await fs.rename(tempUpload, resultUpload);
        const avatarURL = path.join("public", "avatars", originalname);
        await User.findByIdAndUpdate(req.user._id, { avatarURL });
        res.json({ avatarURL });
    } catch (error) {
        await fs.unlink(tempUpload);
        throw error;
    }
});

router.get("verify/:verificationToken", async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await User.findOne({ verificationToken });
        if (!user) {
            throw new NotFound("User not found");
        }
        await User.findByIdAndUpdate(user._id, { verificationToken: null, verify: true });
        res.json({
            message: 'Verification successful',
        })
    } catch (error) {
        next(error);
    }
});
router.post("verify", async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new BadRequest("missing required field email");
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new NotFound("User not found");
        }
        if (user.verify) {
            throw new BadRequest("Verification has already been passed")
        }
        const { verificationToken } = user;
        const data = {
            to: email,
            subject: "Подтверждение email",
            html: `<a>target="_blank" href="/users/verify/${verificationToken}"</a>`
        }
        await sendEmail(data);
        resp.status(201).json({
            message: "Verification email send"
        })
    } catch (error) {
        next(error);
    }
})

module.exports = router;