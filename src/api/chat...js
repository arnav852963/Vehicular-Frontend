import {api} from "./api.js";


export const chatAPi  = {

    getChats: (sessionId)=>{
        return api.get(`/chat/getChatsById/${sessionId}`);
    }
}