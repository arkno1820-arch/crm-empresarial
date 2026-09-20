const EmpleadosModule = {
  data: [],

  puedeVerSalud() {
    const user = Auth.getUser();
    return user?.role === "admin" || (user?.permisos || []).includes("empleados_salud");
  },

  esAdmin() {
    return Auth.getUser()?.role === "admin";
  },

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
        <td>${e.activo ? `<span class="badge badge-ok">Activo</span>` : `<span class="badge badge-neutral">Inactivo</span>`}</td>
        <td class="actions-cell">
          <button class="btn btn-ghost btn-sm" data-edit="${e.id}">Editar</button>
          ${this.esAdmin() ? `<button class="btn btn-ghost btn-sm" data-historial="${e.id}">Historial</button>` : ""}
          ${e.activo ? `<button class="btn btn-danger btn-sm" data-delete="${e.id}">Eliminar</button>` : ""}
        </td>
      </tr>
    `).join("");

    content.innerHTML = `
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th><th>RUT</th><th>Puesto</th><th>Departamento</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    content.querySelectorAll("[data-edit]").forEach(btn =>
      btn.addEventListener("click", () => this.openForm(btn.dataset.edit)));
    content.querySelectorAll("[data-historial]").forEach(btn =>
      btn.addEventListener("click", () => this.verHistorial(btn.dataset.historial)));
    content.querySelectorAll("[data-delete]").forEach(btn =>
      btn.addEventListener("click", () => this.remove(btn.dataset.delete)));
  },

  async verHistorial(id) {
    const empleado = this.data.find(e => String(e.id) === String(id));
    Modal.open(`Historial — ${empleado?.nombre || ""} ${empleado?.apellido || ""}`, `<div class="empty-state">Cargando…</div>`);

    try {
      const registros = await API.auditoriaEmpleado(id);
      const filas = registros.map(r => `
        <tr>
          <td>${formatDateTime(r.fecha)}</td>
          <td>${escapeHtml(r.usuario)}</td>
          <td>${escapeHtml(r.accion)}</td>
          <td>${escapeHtml(r.detalle || "-")}</td>
        </tr>
      `).join("");

      document.getElementById("modal-body").innerHTML = registros.length ? `
        <div class="card" style="overflow-x:auto;">
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      ` : `<div class="empty-state"><h4>Sin registros</h4><p>Aún no hay historial de accesos para esta ficha.</p></div>`;
    } catch (err) {
      handleApiError(err, "No se pudo cargar el historial");
      document.getElementById("modal-body").innerHTML = `<div class="empty-state"><h4>No se pudo cargar</h4></div>`;
    }
  },

  openForm(id = null) {
    const empleado = id ? this.data.find(e => String(e.id) === String(id)) : null;
    const isEdit = !!empleado;

    Modal.open(isEdit ? "Editar empleado" : "Nuevo empleado", `
      <form id="empleado-form" class="form-grid">
        <div class="form-section-title full">Datos personales</div>
        <div class="field">
          <label>Nombre</label>
          <input name="nombre" required value="${escapeHtml(empleado?.nombre || "")}">
        </div>
        <div class="field">
          <label>Apellido</label>
          <input name="apellido" required value="${escapeHtml(empleado?.apellido || "")}">
        </div>
        <div class="field">
          <label>RUT</label>
          <input name="dni" required ${isEdit ? "disabled" : ""} value="${escapeHtml(empleado?.dni || "")}">
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

        <div class="form-section-title full">Datos laborales</div>
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
          <label>Salario (CLP)</label>
          <input type="number" step="1" min="0" name="salario" placeholder="CLP" value="${empleado?.salario ?? ""}">
        </div>

        ${this.puedeVerSalud() ? `
        <div class="form-section-title full">Salud y contacto de emergencia</div>
        <div class="field">
          <label>Contacto de emergencia</label>
          <input name="contacto_emergencia" placeholder="Nombre y teléfono" value="${escapeHtml(empleado?.contacto_emergencia || "")}">
        </div>
        <div class="field">
          <label>Previsión médica</label>
          <input name="prevision_medica" placeholder="Ej. Fonasa, Isapre..." value="${escapeHtml(empleado?.prevision_medica || "")}">
        </div>
        <div class="field full">
          <label>Alergias</label>
          <textarea name="alergias" placeholder="Ej. penicilina, mariscos...">${escapeHtml(empleado?.alergias || "")}</textarea>
        </div>
        <div class="field full">
          <label>Medicamentos que consume</label>
          <textarea name="medicamentos">${escapeHtml(empleado?.medicamentos || "")}</textarea>
        </div>
        <div class="field full">
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;">
            <input type="checkbox" name="consentimiento_datos_sensibles" ${empleado?.consentimiento_datos_sensibles ? "checked" : ""}>
            El empleado autorizó entregar estos datos (uso: contacto en caso de emergencia médica)
          </label>
          ${empleado?.consentimiento_fecha ? `<p style="font-size:12px;color:var(--text-muted);margin:4px 0 0;">Autorizado el ${formatDateTime(empleado.consentimiento_fecha)}</p>` : ""}
        </div>
        ` : `
        <div class="form-section-title full">Salud y contacto de emergencia</div>
        <p style="font-size:13px;color:var(--text-muted);margin:0;">No tienes permiso para ver ni editar estos datos. Pídele a un administrador el acceso "Empleados: datos de salud" si lo necesitas.</p>
        `}

        <div class="form-section-title full">Otras informaciones</div>
        <div class="field full">
          <label>Notas</label>
          <textarea name="notas" placeholder="Cualquier otro dato relevante">${escapeHtml(empleado?.notas || "")}</textarea>
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
      // Un checkbox sin marcar no viaja en el FormData; si la sección de
      // salud está visible, hay que mandar explícitamente el false.
      if (this.puedeVerSalud()) {
        payload.consentimiento_datos_sensibles = fd.get("consentimiento_datos_sensibles") === "on";
      }

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
    const confirmado = confirmAction(
      `¿Eliminar a ${empleado?.nombre} ${empleado?.apellido}?\n\n` +
      `Esto no borra el registro por completo: se conservan nombre, RUT, cargo, fechas y salario ` +
      `(exigido por la ley laboral), pero se eliminan todos sus datos de contacto y de salud. ` +
      `Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;
    try {
      await API.deleteEmpleado(id);
      showToast("Empleado eliminado (datos personales y de salud anonimizados)", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el empleado");
    }
  }
};
