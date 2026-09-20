const ChatModule = {
  conversaciones: [],
  mensajesActuales: [],
  directorioUsuarios: [],
  activeUser: null,
  pollInterval: null,
  viewMode: "chat",

  esAdmin() {
    return Auth.getUser()?.role === "admin";
  },

  async render() {
    document.getElementById("module-title").textContent = "Chat";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-ghost" id="btn-nueva-conversacion">+ Nueva conversación</button>
      ${this.esAdmin() ? `<button class="btn btn-ghost" id="btn-ver-auditoria" style="margin-left:8px;">Auditoría</button>` : ""}
    `;
    document.getElementById("btn-nueva-conversacion").addEventListener("click", () => this.abrirSelectorUsuario());
    if (this.esAdmin()) {
      document.getElementById("btn-ver-auditoria").addEventListener("click", () => this.mostrarAuditoria());
    }

    this.viewMode = "chat";
    this.activeUser = null;
    this.mensajesActuales = [];

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando conversaciones…</div></div>`;

    try {
      this.conversaciones = await API.listConversaciones();
      this.renderLayout();
      this.iniciarPolling();
    } catch (err) {
      handleApiError(err, "No se pudieron cargar las conversaciones");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de chat esté activo.</p></div></div>`;
    }
  },

  renderLayout() {
    const content = document.getElementById("module-content");
    content.innerHTML = `
      <div class="chat-banner">
        🔒 Este chat interno queda registrado y es auditable por administración. No compartas información personal o confidencial que no corresponda al trabajo. Los mensajes se conservan visibles 30 días.
      </div>
      <div class="chat-layout">
        <div class="chat-sidebar" id="chat-sidebar"></div>
        <div class="chat-panel" id="chat-panel"></div>
      </div>
    `;
    this.renderSidebar();
    this.renderPanel();
  },

  renderSidebar() {
    const el = document.getElementById("chat-sidebar");
    if (!el) return;

    if (this.conversaciones.length === 0) {
      el.innerHTML = `<div class="chat-empty-sidebar">Aún no tienes conversaciones.<br>Usa "+ Nueva conversación" para empezar.</div>`;
      return;
    }

    el.innerHTML = this.conversaciones.map(c => `
      <button class="chat-conv-item ${c.usuario === this.activeUser ? "active" : ""}" data-usuario="${escapeHtml(c.usuario)}">
        <span class="chat-conv-avatar">${escapeHtml(c.usuario.charAt(0).toUpperCase())}</span>
        <span class="chat-conv-info">
          <span class="chat-conv-nombre">${escapeHtml(c.usuario)}</span>
          <span class="chat-conv-preview">${escapeHtml(c.ultimo_mensaje || "")}</span>
        </span>
        ${c.no_leidos > 0 ? `<span class="chat-conv-badge">${c.no_leidos}</span>` : ""}
      </button>
    `).join("");

    el.querySelectorAll("[data-usuario]").forEach(btn =>
      btn.addEventListener("click", () => this.abrirConversacion(btn.dataset.usuario)));
  },

  async abrirConversacion(usuario) {
    this.activeUser = usuario;
    this.renderSidebar();
    this.renderPanel();

    try {
      this.mensajesActuales = await API.verConversacion(usuario);
      this.renderMensajesList();
      // Refresca la lista para que el contador de "no leídos" baje al abrir.
      this.conversaciones = await API.listConversaciones();
      this.renderSidebar();
    } catch (err) {
      handleApiError(err, "No se pudo cargar la conversación");
    }
  },

  renderPanel() {
    const el = document.getElementById("chat-panel");
    if (!el) return;

    if (!this.activeUser) {
      el.innerHTML = `<div class="chat-empty-panel">Selecciona una conversación o inicia una nueva.</div>`;
      return;
    }

    el.innerHTML = `
      <div class="chat-panel-header">${escapeHtml(this.activeUser)}</div>
      <div class="chat-mensajes-list" id="chat-mensajes-list"></div>
      <form id="chat-form" class="chat-input-bar">
        <input type="file" id="chat-file-input" hidden>
        <button type="button" class="btn btn-ghost btn-sm" id="chat-btn-adjuntar" title="Adjuntar documento">📎</button>
        <input type="text" id="chat-input-texto" placeholder="Escribe un mensaje..." autocomplete="off">
        <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
      </form>
    `;
    this.renderMensajesList();

    document.getElementById("chat-btn-adjuntar").addEventListener("click", () =>
      document.getElementById("chat-file-input").click());

    document.getElementById("chat-file-input").addEventListener("change", async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      try {
        await API.enviarArchivoChat(this.activeUser, archivo);
        e.target.value = "";
        await this.abrirConversacion(this.activeUser);
      } catch (err) {
        handleApiError(err, "No se pudo enviar el archivo");
      }
    });

    document.getElementById("chat-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("chat-input-texto");
      const texto = input.value.trim();
      if (!texto) return;
      input.value = "";
      try {
        await API.enviarMensajeChat(this.activeUser, texto);
        this.mensajesActuales = await API.verConversacion(this.activeUser);
        this.renderMensajesList();
        this.conversaciones = await API.listConversaciones();
        this.renderSidebar();
      } catch (err) {
        handleApiError(err, "No se pudo enviar el mensaje");
        input.value = texto;
      }
    });
  },

  renderMensajesList() {
    const el = document.getElementById("chat-mensajes-list");
    if (!el) return;
    const yo = Auth.getUser()?.username;

    if (this.mensajesActuales.length === 0) {
      el.innerHTML = `<div class="chat-empty-panel">Aún no hay mensajes en esta conversación.</div>`;
      return;
    }

    el.innerHTML = this.mensajesActuales.map(m => {
      const esMio = m.remitente === yo;
      const cuerpo = m.contenido
        ? escapeHtml(m.contenido)
        : `📎 <button class="chat-archivo-btn" data-descargar="${m.id}" data-nombre="${escapeHtml(m.archivo_nombre || "archivo")}">${escapeHtml(m.archivo_nombre || "archivo")}</button>`;
      return `
        <div class="chat-bubble-row ${esMio ? "mio" : "otro"}">
          <div class="chat-bubble ${esMio ? "mio" : "otro"}">
            <div>${cuerpo}</div>
            <div class="chat-bubble-hora">${formatDateTime(m.fecha_envio)}</div>
          </div>
        </div>
      `;
    }).join("");

    el.querySelectorAll("[data-descargar]").forEach(btn =>
      btn.addEventListener("click", () => {
        API.descargarArchivoChat(btn.dataset.descargar, btn.dataset.nombre)
          .catch(err => handleApiError(err, "No se pudo descargar el archivo"));
      }));

    el.scrollTop = el.scrollHeight;
  },

  async abrirSelectorUsuario() {
    Modal.open("Nueva conversación", `<div class="empty-state">Cargando usuarios…</div>`);
    try {
      this.directorioUsuarios = await API.directorio();
      const lista = this.directorioUsuarios.map(u => `
        <button type="button" class="chat-directorio-item" data-usuario="${escapeHtml(u.username)}">
          <span class="chat-conv-avatar">${escapeHtml(u.username.charAt(0).toUpperCase())}</span>
          ${escapeHtml(u.username)}
        </button>
      `).join("");

      document.getElementById("modal-body").innerHTML = this.directorioUsuarios.length
        ? `<div class="chat-directorio-list">${lista}</div>`
        : `<div class="empty-state"><h4>No hay otros usuarios</h4><p>Pídele a un administrador que cree más perfiles.</p></div>`;

      document.querySelectorAll("[data-usuario]").forEach(btn =>
        btn.addEventListener("click", () => {
          Modal.close();
          this.abrirConversacion(btn.dataset.usuario);
        }));
    } catch (err) {
      handleApiError(err, "No se pudo cargar la lista de usuarios");
      Modal.close();
    }
  },

  iniciarPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(async () => {
      // Si ya no estamos en el módulo Chat, deja de sondear.
      if (!document.getElementById("chat-sidebar")) {
        clearInterval(this.pollInterval);
        return;
      }
      try {
        this.conversaciones = await API.listConversaciones();
        this.renderSidebar();
        if (this.activeUser) {
          this.mensajesActuales = await API.verConversacion(this.activeUser);
          this.renderMensajesList();
        }
      } catch (_) {
        // Fallo silencioso: no interrumpir al usuario por un sondeo fallido.
      }
    }, 3000);
  },

  async mostrarAuditoria(usuarioFiltro = "") {
    this.viewMode = "auditoria";
    if (this.pollInterval) clearInterval(this.pollInterval);

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando auditoría…</div></div>`;

    try {
      const query = usuarioFiltro ? `usuario=${encodeURIComponent(usuarioFiltro)}` : "";
      const mensajes = await API.auditoriaChat(query);

      const filas = mensajes.map(m => `
        <tr>
          <td>${formatDateTime(m.fecha_envio)}</td>
          <td>${escapeHtml(m.remitente)}</td>
          <td>${escapeHtml(m.destinatario)}</td>
          <td>${m.contenido
            ? escapeHtml(m.contenido)
            : (m.archivo_nombre ? `📎 <button class="chat-archivo-btn" data-descargar="${m.id}" data-nombre="${escapeHtml(m.archivo_nombre)}">${escapeHtml(m.archivo_nombre)}</button>` : "-")}</td>
        </tr>
      `).join("");

      content.innerHTML = `
        <div class="chat-banner">
          Vista de auditoría: se muestran TODOS los mensajes de todos los usuarios, sin límite de 30 días. Solo visible para administradores.
        </div>
        <div class="toolbar">
          <input type="text" id="filtro-usuario-auditoria" placeholder="Filtrar por usuario..." value="${escapeHtml(usuarioFiltro)}">
          <button class="btn btn-ghost btn-sm" id="btn-filtrar-auditoria">Filtrar</button>
          <button class="btn btn-ghost btn-sm" id="btn-volver-chat">← Volver al chat</button>
        </div>
        <div class="card" style="overflow-x:auto;">
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>De</th><th>Para</th><th>Contenido</th></tr></thead>
            <tbody>${filas || `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">Sin mensajes</td></tr>`}</tbody>
          </table>
        </div>
      `;

      document.getElementById("btn-volver-chat").addEventListener("click", () => this.render());
      document.getElementById("btn-filtrar-auditoria").addEventListener("click", () =>
        this.mostrarAuditoria(document.getElementById("filtro-usuario-auditoria").value.trim()));
      content.querySelectorAll("[data-descargar]").forEach(btn =>
        btn.addEventListener("click", () => {
          API.descargarArchivoChat(btn.dataset.descargar, btn.dataset.nombre)
            .catch(err => handleApiError(err, "No se pudo descargar el archivo"));
        }));
    } catch (err) {
      handleApiError(err, "No se pudo cargar la auditoría");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo cargar</h4></div></div>`;
    }
  },
};
