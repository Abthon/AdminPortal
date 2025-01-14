import { toAbsoluteUrl } from "@/utils";
import { MarkerF, OverlayView } from "@react-google-maps/api";

interface MarkerProps {
  driver: any;
}

const CustomMarker: React.FC<MarkerProps> = ({ driver }) => {
  console.log(driver, "driver");
  const successImg = toAbsoluteUrl(
    "/media/illustrations/motorcycle-success.png"
  );
  const failureImg = toAbsoluteUrl(
    "/media/illustrations/motorcycle-failure.png"
  );

  return (
    <MarkerF
      position={{ lat: driver?.lat, lng: driver?.lng }}
      icon={{
        url: driver?.is_online ? successImg : failureImg,
        scaledSize: new google.maps.Size(50, 50), // Use google.maps.Size constructor if you're using Google Maps
      }}
    >
      <OverlayView
        position={{ lat: driver?.lat, lng: driver?.lng }}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      >
        <div>
          <p>{driver.firstName}</p>
        </div>
      </OverlayView>
    </MarkerF>
  );
};

export { CustomMarker };
