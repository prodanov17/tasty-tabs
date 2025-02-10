CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    street VARCHAR(255),
    city VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS employees (
                                         user_id BIGSERIAL PRIMARY KEY,
                                         net_salary DECIMAL(10,2),
    gross_salary DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS customers (
                                         user_id BIGSERIAL PRIMARY KEY,
                                         FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS staff_roles (
                                           id BIGSERIAL PRIMARY KEY,
                                           name VARCHAR(255) NOT NULL
    );

CREATE TABLE IF NOT EXISTS front_staff (
                                           employee_id BIGSERIAL PRIMARY KEY,
                                           tip_percent DECIMAL(10,2),
    staff_role_id BIGINT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (staff_role_id) REFERENCES staff_roles (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS back_staff (
                                          employee_id BIGSERIAL PRIMARY KEY,
                                          staff_role_id BIGINT NOT NULL,
                                          FOREIGN KEY (employee_id) REFERENCES employees (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (staff_role_id) REFERENCES staff_roles (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS managers (
                                        employee_id BIGSERIAL PRIMARY KEY,
                                        FOREIGN KEY (employee_id) REFERENCES employees (user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS shifts (
                                      id BIGSERIAL PRIMARY KEY,
                                      date DATE NOT NULL,
                                      start_time TIME NOT NULL,
                                      end_time TIME NOT NULL,
                                      manager_id BIGINT NOT NULL,
                                      FOREIGN KEY (manager_id) REFERENCES managers (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS assignments (
                                           id BIGSERIAL PRIMARY KEY,
                                           clock_in_time TIME,
                                           clock_out_time TIME,
                                           manager_id BIGINT NOT NULL,
                                           employee_id BIGINT NOT NULL,
                                           shift_id BIGINT NOT NULL,
                                           FOREIGN KEY (manager_id) REFERENCES managers (employee_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS tables (
                                      table_number BIGSERIAL PRIMARY KEY,
                                      capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
                                            id BIGSERIAL PRIMARY KEY,
                                            customer_id BIGINT NOT NULL,
                                            creation_timestamp TIMESTAMP NOT NULL,
                                            datetime TIMESTAMP NOT NULL,
                                            number_of_people BIGINT NOT NULL,
                                            stay_length DECIMAL(10,2) NULL, --hours
    FOREIGN KEY (customer_id) REFERENCES customers (user_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS frontstaff_managed_reservations (
                                                               id BIGSERIAL PRIMARY KEY,
                                                               reservation_id BIGINT NOT NULL,
                                                               front_staff_id BIGINT NOT NULL,
                                                               table_number BIGINT NOT NULL,
                                                               FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (front_staff_id) REFERENCES front_staff (employee_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (table_number) REFERENCES tables (table_number) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS categories (
                                          id BIGSERIAL PRIMARY KEY,
                                          name VARCHAR(255) NOT NULL
    );

CREATE TABLE IF NOT EXISTS products (
                                        id BIGSERIAL PRIMARY KEY,
                                        name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id BIGINT NOT NULL,
    manage_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS inventories (
                                           product_id BIGSERIAL PRIMARY KEY,
                                           quantity INT NOT NULL,
                                           FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS orders (
                                      id BIGSERIAL PRIMARY KEY,
                                      status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS order_items (
                                           id BIGSERIAL PRIMARY KEY,
                                           order_id BIGINT NOT NULL,
                                           product_id BIGINT NOT NULL,
                                           is_processed BOOLEAN NOT NULL DEFAULT FALSE,
                                           quantity INT NOT NULL,
                                           price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS tab_orders (
                                          order_id BIGSERIAL PRIMARY KEY,
                                          front_staff_id BIGINT NOT NULL,
                                          table_number BIGINT NOT NULL,
                                          FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (table_number) REFERENCES tables (table_number) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (front_staff_id) REFERENCES front_staff (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
    );


CREATE TABLE IF NOT EXISTS online_orders (
                                             order_id BIGSERIAL PRIMARY KEY,
                                             delivery_address VARCHAR(255) NOT NULL,
    customer_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE IF NOT EXISTS payments (
                                        id BIGSERIAL PRIMARY KEY,
                                        order_id BIGINT NOT NULL,
                                        amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(32) NOT NULL,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE
    );