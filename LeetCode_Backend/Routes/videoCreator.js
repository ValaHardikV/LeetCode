import express from "express";
import verifyAdmin from "../Middlewares/verifyAdmin.js"
import { generateUploadSignature, saveVideoMetadata, deleteVideo } from "../Controllers/videoSection.js"


const videoRouter = express.Router();


videoRouter.get("/create/:problemId",verifyAdmin,generateUploadSignature);

videoRouter.post("/save",verifyAdmin,saveVideoMetadata);

videoRouter.delete("/delete/:videoId",verifyAdmin,deleteVideo);

export default videoRouter;