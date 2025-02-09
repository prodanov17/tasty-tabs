import React, { useState, useEffect } from "react";
import useHttp from "../dataStorage/use-http";
import { getShift } from "../dataStorage/api";
import ClockInButton from "./ClockInButton";
import ClockOutButton from "./ClockOutButton"
const ShiftBox = () => {
  const { sendRequest, status, data, error } = useHttp(getShift, true);

  useEffect(() => {
    sendRequest(localStorage.getItem("user_id")); // Send request on component mount
  }, [sendRequest]);

  return (
    <div className="rounded-lg block w-[90%] py-4 sm:px-8 px-2 bg-white text-black shadow-md mx-auto">
      {status === "pending" && (
        <div className="text-center py-4">Loading data...</div>
      )}

      {status === "completed" && data && data.length > 0 && (
        <div className="bg-white rounded-2xl p-4 w-full mx-auto">
          <h2 className="text-xl font-semibold text-gray-800">Shift Details</h2>
          <div className="mt-4">
            <p className="text-gray-600">
              <span className="font-semibold">Shift ID:</span>{" "}
              {data[0].shift_id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Manager ID:</span>{" "}
              {data[0].manager_id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Start Time:</span>{" "}
              {data[0].start_time}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">End Time:</span>{" "}
              {data[0].end_time}
            </p>
          </div>
          <ClockInButton shift_id={data[0].shift_id}></ClockInButton>
          <ClockOutButton shift_id={data[0].shift_id}></ClockOutButton>
        </div>
      )}

      {status === "completed" && (!data || data.length === 0) && (
        <div className="text-center py-4">No shift data available.</div>
      )}
    </div>
  );
};

export default ShiftBox;
