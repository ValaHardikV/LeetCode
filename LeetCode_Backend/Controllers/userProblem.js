import { getLanguageById, CreatesubmitBatch, getBatchResult, getErrorbyId } from "../Utils/problemUtility.js";

import Problem from "../Models/problemSchema.js";
import User from "../Models/userSchema.js";
import Submission from "../Models/submission.js";
import SolutionVideo from "../Models/solutionVideo.js"

async function createProblem(req, res) {
    try {
        console.log(req.body);
        
        const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

        // console.log(req.body);

        // check that admin provide referenceSolution that correct or not
        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);

            // create batch
            // means for particular language, create batch of all test case

            const submission = visibleTestCases.map(({ input, output }) => {

                // crate object that return as current test case + expected output with source code and language id
                let obj = {
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output
                }

                return obj;

            });

            // first stage we make post request and get token
            const Token = await CreatesubmitBatch(submission);

            // console.log(Token);

            const resultToken = Token.map((val) => val.token);

            const testResult = await getBatchResult(resultToken);
            // console.log(testResult);


            // now check for result all result got correct or not using status_id
            // if any result get error then send error
            for (const test of testResult) {
                if (test.status_id != 3) {
                    res.status(400).send(`${getErrorbyId(test.status_id)}`);
                    return; // return from here not do anything if we get error
                }
            }

        }


        // once we verify that all reference solution is correct, now we store into DB
        const userProblem = await Problem.create({
            // spread all req.body data and at last add id of admin
            ...req.body,

            // when we verify admin we store that information in request, so we directly use it and take mongodn id from it
            problemCreator: req.user._id
        });

        res.status(201).send("Data saved successfuuly in DB !!!");
    }
    catch (err) {
        res.status(400).send("Error : " + err);
    }
}

async function updateProblem(req, res) {
    try {

        const {id} = req.params;

        if(!id){
            res.status(401).send("ID is missing");
            return;
        }

        const DSAProblem = await Problem.findById(id);

        if(!DSAProblem){
            res.status(404).send("Problem not found for this ID");
            return;
        }


        const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;


        // check that admin provide referenceSolution in update that correct or not
        for (const { language, completeCode } of referenceSolution) {

            const languageId = getLanguageById(language);

            // create batch
            // means for particular language, create batch of all test case

            const submission = visibleTestCases.map(({ input, output }) => {

                // crate object that return as current test case + expected output with source code and language id
                let obj = {
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: input,
                    expected_output: output
                }

                return obj;

            });

            // first stage we make post request and get token
            const Token = await CreatesubmitBatch(submission);

            // console.log(Token);

            const resultToken = Token.map((val) => val.token);

            const testResult = await getBatchResult(resultToken);
            // console.log(testResult);


            // now check for result all result got correct or not using status_id
            // if any result get error then send error
            for (const test of testResult) {
                if (test.status_id != 3) {
                    res.status(400).send(`${getErrorbyId(test.status_id)}`);
                    return; // return from here not do anything if we get error
                }
            }

        }


        // now we modify problem
        await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators:true});

        res.status(200).send("Problem update successfully");

    }
    catch(err){
        res.status(400).send("Error : " + err);
    }
}

async function deleteProblem(req, res){
    try{
        const {id} = req.params;
        
        if(!id){
            res.status(400).send("Id is missing");
            return;
        }

        const DSAProblem = await Problem.findByIdAndDelete(id);

        if(!DSAProblem){
            res.status(404).send("Problem not found wiht given ID in DB");
            return;
        }

        res.status(200).send("Data delete successfully");
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

async function getProblemById(req, res){
    try{
        const {id} = req.params;
        
        if(!id){
            res.status(400).send("ID is missing");
            return;
        }

        // not give entire data to user, select some fiiled and get that data only
        const DSAProblem = await Problem.findById(id).select("_id title description difficulty tags visibleTestCases startCode referenceSolution");

        if(!DSAProblem){
            res.status(400).send("Problem not found for this id");
            return;
        }


        // send video information also
        const video = await SolutionVideo.findOne({problemId: id});

        if(video){
            DSAProblem.secureUrl = secureUrl;
            DSAProblem.cloudinaryPublicId = cloudinaryPublicId;
            DSAProblem.thumbnailUrl = thumbnailUrl;
            DSAProblem.duration = duration;
        }

        res.status(200).send(DSAProblem);
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

async function getAllProblem(req, res){
    try{
        const {page, limit} = req.query;
        
        if(!page || !limit){
            res.status(400).send("Plase enter page and Limit");
            return;
        }

        const skip = (page - 1) * limit;

        const result = await Problem.find({}).skip(skip).limit(limit).select("_id title difficulty tags");
        res.status(200).send(result);
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

async function problemSolvedByUser(req, res) {
    try{

        const userId = req.user._id;

        // method 1
        // const user = await User.findById(userId).populate("problemSolved");

        // method 2
        const user = await User.findById(userId).populate(
            {
                path: "problemSolved",
                select: "_id title difficulty tags"
            }
        );

        // return required information of solved problem
        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

async function submittedProblem(req, res){
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        // skip id, userId and problemId from result
        const result = await Submission.find({userId, problemId}).select('-_id -userId -problemId');

        res.status(200).send(result);
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

export { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, problemSolvedByUser, submittedProblem };