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
        return  api.post(`/vehicle/updateVehicleImage/${vehicleId}` , formData , {
            headers:{"Content-Type": "multipart/form-data"}
        })
    },

    deleteVehicle:(vehicleId)=>{
        return api.delete(`vehicle/delete/${vehicleId}`)
    },
    getQr:(vehicleId)=>{
        return api.get(`/vehicle/getQr/${vehicleId}`)


},

    scanQr:(qrId  , formdata)=>{

        return api.post(`/vehicle/qrScanned/${qrId}` , formdata  , {
            headers:{"Content-Type": "multipart/form-data"}
        })


    },

    getVehicleByQrId:(qrId )=>{
        return api.get(`/vehicle/getVehicleByQrId/${qrId}`)

    },

    activateDeactivateQr: (vehicleId , activate)=>{
        return api.patch(`/vehicle/activateQr/${vehicleId}` , {activate})
    },

    sendMail: (data)=>{
       return  api.post('/vehicle/sendEmail' , data)

    }







}
