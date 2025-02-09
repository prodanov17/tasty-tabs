from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras

app = Flask(__name__)

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

# --- Endpoints ---

# Employee Login
# (POST /api/auth/login)
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    # Retrieve the email and password from the database
    query = "SELECT email, password FROM users WHERE email = %s;"
    cursor.execute(query, (email,))
    user_record = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user_record:
        return jsonify({"error": "User not found"}), 404

    # Minimal application-level password check (in a real system, never store or compare plaintext passwords)
    if password != user_record['password']:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "user": user_record})


# Employee Views His Shift
# (GET /api/employees/<employee_id>/shift)
@app.route('/api/employees/<int:employee_id>/shift', methods=['GET'])
def get_shift(employee_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = """
        SELECT a.id, a.shift_id, a.manager_id, s.start_time, s.end_time 
        FROM assignments a
        LEFT JOIN public.shifts s ON s.id = a.shift_id
        LEFT JOIN public.managers m ON a.manager_id = m.employee_id
        WHERE s.date = current_date AND a.employee_id = %s;
    """
    cursor.execute(query, (employee_id,))
    shifts = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(shifts)


# Employee Clocks In Work
# (PATCH /api/employees/<employee_id>/shift/<shift_id>/clock-in)
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


# Employee Clocks Out
# (PATCH /api/employees/<employee_id>/shift/<shift_id>/clock-out)
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
# (GET /api/menu)
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
# (POST /api/orders)
@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    product_id = data.get('product_id')
    front_staff_id = data.get('front_staff_id')
    if not product_id or not front_staff_id:
        return jsonify({"error": "product_id and front_staff_id are required"}), 400

    conn = get_connection()
    # Use a RealDictCursor to grab the generated order id
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Insert a new order (assuming the orders table has a serial primary key and default values)
    cursor.execute("INSERT INTO orders DEFAULT VALUES RETURNING id;")
    order = cursor.fetchone()
    order_id = order['id']

    # Link the order to the front staff in tab_orders
    cursor.execute("INSERT INTO tab_orders (order_id, front_staff_id) VALUES (%s, %s);", (order_id, front_staff_id))

    # Create an order item, pulling the price from the products table.
    cursor.execute("""
        INSERT INTO order_items (order_id, product_id, price, quantity)
        SELECT %s, %s, p.price, 1 FROM products p WHERE p.id = %s;
    """, (order_id, product_id, product_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Order created", "order_id": order_id}), 201


# Update Order Status to Completed
# (PATCH /api/orders/<order_id>?status=completed)
@app.route('/api/orders/<int:order_id>', methods=['PATCH'])
def update_order_status(order_id):
    # Get the status from the query parameter
    status = request.args.get('status')
    if not status:
        return jsonify({"error": "status parameter is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    query = "UPDATE orders SET status = %s WHERE id = %s;"
    # In the provided query, status is set to 'COMPLETED'
    cursor.execute(query, (status.upper(), order_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"Order {order_id} updated to status {status.upper()}"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5002, host="0.0.0.0")
