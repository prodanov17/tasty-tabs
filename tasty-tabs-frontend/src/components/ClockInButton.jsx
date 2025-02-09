import  { useState } from "react";
import useHttp from "../dataStorage/use-http";
import { clockIn } from "../dataStorage/api";
const ClockInButton = (props) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const { sendRequest, status, data, error } = useHttp(clockIn, true);
  const handleClockIn = () => {
    setIsClockedIn(true);
    // Implement API request for clocking in if needed
    let inputData = {
      employee_id: localStorage.getItem("user_id"),
      shift_id: props.shift_id,
    };
    sendRequest(inputData);
  };

  return (
    <button
      onClick={handleClockIn}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400"
      disabled={isClockedIn}
    >
      Clock In
    </button>
  );
};

export default ClockInButton;
