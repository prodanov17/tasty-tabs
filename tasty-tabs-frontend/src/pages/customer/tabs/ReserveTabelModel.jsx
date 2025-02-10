import React,{ useState ,useRef} from "react";
import useHttp from "../../../dataStorage/use-http";
import { makeReservation } from "../../../dataStorage/api";
const ReserveTabelModel = () =>{
    const [isModalOpen, setModalOpen] = useState(false);
    const { sendRequest, status, data, error } = useHttp(makeReservation, true);
    const [hasError,setHasError] = useState(false);
    const numberOfGuests = useRef();
    const datetime = useRef();
    const stayOfLength= useRef();
    // Functions to open and close the modal
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
  
    // Handle form submission
    const handleSubmit =async (event) => {
      event.preventDefault();
      // Add your form submission logic here (e.g., send data to an API)
      const inputData={
        datetime : datetime.current.value,
        stay_length: stayOfLength.current.value,
        number_of_people : numberOfGuests.current.value,
        user_id : localStorage.getItem("user_id"),
      }
      try {
        const response = await sendRequest(inputData);
    
        alert("You have successfully reserved a table!");
        closeModal();
      } catch (error) {
        console.error(error);
        alert(error.message || "Could not make a reservation. Try again.");
      }
    };
  
    return (
      <div className=" text-center">
        <button
          onClick={openModal}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-neutral-600 transition-colors"
        >
          Reserve Table
        </button>
  
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            {/* Modal content */}
            <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">Fill out the form</h2>
              <div className="text-left">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="numberOfGuests" className="block text-gray-700">
                    Number of guests:
                  </label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    required
                    ref={numberOfGuests}
                    placeholder=""
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="dateOfReservation" className="block text-gray-700">
                    Reservation date:
                  </label>
                  <input
                    type="datetime-local"
                    id="dateOfReservation"
                    required
                    ref={datetime}
                    placeholder=""
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4">
                <label htmlFor="stayLength" className="block text-gray-700">
                    Length of stay in hours:
                  </label>
                  <input
                    type="number"
                    id="stayLength"
                    required
                    ref={stayOfLength}
                    placeholder=""
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mb-4">
                    {error}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default ReserveTabelModel;