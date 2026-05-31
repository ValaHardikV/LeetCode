import validateUser from "../Utils/validateUser.js";
import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "../Database/redis.js";
import "dotenv/config"
import Submission from "../Models/submission.js";

export const register = async (req, res)=>{
    try{

        validateUser(req.body);

        req.body.password = await bcrypt.hash(req.body.password, 10);

        // from this routes we only register normal user, not admin. so if anyone make request that define role is admin then it's problem for us. we not give admin role directy to anyone. so we set role = user here
        req.body.role = 'user';

        const user = await User.create(req.body);

        const jwtToken = await jwt.sign({id:user._id, emailId:user.emailId, role:'user'}, process.env.JWT_PRIVATE_KEY, {expiresIn: 60*60}); // after 1 hour token in valid

        res.cookie("token", jwtToken, {maxAge:60*60*1000}); // after 1 hour cookie clear

        // insted of just send messge send userinfo also
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role,
            _id : user._id
        };

        // insed of send, send data in json format
        res.status(201).json(
            {
                user: reply,
                message: "User register successfully"
            }
        );

    }
    catch(err){
        res.send(`Error : ${err}`);
    }
};

export const login = async (req, res)=>{
    try{
        
        const {emailId, password} = req.body;

        if(!emailId || !password){
            throw new Error("Please enter emailId and password");
        }


        const user = await User.findOne({emailId});

        if(!user){
            throw new Error("Invalid Credentials");
        }

        const check = await bcrypt.compare(password, user.password);

        if(!check){
            throw new Error("Invalid Credentials");
        }

        const jwtToken = await jwt.sign({id:user._id, emailId:user.emailId, role:user.role}, process.env.JWT_PRIVATE_KEY, {expiresIn: 60*60}); // after 1 hour token in valid

        res.cookie("token", jwtToken, {maxAge:60*60*1000}); // after 1 hour cookie clear

        // insted of just send messge send userinfo also
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role,
            _id : user._id
        };

        // insed of send, send data in json format
        res.status(200).json(
            {
                user: reply,
                message: "User login successfully"
            }
        );
    }
    catch(err){
        res.send(`Error : ${err}`);
    }
}

export const logout = async (req, res)=>{
    try{

        const {token} = req.cookies;

        const payload = await jwt.decode(token);

        await redisClient.set(`token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);


        // send token null, and clear all cookies
        res.cookie("token", null, {expires: new Date(Date.now())}); // when user click logout, request comes that time clear all cookies

        res.send("Logged out successfully");

    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
};

export const adminRegister = async (req, res)=>{
    try{

        validateUser(req.body);

        req.body.password = await bcrypt.hash(req.body.password, 10);

        // ere we remove this line from admin normal register. means when user want to login as admin then it's give admin as role, otherwise it's normal user
        // req.body.role = 'user';

        const user = await User.create(req.body);

        const jwtToken = await jwt.sign({id:user._id, emailId:user.emailId, role:user.role}, process.env.JWT_PRIVATE_KEY, {expiresIn: 60*60}); // after 1 hour token in valid

        res.cookie("token", jwtToken, {maxAge:60*60*1000}); // after 1 hour cookie clear

        res.status(200).send("Data Add Successfully");

    }
    catch(err){
        res.send(`Error : ${err}`);
    }
};

export const deleteProfile = async (req, res)=>{
    try {

        const userId = req.user._id;

        // delete use details from DB
        await User.findByIdAndDelete(userId);

        // Along with User info, we delete all submission of user also

        // Method - 1 , Method - 2 define in userSchema show there
        // await Submission.deleteMany({userId: userId});

        res.status(200).send("Data delete successfully");
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

export const sendUserInfo = async (req, res)=>{
    try {
        const reply = {
            firstName : req.user.firstName,
            emailId : req.user.emailId,
            role: req.user.role,
            _id : req.user._id
        };

        res.status(200).json(
            {
                user: reply,
                message: "Valid user"
            }
        )
    }
    catch(err){
        res.status(500).send("Error : "+err);
    }
}