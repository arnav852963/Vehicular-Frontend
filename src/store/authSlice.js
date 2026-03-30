import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated:false,
    userInfo:null
}

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{

        login: (state , action)=>{
            state.isAuthenticated = true

            state.userInfo = action.payload

        },

        logout:(state , action)=>{

            state.isAuthenticated = false

            state.userInfo = null

        }





    }
})
export const  {login , logout} = authSlice.actions
export const authReducers = authSlice.reducer