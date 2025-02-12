/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import useHttp from "../../../dataStorage/use-http";
import { getTables } from "../../../dataStorage/api";


const TablesTab = () => {
  const { sendRequest, status, data, error } = useHttp(getTables, true);

  useEffect(() => {
    sendRequest(); // Send request on component mount
  }, [sendRequest]);

  return (
    <div className="rounded-lg block w-[90%] py-4 sm:px-8 px-2 mt-5 bg-white text-black shadow-md mx-auto">
      {status === "pending" && (
        <div className="text-center py-4">Loading data...</div>
      )}
      {status === "completed" && data && data.length > 0 && (
        <div className="bg-white rounded-2xl p-4 w-full mx-auto">
          <h2 className="text-xl font-semibold text-gray-800">Tables</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {data.map((table) => (
              <div
                key={table.table_number}
                className="bg-gray-100 w-36 h-36 md:w-48 md:h-48 rounded-full shadow-md flex flex-col items-center justify-center"
              >
                <span className="text-lg font-semibold text-gray-800">
                  {table.table_number}
                </span>
                <span className="text-gray-600 text-sm">
                  Seats: {table.capacity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "completed" && (!data || data.length === 0) && (
        <div className="text-center py-4">No shift data available.</div>
      )}
    </div>
  );
};

export default TablesTab;
