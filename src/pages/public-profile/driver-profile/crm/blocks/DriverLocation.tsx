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
  console.log(data, "DriverLocation data");
  const lat = data?.lat || 40.724716;
  const lng = data?.lng || -73.984789;
  // const rows: IProfileRows = [
  //   {
  //     icon: "dribbble",
  //     text: "https://duolingo.com",
  //     info: true,
  //   },
  //   {
  //     icon: "facebook",
  //     text: "duolingo",
  //     info: true,
  //   },
  //   {
  //     icon: "youtube",
  //     text: "duolingo-tuts",
  //     info: true,
  //   },
  //   {
  //     icon: "whatsapp",
  //     text: "(31) 6-1235-4567",
  //     info: false,
  //   },
  //   {
  //     icon: "map",
  //     text: "Herengracht 501, 1017 BV Amsterdam, NL",
  //     info: false,
  //   },
  // ];

  // const products: IProfileProducts = [
  //   { label: "Lingo Kids" },
  //   { label: "Lingo Express" },
  //   { label: "Fun Learning" },
  //   { label: "Lingo Espanol" },
  //   { label: "Speaking Mastery" },
  //   { label: "Grammar Guru" },
  //   { label: "Lingo Quest" },
  //   { label: "History Lessons" },
  //   { label: "Global Explorer" },
  //   { label: "Translator" },
  //   { label: "Webflow" },
  //   { label: "Language Lab" },
  //   { label: "Lingo Plus" },
  // ];

  // const renderRows = (row: IProfileRow, index: number) => {
  //   return (
  //     <div key={index} className="flex items-center gap-2.5">
  //       <span>
  //         <KeenIcon icon={row.icon} className="text-lg text-gray-500" />
  //       </span>
  //       {row.info ? (
  //         <a href={row.text} className="link text-sm font-medium">
  //           {row.text}
  //         </a>
  //       ) : (
  //         <span className="text-sm text-gray-900">{row.text}</span>
  //       )}
  //     </div>
  //   );
  // };

  // const renderProducts = (product: IProfileProduct, index: number) => {
  //   return (
  //     <span key={index} className="badge badge-outline">
  //       {product.label}
  //     </span>
  //   );
  // };

  const customIcon = L.divIcon({
    html: `<i class="ki-solid ki-geolocation text-3xl text-success"></i>`,
    className: "leaflet-marker",
    bgPos: [10, 10],
    iconAnchor: [20, 37],
    popupAnchor: [0, -37],
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Driver Location</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-wrap items-center gap-5 mb-10">
          <MapContainer
            center={[lat, lng]}
            zoom={30}
            className="rounded-xl w-full md:w-80 min-h-52"
            style={{ width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={customIcon}>
              <Popup>Driver.</Popup>
              {/* <Popup>430 E 6th St, New York, 10009.</Popup> */}
            </Marker>
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
