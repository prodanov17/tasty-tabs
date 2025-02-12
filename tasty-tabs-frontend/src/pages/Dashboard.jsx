import { useContext } from "react";
import { useAuth } from "../dataStorage/useAuth";
import CustomerDashboard from "./customer/CustomerDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";
import AuthContext from "../dataStorage/Auth-context";
const Dashboard = (props) => {
  const { user } = useAuth();
  const authCtx = useContext(AuthContext);
  const logoutHandler = () => {
    authCtx.logout();
  };
  if (!user) {
    return <div>Loading...</div>;
  }
  return (
    <div className=" min-w-screen py-4 bg-neutral-300 min-h-screen text-black relative">
      <button
        onClick={logoutHandler}
        className="py-2 cursor-pointer px-4 rounded bg-blue-500 text-white absolute right-10"
      >
        Logout
      </button>
      <h1 className="text-lg font-semibold text-center mb-4">
        Welcome, {user ? user.role : "user"}
      </h1>
      {user.user_type === "employee" && user.role !== "manager" && (
        <EmployeeDashboard />
      )}
      {user.role === "manager" && <ManagerDashboard />}
      {user.user_type === "customer" && <CustomerDashboard />}
    </div>
  );
};

export default Dashboard;
