// DirectionsMap.jsx or DirectionsMap.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { decode } from '@googlemaps/polyline-codec'; // Updated Import
import { MapContainer, TileLayer, Polyline as LeafletPolyline, Marker, Popup,useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.gridlayer.googlemutant'; // Ensure this is installed


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GoogleLayer = () => {
  const map = useMap();

  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDBbmSw9fX9vAjkgPpJ3ahoYsmzagGr4LI`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const googleLayer = L.gridLayer.googleMutant({
        type: "roadmap", // 'roadmap', 'satellite', 'terrain', 'hybrid'
      });
      googleLayer.addTo(map);

      return () => {
        map.removeLayer(googleLayer);
      };
    };

    // Load Google Maps script dynamically
    loadGoogleMaps();

    return initMap;

  }, [map]);

  return null;
};


export const PathInfo = ({data}) => {
  // Define your pickup and dropoff coordinates (Addis Ababa)
  const pickup = { lat: 9.0308644, lng: 38.7626244 }; // Example Start Point in Addis Ababa
  const dropoff = { lat: 9.0053468, lng: 38.7673327 }; // Example End Point in Addis Ababa

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Access the API key using Vite's environment variables
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const origin = `${pickup.lat},${pickup.lng}`;
        const destination = `${dropoff.lat},${dropoff.lng}`;
        const response = await axios.get('/api/directions', {
          params: {
            origin: origin,
            destination: destination,
            // Note: Do NOT include the API key here. The proxy will append it.
          },
        });

        console.log(response.data, "the response");
        if (response.data.status !== 'OK') {
          throw new Error(`Directions API error: ${response.data.status}`);
        }

        const encodedPolyline = response.data.routes[0].overview_polyline.points;
        const decodedPath = decode(encodedPolyline).map(([lat, lng]) => ({
          lat,
          lng,
        }));

        setRouteCoordinates(decodedPath);
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };

    fetchDirections();
  }, [pickup, dropoff]);

  // Coordinates for Addis Ababa
  const mapCenter = {
    lat: 9.0300, // Latitude of Addis Ababa
    lng: 38.7400, // Longitude of Addis Ababa
  };

  return (
    <MapContainer center={mapCenter} zoom={14} style={{ height: '500px', width: '100%' }}>
      {/* OpenStreetMap tiles */}
      {/* <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      /> */}
      <GoogleLayer />

      {/* Markers for Pickup and Dropoff */}
      <Marker position={pickup}>
        <Popup>Pickup Location</Popup>
      </Marker>
      <Marker position={dropoff}>
        <Popup>Dropoff Location</Popup>
      </Marker>

      {/* Draw the polyline if routeCoordinates are available */}
      {routeCoordinates.length > 0 && (
        <LeafletPolyline
          positions={routeCoordinates}
          color='blue'
          weight={4}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
};
