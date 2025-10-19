import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { notifyMissingFields } from "../../pages/notification/notification";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializo directamente con función para leer localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar validez y expiración del token
    const checkToken = () => {
      if (!token) {
        logout();
        return;
      }
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // jwt exp está en segundos

        if (decodedToken.exp < currentTime) {
          notifyMissingFields(
            "Su sesión ha expirado. Por favor, inicie sesión nuevamente."
          );
          logout();
        }
      } catch (error) {
        notifyMissingFields(
          "Su sesión es inválida. Por favor, inicie sesión nuevamente."
        );
        logout();
      }
    };

    checkToken();

    // Verificación periódica cada 5 min
    const interval = setInterval(checkToken, 5 * 60 * 1000);
    setLoading(false);
    return () => clearInterval(interval);
  }, [token]);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!token,
        tokenisAdmin: user?.isAdmin || false,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
