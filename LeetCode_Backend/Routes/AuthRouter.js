import express from "express";
import {register, login, logout, adminRegister, deleteProfile, sendUserInfo} from "../Controllers/userauth.js";
import verifyJWTToken from "../Middlewares/verifyJWT.js";
import verifyAdmin from "../Middlewares/verifyAdmin.js";

const AuthRouter = express.Router();


AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.get("/logout", verifyJWTToken, logout);
AuthRouter.post("/admin/register", verifyAdmin, adminRegister); // register for admin, not user
AuthRouter.delete("/deleteProfile", verifyJWTToken, deleteProfile);


// this API hot any any user enter the website, if user is valid (we check using verifyJWTToken miidleware) then we directly sned user Information
AuthRouter.get("/check", verifyJWTToken, sendUserInfo);

export default AuthRouter;