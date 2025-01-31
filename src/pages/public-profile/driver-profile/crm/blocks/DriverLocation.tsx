import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { memo, useEffect, useRef, useState } from "react";
import "leaflet.gridlayer.googlemutant";

interface IProfileRow {
  icon: string;
  text: string;
  info: boolean;
}
interface IProfileRows extends Array<IProfileRow> {}

interface DriverLocationProps {
  data: any;
}

interface IProfileProduct {
  label: string;
}
interface IProfileProducts extends Array<IProfileProduct> {}

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

const GoogleLayer = memo(({ onLayerLoaded }: any) => {
  const map = useMap();
  const googleLayerRef = useRef(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
    const scriptId = "google-maps-api-script";

    const loadGoogleLayer = () => {
      if (!googleLayerRef.current) {
        const googleLayer = (L.gridLayer as any).googleMutant({
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

const DriverLocation: React.FC<DriverLocationProps> = ({ data }) => {
  const [isGoogleLayerLoaded, setGoogleLayerLoaded] = useState(false);
  const lat = data?.lat || 9.03;
  const lng = data?.lng || 38.74;

  const customIcon = L.divIcon({
    html: `<i class="ki-solid ki-geolocation text-3xl text-success"></i>`,
    className: "leaflet-marker",
    bgPos: [10, 10],
    iconAnchor: [20, 37],
    popupAnchor: [0, -37],
  });

  const handleGoogleLayerLoaded = () => {
    setGoogleLayerLoaded(true);
  };

  // const mapCenter = { lat: 9.03, lng: 38.74 };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Driver Location</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            className="rounded-xl w-full md:w-80 min-h-52"
            style={{ width: "100%" }}
          >
            <GoogleLayer onLayerLoaded={handleGoogleLayerLoaded} />
            {/* <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /> */}
            <Marker position={[lat, lng]}>
              <Popup>{`${data?.firstName} ${data?.lastName}`}</Popup>
            </Marker>
            {/* <Marker position={[lat, lng]} icon={customIcon}>
              <Popup>Driver.</Popup>
            </Marker> */}
          </MapContainer>

          {/* <div className="flex flex-col gap-2.5">
            {rows.map((row, index) => {
              return renderRows(row, index);
            })}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export {
  DriverLocation,
  type IProfileRow,
  type IProfileRows,
  type IProfileProduct,
  type IProfileProducts,
};
