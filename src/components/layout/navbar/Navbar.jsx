import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import logo from "../../../assets/logo.png";
import avatarDefault from "../../../assets/avatarDefault.jpeg";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "../sideBar/SideBar";
import SellerPolicyModal from "../../../features/sellerFeatures/DataBackPage";
import { useAuth } from "../../../services/auth/AuthContext";
import { useSearch } from "../../../services/auth/SearchContext";
import { useContext } from "react";
import { NotificationsContext } from "../../../services/notifications/notifications.context";
import NotificationCard from "./NotificationCard";

export default function Navbar({ publications }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const { searchTitle, setSearchTitle } = useSearch();
  const [searchButton, setSearchButton] = useState(false);
  const { notifications, removeNotification } =
    useContext(NotificationsContext);
  const [viewNotifications, setViewNotifications] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearchChange = (e) => {
    setSearchTitle(e.target.value);
    navigate("/catalogo");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-[#40250D] px-6 py-3 flex items-center justify-between shadow">
        {/* Izquierda: menú y logo */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
            <h1 className="text-white text-xl font-semibold font-mono">
              CarpinChords
            </h1>
          </Link>

          <ul className="hidden min-[1000px]:flex gap-6 text-white font-medium text-lg font-mono">
            <li>
              <Link
                to="/home"
                className="hover:text-gray-300 transition-colors"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo"
                className="hover:text-gray-300 transition-colors"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                to="/vender"
                className="hover:text-gray-300 transition-colors"
              >
                Ventas
              </Link>
            </li>
            {user?.isAdmin && (
              <li>
                <Link
                  to="/panel-admin"
                  className="hover:text-gray-300 transition-colors"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Derecha: búsqueda, notificaciones y avatar */}
        <div className="hidden min-[650px]:flex items-center gap-5">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTitle}
              onChange={handleSearchChange}
              placeholder="Buscar..."
              className="bg-[#60250D] text-white pl-10 pr-4 py-2 rounded-md text-sm placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative text-gray-400 hover:text-white transition-colors"
            onClick={() => setViewNotifications(!viewNotifications)}
          >
            <Bell className="w-5 h-5" />

            {/* Badge */}
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-3 px-1 text-[0.625rem] font-bold text-white bg-red-600 rounded-full border border-gray-900">
                {notifications.length}
              </span>
            )}
          </button>

          <Link to="/Perfil">
            <img
              src={
                user?.avatarUrl
                  ? user.avatarUrl.startsWith("http")
                    ? user.avatarUrl
                    : `http://localhost:3000/${user.avatarUrl}`
                  : avatarDefault
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>
        </div>
        <div className="min-[650px]:hidden flex items-center gap-5">
          <button
            className="relative text-gray-400 hover:text-white transition-colors"
            onClick={() => setViewNotifications(!viewNotifications)}
          >
            <Bell className="w-5 h-5" />

            {/* Badge */}
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-3 px-1 text-[0.625rem] font-bold text-white bg-red-600 rounded-full border border-gray-900">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setSearchButton(!searchButton);
            }}
          >
            <Search className="text-gray-400 w-4 h-4" />
          </button>
        </div>
      </nav>
      {searchButton && (
        <input
          type="text"
          value={searchTitle}
          onChange={handleSearchChange}
          placeholder="Buscar..."
          className="min-[650px]:hidden fixed top-[64px] z-40 w-screen bg-[#60250D] text-white pl-10 pr-4 py-4 mt-3 text-sm placeholder-gray-400 focus:outline-none"
        />
      )}

      {/* Notificaciones */}
      <div
        className={`
      fixed top-18 right-4 
      w-80 max-h-[400px] overflow-y-auto 
      bg-gray-700 bg-opacity-75 rounded-xl shadow-lg 
      p-2 z-50 transition-all duration-300 ease-out
    ${viewNotifications ? "top-16 opacity-100 translate-y-0" : "top-12 opacity-0 -translate-y-2 pointer-events-none"}`}
      >
        <div className="p-3 overflow-y-auto max-h-[400px]">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                removeNotification={removeNotification}
                setViewNotifications={setViewNotifications}
              />
            ))
          ) : (
            <p className="text-center text-gray-50 text-sm py-4">
              No tienes notificaciones pendientes.
            </p>
          )}
        </div>
      </div>

      {/* Modal de políticas para vendedores */}
      {showPolicyModal && <SellerPolicyModal onConfirm={handleConfirmSeller} />}

      {/* Sidebar */}
      <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
