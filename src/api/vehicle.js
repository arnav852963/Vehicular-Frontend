import {api} from "./api.js";

export const vehicleApi = {
    createVehicle: (data)=>{
        return api.post("/vehicle/create" , data , {
            headers: {
                "Content-Type": "multipart/form-data"
            }

        })
    } ,
    getVehicle:(vehicleId)=>{
        return api.get(`/vehicle/get/${vehicleId}`)
    },

    getUserVehicles:()=>{
        return api.get("/vehicle/getAll")
    },

    updateVehicleImage: (formData , vehicleId)=>{
        return  api.patch(`/vehicle/updateVehicleImage/${vehicleId}` , formData , {
            headers:{"Content-Type": "multipart/form-data"}
        })
    },

    deleteVehicle:(vehicleId)=>{
        return api.delete(`vehicle/delete/${vehicleId}`)
    },







}
