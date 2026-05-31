import Problem from "../Models/problemSchema.js";
import Submission from "../Models/submission.js";
import { CreatesubmitBatch, getBatchResult, getLanguageById } from "../Utils/problemUtility.js";


async function submitCode(req, res){
    try{

        const problemId = req.params.id;

        // when we authicate user we attach entire user with request
        const userId = req.user._id;

        let {code, language} = req.body;

        if(!problemId || !userId || !code || !language){
            return res.status(400).send("Some field is missing");
        }

        // Find problem that user want to submit
        const problem = await Problem.findById(problemId);

        if(!problem){
            res.status(404).send("Problem not found with given id");
            return;
        }


        // first store data that user send, then run test case on judge0, because it's happen that judge0 gives some error and if we not store data in DB then we lost data

        const submittedResult = await Submission.create(
            {
                userId,
                problemId,
                code,
                language,
                status: "pending",
                testCasesTotal: problem.hiddenTestCases.length
            }
        );

        // once data store in DB, now run and test all hidden test case using judge0

        const languageId = getLanguageById(language);

        const submission = problem.hiddenTestCases.map(({input, output})=>{
            
            let obj = {
                source_code: code,
                language_id: languageId,
                stdin: input,
                expected_output: output
            };

            return obj;
        });


        // first stage we make post request and get token
        const Token = await CreatesubmitBatch(submission);

        const resultToken = Token.map((val) => val.token);

        const testResult = await getBatchResult(resultToken);


        // now onces we get result fromjudge0, update the result in DB

        let testCasesPassed = 0;
        let runtime = 0; // total time to run the all test cases
        let memory = 0; // maximum memory for any test case
        let status = 'accepted';
        let errorMessage = null;


        for (const test of testResult){
            // correct solution
            if (test.status_id == 3){
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time); // convet string into float
                memory = Math.max(memory, test.memory);
            }
            else{
                
                status = test.status.description;
                errorMessage = test.stderr;
                
            }
        }

        // update all varible
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;

        await submittedResult.save();

        // One's user solved problem succesfully, add problemid into problemSolved in userSchema
        // when we authicate user we attach entire user with request
        // req.user --> object
        // req.user.problemSolved --> array
        if(!req.user.problemSolved.includes(problemId)){
            req.user.problemSolved.push(problemId);
            await req.user.save();
        }


        const accepted = (status == "accepted");

        res.status(201).json(
            {
                accepted,
                totalTestCases: submittedResult.testCasesTotal,
                passedTestCases: testCasesPassed,
                runtime,
                memory
            }
        );
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

async function runCode(req, res){
    try{

        const problemId = req.params.id;

        // when we authicate user we attach entire user with request
        const userId = req.user._id;

        const {code, language} = req.body;

        if(!problemId || !userId || !code || !language){
            return res.status(400).send("Some field is missing");
        }

        // Find problem that user want to submit
        const problem = await Problem.findById(problemId);

        if(!problem){
            res.status(404).send("Problem not found with given id");
            return;
        }

        //  run and test all visible test case using judge0

        const languageId = getLanguageById(language);

        const submission = problem.visibleTestCases.map(({input, output})=>{
            
            let obj = {
                source_code: code,
                language_id: languageId,
                stdin: input,
                expected_output: output
            };

            return obj;
        });


        // first stage we make post request and get token
        const Token = await CreatesubmitBatch(submission);

        const resultToken = Token.map((val) => val.token);

        const testResult = await getBatchResult(resultToken);

        // console.log(testResult);

        let testCasesPassed = 0;
        let runtime = 0; // total time to run the all test cases
        let memory = 0; // maximum memory for any test case
        let status = true;
        let errorMessage = null;


        for (const test of testResult){
            // correct solution
            if (test.status_id == 3){
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time); // convet string into float
                memory = Math.max(memory, test.memory);
            }
            else{
                
                status = false;
                errorMessage = test.stderr;
                
            }
        }

        res.status(201).json(
            {
                success: status,
                testCases: testResult,
                runtime,
                memory
            }
        );
    }
    catch(err){
        res.status(500).send("Error : " + err);
    }
}

export {submitCode, runCode}