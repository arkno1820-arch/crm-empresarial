const Modules = {
  empleados: EmpleadosModule,
  calendario: CalendarioModule,
  inventario: InventarioModule,
  reservas: ReservasModule,
  usuarios: UsuariosModule,
};

let currentModule = null;

function showScreen(id) {
  ["login-screen", "app-shell"].forEach(s => {
    document.getElementById(s).hidden = (s !== id);
  });
}

function accesibleModules(user) {
  // El admin ve todo, incluyendo Usuarios. Los demás solo ven lo que tengan en "permisos".
  if (user.role === "admin") return ["empleados", "calendario", "inventario", "reservas", "usuarios"];
  return (user.permisos || []).filter(m => Modules[m]);
}

function applyPermissionsToSidebar(user) {
  const permitidos = accesibleModules(user);
  document.querySelectorAll(".nav-item").forEach(btn => {
    const mod = btn.dataset.module;
    btn.hidden = !permitidos.includes(mod);
  });
  return permitidos;
}

function initSession() {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-role").textContent = user.role;
    document.getElementById("user-avatar").textContent = user.username.charAt(0).toUpperCase();

    const permitidos = applyPermissionsToSidebar(user);
    showScreen("app-shell");

    if (permitidos.length === 0) {
      document.getElementById("module-title").textContent = "Sin acceso asignado";
      document.getElementById("topbar-actions").innerHTML = "";
      document.getElementById("module-content").innerHTML = `
        <div class="card"><div class="empty-state">
          <h4>Aún no tienes módulos asignados</h4>
          <p>Pídele a un administrador que te asigne acceso desde "Usuarios".</p>
        </div></div>`;
      return;
    }

    const startModule = permitidos.includes(currentModule) ? currentModule : permitidos[0];
    navigateTo(startModule);
  } else {
    showScreen("login-screen");
  }
}

function navigateTo(moduleName) {
  currentModule = moduleName;
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.module === moduleName);
  });
  Modules[moduleName].render();
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.module));
});

document.getElementById("logout-btn").addEventListener("click", () => {
  Auth.clearSession();
  currentModule = null;
  showScreen("login-screen");
});

// ---------- LOGIN ----------
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");
  errorBox.hidden = true;

  try {
    const tokenData = await API.login(username, password);
    // El servicio de administracion de accesos codifica rol y permisos dentro del JWT.
    const payload = JSON.parse(atob(tokenData.access_token.split(".")[1]));
    Auth.setSession(tokenData.access_token, {
      username: payload.sub,
      role: payload.role,
      permisos: payload.permisos || [],
    });
    initSession();
  } catch (err) {
    errorBox.textContent = err.message || "Usuario o contraseña incorrectos";
    errorBox.hidden = false;
  }
});

// ---------- INIT ----------
initSession();
