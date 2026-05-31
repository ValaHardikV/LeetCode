import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20
        },
        lastName: {
            type: String,
            minLength: 3,
            maxLength: 20,
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            immutable: true,
        },
        age: {
            type: Number,
            min: 6,
            max: 80,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        problemSolved: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'problem'
                }
            ],
            default: []
        },
        password: {
            type: String,
            required: true
        }
    },

    {
        timestamps: true
    }
);



// this function call after (because it is post) every findByIdAndDelete function call using mongoose
// because findOneAndDelete match with findByIdAndDelete
// so basically we want after delete user information using findByIdAndDelete, we delete all submission of user that happen here
// userInfo is the information about delete user that we delete using findByIdAndDelete
userSchema.post('findOneAndDelete', async function (userInfo){
    if(userInfo){
        await mongoose.model('submission').deleteMany({userId : userInfo._id});
    }
});


const User = mongoose.model("user", userSchema);

export default User;