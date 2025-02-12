import { useState } from "react";
import ReserveTabelModel from "./tabs/ReserveTabelModel";
import Reservations from "./tabs/Reservations";
import MenuOrder from "./tabs/MenuOrder";


const CustomerDashboard = () =>{
    const [reloadReservations, setReloadReservations] = useState(false);
    const handleReservationSuccess = () => {
        // Toggle or increment so that we can trigger
        // an effect in Reservations to refetch
        setReloadReservations((prev) => !prev);
      };
    return (
        <div>
            <ReserveTabelModel onReservationSuccess={handleReservationSuccess}/>
            <Reservations reloadTrigger={reloadReservations}/>
            <MenuOrder/>
        </div>
    )
}


export default CustomerDashboard;