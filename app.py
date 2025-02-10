from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
from flask_cors import CORS
app = Flask(__name__)
CORS(app, supports_credentials=True)

# --- Database Connection Settings ---
DB_HOST = "db"
DB_NAME = "tasty-tabs"
DB_USER = "root"
DB_PASS = "root"
DB_PORT = "5432"  # adjust if necessary

def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )

# ============================
# Authentication Endpoint
# ============================
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Get the user record from the users table.
    query = "SELECT id, email, password FROM users WHERE email = %s;"
    cursor.execute(query, (email,))
    user_record = cursor.fetchone()

    if not user_record:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Minimal (plaintext) password check.
    if password != user_record['password']:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid credentials"}), 401

    user_id = user_record['id']
    user_type = None
    role = None

    # First, check if the user is a customer.
    cursor.execute("SELECT user_id FROM customers WHERE user_id = %s;", (user_id,))
    customer_record = cursor.fetchone()
    if customer_record:
        user_type = "customer"
    else:
        # If not a customer, check if the user is an employee.
        cursor.execute("SELECT user_id FROM employees WHERE user_id = %s;", (user_id,))
        employee_record = cursor.fetchone()
        if not employee_record:
            # Shouldn't happen if your data integrity is correct.
            cursor.close()
            conn.close()
            return jsonify({"error": "User type could not be determined"}), 500

        user_type = "employee"
        # Now check the employee's role.
        cursor.execute("SELECT employee_id, tip_percent, staff_role_id FROM front_staff WHERE employee_id = %s;", (user_id,))
        front_staff_record = cursor.fetchone()
        if front_staff_record:
            role = "front_staff"
        else:
            cursor.execute("SELECT employee_id, staff_role_id FROM back_staff WHERE employee_id = %s;", (user_id,))
            back_staff_record = cursor.fetchone()
            if back_staff_record:
                role = "back_staff"
            else:
                cursor.execute("SELECT employee_id FROM managers WHERE employee_id = %s;", (user_id,))
                manager_record = cursor.fetchone()
                if manager_record:
                    role = "manager"
                else:
                    role = "unknown"

    cursor.close()
    conn.close()

    response = {
        "message": "Login successful",
        "user": {
            "id": user_record["id"],
            "email": user_record["email"],
            "user_type": user_type
        }
    }
    if role:
        response["user"]["role"] = role

    return jsonify(response)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Retrieve the user record
    query = "SELECT id, email FROM users WHERE id = %s;"
    cursor.execute(query, (user_id,))
    user_record = cursor.fetchone()

    if not user_record:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Determine the user type and role
    user_type = None
    role = None

    # Check if the user is a customer
    cursor.execute("SELECT user_id FROM customers WHERE user_id = %s;", (user_id,))
    customer_record = cursor.fetchone()
    if customer_record:
        user_type = "customer"
    else:
        # Otherwise, check if the user is an employee
        cursor.execute("SELECT user_id FROM employees WHERE user_id = %s;", (user_id,))
        employee_record = cursor.fetchone()
        if not employee_record:
            cursor.close()
            conn.close()
            return jsonify({"error": "User type could not be determined"}), 500

        user_type = "employee"
        # Determine the specific role
        cursor.execute("SELECT employee_id, tip_percent, staff_role_id FROM front_staff WHERE employee_id = %s;", (user_id,))
        front_staff_record = cursor.fetchone()
        if front_staff_record:
            role = "front_staff"
        else:
            cursor.execute("SELECT employee_id, staff_role_id FROM back_staff WHERE employee_id = %s;", (user_id,))
            back_staff_record = cursor.fetchone()
            if back_staff_record:
                role = "back_staff"
            else:
                cursor.execute("SELECT employee_id FROM managers WHERE employee_id = %s;", (user_id,))
                manager_record = cursor.fetchone()
                if manager_record:
                    role = "manager"
                else:
                    role = "unknown"

    cursor.close()
    conn.close()

    response = {
        "user": {
            "id": user_record["id"],
            "email": user_record["email"],
            "user_type": user_type
        }
    }
    if role:
        response["user"]["role"] = role

    return jsonify(response), 200

