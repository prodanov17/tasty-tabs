import ShiftBox from "../components/ShiftBox";
import { useAuth } from "../dataStorage/useAuth";
import EmployeeDashboard from "./employee/EmployeeDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";
const Dashboard = (props) => {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }
    return (
        <div className=" min-w-screen py-4 bg-neutral-300 min-h-screen text-black">
            <h1 className="text-lg font-semibold text-center mb-4">
                Welcome, {user ? user.role : "user"}
            </h1>
            {user.user_type === "employee" && user.role !== "manager" && <EmployeeDashboard />}
            {user.role === "manager" && <ManagerDashboard />}
            {user.role === "customer" && <div>Customer Dashboard</div>}

        </div>
    );
};

export default Dashboard;
