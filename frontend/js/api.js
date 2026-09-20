// Base del gateway: mismo host donde se abre la app, con el puerto real del gateway
// (inyectado por config.js al arrancar el contenedor, ver GATEWAY_PORT en docker-compose.yml).
// Si accedes a la app en http://192.168.1.10:3000, esto apuntará a http://192.168.1.10:8080/api automáticamente.
// Si la accedes por HTTPS (https://localhost:3443, recomendado), las llamadas
// a la API van también por HTTPS al gateway (puerto 8443), para que los
// datos viajen cifrados de punta a punta y no solo la página.
const ES_HTTPS = window.location.protocol === "https:";
const GATEWAY_PORT = ES_HTTPS
  ? (window.API_GATEWAY_HTTPS_PORT || "8443")
  : (window.API_GATEWAY_PORT || "8080");
const API_BASE = `${window.location.protocol}//${window.location.hostname}:${GATEWAY_PORT}/api`;

const Auth = {
  getToken() { return localStorage.getItem("crm_token"); },
  getUser() {
    const raw = localStorage.getItem("crm_user");
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem("crm_token", token);
    localStorage.setItem("crm_user", JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
  },
  isLoggedIn() { return !!this.getToken(); }
};

async function apiRequest(path, { method = "GET", body = null, service = "" } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${service}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) return null;
  return res.json();
}

// Subida de archivos (multipart/form-data): sin Content-Type manual, el
// navegador arma el boundary correcto solo si se lo dejamos hacer a él.
async function apiUpload(path, { service = "", formData } = {}) {
  const headers = {};
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${service}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

// Descarga con el header de autorización (un <a href> normal no puede
// llevar el token): se trae el archivo como blob y se dispara la descarga.
async function descargarConAuth(url, nombreSugerido) {
  const token = Auth.getToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("No se pudo descargar el archivo");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = nombreSugerido || "archivo";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

const API = {
  // ---- Auth / Usuarios ----
  login: (username, password) =>
    apiRequest("/login", { method: "POST", body: { username, password }, service: "/auth" }),
  register: (payload) =>
    apiRequest("/register", { method: "POST", body: payload, service: "/auth" }),
  listUsers: () => apiRequest("/users", { service: "/auth" }),
  updateUser: (id, payload) => apiRequest(`/users/${id}`, { method: "PUT", body: payload, service: "/auth" }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: "DELETE", service: "/auth" }),

  // ---- Empleados ----
  listEmpleados: () => apiRequest("/empleados/", { service: "/empleados" }),
  createEmpleado: (payload) => apiRequest("/empleados/", { method: "POST", body: payload, service: "/empleados" }),
  updateEmpleado: (id, payload) => apiRequest(`/empleados/${id}`, { method: "PUT", body: payload, service: "/empleados" }),
  deleteEmpleado: (id) => apiRequest(`/empleados/${id}`, { method: "DELETE", service: "/empleados" }),
  auditoriaEmpleado: (id) => apiRequest(`/empleados/auditoria?empleado_id=${id}`, { service: "/empleados" }),

  // ---- Calendario ----
  listEventos: () => apiRequest("/eventos/", { service: "/calendario" }),
  createEvento: (payload) => apiRequest("/eventos/", { method: "POST", body: payload, service: "/calendario" }),
  updateEvento: (id, payload) => apiRequest(`/eventos/${id}`, { method: "PUT", body: payload, service: "/calendario" }),
  deleteEvento: (id) => apiRequest(`/eventos/${id}`, { method: "DELETE", service: "/calendario" }),

  // ---- Inventario ----
  listProductos: () => apiRequest("/productos", { service: "/inventario" }),
  createProducto: (payload) => apiRequest("/productos", { method: "POST", body: payload, service: "/inventario" }),
  updateProducto: (id, payload) => apiRequest(`/productos/${id}`, { method: "PUT", body: payload, service: "/inventario" }),
  deleteProducto: (id) => apiRequest(`/productos/${id}`, { method: "DELETE", service: "/inventario" }),
  registrarMovimiento: (id, payload) => apiRequest(`/productos/${id}/movimientos`, { method: "POST", body: payload, service: "/inventario" }),
  listMovimientos: (id) => apiRequest(`/productos/${id}/movimientos`, { service: "/inventario" }),

  // ---- Reservas ----
  listHabitaciones: () => apiRequest("/habitaciones", { service: "/reservas" }),
  createHabitacion: (payload) => apiRequest("/habitaciones", { method: "POST", body: payload, service: "/reservas" }),
  updateHabitacion: (id, payload) => apiRequest(`/habitaciones/${id}`, { method: "PUT", body: payload, service: "/reservas" }),
  deleteHabitacion: (id) => apiRequest(`/habitaciones/${id}`, { method: "DELETE", service: "/reservas" }),
  habitacionesDisponibles: (checkin, checkout) =>
    apiRequest(`/habitaciones/disponibles?checkin=${checkin}&checkout=${checkout}`, { service: "/reservas" }),
  listReservas: () => apiRequest("/reservas", { service: "/reservas" }),
  createReserva: (payload) => apiRequest("/reservas", { method: "POST", body: payload, service: "/reservas" }),
  updateReserva: (id, payload) => apiRequest(`/reservas/${id}`, { method: "PUT", body: payload, service: "/reservas" }),
  cancelarReserva: (id) => apiRequest(`/reservas/${id}/cancelar`, { method: "POST", service: "/reservas" }),
  deleteReserva: (id) => apiRequest(`/reservas/${id}`, { method: "DELETE", service: "/reservas" }),

  // ---- Chat ----
  directorio: () => apiRequest("/directorio", { service: "/auth" }),
  listConversaciones: () => apiRequest("/chat/conversaciones", { service: "/chat" }),
  verConversacion: (usuario) => apiRequest(`/chat/conversaciones/${encodeURIComponent(usuario)}`, { service: "/chat" }),
  enviarMensajeChat: (destinatario, contenido) =>
    apiRequest("/chat/mensajes", { method: "POST", body: { destinatario, contenido }, service: "/chat" }),
  enviarArchivoChat: (destinatario, archivo) => {
    const fd = new FormData();
    fd.append("destinatario", destinatario);
    fd.append("archivo", archivo);
    return apiUpload("/chat/archivos", { service: "/chat", formData: fd });
  },
  auditoriaChat: (query = "") => apiRequest(`/chat/auditoria${query ? "?" + query : ""}`, { service: "/chat" }),
  urlArchivoChat: (id) => `${API_BASE}/chat/chat/archivos/${id}`,
  descargarArchivoChat: (id, nombre) => descargarConAuth(API.urlArchivoChat(id), nombre),
};
