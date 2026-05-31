import express from "express";
import solveDoubt from "../Controllers/solveDoubt.js";
import verifyJWTToken from "../Middlewares/verifyJWT.js";

const aiRouter = express.Router();

aiRouter.post('/chat', verifyJWTToken, solveDoubt);

export default aiRouter;