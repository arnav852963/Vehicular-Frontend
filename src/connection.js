import {io} from "socket.io-client";

const url =String(import.meta.env.VITE_SOCKET_URL)
export const connectSocket  =  (auth)=>{
    return io(url , {
        auth:auth
    })
}