import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const TimePicker24h = ({ value, onChange, className = "" }) => {
  const [selectedHour, setSelectedHour] = useState("00");
  const [selectedMinute, setSelectedMinute] = useState("00");

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":");
      setSelectedHour(hour || "00");
      setSelectedMinute(minute || "00");
    }
  }, [value]);

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Generate minutes (00, 15, 30, 45)
  const minutes = ["00", "15", "30", "45"];

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
  };

  const scrollToSelected = (containerId, selectedValue) => {
    const container = document.getElementById(containerId);
    const selectedElement = container?.querySelector(
      `[data-value="${selectedValue}"]`
    );
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    // Scroll to selected values after render
    setTimeout(() => {
      scrollToSelected("hours-column", selectedHour);
      scrollToSelected("minutes-column", selectedMinute);
    }, 100);
  }, [selectedHour, selectedMinute]);

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      {/* Header showing selected time */}
      {/* <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Selected Time</div>
          <div className="text-xl font-semibold text-gray-900">
            {selectedHour}:{selectedMinute}
          </div>
          <div className="text-xs text-gray-500 mt-1">24-hour format</div>
        </div>
      </div> */}

      {/* Time selection columns */}
      <div className="flex">
        {/* Hours column */}
        <div className="flex-1 border-r border-gray-200">
          <div className="p-3 text-center border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Hour</span>
          </div>
          <div
            id="hours-column"
            className="h-48 overflow-y-auto scrollbar-thin"
          >
            {hours.map((hour) => (
              <div
                key={hour}
                data-value={hour}
                className={`p-3 text-center cursor-pointer transition-all border-b border-gray-100 last:border-b-0
                  ${
                    selectedHour === hour
                      ? "bg-blue-50 text-blue-600 font-semibold border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => handleHourSelect(hour)}
              >
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Minutes column */}
        <div className="flex-1">
          <div className="p-3 text-center border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Minute</span>
          </div>
          <div
            id="minutes-column"
            className="h-48 overflow-y-auto scrollbar-thin"
          >
            {minutes.map((minute) => (
              <div
                key={minute}
                data-value={minute}
                className={`p-3 text-center cursor-pointer transition-all border-b border-gray-100 last:border-b-0
                  ${
                    selectedMinute === minute
                      ? "bg-blue-50 text-blue-600 font-semibold border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => handleMinuteSelect(minute)}
              >
                {minute}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      {/* <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onChange("09:00")}
          >
            Morning
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onChange("14:00")}
          >
            Afternoon
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onChange("19:00")}
          >
            Evening
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default TimePicker24h;
