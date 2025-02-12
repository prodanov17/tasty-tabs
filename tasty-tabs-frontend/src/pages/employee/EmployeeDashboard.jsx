import ShiftBox from "../../components/ShiftBox";
import TablesTab from "./tabs/TablesTab";

const EmployeeDashboard = (props) => {
    return (
        <div className=" min-w-screen py-4 bg-neutral-300 min-h-screen text-black">
            <ShiftBox></ShiftBox>
            <TablesTab></TablesTab>
        </div>
    );
};

export default EmployeeDashboard;

