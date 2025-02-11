import { useEffect, useState } from "react"
import { getReservations } from "../../../dataStorage/api";
import useHttp from "../../../dataStorage/use-http";

const Reservations =({ reloadTrigger })=>{
    const { sendRequest, status, data, error } = useHttp(getReservations, true);

    useEffect(() => {
        sendRequest(localStorage.getItem("user_id")); // Send request on component mount
        console.log(data);
    }, [sendRequest,reloadTrigger]);

    return (
        <div>
        <h2 className="text-2xl m-2">My Reservations</h2>
        <hr/>
        {/* Assuming `data` is an array of reservation objects */}
        {data!=null && data.map((reservation) => (
          <div key={reservation.id} style={{ marginBottom: "1rem" }} className="border-2 border-black rounded-sm p-2 m-2">
            <p><strong>Date/Time:</strong> {reservation.datetime}</p>
            <p><strong>Number of People:</strong> {reservation.number_of_people}</p>
            {/* Add any other fields you want to display */}
          </div>
        ))}
      </div>
    )
}


export default Reservations;