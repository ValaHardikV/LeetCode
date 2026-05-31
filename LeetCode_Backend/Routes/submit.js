import express from "express";
import verifyJWTToken from "../Middlewares/verifyJWT.js";
import { submitCode, runCode } from "../Controllers/userSubmission.js";
import rateLimiter from "../Middlewares/rateLimiter.js"


const submitRouter = express.Router();


submitRouter.post("/submit/:id", verifyJWTToken, rateLimiter, submitCode);
submitRouter.post("/run/:id", verifyJWTToken, rateLimiter, runCode);


export default submitRouter;