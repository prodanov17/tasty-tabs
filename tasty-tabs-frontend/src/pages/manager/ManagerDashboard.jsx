import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../dataStorage/useAuth";
import { getManagerShifts } from "../../dataStorage/api";

const ManagerDashboard = (props) => {
    const { user } = useAuth();
    const [shifts, setShifts] = useState([]);

    const fetchShifts = useCallback(async () => {
        if (!user) {
            return;
        }
        const response = await getManagerShifts(user.id);

        if (response && response) {
            setShifts(response);
        }

        console.log(response);

    }, [user]);


    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);
    return (
        <div className="w-full flex flex-col gap-4 justify-start  p-4">
            <button className="bg-blue-500 w-fit text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400">Create Shift</button>

            <div className="w-full flex flex-col gap-2 justify-start items-start ">
                {shifts.map((shift) => (
                    <div key={shift.shift_id} className="bg-white rounded-2xl p-4 w-full mx-auto">
                        <h2 className="text-xl font-semibold text-gray-800">Shift Details</h2>
                        <div className="mt-4">
                            <p className="text-gray-600">
                                <span className="font-semibold">Shift ID:</span>{" "}
                                {shift.id}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Manager ID:</span>{" "}
                                {shift.manager_id}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Start Time:</span>{" "}
                                {shift.start_time}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">End Time:</span>{" "}
                                {shift.end_time}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Date:</span>{" "}
                                {new Date(shift.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerDashboard;

