import ShiftBox from "../../components/ShiftBox";
import { useAuth } from "../../dataStorage/useAuth";

const EmployeeDashboard = (props) => {
    const { user } = useAuth();
    return (
        <div className=" min-w-screen py-4 bg-neutral-300 min-h-screen text-black">
            <ShiftBox></ShiftBox>
        </div>
    );
};

export default EmployeeDashboard;

