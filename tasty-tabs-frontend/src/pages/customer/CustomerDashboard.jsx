import { useState } from "react";
import ReserveTabelModel from "./tabs/ReserveTabelModel";
import Reservations from "./tabs/Reservations";


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
        </div>
    )
}


export default CustomerDashboard;