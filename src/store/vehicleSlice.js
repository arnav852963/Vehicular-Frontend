import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    vehicleExist:false,
    vehicleImages:null
}

export const vehicleSlice = createSlice({
    name:"vehicle",
    initialState,
    reducers:{

        addVehicleImages: (state , action)=>{
            state. vehicleExist = true

            state. vehicleImages = action.payload

        }




    }
})
export const  {addVehicleImages} = vehicleSlice.actions
export const vehicleReducers = vehicleSlice.reducer