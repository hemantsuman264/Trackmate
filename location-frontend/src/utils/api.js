import axios from "axios";

console.log("API baseUrl: ", process.env.REACT_APP_API_URL)

const baseURL = process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api";

const API = axios.create({ baseURL });


API.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

export default API;