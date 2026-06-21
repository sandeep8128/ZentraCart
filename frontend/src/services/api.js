import axios from "axios";

const API = axios.create({
  baseURL: "https://zentracart-backend.onrender.com/api",
});


export default API;