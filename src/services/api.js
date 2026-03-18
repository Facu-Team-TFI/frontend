import { API_BASE } from "@/lib/config";

export const getPublications = async () => {
  const res = await fetch(`${API_BASE}/publications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Error al obtener publicaciones");
  return await res.json();
};

export const getLatestPublications = async () => {
  const res = await fetch(`${API_BASE}/publications/latest`);
  if (!res.ok) throw new Error("Error al obtener las ultimas publicaciones");
  return await res.json();
};

export const getPublicationById = async (id) => {
  const res = await fetch(`${API_BASE}/publications/${id}`);
  if (!res.ok) throw new Error("Publicación no encontrada");
  return await res.json();
};

export const getSellerByPublicationId = async (id) => {
  const res = await fetch(`${API_BASE}/publications/${id}/seller`);
  if (!res.ok) throw new Error("Error al obtener el vendedor");
  return await res.json();
};

export const createPublication = async (data) => {
  const res = await fetch(`${API_BASE}/publications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear publicación");
  return await res.json();
};

export const createBuyer = async (data, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/buyers`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    // Lanza el mensaje real que devuelve el backend
    throw new Error(result.error || "Error al crear usuario");
  }

  return result;
};

export const updatePublication = async (id, data) => {
  const res = await fetch(`${API_BASE}/publications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar publicación");
  return await res.json();
};

export const deletePublication = async (id) => {
  const res = await fetch(`${API_BASE}/publications/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar publicación");
  return await res.json();
};

export const getAllNotifications = async (userId) => {
  const res = await fetch(`${API_BASE}/${userId}/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Error al obtener notificaciones");
  return await res.json();
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Error al eliminar notificaciones");
  return await res.json();
};
