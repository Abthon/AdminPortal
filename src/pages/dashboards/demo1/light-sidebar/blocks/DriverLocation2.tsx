import { toAbsoluteUrl } from "@/utils";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { CustomMarker } from "./Markers";

interface DriverLocationProps {
  data: any;
}

// const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY;
import React, { useState, useEffect } from "react";
const DriversLocationMap: React.FC<DriverLocationProps> = ({ data }) => {
  const mapContainerStyle = {
    width: "100%",
    height: "70vh",
  };

  const [mapCenter, setMapCenter] = useState({
    lat: 9.005245,
    lng: 38.7463535,
  });

  // State to hold the selected driver for the legend
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  // Function to handle marker click and set selected driver
  const handleMarkerClick = (driver: any) => {
    setSelectedDriver(driver);
  };

  useEffect(() => {
    if (data && data.length > 0 && data[0]?.lat && data[0]?.lng) {
      setMapCenter({ lat: data[0].lat, lng: data[0].lng });
    }
  }, [data]);

  const validDrivers = data?.filter((driver: any) => driver.lat && driver.lng);
  const successImg = toAbsoluteUrl("/media/illustrations/success-loc.png");
  const failureImg = toAbsoluteUrl("/media/illustrations/fail-loc.png");

  return (
    <div>
      <LoadScript googleMapsApiKey={"AIzaSyDBbmSw9fX9vAjkgPpJ3ahoYsmzagGr4LI"}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          // Optional: Add onDragEnd to update state when user moves map manually
          // onDragEnd={() => setMapCenter(map.getCenter().toJSON())}
        >
          {validDrivers?.map((driver: any) => (
            <CustomMarker
              key={driver.id}
              driver={driver}
              onClick={handleMarkerClick} // Pass the click handler
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Driver Status Legend */}
      {selectedDriver && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            zIndex: 100,
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          <h4>Driver Info</h4>
          <p>
            <strong>Name:</strong>{" "}
            {`${selectedDriver.firstName} ${selectedDriver.lastName}`}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {selectedDriver.is_online
              ? selectedDriver.isBusy
                ? "Busy"
                : selectedDriver.is_available
                  ? "Available"
                  : "Online"
              : "Offline"}
          </p>
          {/* Add more driver info here if needed */}
        </div>
      )}
    </div>
  );
};

export { DriversLocationMap };
