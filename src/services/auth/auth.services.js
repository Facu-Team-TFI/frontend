import { API_BASE } from "@/lib/config";

export const loginBuyer = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Email o contraseña incorrectos");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "Error al iniciar sesión");
  }
};
