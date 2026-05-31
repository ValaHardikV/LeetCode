import validator from "validator";


function validateUser(data) {
    // Api level validation Before DataBase calls

    const arr = Object.keys(data);
    const required = ["firstName", "emailId", "password"];
    const flag = required.every((val) => arr.includes(val));

    if (!flag) {
        throw new Error("Required field is missing");
    }

    if (data.firstName.length < 3 || data.firstName.length > 20) {
        throw new Error("First name length is at least 3 or at most 20");
    }

    if (!validator.isEmail(data.emailId)) {
        throw new Error("Email is not valid form. please enter valid Email ID");
    }

    if (!validator.isStrongPassword(data.password)) {
        throw new Error("Weak Password");
    }
}

export default validateUser;