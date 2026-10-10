import React from "react";
import { VehicleRoadScene } from "./3dModels/VehicleRoadScene.jsx";

// Home screen: tap the vehicle label to cycle Car -> Motorcycle -> Truck -> Bus.
export const Vehicle3DHub = () => <VehicleRoadScene type="CAR" cycle className="mt-5" />;
