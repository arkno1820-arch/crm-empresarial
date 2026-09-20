// ---------- TOASTS ----------
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// ---------- MODAL ----------
const Modal = {
  open(title, bodyHtml) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = bodyHtml;
    document.getElementById("modal-overlay").hidden = false;
  },
  close() {
    document.getElementById("modal-overlay").hidden = true;
    document.getElementById("modal-body").innerHTML = "";
  }
};

document.getElementById("modal-close").addEventListener("click", () => Modal.close());
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") Modal.close();
});

// ---------- CONFIRM ----------
function confirmAction(message) {
  return window.confirm(message);
}

// ---------- HELPERS ----------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  // dateStr es una fecha pura "YYYY-MM-DD" (sin hora). new Date("YYYY-MM-DD")
  // la interpreta como medianoche UTC, y al mostrarla en una zona horaria
  // detrás de UTC (como Chile) el día se corre uno hacia atrás. Se arma la
  // fecha con sus componentes en horario LOCAL para evitar ese corrimiento.
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function handleApiError(err, fallback = "Ocurrió un error") {
  console.error(err);
  showToast(err.message || fallback, "error");
}
