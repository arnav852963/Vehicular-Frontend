import {createSlice} from "@reduxjs/toolkit";

const initialState = {

    vehicleInfo: null,
    guestSessionId:null
}

export const scanSlice = createSlice({
    name:"scan",
    initialState,
    reducers:{



        setInfoAfterScan:(state , action)=> {
            state.vehicleInfo = action.payload.vehicleInfo
            state.guestSessionId = action.payload.guestSessionId

        }


    }
})
export const  { setInfoAfterScan} = scanSlice.actions
export const scanReducers = scanSlice.reducer