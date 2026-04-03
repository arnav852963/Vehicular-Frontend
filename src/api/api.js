import axios from "axios";
const baseUrl =  String(import.meta.env.VITE_BACKEND_URL)
export const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true
})


