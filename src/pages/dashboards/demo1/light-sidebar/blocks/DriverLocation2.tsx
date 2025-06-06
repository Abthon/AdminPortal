import { toAbsoluteUrl } from "@/utils";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { CustomMarker } from "./Markers";

interface DriverLocationProps {
  data: any;
}

// const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY;
import React, { useState, useEffect } from "react";

type FilterOption = "all" | "active-busy" | "active-not-busy" | "offline";

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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // State for filter dropdown
  const [filterOption, setFilterOption] = useState<FilterOption>("all");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const driversPerPage = 10;

  // Function to handle marker click and set selected driver
  const handleMarkerClick = (driverId: string | null) => {
    setSelectedMarkerId(driverId);
    if (driverId) {
      const driver = data.find((d: any) => d.id === driverId);
      setSelectedDriver(driver);
    } else {
      setSelectedDriver(null);
    }
  };

  // Function to get valid drivers (those with lat/lng)
  const getValidDrivers = (drivers: any[]) => {
    if (!drivers) return [];
    return drivers.filter((driver: any) => driver.lat && driver.lng);
  };

  // Function to paginate drivers FIRST
  const paginateDrivers = (drivers: any[]) => {
    const startIndex = (currentPage - 1) * driversPerPage;
    const endIndex = startIndex + driversPerPage;
    return drivers.slice(startIndex, endIndex);
  };

  // Function to filter drivers within the current page
  const filterPaginatedDrivers = (drivers: any[]) => {
    if (!drivers) return [];

    return drivers.filter((driver: any) => {
      switch (filterOption) {
        case "active-busy":
          return driver.is_online && driver.isBusy;
        case "active-not-busy":
          return driver.is_online && !driver.isBusy;
        case "offline":
          return !driver.is_online;
        case "all":
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    if (data && data.length > 0 && data[0]?.lat && data[0]?.lng) {
      setMapCenter({ lat: data[0].lat, lng: data[0].lng });
    }
  }, [data]);

  // First get valid drivers, then paginate, then filter within the page
  const validDrivers = getValidDrivers(data);
  const paginatedDrivers = paginateDrivers(validDrivers);
  const finalDriversToShow = filterPaginatedDrivers(paginatedDrivers);
  const totalPages = Math.ceil(validDrivers.length / driversPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const successImg = toAbsoluteUrl("/media/illustrations/success-loc.png");
  const failureImg = toAbsoluteUrl("/media/illustrations/fail-loc.png");

  return (
    <div>
      {/* Filter Dropdown and Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Filter Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="driver-filter" style={{ fontWeight: "bold" }}>
            Filter Current Page:
          </label>
          <select
            id="driver-filter"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              minWidth: "200px",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">All Drivers</option>
            <option value="active-busy">Active but Busy</option>
            <option value="active-not-busy">Active but Not Busy</option>
            <option value="offline">Offline</option>
          </select>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Showing {finalDriversToShow.length} of {paginatedDrivers.length}{" "}
            driver(s) on this page
          </span>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: currentPage === 1 ? "#f5f5f5" : "white",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              Previous
            </button>

            {getPageNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor:
                    currentPage === pageNumber ? "#007bff" : "white",
                  color: currentPage === pageNumber ? "white" : "black",
                  cursor: "pointer",
                  fontSize: "14px",
                  minWidth: "35px",
                }}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor:
                  currentPage === totalPages ? "#f5f5f5" : "white",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              Next
            </button>

            <span
              style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}
            >
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      <LoadScript googleMapsApiKey={"AIzaSyDBbmSw9fX9vAjkgPpJ3ahoYsmzagGr4LI"}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          // Optional: Add onDragEnd to update state when user moves map manually
          // onDragEnd={() => setMapCenter(map.getCenter().toJSON())}
        >
          {finalDriversToShow?.map((driver: any) => (
            <CustomMarker
              key={driver.id}
              driver={driver}
              selectedMarkerId={selectedMarkerId}
              onMarkerClick={handleMarkerClick}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Driver Status Legend */}
      {/* {
      selectedDriver && (
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
        </div>
      )} */}
    </div>
  );
};

export { DriversLocationMap };
