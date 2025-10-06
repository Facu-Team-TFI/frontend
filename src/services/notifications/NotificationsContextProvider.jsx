import { createContext, useState, useEffect } from "react";
import { deleteNotification, getAllNotifications } from "../api";
import { notifyMissingFields } from "../../pages/notification/notification";
import { useAuth } from "../auth/AuthContext";
import { NotificationsContext } from "./notifications.context";

export const NotificationsContextProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchNotifications = async () => {
    try {
      const data = await getAllNotifications(userId);
      const { notifications } = data;
      setNotifications(notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones desde el backend al iniciar
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    //implemetar sockets
    // interval cada 10 minutos (600000 ms)
    const intervalId = setInterval(fetchNotifications, 600000);
    // limpiar interval al desmontar o cambiar userId
    return () => clearInterval(intervalId);
  }, [userId]);

  //Eliminar una notificación por id
  const removeNotification = async (id) => {
    try {
      const data = await deleteNotification(id);
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        notifyMissingFields(data.message);
      }
    } catch (error) {
      console.error(error);
      notifyMissingFields(error);
    }
  };

  return (
    <NotificationsContext
      value={{ notifications, removeNotification, loading }}
    >
      {children}
    </NotificationsContext>
  );
};
