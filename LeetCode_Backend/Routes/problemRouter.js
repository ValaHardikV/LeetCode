import express from "express";
import verifyAdmin from "../Middlewares/verifyAdmin.js";
import verifyJWTToken from "../Middlewares/verifyJWT.js";

import { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, problemSolvedByUser, submittedProblem } from "../Controllers/userProblem.js";

const problemRouter = express.Router();


// admin access required
problemRouter.post("/create", verifyAdmin, createProblem);
problemRouter.put("/update/:id", verifyAdmin, updateProblem);
problemRouter.delete("/delete/:id", verifyAdmin, deleteProblem);


// admin access not required
problemRouter.get("/ProblemById/:id", verifyJWTToken, getProblemById);
problemRouter.get("/getAllProblemOfPage", verifyJWTToken, getAllProblem);

// find all problem that solved user
problemRouter.get("/problemSolvedByUser", verifyJWTToken, problemSolvedByUser);

// find all submission for particular problem for user
problemRouter.get("/submittedProblem/:id", verifyJWTToken, submittedProblem);


export default problemRouter;