# ============================
# Employee Endpoints
# ============================

# Employee Views His Shift
@app.route('/api/employees/<int:employee_id>/shift', methods=['GET'])
def get_shift(employee_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        query = """
            SELECT a.id, a.shift_id, a.manager_id, s.start_time, s.end_time, a.clock_in_time, a.clock_out_time 
            FROM assignments a
            LEFT JOIN shifts s ON s.id = a.shift_id
            LEFT JOIN managers m ON a.manager_id = m.employee_id
            WHERE s.date = current_date AND a.employee_id = %s;
        """
        cursor.execute(query, (employee_id,))
        shifts = cursor.fetchall()
        # Convert time objects to strings
        for shift in shifts:
            shift['start_time'] = str(shift['start_time'])
            shift['end_time'] = str(shift['end_time'])
            shift['clock_in_time'] = str(shift['clock_in_time']) if shift['clock_in_time'] else None
            shift['clock_out_time'] = str(shift['clock_out_time']) if shift['clock_out_time'] else None
        cursor.close()
        conn.close()
        return jsonify(shifts)
    except Exception as e:
        app.logger.error(f"Error fetching shift for employee {employee_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Employee Clocks In Work
@app.route('/api/employees/<int:employee_id>/shift/<int:shift_id>/clock-in', methods=['PATCH'])
def clock_in(employee_id, shift_id):
    conn = get_connection()
    cursor = conn.cursor()
    query = "UPDATE assignments SET clock_in_time = current_time WHERE employee_id = %s AND shift_id = %s;"
    cursor.execute(query, (employee_id, shift_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Employee {employee_id} clocked in for shift {shift_id}"}), 200

# Employee Clocks Out Work
@app.route('/api/employees/<int:employee_id>/shift/<int:shift_id>/clock-out', methods=['PATCH'])
def clock_out(employee_id, shift_id):
    conn = get_connection()
    cursor = conn.cursor()
    query = "UPDATE assignments SET clock_out_time = current_time WHERE employee_id = %s AND shift_id = %s;"
    cursor.execute(query, (employee_id, shift_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Employee {employee_id} clocked out for shift {shift_id}"}), 200

# Employee Views Menu
@app.route('/api/menu', methods=['GET'])
def view_menu():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = "SELECT p.id, p.name FROM products p;"
    cursor.execute(query)
    menu_items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(menu_items)

# Employee Creates a Taborder
@app.route('/api/tab/orders', methods=['POST'])
def create_tab_order():
    data = request.get_json()
    product_id = data.get('product_id')
    table_number=data.get('table_number')
    front_staff_id = data.get('front_staff_id')
    if not product_id or not front_staff_id:
        return jsonify({"error": "product_id and front_staff_id are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Create a new order with default values and get its id.
    cursor.execute("INSERT INTO orders DEFAULT VALUES RETURNING id;")
    order = cursor.fetchone()
    order_id = order['id']

    # Link the order to the front staff in tab_orders.
    cursor.execute("INSERT INTO tab_orders (order_id, front_staff_id,table_number) VALUES (%s, %s,%s);", (order_id, front_staff_id,table_number))

    # Create an initial order item pulling price from products.
    cursor.execute("""
        INSERT INTO order_items (order_id, product_id, price, quantity)
        SELECT %s, %s, p.price, 1 FROM products p WHERE p.id = %s;
    """, (order_id, product_id, product_id))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Tab order created", "order_id": order_id}), 201

# Update Order Status (used when a customer submits order or an employee confirms it)
@app.route('/api/orders/<int:order_id>', methods=['PATCH'])
def update_order_status(order_id):
    status = request.args.get('status')
    if not status:
        return jsonify({"error": "status parameter is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    query = "UPDATE orders SET status = %s WHERE id = %s;"
    cursor.execute(query, (status.upper(), order_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"Order {order_id} updated to status {status.upper()}"}), 200

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = """
        SELECT 
            o.id AS order_id, 
            o.status,
            json_agg(
                json_build_object(
                    'product_name', p.name, 
                    'product_price', p.price, 
                    'quantity', oi.quantity
                )
            ) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        GROUP BY o.id, o.status
        ORDER BY o.id;
    """

    cursor.execute(query)
    orders = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(orders), 200

# Get Order Details (for employee order management)
@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order_details(order_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = """
        SELECT p.name, p.price, oi.quantity
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = %s;
    """
    cursor.execute(query, (order_id,))
    order_details = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(order_details), 200

# Add Order Item (for both customer and employee)
@app.route('/api/orders/<int:order_id>/items', methods=['POST'])
def add_order_item(order_id):
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    if not product_id or not quantity:
        return jsonify({"error": "product_id and quantity are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        query = """
            INSERT INTO order_items (order_id, product_id, is_processed, quantity, price)
            SELECT %s, %s, false, %s, price FROM products WHERE id = %s
            RETURNING id;
        """
        cursor.execute(query, (order_id, product_id, quantity, product_id))
        order_item = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Order item added", "order_item_id": order_item["id"]}), 201

# Process Order Items (mark as processed)
@app.route('/api/orders/<int:order_id>/items/process', methods=['PATCH'])
def process_order_items(order_id):
    data = request.get_json()
    order_item_ids = data.get("order_item_ids")
    if not order_item_ids or not isinstance(order_item_ids, list):
        return jsonify({"error": "order_item_ids must be provided as a list"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = "UPDATE order_items SET is_processed = true WHERE id = %s AND order_id = %s;"
        for item_id in order_item_ids:
            cursor.execute(query, (item_id, order_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Order items processed"}), 200

# Process Payment for an Order (computes total from order_items)
@app.route('/api/orders/<int:order_id>/pay', methods=['POST'])
def pay_order(order_id):
    data = request.get_json()
    payment_type = data.get("payment_type")
    tip_amount = data.get("tip_amount", 0)
    if not payment_type:
        return jsonify({"error": "payment_type is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Compute the total amount (note: you might want to factor quantity in a real app)
        cursor.execute("SELECT COALESCE(SUM(price), 0) as total FROM order_items WHERE order_id = %s;", (order_id,))
        result = cursor.fetchone()
        total_amount = result["total"]

        query = """
            INSERT INTO payments (order_id, amount, payment_type, tip_amount)
            VALUES (%s, %s, %s, %s)
            RETURNING id;
        """
        cursor.execute(query, (order_id, total_amount, payment_type, tip_amount))
        payment = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Payment recorded", "payment_id": payment["id"], "amount": total_amount}), 201
# ============================
# Manager Endpoints
# ============================

# GET shifts for a specific manager (using the manager_id path variable)
@app.route('/api/managers/<int:manager_id>/shifts', methods=['GET'])
def get_shifts(manager_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Filter shifts for the given manager_id
    query = "SELECT date, start_time, end_time, manager_id, id FROM shifts WHERE manager_id = %s AND date >= current_date;"
    cursor.execute(query, (manager_id,))
    shifts = cursor.fetchall()
    for shift in shifts:
        shift['start_time'] = str(shift['start_time'])
        shift['end_time'] = str(shift['end_time'])
    cursor.close()
    conn.close()
    return jsonify(shifts), 200

# POST creates a new shift for a manager using path variables:
# URL pattern: /api/managers/<manager_id>/shifts/<date>/<start_time>/<end_time>
@app.route('/api/managers/<int:manager_id>/shifts', methods=['POST'])
def create_shift(manager_id):
    # Optionally, you can validate that the date, start_time, and end_time strings match your expected format.
    data = request.get_json()

    date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = """
        INSERT INTO shifts (date, start_time, end_time, manager_id)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """
    cursor.execute(query, (date, start_time, end_time, manager_id))
    shift = cursor.fetchone()

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Shift created", "shift_id": shift["id"]}), 201

# Manager Assigns Shifts to Employees
@app.route('/api/shift/<int:shift_id>/assignment', methods=['POST'])
def assign_shift(shift_id):
    data = request.get_json()
    manager_id = data.get('manager_id')
    employee_id = data.get('employee_id')
    if not manager_id or not employee_id:
        return jsonify({"error": "manager_id and employee_id are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = """
        INSERT INTO assignments (manager_id, employee_id, shift_id)
        VALUES (%s, %s, %s)
        RETURNING id;
    """
    cursor.execute(query, (manager_id, employee_id, shift_id))
    assignment = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Shift assigned", "assignment_id": assignment["id"]}), 201

# ============================
# Customer Endpoints
# ============================

# Customer Creates an Online Order (includes initial order item)
@app.route('/api/online/orders', methods=['POST'])
def create_online_order():
    data = request.get_json()
    status = data.get("status", "PENDING")
    datetime_str = data.get("datetime")
    delivery_address = data.get("delivery_address")
    customer_id = data.get("customer_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    if not (datetime_str and delivery_address and customer_id and product_id and quantity):
        return jsonify({"error": "datetime, delivery_address, customer_id, product_id, and quantity are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cursor.execute(
            "INSERT INTO orders (status, datetime) VALUES (%s, %s) RETURNING id;",
            (status, datetime_str)
        )
        order = cursor.fetchone()
        order_id = order["id"]

        cursor.execute(
            "INSERT INTO online_orders (order_id, delivery_address, customer_id) VALUES (%s, %s, %s);",
            (order_id, delivery_address, customer_id)
        )

        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, is_processed, price, quantity) "
            "SELECT %s, %s, true, price, %s FROM products WHERE id = %s;",
            (order_id, product_id, quantity, product_id)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Order created", "order_id": order_id}), 201

# ============================
# Reservation Endpoints
# ============================

# Customer Makes a Reservation
@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    reservation_datetime = data.get("datetime")
    stay_length = data.get("stay_length")  # in hours
    number_of_people = data.get("number_of_people")
    user_id = data.get("user_id")
    if not reservation_datetime or not stay_length or not number_of_people or not user_id:
        return jsonify({"error": "datetime, stay_length, number_of_people, and user_id are required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # 1. Find an available table.
        available_table_query = """
            SELECT table_number
            FROM tables
            WHERE seat_capacity >= %s
              AND table_number NOT IN (
                SELECT table_number
                FROM frontstaff_managed_reservations rmf
                JOIN reservations r ON rmf.reservation_id = r.id
                WHERE r.datetime BETWEEN %s AND (%s::timestamp + interval '1 hour' * %s)
              )
            LIMIT 1;
        """
        cursor.execute(available_table_query, (number_of_people, reservation_datetime, reservation_datetime, stay_length))
        table_result = cursor.fetchone()
        if not table_result:
            conn.rollback()
            return jsonify({"error": "No available table found for the given time and party size"}), 404
        available_table_number = table_result["table_number"]

        # 2. Create the reservation.
        insert_reservation_query = """
            INSERT INTO reservations (stay_length, datetime, creation_timestamp, number_of_people, user_id)
            VALUES (%s, %s, NOW(), %s, %s)
            RETURNING id;
        """
        cursor.execute(insert_reservation_query, (stay_length, reservation_datetime, number_of_people, user_id))
        reservation = cursor.fetchone()
        reservation_id = reservation["id"]

        # 3. Assign a front-staff member and table.
        insert_frontstaff_query = """
            INSERT INTO frontstaff_managed_reservations (reservation_id, employee_id, table_number)
            VALUES (
                %s,
                (
                    SELECT fs.employee_id
                    FROM front_staff fs
                    JOIN assignments a ON fs.employee_id = a.employee_id
                    JOIN shifts s ON a.shift_id = s.id
                    WHERE %s::timestamp BETWEEN s.start_time AND s.end_time
                    LIMIT 1
                ),
                %s
            );
        """
        cursor.execute(insert_frontstaff_query, (reservation_id, reservation_datetime, available_table_number))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({
        "message": "Reservation created",
        "reservation_id": reservation_id,
        "table_number": available_table_number
    }), 201

@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation_details(reservation_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        query = """
            SELECT r.id, r.datetime, r.number_of_people, t.table_number, u.email
            FROM reservations r
            JOIN frontstaff_managed_reservations rmf ON r.id = rmf.reservation_id
            JOIN tables t ON rmf.table_number = t.table_number
            JOIN users u ON r.user_id = u.id
            WHERE r.id = %s;
        """
        cursor.execute(query, (reservation_id,))
        reservation_details = cursor.fetchone()
        if not reservation_details:
            return jsonify({"error": "Reservation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify(reservation_details), 200

@app.route('/api/reservations/<int:reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        delete_frontstaff_query = "DELETE FROM frontstaff_managed_reservations WHERE reservation_id = %s;"
        cursor.execute(delete_frontstaff_query, (reservation_id,))
        delete_reservation_query = "DELETE FROM reservations WHERE id = %s;"
        cursor.execute(delete_reservation_query, (reservation_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Reservation canceled"}), 200

# ============================
# Tab Transfer Endpoints
# ============================

# Get All Tabs Assigned to a Front Staff Member
@app.route('/api/tabs', methods=['GET'])
def get_tabs_for_transfer():
    frontstaff_id = request.args.get('frontstaff_id', type=int)
    if not frontstaff_id:
        return jsonify({"error": "frontstaff_id parameter is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        query = """
            SELECT o.id AS order_id, t.table_number 
            FROM tab_orders t
            JOIN orders o ON t.order_id = o.id
            WHERE t.front_staff_id = %s;
        """
        cursor.execute(query, (frontstaff_id,))
        tabs = cursor.fetchall()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify(tabs), 200

# Get an Available Front Staff Member (excluding the current one)
@app.route('/api/frontstaff/available', methods=['GET'])
def get_available_frontstaff():
    current_employee_id = request.args.get('current_employee_id', type=int)
    if not current_employee_id:
        return jsonify({"error": "current_employee_id parameter is required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        query = """
            SELECT fs.employee_id 
            FROM front_staff fs
            JOIN assignments a ON fs.employee_id = a.employee_id
            JOIN shifts s ON a.shift_id = s.id
            WHERE a.clock_in_time IS NOT NULL  
              AND a.clock_out_time IS NULL       
              AND s.date = CURRENT_DATE       
              AND fs.employee_id != %s          
            LIMIT 1;
        """
        cursor.execute(query, (current_employee_id,))
        available = cursor.fetchone()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    if not available:
        return jsonify({"error": "No available front staff found"}), 404
    return jsonify(available), 200

# Transfer a Tab from One Front Staff to Another
@app.route('/api/tabs/transfer', methods=['POST'])
def transfer_tab():
    data = request.get_json()
    order_id = data.get('order_id')
    current_frontstaff_id = data.get('current_frontstaff_id')
    new_frontstaff_id = data.get('new_frontstaff_id')
    if not order_id or not current_frontstaff_id or not new_frontstaff_id:
        return jsonify({
            "error": "order_id, current_frontstaff_id, and new_frontstaff_id are required"
        }), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
            UPDATE tab_orders
            SET front_staff_id = %s
            WHERE order_id = %s
              AND front_staff_id = %s;
        """
        cursor.execute(query, (new_frontstaff_id, order_id, current_frontstaff_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({
                "error": "No tab was updated. Check order_id and current frontstaff assignment."
            }), 404
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
    return jsonify({
        "message": f"Tab for order {order_id} successfully transferred from employee {current_frontstaff_id} to employee {new_frontstaff_id}."
    }), 200

# ============================
# Run the App
# ============================
if __name__ == '__main__':
    app.run(debug=True, port=5002, host="0.0.0.0")
