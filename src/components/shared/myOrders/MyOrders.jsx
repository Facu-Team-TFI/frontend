import { useEffect, useState } from "react";
import { useAuth } from "../../../services/auth/AuthContext";
import { motion } from "framer-motion";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`http://localhost:3000/order/buyer/${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="p-4 flex flex-col justify-center items-center text-center text-[#60250D] min-h-[700px]">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-[#40250D] p-8 rounded-xl mb-20 mt-24 text-center shadow-lg">
          <h2 className="text-4xl font-bold text-[#FDE7B9] font-poppins">
            Mis Pedidos
          </h2>
        </div>
      </motion.div>
      {orders.length === 0 ? (
        <p>No tenés pedidos aún.</p>
      ) : (
        <ul className="space-y-4 w-[90vw] md:w-[50vw] lg:w-[40vw]">
          {orders.map((order) => (
            <li
              key={order.ID_Orders}
              className="p-4 bg-[#fff] rounded-xl shadow-md hover:shadow-2xl transition-shadow"
            >
              <p>
                <strong>Estado:</strong> {order.State}
              </p>
              <p>
                <strong>Fecha:</strong> {order.DistributionDate}
              </p>

              <h3 className="font-semibold mt-2">Productos:</h3>
              <ul className="ml-4 list-disc">
                {order.OrderDetails.map((detail) => (
                  <li key={detail.ID_OrderDetails}>
                    {detail.Publication?.Title || "Producto eliminado"} - $
                    {detail.Publication?.Price}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOrders;
