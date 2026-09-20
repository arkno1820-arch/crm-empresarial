const InventarioModule = {
  data: [],

  async render() {
    document.getElementById("module-title").textContent = "Inventario";
    document.getElementById("topbar-actions").innerHTML = `
      <button class="btn btn-primary" id="btn-nuevo-producto">+ Nuevo producto</button>
    `;
    document.getElementById("topbar-actions").querySelector("#btn-nuevo-producto")
      .addEventListener("click", () => this.openForm());

    const content = document.getElementById("module-content");
    content.innerHTML = `<div class="card"><div class="empty-state">Cargando inventario…</div></div>`;

    try {
      this.data = await API.listProductos();
      this.renderTable();
    } catch (err) {
      handleApiError(err, "No se pudo cargar el inventario");
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>No se pudo conectar</h4><p>Revisa que el servicio de inventario esté activo.</p></div></div>`;
    }
  },

  renderTable() {
    const content = document.getElementById("module-content");
    if (this.data.length === 0) {
      content.innerHTML = `<div class="card"><div class="empty-state"><h4>Sin productos registrados</h4><p>Agrega el primero con "Nuevo producto".</p></div></div>`;
      return;
    }

    const bajoStock = this.data.filter(p => p.cantidad <= p.stock_minimo).length;

    const rows = this.data.map(p => {
      const low = p.cantidad <= p.stock_minimo;
      const badge = low
        ? `<span class="badge badge-danger">${p.cantidad} · bajo stock</span>`
        : `<span class="badge badge-ok">${p.cantidad} en stock</span>`;
      return `
        <tr>
          <td><strong>${escapeHtml(p.nombre)}</strong><br><span style="color:var(--text-muted);font-size:12px;">${escapeHtml(p.categoria || "Sin categoría")}</span></td>
          <td>${badge}</td>
          <td>${formatMoney(p.precio_unitario)}</td>
          <td>${escapeHtml(p.ubicacion || "-")}</td>
          <td class="actions-cell">
            <button class="btn btn-ghost btn-sm" data-mov="${p.id}">+ / - Stock</button>
            <button class="btn btn-ghost btn-sm" data-edit="${p.id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-delete="${p.id}">Eliminar</button>
          </td>
        </tr>
      `;
    }).join("");

    content.innerHTML = `
      ${bajoStock > 0 ? `<div class="card" style="margin-bottom:16px;padding:14px 18px;background:var(--danger-bg);color:var(--danger);font-weight:600;">⚠ ${bajoStock} producto(s) con stock bajo el mínimo</div>` : ""}
      <div class="card">
        <table class="data-table">
          <thead>
            <tr><th>Producto</th><th>Stock</th><th>Precio unitario</th><th>Ubicación</th><th>Acciones</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    content.querySelectorAll("[data-edit]").forEach(btn =>
      btn.addEventListener("click", () => this.openForm(btn.dataset.edit)));
    content.querySelectorAll("[data-delete]").forEach(btn =>
      btn.addEventListener("click", () => this.remove(btn.dataset.delete)));
    content.querySelectorAll("[data-mov]").forEach(btn =>
      btn.addEventListener("click", () => this.openMovimiento(btn.dataset.mov)));
  },

  openForm(id = null) {
    const producto = id ? this.data.find(p => String(p.id) === String(id)) : null;
    const isEdit = !!producto;

    Modal.open(isEdit ? "Editar producto" : "Nuevo producto", `
      <form id="producto-form" class="form-grid">
        <div class="field full">
          <label>Nombre</label>
          <input name="nombre" required value="${escapeHtml(producto?.nombre || "")}">
        </div>
        <div class="field">
          <label>Categoría</label>
          <input name="categoria" value="${escapeHtml(producto?.categoria || "")}">
        </div>
        <div class="field">
          <label>Ubicación</label>
          <input name="ubicacion" value="${escapeHtml(producto?.ubicacion || "")}">
        </div>
        ${!isEdit ? `
        <div class="field">
          <label>Cantidad inicial</label>
          <input type="number" name="cantidad" value="0">
        </div>` : ""}
        <div class="field">
          <label>Precio unitario (CLP)</label>
          <input type="number" step="1" min="0" name="precio_unitario" placeholder="CLP" value="${producto?.precio_unitario ?? 0}">
        </div>
        <div class="field">
          <label>Stock mínimo (alerta)</label>
          <input type="number" name="stock_minimo" value="${producto?.stock_minimo ?? 0}">
        </div>
        <div class="field full">
          <label>Descripción</label>
          <textarea name="descripcion">${escapeHtml(producto?.descripcion || "")}</textarea>
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? "Guardar cambios" : "Crear producto"}</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("producto-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      if (payload.cantidad !== undefined) payload.cantidad = Number(payload.cantidad);
      payload.precio_unitario = Number(payload.precio_unitario);
      payload.stock_minimo = Number(payload.stock_minimo);

      try {
        if (isEdit) {
          await API.updateProducto(producto.id, payload);
          showToast("Producto actualizado", "success");
        } else {
          await API.createProducto(payload);
          showToast("Producto creado", "success");
        }
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo guardar el producto");
      }
    });
  },

  openMovimiento(id) {
    const producto = this.data.find(p => String(p.id) === String(id));
    Modal.open(`Movimiento de stock — ${producto.nombre}`, `
      <form id="mov-form" class="form-grid">
        <div class="field full">
          <label>Tipo de movimiento</label>
          <select name="tipo">
            <option value="entrada">Entrada (suma stock)</option>
            <option value="salida">Salida (resta stock)</option>
          </select>
        </div>
        <div class="field full">
          <label>Cantidad</label>
          <input type="number" name="cantidad" min="1" required>
        </div>
        <div class="field full">
          <label>Motivo</label>
          <input name="motivo" placeholder="Ej. Compra a proveedor, uso interno...">
        </div>
        <div class="form-actions full">
          <button type="button" class="btn btn-ghost" id="cancel-form">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar movimiento</button>
        </div>
      </form>
    `);

    document.getElementById("cancel-form").addEventListener("click", () => Modal.close());
    document.getElementById("mov-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      payload.cantidad = Number(payload.cantidad);

      try {
        await API.registrarMovimiento(id, payload);
        showToast("Movimiento registrado", "success");
        Modal.close();
        this.render();
      } catch (err) {
        handleApiError(err, "No se pudo registrar el movimiento");
      }
    });
  },

  async remove(id) {
    const producto = this.data.find(p => String(p.id) === String(id));
    if (!confirmAction(`¿Eliminar "${producto?.nombre}" del inventario?`)) return;
    try {
      await API.deleteProducto(id);
      showToast("Producto eliminado", "success");
      this.render();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar el producto");
    }
  }
};
