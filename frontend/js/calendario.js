const CalendarioModule = {
  data: [],

  async render() {
    document.getElementById("module-title").textContent = "Calendario";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-primary" id="btn-nuevo-evento">+ Nuevo evento</button>
    `;
    document.getElementById("topbar-actions").querySelector("#btn-nuevo-evento")
      .addEventListener("click", () => this.openForm());

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando calendario…</div></div>`;

    try {
      this.data = await API.listEventos();
      this.renderAgenda();
    } catch (err) {
      handleApiError(err, "No se pudo cargar el calendario");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de calendario esté activo.</p></div></div>`;
    }
  },

  renderAgenda() {
    const content = document.getElementById("module-content");
    if (this.data.length === 0) {
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No hay eventos programados</h4><p>Agrega el primero con "Nuevo evento".</p></div></div>`;
      return;
    }

    const sorted = [...this.data].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    const groups = {};
    sorted.forEach(ev => {
      const key = new Date(ev.fecha_inicio).toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });

    content.innerHTML = Object.entries(groups).map(([day, events]) => `
      <div class="agenda-day">
        <div class="agenda-day-label">${day}</div>
        ${events.map(ev => `
          <div class="event-card">
            <div class="event-time">
              ${new Date(ev.fecha_inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} –
              ${new Date(ev.fecha_fin).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div class="event-info">
              <h4>${escapeHtml(ev.titulo)}</h4>
              <p>${escapeHtml(ev.ubicacion || "Sin ubicación")} · Creado por ${escapeHtml(ev.creado_por)}</p>
              ${ev.descripcion ? `<p>${escapeHtml(ev.descripcion)}</p>` : ""}
              ${ev.participantes && ev.participantes.length ? `<p>Participantes: ${escapeHtml(ev.participantes.join(", "))}</p>` : ""}
            </div>
            <div class="event-actions">
              <button class="btn btn-danger btn-sm" data-delete="${ev.id}">Eliminar</button>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("");

    content.querySelectorAll("[data-delete]").forEach(btn =>
      btn.addEventListener("click", () => this.remove(btn.dataset.delete)));
  },

  openForm() {
    const user = Auth.getUser();
    Modal.open("Nuevo evento", `
      <form id="evento-form" class="form-grid">
        <div class="field full">
          <label>Título</label>
          <input name="titulo" required placeholder="Ej. Reunión con proveedor">
        </div>
        <div class="field">
          <label>Inicio</label>
          <input type="datetime-local" name="fecha_inicio" required>
        </div>
        <div class="field">
          <label>Fin</label>
          <input type="datetime-local" name="fecha_fin" required>
        </div>
        <div class="field full">
          <label>Ubicación</label>
          <input name="ubicacion" placeholder="Ej. Sala de juntas">
        </div>
        <div class="field full">
          <label>Participantes (separados por coma)</label>
          <input name="participantes" placeholder="ej. maria@empresa.com, juan@empresa.com">
        </div>
        <div class="field full">
          <label>Descripción</label>
          <textarea name="descripcion"></textarea>
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear evento</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("evento-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      payload.creado_por = user ? user.username : "desconocido";
      payload.participantes = payload.participantes
        ? payload.participantes.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      payload.fecha_inicio = new Date(payload.fecha_inicio).toISOString();
      payload.fecha_fin = new Date(payload.fecha_fin).toISOString();

      try {
        await API.createEvento(payload);
        showToast("Evento creado", "success");
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo crear el evento");
      }
    });
  },

  async remove(id) {
    if (!confirmAction("¿Eliminar este evento del calendario?")) return;
    try {
      await API.deleteEvento(id);
      showToast("Evento eliminado", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el evento");
    }
  }
};
