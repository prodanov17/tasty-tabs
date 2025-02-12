import { useCallback, useEffect, useState } from "react";
import ShiftsTab from "./tabs/ShiftsTab";
import EmployeesTab from "./tabs/EmployeesTab";
import {
  assignShiftToEmployee,
  createShift,
  getEmployees,
  getManagerShifts,
  getShiftEmployees,
} from "../../dataStorage/api";
import { useAuth } from "../../dataStorage/useAuth";

// ManagerDashboard with color-changing tabs (no borders)
const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("shifts");
  const [shiftEmployees, setShiftEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const { user } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getManagerShifts(user.id);
      if (response) {
        setShifts(response);
      }
      console.log(response);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    }
  }, [user]);

  const fetchEmployees = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getEmployees();
      if (response) {
        setEmployees(response);
      }
      console.log(response);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    }
  }, [user]);

  const assignShift = async (shiftId, employeeId, managerId) => {
    try {
      const response = await assignShiftToEmployee(
        shiftId,
        employeeId,
        managerId
      );
      if (response) {
        fetchShifts();
      }
    } catch (error) {
      console.error("Failed to assign employee to shift:", error);
    }
  };

  const handleCreateShift = async (manager_id, date, start_time, end_time) => {
    try {
      const response = await createShift(
        manager_id,
        date,
        start_time,
        end_time
      );
      if (response) {
        fetchShifts();
      }
    } catch (error) {
      console.error("Failed to create shift:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, [fetchShifts, fetchEmployees]);

  return (
    <div className="w-full p-4">
      <div className="flex bg-gray-200 rounded mb-4 w-max mx-4">
        <button
          onClick={() => setActiveTab("employees")}
          className={`py-2 cursor-pointer px-4 rounded ${
            activeTab === "employees"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab("shifts")}
          className={`py-2 cursor-pointer px-4 rounded ${
            activeTab === "shifts"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Shifts
        </button>
      </div>
      <div>
        {activeTab === "employees" && (
          <EmployeesTab
            employees={employees}
            shifts={shifts}
            assignShift={assignShift}
          />
        )}
        {activeTab === "shifts" && (
          <ShiftsTab
            shifts={shifts}
            employees={employees}
            assignShift={assignShift}
            createShift={handleCreateShift}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
