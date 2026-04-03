import {configureStore} from "@reduxjs/toolkit"
import {authReducers} from "./authSlice.js";
import {vehicleReducers} from "./vehicleSlice.js";

const store = configureStore({
    reducer:{
        auth: authReducers,
        vehicle: vehicleReducers

    }
})

export default store