const EmpleadosModule = {
  data: [],

  async render() {
    document.getElementById("module-title").textContent = "Empleados";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-primary" id="btn-nuevo-empleado">+ Nuevo empleado</button>
    `;
    document.getElementById("topbar-actions").querySelector("#btn-nuevo-empleado")
      .addEventListener("click", () => this.openForm());

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando fichas de empleados…</div></div>`;

    try {
      this.data = await API.listEmpleados();
      this.renderTable();
    } catch (err) {
      handleApiError(err, "No se pudieron cargar los empleados");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de empleados esté activo.</p></div></div>`;
    }
  },

  renderTable() {
    const content = document.getElementById("module-content");
    if (this.data.length === 0) {
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>Aún no hay empleados</h4><p>Registra la primera ficha con "Nuevo empleado".</p></div></div>`;
      return;
    }

    const rows = this.data.map(e => `
      <tr>
        <td><strong>${escapeHtml(e.nombre)} ${escapeHtml(e.apellido)}</strong></td>
        <td>${escapeHtml(e.dni)}</td>
        <td>${escapeHtml(e.puesto || "-")}</td>
        <td>${escapeHtml(e.departamento || "-")}</td>
        <td>${escapeHtml(e.telefono || "-")}</td>
        <td>${escapeHtml(e.email || "-")}</td>
        <td class="actions-cell">
          <button class="btn btn-ghost btn-sm" data-edit="${e.id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-delete="${e.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    content.innerHTML = `
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th><th>DNI</th><th>Puesto</th><th>Departamento</th><th>Teléfono</th><th>Correo</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    content.querySelectorAll("[data-edit]").forEach(btn =>
      btn.addEventListener("click", () => this.openForm(btn.dataset.edit)));
    content.querySelectorAll("[data-delete]").forEach(btn =>
      btn.addEventListener("click", () => this.remove(btn.dataset.delete)));
  },

  openForm(id = null) {
    const empleado = id ? this.data.find(e => String(e.id) === String(id)) : null;
    const isEdit = !!empleado;

    Modal.open(isEdit ? "Editar empleado" : "Nuevo empleado", `
      <form id="empleado-form" class="form-grid">
        <div class="field">
          <label>Nombre</label>
          <input name="nombre" required value="${escapeHtml(empleado?.nombre || "")}">
        </div>
        <div class="field">
          <label>Apellido</label>
          <input name="apellido" required value="${escapeHtml(empleado?.apellido || "")}">
        </div>
        <div class="field">
          <label>DNI</label>
          <input name="dni" required ${isEdit ? "disabled" : ""} value="${escapeHtml(empleado?.dni || "")}">
        </div>
        <div class="field">
          <label>Puesto</label>
          <input name="puesto" value="${escapeHtml(empleado?.puesto || "")}">
        </div>
        <div class="field">
          <label>Departamento</label>
          <input name="departamento" value="${escapeHtml(empleado?.departamento || "")}">
        </div>
        <div class="field">
          <label>Fecha de ingreso</label>
          <input type="date" name="fecha_ingreso" value="${empleado?.fecha_ingreso || ""}">
        </div>
        <div class="field">
          <label>Salario</label>
          <input type="number" step="0.01" name="salario" value="${empleado?.salario ?? ""}">
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input name="telefono" value="${escapeHtml(empleado?.telefono || "")}">
        </div>
        <div class="field full">
          <label>Correo</label>
          <input type="email" name="email" value="${escapeHtml(empleado?.email || "")}">
        </div>
        <div class="field full">
          <label>Dirección</label>
          <textarea name="direccion">${escapeHtml(empleado?.direccion || "")}</textarea>
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Guardar cambios" : "Crear empleado"}</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("empleado-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      if (payload.salario === "") delete payload.salario;
      if (payload.fecha_ingreso === "") delete payload.fecha_ingreso;

      try {
        if (isEdit) {
          delete payload.dni;
          await API.updateEmpleado(empleado.id, payload);
          showToast("Empleado actualizado", "success");
        } else {
          await API.createEmpleado(payload);
          showToast("Empleado creado", "success");
        }
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo guardar el empleado");
      }
    });
  },

  async remove(id) {
    const empleado = this.data.find(e => String(e.id) === String(id));
    if (!confirmAction(`¿Eliminar a ${empleado?.nombre} ${empleado?.apellido}? Esta acción no se puede deshacer.`)) return;
    try {
      await API.deleteEmpleado(id);
      showToast("Empleado eliminado", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el empleado");
    }
  }
};
