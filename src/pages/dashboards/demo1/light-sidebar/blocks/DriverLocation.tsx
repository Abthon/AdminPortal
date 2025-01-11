import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const DriverLocation: React.FC<DriverLocationProps> = ({ data }) => {
  console.log(data, "new data");
  //9.005245, 38.746353
  const lat = 9.005245;
  const lng = 38.7463535;
  const validDrivers = data?.filter((driver: any) => driver.lat && driver.lng);

  const customIcon = L.divIcon({
    html: `<i class="ki-solid ki-geolocation text-3xl text-success"></i>`,
    className: "leaflet-marker",
    bgPos: [10, 10],
    iconAnchor: [20, 37],
    popupAnchor: [0, -37],
  });

  const mapCenter =
    validDrivers?.length > 0
      ? [parseFloat(validDrivers[0]?.lat!), parseFloat(validDrivers[0]?.lng!)]
      : [40.724716, -73.984789];

  console.log(mapCenter, "here");

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            className="rounded-xl w-full md:w-80 min-h-52"
            style={{ width: "100%", height: "550px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validDrivers?.map((driver: any) => (
              <Marker
                key={driver?.id}
                position={[parseFloat(driver?.lat!), parseFloat(driver?.lng!)]}
                icon={customIcon}
              >
                <Popup>
                  {driver?.firstName} {driver?.lastName}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
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
