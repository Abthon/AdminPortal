import React, { useState, useEffect, memo, useRef } from "react";
import { decode } from "@googlemaps/polyline-codec";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline as LeafletPolyline,
  useMap, // Your image path
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.gridlayer.googlemutant";
import axiosInstance from "@/auth/_helpers";

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom green icon for actual path markers
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GoogleLayer = memo(({ onLayerLoaded }) => {
  const map = useMap();
  const googleLayerRef = useRef(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
    const scriptId = "google-maps-api-script";

    const loadGoogleLayer = () => {
      if (!googleLayerRef.current) {
        const googleLayer = L.gridLayer.googleMutant({
          type: "roadmap", // Options: 'roadmap', 'satellite', 'terrain', 'hybrid'
        });
        googleLayer.addTo(map);
        googleLayerRef.current = googleLayer;
        onLayerLoaded(); // Notify parent when the layer is loaded
      }
    };

    // Load Google Maps API script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleLayer;
      document.head.appendChild(script);
    } else {
      loadGoogleLayer();
    }

    return () => {
      if (googleLayerRef.current) {
        map.removeLayer(googleLayerRef.current);
        googleLayerRef.current = null;
      }
    };
  }, [map, onLayerLoaded]);

  return null;
});

const getPolylinePoints = async ({ updatedFields }) => {
  try {
    const res = await axiosInstance.post(
      "api/v1/bookings/estimate/",
      updatedFields
    );
    return res.data.data.possiblePaths.routes[0].overview_polyline.points;
  } catch (error) {
    console.log(error, "error");
  }
};

export const PathInfo = ({ data }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [endcodedPolyline, setEncodedPolyline] = useState("");
  const [isGoogleLayerLoaded, setGoogleLayerLoaded] = useState(false);
  const [actualPickup, setActualPickup] = useState(null);
  const [actualDropoff, setActualDropoff] = useState(null);

  const pickup = {
    lat: data.pickupLat || 9.0308644,
    lng: data.pickupLng || 38.7626244,
  };
  const dropoff = {
    lat: data.dropOffLat || 9.0053468,
    lng: data.dropOffLng || 38.7673327,
  };

  const updatedFields = {
    lng1: Number(data?.pickupLng),
    lat1: Number(data?.pickupLat),
    lat2: Number(data?.dropOffLat),
    lng2: Number(data?.dropOffLng),
    vehicleTypeId: Number(data?.associatedVehicle),
  };

  useEffect(() => {
    if (isGoogleLayerLoaded) {
      const fetchPolylinePoints = async () => {
        const result = await getPolylinePoints({ updatedFields });
        console.log(result, "The decoded polyline");
        setEncodedPolyline(result);
      };
      fetchPolylinePoints();
    }
  }, [isGoogleLayerLoaded]);

  useEffect(() => {
    if (data.actualtraveledPath) {
      const decodedPath = decode(data.actualtraveledPath).map((arr) => ({
        lat: arr[0],
        lng: arr[1],
      }));

      // Set actual pickup and dropoff points from the path
      if (decodedPath.length > 0) {
        setActualPickup(decodedPath[0]);
        setActualDropoff(decodedPath[decodedPath.length - 1]);
      }

      setRouteCoordinates(decodedPath);
    } else {
      if (endcodedPolyline) {
        const decodedPath = decode(endcodedPolyline).map(([lat, lng]) => ({
          lat,
          lng,
        }));
        setRouteCoordinates(decodedPath);
      }
    }
  }, [endcodedPolyline, data.actualtraveledPath]);

  const handleGoogleLayerLoaded = () => {
    setGoogleLayerLoaded(true);
  };

  const mapCenter = { lat: 9.03, lng: 38.74 };

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="path-info">
        <h3 className="card-title">Path Information</h3>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "800px", width: "100%" }}
      >
        {/* Google Layer for the map */}
        <GoogleLayer onLayerLoaded={handleGoogleLayerLoaded} />

        {/* Show either estimated or actual markers */}
        {data.actualtraveledPath ? (
          <>
            {/* Actual Pickup Marker */}
            {actualPickup && (
              <Marker position={actualPickup} icon={greenIcon}>
                <Popup>
                  <div>
                    <strong>Actual Pickup Location</strong>
                    <p>Started here</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Actual Dropoff Marker */}
            {actualDropoff && (
              <Marker position={actualDropoff} icon={greenIcon}>
                <Popup>
                  <div>
                    <strong>Actual Dropoff Location</strong>
                    <p>Ended here</p>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Estimated Pickup Marker (always show) */}
            <Marker position={pickup}>
              <Popup>
                <div>
                  <strong>Estimated Pickup Location</strong>
                  <p>Will start here</p>
                </div>
              </Popup>
            </Marker>

            {/* Estimated Dropoff Marker (always show) */}
            <Marker position={dropoff}>
              <Popup>
                <div>
                  <strong>Estimated Dropoff Location</strong>
                  <p>Will end here</p>
                </div>
              </Popup>
            </Marker>
          </>
        ) : (
          /* Estimated Markers when no Actual Path */
          <>
            {/* Estimated Pickup Marker */}
            <Marker position={pickup}>
              <Popup>
                <div>
                  <strong>Estimated Pickup Location</strong>
                  <p>Will start here</p>
                </div>
              </Popup>
            </Marker>

            {/* Estimated Dropoff Marker */}
            <Marker position={dropoff}>
              <Popup>
                <div>
                  <strong>Estimated Dropoff Location</strong>
                  <p>Will end here</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Route Polyline */}
        {data.actualtraveledPath ? (
          <>
            {/* Actual Polyline (Green) */}
            {routeCoordinates.length > 0 && (
              <LeafletPolyline
                positions={routeCoordinates.map((coord) => [
                  coord.lat,
                  coord.lng,
                ])}
                color="green"
                weight={4}
                opacity={0.7}
              />
            )}
            {/* Estimated Polyline (Blue) when Actual Path exists */}
            {endcodedPolyline && (
              <LeafletPolyline
                positions={decode(endcodedPolyline).map(([lat, lng]) => [
                  lat,
                  lng,
                ])}
                color="blue"
                weight={4}
                opacity={0.7}
              />
            )}
          </>
        ) : (
          /* Estimated Polyline (Blue) when no Actual Path */
          routeCoordinates.length > 0 && (
            <LeafletPolyline
              positions={routeCoordinates.map((coord) => [
                coord.lat,
                coord.lng,
              ])}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          )
        )}
      </MapContainer>
    </div>
  );
};
