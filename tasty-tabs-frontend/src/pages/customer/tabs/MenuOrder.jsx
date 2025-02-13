import { useEffect, useRef, useState } from "react";
import { getMenu, makeOnlineOrder } from "../../../dataStorage/api";
import useHttp from "../../../dataStorage/use-http";


const MenuOrder = ()=>{
    const [openMenu,setOpenMenu] = useState(false);
    const [cart,setCart]=useState([]);
    const deliveryAddress=useRef();
    const { sendRequest, status, data, error } = useHttp(getMenu, true);
    useEffect(()=>
    {
        sendRequest();
    },[sendRequest])
    const openMenuHandler= () => setOpenMenu(true);

    const closeMenuHandler = () => setOpenMenu(false);
    const orderHandler = async (event) =>{
        event.preventDefault();
        console.log("INSIDE order handler")
        const inputData=            {
            "datetime": new Date().toISOString(),
            "delivery_address": deliveryAddress.current.value,
            "customer_id" : localStorage.getItem("user_id"),
            "status" : "PENDING",
            "items" : cart
        }
        const response= await makeOnlineOrder(
            inputData
        );

        console.log(response);  

        setCart([]);
    }
    const addToCart = (id,name,price) =>{
        setCart((prevCart) => {
            // 1. Check if this item is already in the cart
            const existingItemIndex = prevCart.findIndex((item) => item.name === name);
        
            // 2. If the item already exists, increment its quantity
            if (existingItemIndex !== -1) {
              // Make a copy of the cart array
              const updatedCart = [...prevCart];
              // Make a copy of the item and increment the quantity
              const updatedItem = {
                ...updatedCart[existingItemIndex],
                quantity: updatedCart[existingItemIndex].quantity + 1,
              };
              updatedCart[existingItemIndex] = updatedItem;
              console.log(updatedCart)
              return updatedCart;
            } else {
              // 3. If the item does not exist, add it with quantity = 1
              return [...prevCart, { id,name, price, quantity: 1 }];
            }
          });
    }
    return (
        <div>
            <div>
                {!openMenu && <button onClick={openMenuHandler} className="mx-4 px-2 my-2 py-1 bg-indigo-500 text-white rounded hover:bg-neutral-600 transition-colors">Open Menu</button>}
                {openMenu && <button onClick={closeMenuHandler} className="mx-4 px-2 my-2 py-1 bg-indigo-500 text-white rounded hover:bg-neutral-600 transition-colors">Close</button>}

            </div>
            {openMenu && data.map(element => (
            <div className=" mx-4 my-2">
                <div className="flex justify-between rounded-md border border-black border-solid my-2">
                    <div className="">
                        <p className="px-3 font-extrabold text-lg">
                            {element.name}
                        </p>
                        <p className="p-3">
                        {element.price}
                        </p>
                    </div>
                    <button className="mx-4 px-2 my-2 py-1 bg-indigo-500 text-white rounded hover:bg-neutral-600 transition-colors" onClick={()=> addToCart(element.id,element.name,element.price)}>Add to Cart</button>
                </div>
            <div>
                <h6>Your cart</h6>
                {
                    cart.length>0 && cart.map(el =>(
                        <div>
                            <p className="px-3 font-extrabold text-lg">
                                {el.name} 
                            </p>
                            <p className="p-3">
                                Quantity: {el.quantity}
                            </p>
                            <p className="p-3">
                                Price: {el.price}
                            </p>
                        </div>
                    ))
                }
                </div>
            <form onSubmit={orderHandler}>
                <label htmlFor="deliveryAddress"className="block" >Delivery Address</label>
                <input type="text" className="bg-gray-500 text-white rounded-md p-1" ref={deliveryAddress}/>
                <button type="submit"  className=" p-6 my-2 py-1 bg-indigo-500 text-white rounded hover:bg-neutral-600 transition-colors">Order</button>
            </form> 
            </div>
            ))}
        </div>
    )
}


export default MenuOrder;