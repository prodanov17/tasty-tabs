import { useState } from "react";
import useHttp from "../dataStorage/use-http";
import { clockOut } from "../dataStorage/api";

const ClockOutButton = ({ shift_id, onClockOut }) => {
  const { sendRequest, status } = useHttp(clockOut, false); // No auto-fetching
  const [isClockedOut, setIsClockedOut] = useState(false);

  const handleClockOut = async () => {
    if (isClockedOut || status === "pending") return; // Prevent multiple clicks

    let inputData = {
      employee_id: localStorage.getItem("user_id"),
      shift_id: shift_id,
    };

    try {
      await sendRequest(inputData); // Wait for API request to complete
      setIsClockedOut(true);
      onClockOut(); // Refresh shift data in ShiftBox
    } catch (error) {
      console.error("Clock-out failed:", error);
    }
  };

  return (
    <button
      onClick={handleClockOut}
      disabled={isClockedOut || status === "pending"}
      className={`px-4 py-2 ml-5 rounded-lg shadow-md 
        ${
          isClockedOut
            ? "bg-gray-400"
            : "bg-red-500 hover:bg-red-600 text-white"
        }
        ${status === "pending" ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {status === "pending"
        ? "Clocking out..."
        : isClockedOut
        ? "Clocked Out"
        : "Clock Out"}
    </button>
  );
};

export default ClockOutButton;
