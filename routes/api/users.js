const express = require('express');
const { User } = require('../../models/user');
const router = express.Router();
const { authenticate, upload } = require('../../middlewares');
const path = require("path");
const fs = require("fs/promises");

const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
const { authenticate } = require('../../middlewares');

router.get("/logout", authenticate, async (req, res) => {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: null});
    res.status(204).send();
})

router.get("/current", authenticate, async (req, res) => {
    const {email, subscription} = req.user;
    res.json({
        user: {
            email, 
            subscription
        }
    })
})

router.patch('/avatars', authenticate, upload.single('avatar'), async (req, res) => {
    const {path: tempUpload, originalname} = req.file;
    const {_id: id} = req.user;
    const imageName = `${id}_${originalname}`;
    try {
        const resultUpload = path.join(avatarsDir, imageName);
        await fs.rename(tempUpload,resultUpload);
        const avatarURL = path.join("public", "avatars", originalname);
        await User.findByIdAndUpdate(req.user._id, {avatarURL});
        res.json({avatarURL});
    } catch (error) {
        await fs.unlink(tempUpload);
        throw error;
    }
})

module.exports = router;