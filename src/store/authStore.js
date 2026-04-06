import {configureStore} from "@reduxjs/toolkit"
import {authReducers} from "./authSlice.js";
import {vehicleReducers} from "./vehicleSlice.js";
import {scanReducers} from "./scanSlice.js";

const store = configureStore({
    reducer:{
        auth: authReducers,
        vehicle: vehicleReducers,
        scan: scanReducers

    }
})

export default store