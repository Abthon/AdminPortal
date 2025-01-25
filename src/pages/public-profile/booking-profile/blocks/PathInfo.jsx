import React, { useState, useEffect, memo, useRef} from 'react';
import { decode } from '@googlemaps/polyline-codec';
import { MapContainer, Marker, Popup, Polyline as LeafletPolyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.gridlayer.googlemutant';
import axiosInstance from "@/auth/_helpers";

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GoogleLayer = memo(({ onLayerLoaded }) => {
  const map = useMap();
  const googleLayerRef = useRef(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
    const scriptId = 'google-maps-api-script';

    const loadGoogleLayer = () => {
      if (!googleLayerRef.current) {
        const googleLayer = L.gridLayer.googleMutant({
          type: 'roadmap', // Options: 'roadmap', 'satellite', 'terrain', 'hybrid'
        });
        googleLayer.addTo(map);
        googleLayerRef.current = googleLayer;
        onLayerLoaded(); // Notify parent when the layer is loaded
      }
    };

    // Load Google Maps API script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
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

const getPolylinePoints = async ({updatedFields}) => {
  try{
    const res = await axiosInstance.post(
      "api/v1/bookings/estimate/",
      updatedFields
    );
    return res.data.data.possiblePaths.routes[0].overview_polyline.points;
  }catch(error){
    console.log(error, "error");
  }
};

export const PathInfo = ({ data }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [endcodedPolyline, setEncodedPolyline] = useState("");
  const [isGoogleLayerLoaded, setGoogleLayerLoaded] = useState(false);

  const pickup = { lat: data.pickupLat || 9.0308644, lng: data.pickupLng || 38.7626244 };
  const dropoff = { lat: data.dropOffLat || 9.0053468, lng: data.dropOffLng || 38.7673327 };

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
    if (endcodedPolyline) {
      const decodedPath = decode(endcodedPolyline).map(([lat, lng]) => ({ lat, lng }));
      setRouteCoordinates(decodedPath);
    }
  }, [endcodedPolyline]);

  const handleGoogleLayerLoaded = () => {
    setGoogleLayerLoaded(true);
  };

  const mapCenter = { lat: 9.0300, lng: 38.7400 };

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '800px', width: '100%' }}>
      {/* Google Layer for the map */}
      <GoogleLayer onLayerLoaded={handleGoogleLayerLoaded} />

      {/* Pickup Marker */}
      <Marker position={pickup}>
        <Popup>Pickup Location</Popup>
      </Marker>

      {/* Dropoff Marker */}
      <Marker position={dropoff}>
        <Popup>Dropoff Location</Popup>
      </Marker>

      {/* Route Polyline */}
      {routeCoordinates.length > 0 && (
        <LeafletPolyline
          positions={routeCoordinates.map(coord => [coord.lat, coord.lng])}
          color="blue"
          weight={4}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
};