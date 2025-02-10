import { useEffect, useState } from "react"
import { getReservations } from "../../../dataStorage/api";
import useHttp from "../../../dataStorage/use-http";

const Reservations =()=>{
    const { sendRequest, status, data, error } = useHttp(getReservations, true);

    useEffect(() => {
        sendRequest(localStorage.getItem("user_id")); // Send request on component mount
        console.log(data);
    }, [sendRequest]);

    return (
        <div>
        <h2>My Reservations</h2>
        {/* Assuming `data` is an array of reservation objects */}
        {data!=null && data.map((reservation) => (
          <div key={reservation.id} style={{ marginBottom: "1rem" }}>
            <p><strong>Date/Time:</strong> {reservation.datetime}</p>
            <p><strong>Stay Length:</strong> {reservation.stay_length}</p>
            <p><strong>Number of People:</strong> {reservation.number_of_people}</p>
            {/* Add any other fields you want to display */}
            <hr />
          </div>
        ))}
      </div>
    )
}


export default Reservations;