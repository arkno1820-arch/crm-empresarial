const MODULOS_DISPONIBLES = [
  { key: "empleados", label: "Empleados" },
  { key: "calendario", label: "Calendario" },
  { key: "inventario", label: "Inventario" },
  { key: "reservas", label: "Reservas" },
];

const UsuariosModule = {
  data: [],

  async render() {
    document.getElementById("module-title").textContent = "Usuarios y accesos";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-primary" id="btn-nuevo-usuario">+ Nuevo perfil</button>
    `;
    document.getElementById("topbar-actions").querySelector("#btn-nuevo-usuario")
      .addEventListener("click", () => this.openForm());

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando usuarios…</div></div>`;

    try {
      this.data = await API.listUsers();
      this.renderTable();
    } catch (err) {
      handleApiError(err, "No se pudieron cargar los usuarios");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de administración de accesos esté activo.</p></div></div>`;
    }
  },

  renderTable() {
    const content = document.getElementById("module-content");
    const yo = Auth.getUser();

    if (this.data.length === 0) {
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No hay perfiles registrados</h4></div></div>`;
      return;
    }

    const rows = this.data.map(u => {
      const permisosBadges = (u.permisos || []).length
        ? u.permisos.map(p => `<span class="badge badge-neutral" style="margin-right:4px;">${escapeHtml(p)}</span>`).join("")
        : `<span style="color:var(--text-muted);font-size:12px;">Sin módulos asignados</span>`;
      const esYo = u.username === yo.username;

      return `
        <tr>
          <td><strong>${escapeHtml(u.username)}</strong>${esYo ? ' <span class="badge badge-ok">Tú</span>' : ""}<br><span style="color:var(--text-muted);font-size:12px;">${escapeHtml(u.email)}</span></td>
          <td><span class="badge ${u.role === "admin" ? "badge-warn" : "badge-neutral"}" style="text-transform:capitalize;">${escapeHtml(u.role)}</span></td>
          <td>${u.role === "admin" ? `<span style="color:var(--text-muted);font-size:12px;">Acceso total</span>` : permisosBadges}</td>
          <td>${u.is_active ? `<span class="badge badge-ok">Activo</span>` : `<span class="badge badge-danger">Inactivo</span>`}</td>
          <td class="actions-cell">
            <button class="btn btn-ghost btn-sm" data-edit="${u.id}">Editar</button>
            ${!esYo ? `<button class="btn btn-danger btn-sm" data-delete="${u.id}">Eliminar</button>` : ""}
          </td>
        </tr>
      `;
    }).join("");

    content.innerHTML = `
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Usuario</th><th>Rol</th><th>Acceso a módulos</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    content.querySelectorAll("[data-edit]").forEach(btn =>
      btn.addEventListener("click", () => this.openForm(btn.dataset.edit)));
    content.querySelectorAll("[data-delete]").forEach(btn =>
      btn.addEventListener("click", () => this.remove(btn.dataset.delete)));
  },

  checkboxesHtml(permisosActuales = []) {
    return MODULOS_DISPONIBLES.map(m => `
      <label style="display:flex;align-items:center;gap:8px;font-weight:500;">
        <input type="checkbox" name="permisos" value="${m.key}" ${permisosActuales.includes(m.key) ? "checked" : ""}>
        ${m.label}
      </label>
    `).join("");
  },

  openForm(id = null) {
    const usuario = id ? this.data.find(u => String(u.id) === String(id)) : null;
    const isEdit = !!usuario;

    Modal.open(isEdit ? `Editar perfil — ${usuario.username}` : "Nuevo perfil de usuario", `
      <form id="usuario-form" class="form-grid">
        ${!isEdit ? `
        <div class="field">
          <label>Usuario</label>
          <input name="username" required placeholder="ej. maria.recepcion">
        </div>
        <div class="field">
          <label>Correo</label>
          <input type="email" name="email" required placeholder="maria@empresa.com">
        </div>
        ` : ""}
        <div class="field ${isEdit ? "full" : ""}">
          <label>${isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
          <input type="password" name="password" ${isEdit ? "" : "required"} placeholder="${isEdit ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}">
        </div>
        <div class="field full">
          <label>Rol</label>
          <select name="role">
            <option value="admin" ${usuario?.role === "admin" ? "selected" : ""}>Administrador (acceso total)</option>
            <option value="rrhh" ${usuario?.role === "rrhh" ? "selected" : ""}>Recursos humanos</option>
            <option value="recepcion" ${usuario?.role === "recepcion" ? "selected" : ""}>Recepción</option>
            <option value="empleado" ${(!usuario || usuario?.role === "empleado") ? "selected" : ""}>Empleado</option>
          </select>
        </div>
        <div class="field full">
          <label>Módulos a los que tiene acceso</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 0;">
            ${this.checkboxesHtml(usuario?.permisos || [])}
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin:0;">Si el rol es "Administrador", tiene acceso a todo sin importar estos checkboxes.</p>
        </div>
        ${isEdit ? `
        <div class="field full">
          <label style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" name="is_active" ${usuario.is_active ? "checked" : ""}>
            Cuenta activa (desmarcar para bloquear el acceso sin eliminar el perfil)
          </label>
        </div>
        ` : ""}
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Guardar cambios" : "Crear perfil"}</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("usuario-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const permisos = fd.getAll("permisos");

      try {
        if (isEdit) {
          const payload = {
            role: fd.get("role"),
            permisos,
            is_active: fd.get("is_active") === "on",
          };
          const password = fd.get("password");
          if (password) payload.password = password;
          await API.updateUser(usuario.id, payload);
          showToast("Perfil actualizado", "success");
        } else {
          const payload = {
            username: fd.get("username"),
            email: fd.get("email"),
            password: fd.get("password"),
            role: fd.get("role"),
            permisos,
          };
          await API.register(payload);
          showToast("Perfil creado", "success");
        }
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo guardar el perfil");
      }
    });
  },

  async remove(id) {
    const usuario = this.data.find(u => String(u.id) === String(id));
    if (!confirmAction(`¿Eliminar el perfil de "${usuario?.username}"? Perderá el acceso a la plataforma.`)) return;
    try {
      await API.deleteUser(id);
      showToast("Perfil eliminado", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el perfil");
    }
  }
};
