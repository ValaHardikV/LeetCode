import express from "express";
import "dotenv/config";
import ConnectDB from "./Database/mongoDB.js";
import redisClient from "./Database/redis.js";
import cookieParser from "cookie-parser";
import cors from "cors"


// router
import AuthRouter from "./Routes/AuthRouter.js";
import problemRouter from "./Routes/problemRouter.js";
import submitRouter from "./Routes/submit.js";
import aiRouter from "./Routes/aiChatting.js";


const app = express();

app.use(express.json());
app.use(cookieParser());

// solved cors issue we want that only this url access our backend
app.use(cors(
    {
        // if we want that anyone access our backend then we use origin: "*"
        origin: 'http://localhost:5173',
        credentials: true // attech token and otherthings if request comes from this
    }
));


app.use("/auth", AuthRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai",aiRouter);


async function IntilizationConnection(){
    try{
        await Promise.all([ConnectDB(), redisClient.connect()]);
        console.log("Connect with mongoDB and redis successfully");

        app.listen(process.env.PORT, ()=>{
            console.log("Server Running ....");
        })
    }
    catch(err){
        console.error("Error : " + err);
    }
}

IntilizationConnection();