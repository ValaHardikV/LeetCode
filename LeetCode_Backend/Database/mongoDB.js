import mongoose, { connect } from "mongoose";
import "dotenv/config"


async function ConnectDB(){
    const url = `${process.env.DB_CONNECT_KEY}/${process.env.DB_NAME}`;

    await mongoose.connect(url);
}

export default ConnectDB;