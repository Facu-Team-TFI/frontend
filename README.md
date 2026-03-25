# CarpinChords - Frontend 🎹

Interfaz de usuario para **CarpinChords**, marketplace integral de instrumentos y accesorios musicales. Este proyecto representa el **Trabajo Final Integrador (TFI)** para la Tecnicatura Universitaria en Programación de la **UTN FRRo**.

## 🚀 Despliegue y Enlaces
> **Nota de acceso:** Si encuentras una advertencia de seguridad en la raíz, puedes acceder directamente a la aplicación a través del enlace alternativo.

- **Sitio en vivo (Principal):** [https://carpinchords.pages.dev](https://carpinchords.pages.dev)
- **Acceso directo (Alternativo):** [https://carpinchords.pages.dev/home](https://carpinchords.pages.dev/home)
- **API Backend:** [https://carpinchords-backend.up.railway.app](https://carpinchords-backend.up.railway.app)
- **Repositorio Frontend:** [https://github.com/Facu-Team-TFI/frontend](https://github.com/Facu-Team-TFI/frontend)
- **Repositorio Backend:** [https://github.com/Facu-Team-TFI/backend](https://github.com/Facu-Team-TFI/backend)

## 🛠️ Tecnologías y Herramientas
- **Framework:** React.js con Vite.js.
- **Estilos:** Tailwind CSS.
- **Comunicación Real-time:** Socket.io-client (Chat y notificaciones).
- **Variables de Entorno:** Gestión de configuración mediante archivos **.env** (soporte para .env.development y .env.production).
- **Despliegue:** Cloudflare Pages.

## 👥 Roles de Usuario
CarpinChords requiere que los usuarios estén registrados para interactuar con el marketplace.
- **Compradores:** Pueden ver el catálogo completo y comprar artículos desde el registro.
- **Vendedores:** Los usuarios pueden habilitar la opción de venta aceptando las políticas ficticias del sitio para publicar sus accesorios e instrumentos.
- **Administradores:** Gestión global del sistema (acceso restringido y administrado por otros miembros del mismo rol).

## 🔧 Variables de Entorno (.env)
Se utilizan variables de entorno para definir las rutas de conexión con la API y los WebSockets según el entorno:

### Producción (`.env.production`)
- VITE_API_URL=https://carpinchords-backend.up.railway.app
- VITE_WS_URL=wss://carpinchords-backend.up.railway.app

### Desarrollo (`.env.development`)
- VITE_API_URL=http://localhost:3000
- VITE_WS_URL=ws://localhost:3000
