import axios from "axios"


// set configration of request that we send in backend
const axiosClient = axios.create(
    {
        // url of backend
        baseURL: 'http://localhost:4000',

        // this line says when request make attach cookie and other creditical with request
        withCredentials: true,

        // send data in json format
        headers: {
            'Content-Type' : 'application/json'
        }
    }
);


export default axiosClient;