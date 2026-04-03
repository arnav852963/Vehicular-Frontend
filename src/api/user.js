import {api} from "./api.js";

 export const userApi = {
 refreshUserToken: ()=>{
     return api.patch("/user/refreshToken")
 },

    updateUserAvatar: (formData)=>{
        return api.patch("/user/updateAvatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    getUser: ()=>{
        return api.get("/user/getUser")
    },

    updateUserProfile: (data)=>{
        return api.patch("/user/updateProfile", data)
    },

    userLogout: ()=>{
        return api.patch("/user/logout")
    }
    
}