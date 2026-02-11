import { useEffect, useState } from "react";
import { useAuth } from "../../services/auth/AuthContext";
import { motion } from "framer-motion";

const Sails = () => {
  const [sails, setSails] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSails = async () => {
      if (!user?.seller?.id) return;

      try {
        const res = await fetch(
          `http://localhost:3000/sellers/${user.seller.id}/sails`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Error desconocido al obtener ventas",
          );
        }
        const data = await res.json();
        setSails(data.sails);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchSails();
  }, [user]);

  return (
    <div
      id="sails"
      className="p-4 flex flex-col justify-center items-center text-center text-[#60250D] min-h-[700px]"
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-[#40250D] p-8 rounded-xl mb-20 mt-24 text-center shadow-lg">
          <h2 className="text-4xl font-bold text-[#FDE7B9] font-poppins">
            Mis Ventas
          </h2>
        </div>
      </motion.div>
      {sails.length === 0 ? (
        <p className="text-[#401809] font-poppins text-xl">
          No tenés ventas aún.
        </p>
      ) : (
        <ul className="space-y-4 w-[90vw] md:w-[50vw] lg:w-[40vw]">
          {sails.map((sail) => {
            const detail = sail.OrderDetails[0];
            return (
              <li
                key={sail.ID_Orders}
                className="p-4 bg-[#fff] rounded-xl shadow-md hover:shadow-2xl transition-shadow"
              >
                <p>
                  <strong>Estado:</strong> {sail.State}
                </p>
                <p>
                  <strong>Fecha:</strong> {sail.DistributionDate}
                </p>

                <p>
                  <strong>Comprador:</strong> {detail.nombre}
                </p>
                <p>
                  <strong>Código postal:</strong> {detail.cp}
                </p>
                <p>
                  <strong>Calle:</strong> {detail.calle}
                </p>
                <p>
                  <strong>Dpto:</strong> {detail.dpto || "—"}
                </p>

                <h3 className="font-semibold mt-2">Productos:</h3>
                <ul className="ml-4 list-disc">
                  {sail.OrderDetails.map((detail) => (
                    <li key={detail.ID_OrderDetails}>
                      {detail.Publication?.Title || "Producto eliminado"} - $
                      {detail.Publication?.Price}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Sails;
