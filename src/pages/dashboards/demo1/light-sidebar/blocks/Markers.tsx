import { toAbsoluteUrl } from "@/utils";
import { MarkerF, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

interface MarkerProps {
  driver: any;
  selectedMarkerId: string | null;
  onMarkerClick: (driverId: string | null) => void;
}

// Function to generate an SVG marker icon data URL with a specific color
const createSvgMarkerIcon = (color: string) => {
  const svgString = `
    <svg id="glipy_copy" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-name="glipy copy">
      <linearGradient id="linear-gradient" gradientUnits="userSpaceOnUse" x1="9.754" x2="54.246" y1="32" y2="32">
        <stop offset="0" stop-color="${color}"/>
        <stop offset="1" stop-color="${color}"/>
      </linearGradient>
      <path d="m47.37966 10.10053c-13.59092-13.09667-35.72043-3.65201-37.57066 14.53585a22.30855 22.30855 0 0 0 13.7049 22.18383 1.54817 1.54817 0 0 1 .961 1.14125l4.02437 9.37011a3.66091 3.66091 0 0 0 7.04766-.00012l4.02431-9.38a1.55986 1.55986 0 0 1 .951-1.14125c14.75848-5.83835 18.50001-25.9442 6.85742-36.70967zm.14017 23.83576a4.57575 4.57575 0 0 1 -4.56493 4.56493h-21.8636a4.57575 4.57575 0 0 1 -4.56493-4.56493v-2.83308a8.48178 8.48178 0 0 1 5.78622-8.03871l1.912-.63063c-4.41517-6.1059.2105-15.07764 7.79865-14.96613 7.57582-.10955 12.22868 8.85363 7.788 14.95617l1.92231.64059a8.48186 8.48186 0 0 1 5.78622 8.03871zm-15.49655-24.46638a7.51714 7.51714 0 0 1 7.50794 7.508c.18012 5.78867-6.84694 9.56545-11.55265 6.31664-6.25517-3.94355-3.40914-13.83711 4.04471-13.82464zm13.49439 21.6333v2.83308a2.56771 2.56771 0 0 1 -2.56277 2.56277h-21.8636a2.56771 2.56771 0 0 1 -2.56276-2.56277v-2.83308a6.46617 6.46617 0 0 1 4.42476-6.13663l2.72291-.911a9.52876 9.52876 0 0 0 11.48245.92092 8.98389 8.98389 0 0 0 1.21127-.92092l2.733.911a6.47029 6.47029 0 0 1 4.41474 6.13663z" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

const CustomMarker: React.FC<MarkerProps> = ({
  driver,
  selectedMarkerId,
  onMarkerClick,
}) => {
  const isSelected = selectedMarkerId === driver.id;

  // Determine marker color based on driver status
  let markerColor = "#ff0000"; // Default to red for offline

  if (driver?.is_online) {
    if (driver?.isBusy) {
      markerColor = "#0000FF"; // Orange for busy
    } else {
      markerColor = "#008000"; // Green for online regardless of availablity
    }
  }

  // Create the icon URL using the determined color
  const markerIconUrl = createSvgMarkerIcon(markerColor);

  return (
    <MarkerF
      position={{ lat: driver?.lat, lng: driver?.lng }}
      icon={{
        url: markerIconUrl,
        scaledSize: new google.maps.Size(60, 60), // Increased marker size
      }}
      onClick={() => onMarkerClick(driver.id)}
    >
      {isSelected && (
        <InfoWindow
          position={{ lat: driver?.lat, lng: driver?.lng }}
          onCloseClick={() => onMarkerClick(null)}
          options={{
            pixelOffset: new google.maps.Size(0, -70), // Increased offset for larger marker
          }}
        >
          <div
            style={{
              padding: "12px",
              minWidth: "200px",
              textAlign: "center",
              fontSize: "16px", // Increased font size
            }}
          >
            <div className="mb-2">
              <strong
                style={{ fontSize: "18px" }}
              >{`${driver.firstName} ${driver.lastName}`}</strong>
            </div>
            <div>
              <span style={{ color: markerColor, fontSize: "16px" }}>
                {driver.is_online
                  ? driver.isBusy
                    ? "Online but busy"
                    : "Online but Not busy"
                  : "Offline"}
              </span>
            </div>
            {driver.phoneNumber && (
              <div className="mb-1">Phone: +251 {driver.phoneNumber}</div>
            )}
            {driver.vehiclePlate && <div>Vehicle: {driver.vehiclePlate}</div>}
          </div>
        </InfoWindow>
      )}
    </MarkerF>
  );
};

export { CustomMarker };
