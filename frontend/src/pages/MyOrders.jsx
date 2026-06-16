import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";

function MyOrders() {
  const { token } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      setOrders(res.data.orders);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <h3>No Orders Found</h3>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid gray",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3>Order ID</h3>
              <p>{order._id}</p>

              <h4>Status: {order.orderStatus}</h4>

              <h4>
                Final Amount: ₹
                {order.finalAmount}
              </h4>

              <h4>Products</h4>

              {order.products.map((item) => (
                <div key={item._id}>
                  <p>
                    {item.product?.title}
                  </p>

                  <p>
                    Qty: {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MyOrders;