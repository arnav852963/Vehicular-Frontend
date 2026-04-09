import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    vehicleExist:false,
    vehicle:null
}

export const vehicleSlice = createSlice({
    name:"vehicle",
    initialState,
    reducers:{

        addVehicle: (state , action)=>{
            state. vehicleExist = true

            state. vehicle = action.payload

        }




    }
})
export const  {addVehicle} = vehicleSlice.actions
export const vehicleReducers = vehicleSlice.reducer