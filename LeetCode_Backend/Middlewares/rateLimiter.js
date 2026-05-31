/*
    Implement rate limiter

    we implement 2 type of rate lmiter

    1. user make 60 request in 1 hour

        format to store data in radis
            key = ip_address, value = count

    2. user make 60 request in 1 hour + at least 5 second between any 2 conjicutive request

        format to store data in radis
            key = ip_address, value = count:last_time_request_time (we store both sperate by : in string format)


    Implematation 3 : sliding window
*/

import redisClient from "../Database/redis.js";


/*
//---------------------------  implemtation-1 -----------------------------
const rateLimiter = async (req, res, next)=>{
    try{
        
        // find ip
        const ip = req.ip;
        

        // work of incr ---> if key not exit then intilize key with count 1 and return 1
        //              ---> if key exit then increment value by 1 and return new value
        const NumberOfRequest = await redisClient.incr(ip);

        // check each time Number of request increment by 1 when you request
        console.log(NumberOfRequest); 

        if(NumberOfRequest == 1){
            // set expriry time
            redisClient.expire(3600);  // 1 hour = 3600 second
        }

        if(NumberOfRequest > 60){
            throw new Error("User Limit Excess");
        }

        next();
    }
    catch(err){
        res.send("Error : " + err);
    }
}
*/


/*
// ---------------------- Implementation2 -------------------------
const rateLimiter = async (req, res, next)=>{
    try{
        
        // find ip
        const ip = req.ip;
        
        // check ip exist or not
        const check = await redisClient.exists(ip);
        
        // if not exist
        if(!check){
            const t = Math.floor(Date.now() / 1000); // in second
            const str = `1:${t}`;

            await redisClient.set(ip, str); // key = ip, value = str
            await redisClient.expire(ip, 3600); // expire time 1 hour
            
        }
        // exist
        else{
            const val = await redisClient.get(ip);
            const arr = val.split(':');
            const cnt = Number(arr[0]);
            const t1  = Number(arr[1]);
            const t2 = Math.floor(Date.now() / 1000); // current time in second

            if(cnt > 60){
                await redisClient.del(ip);
                throw new Error("User Limit exicess");
            }

            if((t2-t1) < 5){
                throw new Error("Reuest to fast. wait some time then make request");
            }

            
            const str = `${cnt+1}:${t2}`;
            await redisClient.set(ip, str);
            
        }
        
        next();
    }
    catch(err){
        res.send("Error : " + err);
    }
}
*/


// ------------ Implematation 3 : sliding window -----------------
const rateLimiter = async (req, res, next)=>{
    try{
        const windoSize = 3600; // 1 hour
        const maxLimit = 60;

        
        const curret_time = Math.floor(Date.now()/1000);
        const key = `IP:${req.ip}`; // simple req.ip = ::1, so it give error so we add some character before it
        const window_time = curret_time-windoSize;

        // delete old request
        await redisClient.zRemRangeByScore(key, 0, window_time);

        // count total request --> size of set
        const request = await redisClient.zCard(key);

        if(request >= maxLimit){
            throw new Error("User Limit excess");
        }

        // serve request add into redis
        await redisClient.zAdd(key,[{score:curret_time, value:`${curret_time}:${Math.random()}`}]);

        // add exprior time
        await redisClient.expire(key, windoSize); // valid from 1 hour from current time


        // next function call
        next();
    }
    catch(err){
        res.send("Error : " + err);
    }
}

export default rateLimiter;