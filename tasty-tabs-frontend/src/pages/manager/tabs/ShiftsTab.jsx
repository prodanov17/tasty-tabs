/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../dataStorage/useAuth";
import { getShiftEmployees } from "../../../dataStorage/api";


// Component for a single shift card
const ShiftCard = ({ shift, assignShift, employees, user }) => {
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [shiftEmployees, setShiftEmployees] = useState([]);

    // Fetch employees assigned to this shift
    const fetchShiftEmployees = useCallback(async () => {
        if (!shift || !shift.id) return;
        try {
            const response = await getShiftEmployees(shift.id);
            if (response) {
                setShiftEmployees(response);
            }
            console.log("Shift", shift.id, "employees:", response);
        } catch (error) {
            console.error(`Failed to fetch employees for shift ${shift.id}:`, error);
        }
    }, [shift]);

    useEffect(() => {
        fetchShiftEmployees();
    }, [fetchShiftEmployees]);

    return (
        <div className="bg-white rounded-2xl p-4 w-full">
            <h2 className="text-xl font-semibold text-gray-800">Shift Details</h2>
            <div className="mt-4">
                <p className="text-gray-600">
                    <span className="font-semibold">Shift ID:</span> {shift.id}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Manager ID:</span> {shift.manager_id}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Start Time:</span> {shift.start_time}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">End Time:</span> {shift.end_time}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(shift.date).toLocaleDateString()}
                </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mt-4">
                Employees Assigned
            </h3>
            <div className="flex flex-col gap-2 mt-4">
                {shiftEmployees.length > 0 ? (
                    shiftEmployees.map((employee) => (
                        <p key={employee.user_id} className="text-gray-600">
                            - {employee.email}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-600">No employees assigned.</p>
                )}
            </div>
            <div className="flex gap-4 mt-4">
                <select
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                    <option value="">Assign Employee</option>
                    {user &&
                        employees
                            .filter((e) => e.role !== "manager")
                            .filter(
                                (e) =>
                                    shiftEmployees.findIndex(
                                        (se) => se.email === e.email
                                    ) === -1 && e.email !== user.email
                            )
                            .map((employee) => (
                                <option key={employee.user_id} value={employee.user_id}>
                                    {employee.email}
                                </option>
                            ))}
                </select>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 w-fit"
                    onClick={() => assignShift(shift.id, selectedEmployee, user.id)}
                >
                    Assign
                </button>
            </div>
        </div>
    );
};

// Parent component that renders the shifts tab with a "Create Shift" form at the top.
const ShiftsTab = ({ shifts, assignShift, employees, createShift }) => {
    const { user } = useAuth();

    // Local state to store new shift values
    const [newShift, setNewShift] = useState({
        date: "",
        start_time: "",
        end_time: "",
    });

    const handleCreateShift = (e) => {
        e.preventDefault();
        if (!newShift.date || !newShift.start_time || !newShift.end_time) {
            alert("Please fill in all fields.");
            return;
        }
        // Call the createShift function (which you'll implement)
        // Passing the manager's id from the logged-in user, and the new shift details.
        createShift(user.id, newShift.date, newShift.start_time, newShift.end_time);
        // Optionally, clear the form fields after submission
        setNewShift({ date: "", start_time: "", end_time: "" });
    };

    return (
        <div className="p-4">
            {/* Create Shift Form */}
            <form
                onSubmit={handleCreateShift}
                className="mb-6 p-4  rounded-xl bg-gray-50"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Create Shift
                </h2>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            value={newShift.date}
                            onChange={(e) =>
                                setNewShift({ ...newShift, date: e.target.value })
                            }
                            className="p-2 border border-gray-300 rounded-lg"
                            placeholder="Date"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="start_time">Start Time</label>
                        <input
                            type="time"
                            value={newShift.start_time}
                            onChange={(e) =>
                                setNewShift({ ...newShift, start_time: e.target.value })
                            }
                            className="p-2 border border-gray-300 rounded-lg"
                            placeholder="Start Time"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="end_time">End Time</label>
                        <input
                            type="time"
                            value={newShift.end_time}
                            onChange={(e) =>
                                setNewShift({ ...newShift, end_time: e.target.value })
                            }
                            className="p-2 border border-gray-300 rounded-lg"
                            placeholder="End Time"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                    >
                        Create Shift
                    </button>
                </div>
            </form>

            {/* List of existing shifts */}
            <div className="flex flex-col gap-4">
                {shifts.map((shift) => (
                    <ShiftCard
                        key={shift.id}
                        shift={shift}
                        assignShift={assignShift}
                        employees={employees}
                        user={user}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShiftsTab;

