// components/notifications.js

// NOTA: Esto no debería ir en pages, pues no se renderiza ni devuelve ninguna página, solo es lógica reutilizable
// para las notificaciones. Es un estandar de notificaciones, modificable desde acá para no tener que tocar cada notificación
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const defaultNotificationConfig = {
    position: 'top-right',
    autoClose: 4000,
    closeOnClick:false,
    hideProgressBar: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce
}

export const notifyMissingFields = (message, config) => {
    return toast.error(message, {
        ...defaultNotificationConfig,
        ...config
    })

};

export const notifySuccessAdd = (message, config) => {
    return toast.success(message, {
        ...defaultNotificationConfig,
        ...config
    })
};
