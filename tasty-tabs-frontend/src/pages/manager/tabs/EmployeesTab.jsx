/* eslint-disable react/prop-types */

import { useState } from "react";
import { useAuth } from "../../../dataStorage/useAuth";

// Component for an individual employee card
const EmployeeCard = ({ employee, assignShift, shifts, user }) => {
    const [selectedShift, setSelectedShift] = useState("");

    return (
        <div className="bg-white rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-gray-800">
                User ID: {employee.user_id}
            </h3>
            <p className="text-gray-600"><span className="font-semibold">Email:</span> {employee.email}</p>
            <p className="text-gray-600"><span className="font-semibold">Net Salary:</span> {employee.net_salary}</p>
            <p className="text-gray-600"><span className="font-semibold">Gross Salary:</span> {employee.gross_salary}</p>
            <p className="text-gray-600">{employee.phone}</p>
            <div className="mt-4 flex flex-col gap-2">
                <select
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                >
                    <option value="">Assign Shift</option>
                    {user &&
                        shifts.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                                {shift.start_time} - {shift.end_time},{" "}
                                {new Date(shift.date).toLocaleDateString()}
                            </option>
                        ))}
                </select>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 w-fit"
                    onClick={() => assignShift(selectedShift, employee.user_id, user.id)}
                >
                    Assign
                </button>
            </div>
        </div>
    );
};

// Parent component that renders the grid of employee cards
const EmployeesTab = ({ employees, assignShift, shifts }) => {
    const { user } = useAuth();

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">Employees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {employees.map((employee) => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        assignShift={assignShift}
                        shifts={shifts}
                        user={user}
                    />
                ))}
            </div>
        </div>
    );
};

export default EmployeesTab;

