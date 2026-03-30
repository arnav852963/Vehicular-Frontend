import {api} from "./api.js";

export const authApi ={
          firebaseAuth: (idToken)=>{
        return api.post("/auth/firebaseAuth" , {idToken})
        },

    googleAuth: (idToken)=>{
        return api.post("/auth/googleAuth" , {idToken})
    }


}