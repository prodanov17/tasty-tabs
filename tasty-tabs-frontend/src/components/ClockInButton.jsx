import { useState } from "react";
import useHttp from "../dataStorage/use-http";
import { clockIn } from "../dataStorage/api";

const ClockInButton = ({ shift_id, onClockIn }) => {
  const { sendRequest, status } = useHttp(clockIn, false); // Remove auto-fetching
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleClockIn = async () => {
    if (isClockedIn || status === "pending") return; // Avoid multiple requests

    let inputData = {
      employee_id: localStorage.getItem("user_id"),
      shift_id: shift_id,
    };

    try {
      await sendRequest(inputData); // Wait for request completion
      setIsClockedIn(true);
      onClockIn(); // Refresh shift data in parent component
    } catch (error) {
      console.error("Clock-in failed:", error);
    }
  };

  return (
    <button
      onClick={handleClockIn}
      disabled={isClockedIn || status === "pending"}
      className={`px-4 py-2 rounded-lg shadow-md 
        ${
          isClockedIn
            ? "bg-gray-400"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }
        ${status === "pending" ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {status === "pending"
        ? "Clocking in..."
        : isClockedIn
        ? "Clocked In"
        : "Clock In"}
    </button>
  );
};

export default ClockInButton;
