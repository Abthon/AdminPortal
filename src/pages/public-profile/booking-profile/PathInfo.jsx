import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { decode } from '@googlemaps/polyline-codec';
import { MapContainer, Marker, Popup, Polyline as LeafletPolyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.gridlayer.googlemutant';

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Memoized Google Layer to prevent multiple re-renders
const GoogleLayer = memo(() => {
  const map = useMap();

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
    const scriptId = 'google-maps-api-script';

    // Load Google Maps API script only once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const googleLayer = L.gridLayer.googleMutant({
      type: 'roadmap', // Options: 'roadmap', 'satellite', 'terrain', 'hybrid'
    });

    googleLayer.addTo(map);

    return () => {
      map.removeLayer(googleLayer);
    };
  }, [map]);

  return null;
});

export const PathInfo = ({ data }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const pickup = { lat: data.pickupLat || 9.0308644, lng: data.pickupLng || 38.7626244 }; // Example pickup point
  const dropoff = { lat: data.dropOffLat || 9.0053468, lng: data.dropOffLng || 38.7673327 }; // Example dropoff point

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const origin = `${pickup.lat},${pickup.lng}`;
        const destination = `${dropoff.lat},${dropoff.lng}`;

        const response = await axios.get('/api/directions', {
          params: {
            origin: origin,
            destination: destination,
          },
        });

        if (response.data.status !== 'OK') {
          throw new Error(`Directions API error: ${response.data.status}`);
        }

        const encodedPolyline = response.data.routes[0].overview_polyline.points;
        const decodedPath = decode(encodedPolyline).map(([lat, lng]) => ({ lat, lng }));
        setRouteCoordinates(decodedPath);
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    };

    fetchDirections();
  }, [pickup, dropoff, data]);

  const mapCenter = { lat: 9.0300, lng: 38.7400 }; // Addis Ababa coordinates

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '800px', width: '100%' }}>
      {/* Google Layer for the map */}
      <GoogleLayer />

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
