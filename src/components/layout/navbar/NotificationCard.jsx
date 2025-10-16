import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationCard = ({
  notification,
  removeNotification,
  setViewNotifications,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    setViewNotifications(false);

    navigate(`/Chat`); // ajustar la ruta para ir al chat específico
  };

  return (
    <div
      onClick={handleClick}
      className="
        flex items-start justify-between
        bg-gray-100 hover:bg-gray-300
        rounded-lg p-3 mb-2 
        shadow-sm transition-transform-colors duration-300 
        transform hover:cursor-pointer
      "
    >
      {/* Contenido principal */}
      <div className="flex-1">
        <p className="text-sm font-medium text-[#40250D]">
          {notification.description} {/* title en realidad */}
        </p>
        {/* <p className="text-xs text-gray-500">{notification.message}</p> */}
      </div>

      {/* Botón de eliminar */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // evita navegar al chat
          removeNotification(notification.id);
        }}
        className="
          ml-2 text-gray-400 hover:text-red-500 
          transition-colors duration-200
        "
        title="Eliminar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationCard;
