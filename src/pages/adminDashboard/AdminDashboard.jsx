import { useEffect, useState } from "react";
import { useAuth } from "../../services/auth/AuthContext";
import Register from "../../features/auth/register";
import { motion } from "framer-motion";
import {
  notifyMissingFields,
  notifySuccessAdd,
} from "../notification/notification";

async function updatePublication(id, data) {
  const res = await fetch(`http://localhost:3000/publications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando publicación");
  return await res.json();
}

const AdminDashboard = ({ onRefresh }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({});

  const [confirmData, setConfirmData] = useState({
    show: false,
    type: null,
    id: null,
    message: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchPublications();
    fetchSellers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    }
  };

  /*const fetchPublications = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/publicaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setPublications(data);
    } catch (error) {
      console.error("Error al obtener publicaciones", error);
    }
  };*/
  const fetchPublications = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/admin/publicaciones?page=${currentPage}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      setPublications(data.rows || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error al obtener publicaciones", error);
      setPublications([]);
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/sellers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setSellers(data);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`http://localhost:3000/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      closeConfirm();

      if (onRefresh) {
        onRefresh();
      } else {
        setUsers(users.filter((u) => u.ID_Buyers !== id));
      }
      fetchUsers();
      notifySuccessAdd("!Se elimino el usuario con exito!");
    } catch (error) {
      console.error("Error al eliminar usuario", error);
      notifyMissingFields(`¡Hubo un error al eliminar el usuario!`);
      closeConfirm();
    }
  };

  const deletePublication = async (id) => {
    try {
      await fetch(`http://localhost:3000/admin/publicaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      closeConfirm();

      if (onRefresh) {
        onRefresh();
      } else {
        setPublications(publications.filter((p) => p.ID_Publication !== id));
      }
      fetchPublications();
      notifySuccessAdd(`¡Eliminacion de publicacion con exito!`);
    } catch (error) {
      console.error("Error al eliminar publicación", error);
      notifyMissingFields(`!Error al eliminar publicacion`);
      closeConfirm();
    }
  };

  const deleteSellers = async (id) => {
    try {
      await fetch(`http://localhost:3000/admin/seller/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      closeConfirm();

      if (onRefresh) {
        onRefresh();
      } else {
        setSellers(sellers.filter((s) => s.ID_Buyers !== id));
      }
      fetchSellers();
      notifySuccessAdd(`¡Se elimino un usuario!`);
    } catch (error) {
      console.error("Error al eliminar usuario", error);
      notifyMissingFields(`¡Error al eliminar el usuario!`);
      closeConfirm();
    }
  };

  const openConfirm = (type, id) => {
    setConfirmData({
      show: true,
      type,
      id,
      message:
        type === "user"
          ? "¿Eliminar este usuario?, se eliminaran sus publicaciones."
          : type === "publication"
            ? "¿Eliminar esta publicación?"
            : "¿Eliminar este vendedor?, se eliminaran sus publicaciones (no elimina su usuario).",
    });
  };

  const closeConfirm = () => {
    setConfirmData({
      show: false,
      type: null,
      id: null,
      message: "",
    });
  };

  const confirmAction = () => {
    if (confirmData.type === "user") {
      deleteUser(confirmData.id);
    } else if (confirmData.type === "publication") {
      deletePublication(confirmData.id);
    } else if (confirmData.type === "seller") {
      deleteSellers(confirmData.id);
    }
  };

  const openEditor = (post) => {
    setEditingPost(post);
    setFormData(post); // Carga datos del post a formData para editar
  };

  const closeEditor = () => {
    setEditingPost(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updatePublication(editingPost.ID_Publication, formData);
      setPublications((prev) =>
        prev.map((pub) =>
          pub.ID_Publication === editingPost.ID_Publication
            ? { ...pub, ...formData }
            : pub,
        ),
      );
      onRefresh();
      closeEditor();
      notifySuccessAdd(`¡Cambios Guardados!`);
    } catch (error) {
      console.error("Error guardando publicación:", error);
      notifyMissingFields(`¡Error al guardar cambios!`);
    }
  };

  return (
  <>
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
      
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center lg:text-left">
        Panel de Administración
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDE */}
        <div className="flex-1 space-y-10">

          {/* USERS */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">Usuarios</h3>

            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.ID_Buyers}
                  className="bg-[#C5CEBB] shadow-md p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <p className="text-sm sm:text-base">
                    {user.BuyersName} {user.BuyersLastName} - {user.Email}
                  </p>

                  <button
                    onClick={() => openConfirm("user", user.ID_Buyers)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* PUBLICATIONS */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">Publicaciones</h3>

            <ul className="space-y-3">
              {publications.map((pub) => (
                <li
                  key={pub.ID_Publication}
                  className="bg-[#C5CEBB] shadow-md p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <p className="text-sm sm:text-base">
                    {pub.Title} - ${pub.Price}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => openEditor(pub)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        openConfirm("publication", pub.ID_Publication)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* PAGINATION */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm sm:text-base">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400"
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400"
              >
                Siguiente
              </button>
            </div>
          </section>

          {/* SELLERS */}
          <section>
            <h3 className="text-2xl font-semibold mb-4">Vendedores</h3>

            <ul className="space-y-3">
              {sellers.map((seller) => (
                <li
                  key={seller.ID_Buyers}
                  className="bg-[#C5CEBB] shadow-md p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                >
                  <p className="text-sm sm:text-base">
                    {seller.BuyersName} {seller.BuyersLastName} - {seller.Email}
                  </p>

                  <button
                    onClick={() => openConfirm("seller", seller.ID_Buyers)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* RIGHT SIDE - REGISTER */}
        <div className="w-full lg:w-2/4">
          <div className="bg-[#F5F5F5] shadow-xl rounded-2xl p-8 w-full min-w-[320px]">
            <Register onRegisterSuccess={fetchUsers} />
          </div>
        </div>

      </div>
    </div>
  </>
);

};

export default AdminDashboard;
