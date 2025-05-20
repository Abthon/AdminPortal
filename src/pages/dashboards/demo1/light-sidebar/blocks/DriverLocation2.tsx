import { toAbsoluteUrl } from "@/utils";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { CustomMarker } from "./Markers";

interface DriverLocationProps {
  data: any;
}

// const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY;
import React from "react";
const DriversLocationMap: React.FC<DriverLocationProps> = ({ data }) => {
  const mapContainerStyle = {
    width: "100%",
    height: "70vh",
  };
  const center = { lat: 9.005245, lng: 38.7463535 };
  const validDrivers = data?.filter((driver: any) => driver.lat && driver.lng);
  const successImg = toAbsoluteUrl("/media/illustrations/success-loc.png");
  const failureImg = toAbsoluteUrl("/media/illustrations/fail-loc.png");
  return (
    <div>
      <LoadScript googleMapsApiKey={"AIzaSyDBbmSw9fX9vAjkgPpJ3ahoYsmzagGr4LI"}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
        >
          {validDrivers?.map((driver: any) => <CustomMarker driver={driver} />)}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export { DriversLocationMap };
