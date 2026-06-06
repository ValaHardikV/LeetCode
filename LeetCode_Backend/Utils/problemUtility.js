import axios from "axios";


function getLanguageById(language) {

    const lan = {
        "cpp": 105,
        "c++" : 105,
        "java": 91,
        "javascript": 63
    }


    return lan[language.toLowerCase()];
}


function getErrorbyId(statusId){
    const arr = ["In Queue", "Processing", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error (SIGSEGV)", "Runtime Error (SIGXFSZ)", "Runtime Error (SIGFPE)", "Runtime Error (SIGABRT)", "Runtime Error (NZEC)", "Runtime Error (Other)", "Internal Error", "Exec Format Error"];

    return arr[statusId-1]; // convert 1 based statusId by 0 based
}


async function CreatesubmitBatch(submissions) {

    const options = {
        method: 'POST',

        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',

        params: {
            // if you encode your input in base64 then only mark it's true
            // true meaning judge0 decode t using base64
            // if you not encode your data then mark it false
            base64_encoded: 'false'
        },

        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },

        data: {
            submissions
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    }
    catch (err) {
        console.error(err);
    }
};

async function getBatchResult(resultToken) {
    
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","), // all array element join by ","
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    // function that add timer
    async function waitSometime(time){
        setTimeout(()=>{
            return "Hii! Hardik";
        }, time);
    }

    while(true){

        const result = await fetchData();

        // states id = 1 code submission in queue
        // states id = 2 code is running
        //  > success or get errror
        const isResultObtained = result.submissions.every((val)=>val.status_id > 2);

        if(isResultObtained) {
            return result.submissions;
        }

        // if code is in queue or runnig  then again called fetchData() function after 100 milisecond
        await waitSometime(100);

    }


    
};

export { getLanguageById, CreatesubmitBatch, getBatchResult, getErrorbyId };