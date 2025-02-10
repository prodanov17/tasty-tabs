import { useState } from "react";
import ReserveTabelModel from "./tabs/ReserveTabelModel";
import Reservations from "./tabs/Reservations";


const CustomerDashboard = () =>{

    return (
        <div>
            <ReserveTabelModel/>
            <Reservations/>
        </div>
    )
}


export default CustomerDashboard;