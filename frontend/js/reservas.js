const ReservasModule = {
  habitaciones: [],
  reservas: [],
  activeTab: "reservas",

  async render() {
    document.getElementById("module-title").textContent = "Reservas";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-primary" id="btn-nueva-reserva">+ Nueva reserva</button>
      <button class="btn btn-ghost" id="btn-nueva-habitacion" style="margin-left:8px;">+ Nueva habitación</button>
    `;
    document.getElementById("btn-nueva-reserva").addEventListener("click", () => this.openReservaForm());
    document.getElementById("btn-nueva-habitacion").addEventListener("click", () => this.openHabitacionForm());

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando reservas…</div></div>`;

    try {
      [this.habitaciones, this.reservas] = await Promise.all([API.listHabitaciones(), API.listReservas()]);
      this.renderTabs();
    } catch (err) {
      handleApiError(err, "No se pudo cargar la información de reservas");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de reservas esté activo.</p></div></div>`;
    }
  },

  renderTabs() {
    const content = document.getElementById("module-content");
    content.innerHTML = `
      <div class="tab-group" style="margin-bottom:16px;">
        <button class="tab-btn ${this.activeTab === "reservas" ? "active" : ""}" data-tab="reservas">Reservas</button>
        <button class="tab-btn ${this.activeTab === "habitaciones" ? "active" : ""}" data-tab="habitaciones">Habitaciones</button>
      </div>
      <div id="tab-content"></div>
    `;
    content.querySelectorAll("[data-tab]").forEach(btn =>
      btn.addEventListener("click", () => { this.activeTab = btn.dataset.tab; this.renderTabs(); }));

    if (this.activeTab === "reservas") this.renderReservas();
    else this.renderHabitaciones();
  },

  renderReservas() {
    const el = document.getElementById("tab-content");
    if (this.reservas.length === 0) {
      el.innerHTML = `<div class="card"><div class="empty-state"><h4>No hay reservas aún</h4><p>Crea una con "Nueva reserva".</p></div></div>`;
      return;
    }

    const badgeFor = (estado) => {
      if (estado === "confirmada") return `<span class="badge badge-ok">Confirmada</span>`;
      if (estado === "cancelada") return `<span class="badge badge-danger">Cancelada</span>`;
      return `<span class="badge badge-neutral">${escapeHtml(estado)}</span>`;
    };

    const rows = this.reservas.map(r => {
      const hab = this.habitaciones.find(h => h.id === r.habitacion_id);
      return `
        <tr>
          <td><strong>${escapeHtml(r.huesped_nombre)}</strong><br><span style="color:var(--text-muted);font-size:12px;">${escapeHtml(r.huesped_email || "")}</span></td>
          <td>${hab ? escapeHtml(hab.numero) + " · " + escapeHtml(hab.tipo) : "-"}</td>
          <td>${formatDate(r.fecha_checkin)} → ${formatDate(r.fecha_checkout)}</td>
          <td>${formatMoney(r.total)}</td>
          <td>${badgeFor(r.estado)}</td>
          <td class="actions-cell">
            ${r.estado === "confirmada" ? `<button class="btn btn-danger btn-sm" data-cancel="${r.id}">Cancelar</button>` : ""}
          </td>
        </tr>
      `;
    }).join("");

    el.innerHTML = `
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Huésped</th><th>Habitación</th><th>Fechas</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    el.querySelectorAll("[data-cancel]").forEach(btn =>
      btn.addEventListener("click", () => this.cancelarReserva(btn.dataset.cancel)));
  },

  renderHabitaciones() {
    const el = document.getElementById("tab-content");
    if (this.habitaciones.length === 0) {
      el.innerHTML = `<div class="card"><div class="empty-state"><h4>No hay habitaciones registradas</h4><p>Agrega la primera con "Nueva habitación".</p></div></div>`;
      return;
    }

    const rows = this.habitaciones.map(h => `
      <tr>
        <td><strong>${escapeHtml(h.numero)}</strong></td>
        <td>${escapeHtml(h.tipo)}</td>
        <td>${h.capacidad} personas</td>
        <td>${formatMoney(h.precio_noche)} / noche</td>
        <td>${h.estado === "disponible" ? `<span class="badge badge-ok">Disponible</span>` : `<span class="badge badge-warn">${escapeHtml(h.estado)}</span>`}</td>
      </tr>
    `).join("");

    el.innerHTML = `
      <div class="card">
        <table class="data-table">
          <thead><tr><th>Número</th><th>Tipo</th><th>Capacidad</th><th>Precio</th><th>Estado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  openHabitacionForm() {
    Modal.open("Nueva habitación", `
      <form id="hab-form" class="form-grid">
        <div class="field">
          <label>Número</label>
          <input name="numero" required placeholder="Ej. 101">
        </div>
        <div class="field">
          <label>Tipo</label>
          <select name="tipo">
            <option value="individual">Individual</option>
            <option value="doble">Doble</option>
            <option value="suite">Suite</option>
          </select>
        </div>
        <div class="field">
          <label>Precio por noche</label>
          <input type="number" step="0.01" name="precio_noche" required>
        </div>
        <div class="field">
          <label>Capacidad</label>
          <input type="number" name="capacidad" value="2">
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear habitación</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("hab-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      payload.precio_noche = Number(payload.precio_noche);
      payload.capacidad = Number(payload.capacidad);

      try {
        await API.createHabitacion(payload);
        showToast("Habitación creada", "success");
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo crear la habitación");
      }
    });
  },

  openReservaForm() {
    const opciones = this.habitaciones.map(h =>
      `<option value="${h.id}">${escapeHtml(h.numero)} · ${escapeHtml(h.tipo)} · ${formatMoney(h.precio_noche)}/noche</option>`
    ).join("");

    Modal.open("Nueva reserva", `
      <form id="reserva-form" class="form-grid">
        <div class="field full">
          <label>Habitación</label>
          <select name="habitacion_id" required>
            <option value="">Selecciona una habitación</option>
            ${opciones}
          </select>
        </div>
        <div class="field full">
          <label>Nombre del huésped</label>
          <input name="huesped_nombre" required>
        </div>
        <div class="field">
          <label>Correo</label>
          <input type="email" name="huesped_email">
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input name="huesped_telefono">
        </div>
        <div class="field">
          <label>Check-in</label>
          <input type="date" name="fecha_checkin" required>
        </div>
        <div class="field">
          <label>Check-out</label>
          <input type="date" name="fecha_checkout" required>
        </div>
        <div class="field full">
          <label>Notas</label>
          <textarea name="notas"></textarea>
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear reserva</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("reserva-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      payload.habitacion_id = Number(payload.habitacion_id);

      try {
        await API.createReserva(payload);
        showToast("Reserva creada", "success");
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo crear la reserva. Puede que la habitación ya esté ocupada en esas fechas.");
      }
    });
  },

  async cancelarReserva(id) {
    if (!confirmAction("¿Cancelar esta reserva?")) return;
    try {
      await API.cancelarReserva(id);
      showToast("Reserva cancelada", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo cancelar la reserva");
    }
  }
};
