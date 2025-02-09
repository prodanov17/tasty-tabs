INSERT INTO users(id,email,password,phone_number,street,city)
VALUES
    (1,'test@hotmail.com','password1','070003005','Mladinska 3','Strumica'),
    (2, 'test2@hotmail.com','password2','070001002','Marsal Tito 10','Strumica'),
    (3,'test3@hotmail.com','password1','070003003','Mladinska 5','Strumica'),
    (4, 'test4@hotmail.com','password2','070004004','Marsal Tito 11','Strumica'),
    (5,'test5@hotmail.com','password1','070005005','Mladinska 12','Strumica');

INSERT INTO employees(user_id,net_salary,gross_salary)
VALUES
    (1,30000,40000),
    (3,50000,62000),
    (4,35000,46000),
    (5,28000,37000);

INSERT INTO managers(employee_id)
VALUES
    (3);

INSERT INTO staff_roles(id,name)
VALUES
    (1,'Server'),
    (2,'Chef'),
    (3,'Bartender'),
    (4,'Hostess');

INSERT INTO front_staff(employee_id,tip_percent,staff_role_id)
VALUES
    (1,.4,1),
    (5,0.1,4);

INSERT INTO back_staff(employee_id,staff_role_id)
VALUES
    (4,2);

INSERT INTO customers(user_id)
VALUES
    (2);

INSERT INTO shifts (id, date, start_time, end_time, manager_id)
VALUES
    (1, '2025-01-05', '09:00:00', '17:00:00', 3);

INSERT INTO assignments(id,clock_in_time,clock_out_time,manager_id,employee_id,shift_id)
VALUES
    (1,NULL,NULL,3,1,1);

INSERT INTO tables(table_number,capacity)
VALUES
    (1,4),
    (2,8);

INSERT INTO  reservations(id,customer_id,datetime,stay_length)
VALUES
    (1,2,now(),NULL);

INSERT INTO frontstaff_managed_reservations(id,reservation_id,front_staff_id,table_number)
VALUES
    (1,1,5,1);

INSERT INTO categories(id,name)
VALUES
    (1,'Drinks'),
    (2,'Appetizers'),
    (3,'Entrees');

INSERT INTO products(id,name,price,category_id,manage_inventory)
VALUES
    (1,'Coca Cola',100,1,TRUE),
    (2,'Pomfrit so sirenje',250,2,FALSE);

INSERT INTO inventories(product_id,quantity)
VALUES
    (1,100);


INSERT INTO orders(id,status,datetime)
VALUES
    (1,'PENDING','2025-01-05 10:00:00'),
    (2,'ACCEPTED','2025-01-05 10:00:00'),
    (3,'CONFIRMED','2025-01-05 11:00:00');

INSERT INTO order_items (id, order_id, product_id, is_processed, quantity, price)
SELECT 1, 1, 1, TRUE, 3, price FROM products WHERE id = 1
UNION ALL
SELECT 2, 1, 2, FALSE, 1, price FROM products WHERE id = 2
UNION ALL
SELECT 3, 3, 2, FALSE, 2, price FROM products WHERE id = 2
UNION ALL
SELECT 4, 3, 1, FALSE, 2, price FROM products WHERE id = 1;




INSERT INTO tab_orders(order_id,front_staff_id,table_number)
VALUES
    (1,1,1);

INSERT INTO online_orders(order_id,delivery_address,customer_id)
VALUES
    (3,'Leninova 5',2);

INSERT INTO payments(id,order_id,amount, payment_type, tip_amount)
VALUES
    (1,3,700, 'cash', 10)