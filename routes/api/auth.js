const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require('../../models/user');
const { joiRegisterSchema, joiLoginSchema } = require('../../models/user');
const { BadRequest, Conflict, Unauthorized } = require('http-errors');
const { SECRET_KEY } = process.env;

const router = express.Router();

router.post('/signup', async(req, resp, next) => {
    try{
        const {error} = joiRegisterSchema.validate(req.body);
        if(error) {
            throw new BadRequest(error.message);
        }
        const {password, email, subscription} = req.body;
        const user = await User.findOne({email});
        if(user){
            throw new Conflict("User already exist");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({password: hashPassword, email, subscription});
        resp.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription
        })
    } catch (error) {
        next(error);
    }
});

router.post('/login', async ( req, resp, next) => {
    try {
        const {error} = joiLoginSchema.validate(req.body);
        if(error) {
            throw new BadRequest(error.message);
        }
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if(!user) {
            throw new Unauthorized("Email or password is wrong");
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare) {
            throw new Unauthorized("Email or password is wrong");
        }
        const {_id, subscription } = user;
        const payload = {
            id: _id
        }
        const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "1h"});
        await User.findByIdAndUpdate( _id, {token});
        resp.json({
            token, 
            user: {
                email, 
                subscription
            }
        })
    } catch (error) {
        next(error);
    }
})

module.exports = router;