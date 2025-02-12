const API = "http://127.0.0.1:5002";

export async function getUser(user_id) {
    const response = await fetch(
        `${API}/api/users/${parseInt(user_id, 10)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not fetch user.");
    }

    return data;
}

export async function getShiftEmployees(shift_id) {
    const response = await fetch(
        `${API}/api/shifts/${parseInt(shift_id, 10)}/assignments`
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Employees.");
    }

    return data;
}
export async function getEmployees() {
    const response = await fetch(`${API}/api/employees`);

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Employees.");
    }

    return data;
}

export async function createShift(manager_id, date, start_time, end_time) {
    const response = await fetch(`${API}/api/managers/${manager_id}/shifts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                date: date,
                start_time: start_time,
                end_time: end_time,
            }
        ),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not create Shift.");
    }

    return data;
}

export async function assignShiftToEmployee(shiftId, employeeId, managerId) {
    const response = await fetch(`${API}/api/shift/${parseInt(shiftId, 10)}/assignment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            employee_id: parseInt(employeeId, 10),
            manager_id: parseInt(managerId, 10),
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not assign employee to shift.");
    }

    return data;
}

export async function getManagerShifts(manager_id) {
    const response = await fetch(`${API}/api/managers/${parseInt(manager_id, 10)}/shifts`);

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Shifts.");
    }

    return data;
}

export async function getShift(employee_id) {
    console.log(employee_id);
    const response = await fetch(
        `${API}/api/employees/${parseInt(employee_id, 10)}/shift`
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Menu items.");
    }
    const transformedData = [];
    for (const key in data) {
        transformedData.push(data[key]);
    }
    return transformedData;
}

export async function clockIn(inputData) {
    const response = await fetch(
        `${API}/api/employees/${parseInt(
            inputData.employee_id,
            10
        )}/shift/${parseInt(inputData.shift_id, 10)}/clock-in`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        throw new Error(data.message || "Could not clock in.");
    }
    alert("Clocked In succesfully");
    return data;
}
export async function clockOut(inputData) {
    const response = await fetch(
        `${API}/api/employees/${parseInt(
            inputData.employee_id,
            10
        )}/shift/${parseInt(inputData.shift_id, 10)}/clock-out`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        throw new Error(data.message || "Could not clock out.");
    }
    alert("Clocked Out succesfully");
    return data;
}

export async function getMenu() {
    const response = await fetch(
        `${API}/api/menu`
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Menu items.");
    }
    const transformedData = [];
    for (const key in data) {
        transformedData.push(data[key]);
    }
    return transformedData;
}

export async function getTables() {
  const response = await fetch(`${API}/api/tables`);

  const data = await response.json();
  console.log(data);
  if (!response.ok) {
    throw new Error(data.message || "Could not fetch Menu items.");
  }
  const transformedData = [];
  for (const key in data) {
    transformedData.push(data[key]);
  }
  return transformedData;
}

export async function createTab(inputData) {
    const response = await fetch(`${API}/api/tab/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not create Tab order.");
    }

    return data;
}

export async function updateOrderStatus(inputData) {
    const response = await fetch(
        `${API}/api/orders/${parseInt(
            inputData.order_id,
            10
        )}?status=${encodeURIComponent(inputData.status)}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Could not update order status.");
    }

    return data;
}

export async function getOrders() {
    const response = await fetch(`${API}/api/orders`);

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Orders.");
    }
    const transformedData = [];
    for (const key in data) {
        transformedData.push(data[key]);
    }
    return transformedData;
}
export async function getSpecificOrder(inputData) {
    const response = await fetch(
        `${API}/api/orders/${parseInt(inputData.order_id, 10)}`
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new Error(data.message || "Could not fetch Orders.");
    }
    const transformedData = [];
    for (const key in data) {
        transformedData.push(data[key]);
    }
    return transformedData;
}
export async function addItemToOrder(inputData) {
    const response = await fetch(`${API}/api/orders/${parseInt(inputData.order_id, 10)}/items`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inputData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Could not add Item to the order.");
    }

    return data;
}

export async function makeReservation(reservationData) {
    const response= await fetch(`${API}/api/reservations`,{
        method: "POST",
        headers:{
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(reservationData)
    })

    const data=await response.json();
    if(!response.ok){
        console.log("here")
        throw new Error(data.message || "Could not make a reservation.Try again.");
    }
    return data;
}

export async function getReservations() {
    const user_id=localStorage.getItem("user_id");
    console.log(user_id)
    const response= await fetch(`${API}/api/${user_id}/reservations`,{
        method: "GET",
        headers:{
            "Content-Type" : "application/json",
        },
    })

    const data=await response.json();
    if(!response.ok){
        throw new Error(data.message || "Could not make a reservation.Try again.");
    }
    return data;
}