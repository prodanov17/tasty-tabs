import { useState } from "react";
import useHttp from "../dataStorage/use-http";
import { clockOut } from "../dataStorage/api";
const ClockInButton = (props) => {
  const [isClockedOut, setIsClockedOut] = useState(false);
  const { sendRequest, status, data, error } = useHttp(clockOut, true);
  const handleClockOut = () => {
    setIsClockedOut(true);
    // Implement API request for clocking in if needed
    let inputData = {
      employee_id: localStorage.getItem("user_id"),
      shift_id: props.shift_id,
    };
    sendRequest(inputData);
  };

  return (
    <button
      onClick={handleClockOut}
      className="bg-red-500 text-white ml-5 px-4 py-2 rounded-lg shadow-md hover:bg-red-600 disabled:bg-gray-400"
      disabled={isClockedOut}
    >
      Clock Out
    </button>
  );
};

export default ClockInButton;
