import redisClient from "../Database/redis.js";
import jwt from "jsonwebtoken";
import User from "../Models/userSchema.js";

async function verifyAdmin(req, res, next){
    try{

        const {token} = req.cookies;

        if(!token){
            throw new Error("Token is missing");
        }

        const isBlock = await redisClient.exists(`token:${token}`);

        if(isBlock){
            throw new Error("Invalid token");
        }

        const payload = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        const {id} = payload;

        if(!id){
            throw new Error("Invalid token");
        }


        const result = await User.findById(id);

        if(!result){
            throw new Error("Record not found in DB");
        }

        // same code as jwt token, just add this thing when any user want to register as admin then it's have cookies of any other admin, then also it register as admin otherwise not
        if(result.role != 'admin'){
            throw new Error("You have not admin access");
        }

        // append user in request
        req.user = result;

        next();


    }
    catch(err){
        res.send("Error : " + err.message);
    }
}

export default verifyAdmin;