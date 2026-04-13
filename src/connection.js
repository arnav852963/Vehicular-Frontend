import {io} from "socket.io-client";

const url =String(import.meta.env.VITE_SOCKET_URL)
console.log("--------" , url)
export const connectSocket  =  (auth= {})=>{
    return io(url , {
        withCredentials: true,
        auth: auth
    })
}