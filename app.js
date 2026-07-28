/**
 * Controlador Principal de la Aplicación (app.js)
 * Sistema Integrado IDD - PDR V2 (Con Modal Ficha de Proyecto & Exportación Individual)
 */

const App = {
  activeModuleId: 'mod-proyectos',

  init() {
    this.populateCatalogDropdowns();
    this.renderAll();
    this.loadSQLSchemaText();
  },

  populateCatalogDropdowns() {
    const usuarios = DB.getUsuarios();
    const invFilter = document.getElementById('filter-investigador');
    const prevValFilter = invFilter ? invFilter.value : '';

    if (invFilter) {
      invFilter.innerHTML = '<option value="">-- Todos los Investigadores --</option>' +
        usuarios.map(u => `<option value="${u.id}">${u.nombre} (${u.rol})</option>`).join('');
      invFilter.value = prevValFilter;
    }

    ['p-investigador', 'ast-investigador-id', 'tt-investigador', 'cap-investigador-id'].forEach(selectId => {
      const el = document.getElementById(selectId);
      if (el) {
        el.innerHTML = usuarios.map(u => `<option value="${u.id}">${u.nombre} (${u.rol})</option>`).join('');
      }
    });

    const lineas = DB.getLineas();
    const marcaFilter = document.getElementById('filter-marca');
    const prevMarcaFilter = marcaFilter ? marcaFilter.value : '';

    if (marcaFilter) {
      marcaFilter.innerHTML = '<option value="">-- Todas las Líneas --</option>' +
        lineas.map(l => `<option value="${l}">${l}</option>`).join('');
      marcaFilter.value = prevMarcaFilter;
    }

    const pMarca = document.getElementById('p-marca');
    if (pMarca) {
      pMarca.innerHTML = lineas.map(l => `<option value="${l}">${l}</option>`).join('');
    }
  },

  switchModule(moduleId, cardElement) {
    this.activeModuleId = moduleId;
    
    document.querySelectorAll('.nav-module-card').forEach(card => card.classList.remove('active'));
    if (cardElement) cardElement.classList.add('active');

    document.querySelectorAll('.module-section').forEach(sec => sec.style.display = 'none');
    const targetSec = document.getElementById(moduleId);
    if (targetSec) targetSec.style.display = 'block';

    this.renderCurrentModule();
  },

  applyFilters() {
    this.renderAll();
  },

  getFilters() {
    return {
      investigador_id: document.getElementById('filter-investigador').value,
      marca_linea: document.getElementById('filter-marca').value,
      centro_costo: document.getElementById('filter-cc').value,
      fecha_inicio: document.getElementById('filter-fecha-inicio').value,
      fecha_fin: document.getElementById('filter-fecha-fin').value
    };
  },

  renderAll() {
    this.populateCatalogDropdowns();
    const filters = this.getFilters();
    const proyectos = DB.getProjects(filters);

    this.renderKPICards(proyectos);
    this.renderCurrentModule();
  },

  renderCurrentModule() {
    const filters = this.getFilters();
    const proyectos = DB.getProjects(filters);

    switch (this.activeModuleId) {
      case 'mod-proyectos':
        this.renderProyectosModule(proyectos);
        break;
      case 'mod-aplicaciones':
        this.renderAplicacionesModule();
        break;
      case 'mod-asistencia':
        this.renderAsistenciaModule();
        break;
      case 'mod-capacidad':
        this.renderCapacidadModule();
        break;
      case 'mod-capacitaciones':
        this.renderCapacitacionesModule();
        break;
      case 'mod-homologaciones':
        this.renderHomologacionesModule();
        break;
      case 'mod-catalogos':
        this.renderCatalogosModule();
        break;
    }
  },

  // ---------------------------------------------------------------------------
  // KPI CARDS
  // ---------------------------------------------------------------------------
  renderKPICards(proyectos) {
    const otdRes = KPIEngine.calculateOTD(proyectos);
    document.getElementById('kpi-otd-val').innerText = `${otdRes.otd}%`;
    document.getElementById('kpi-otd-sub').innerText = `${otdRes.aTiempo} a tiempo / ${otdRes.evaluados} evaluados`;

    const activos = proyectos.filter(p => p.etapa_actual !== 'Éxito / Aprobado' && p.etapa_actual !== 'Cancelado / Descartado').length;
    document.getElementById('kpi-activos-val').innerText = activos;

    const desviaciones = proyectos.map(p => KPIEngine.calculateTimeDeviation(p));
    const totalDiasDesv = desviaciones.reduce((s, d) => s + d.desviacionDias, 0);
    const avgDesvDias = desviaciones.length > 0 ? (totalDiasDesv / desviaciones.length).toFixed(1) : 0;
    const avgDesvPct = desviaciones.length > 0 ? (desviaciones.reduce((s, d) => s + d.porcentajeDesviacion, 0) / desviaciones.length).toFixed(1) : 0;
    document.getElementById('kpi-desviacion-val').innerText = `${avgDesvDias} días`;
    document.getElementById('kpi-desviacion-sub').innerText = `${avgDesvPct}% promedio de desviación`;

    const eficiencias = DB.data.eficiencias;
    const totalInc = eficiencias.reduce((s, e) => s + KPIEngine.calculateEfficiencyIncrease(e.valor_actual, e.valor_nuevo), 0);
    const avgInc = eficiencias.length > 0 ? (totalInc / eficiencias.length).toFixed(1) : 0;
    document.getElementById('kpi-eficiencia-val').innerText = `+${avgInc}%`;

    const totalCap = DB.data.capacitaciones.reduce((s, c) => s + parseFloat(c.horas || 0), 0);
    document.getElementById('kpi-capacitacion-val').innerText = `${totalCap} hrs`;

    const totalSoporte = DB.data.asistencias_tecnicas.reduce((s, a) => s + parseFloat(a.horas_invertidas || 0), 0);
    document.getElementById('kpi-soporte-val').innerText = `${totalSoporte} hrs`;
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 1: PROYECTOS
  // ---------------------------------------------------------------------------
  renderProyectosModule(proyectos) {
    const etapas = [
      'Por Definir / Briefing', 'En Desarrollo (Laboratorio)', 'En Documentación',
      'En Evaluación / Enviado a Cliente', 'Re-formulación', 'Prueba Piloto / Escalamiento',
      'Stand By / En Espera', 'Estudio de Estabilidad / Vida Útil', 'Éxito / Aprobado', 'Cancelado / Descartado'
    ];

    document.getElementById('funnel-container').innerHTML = etapas.map(etapa => {
      const count = proyectos.filter(p => p.etapa_actual === etapa).length;
      return `<div class="funnel-step-card"><h4>${etapa}</h4><div class="count">${count}</div></div>`;
    }).join('');

    const tbody = document.getElementById('tbl-proyectos-body');
    if (proyectos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay proyectos que coincidan con los filtros.</td></tr>';
      return;
    }

    tbody.innerHTML = proyectos.map(p => {
      const status = KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega);
      return `
        <tr style="cursor:pointer;">
          <td onclick="App.openDetalleProyecto(${p.id})"><span class="badge-traffic ${status.toLowerCase()}"><span class="traffic-dot"></span> ${status}</span></td>
          <td onclick="App.openDetalleProyecto(${p.id})"><strong>${p.codigo}</strong></td>
          <td onclick="App.openDetalleProyecto(${p.id})">
            <div style="font-weight:600; color:#93c5fd; text-decoration:underline;">${p.nombre}</div>
            <div style="font-size:11px; color:var(--text-muted);">Cliente: ${p.cliente || 'Interno'}</div>
          </td>
          <td onclick="App.openDetalleProyecto(${p.id})">${p.categoria}</td>
          <td onclick="App.openDetalleProyecto(${p.id})">${p.marca_linea}</td>
          <td onclick="App.openDetalleProyecto(${p.id})"><span class="badge-etapa">${p.centro_costo}</span></td>
          <td onclick="App.openDetalleProyecto(${p.id})"><span class="badge-etapa">${p.etapa_actual}</span></td>
          <td onclick="App.openDetalleProyecto(${p.id})">${p.fecha_compromiso}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-secondary" onclick="App.openDetalleProyecto(${p.id})">🔍 Ficha</button>
              <button class="btn-edit" onclick="App.openModalProyecto(${p.id})">✏️ Editar</button>
              <button class="btn-secondary" onclick="App.openAuditoriaFechaModal(${p.id})">📅 Auditar</button>
              <button class="btn-danger" onclick="App.deleteProyecto(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---------------------------------------------------------------------------
  // FICHA COMPLETA Y DETALLE DE PROYECTO (CON INFORMES INDIVIDUALES Y BOTÓN X)
  // ---------------------------------------------------------------------------
  openDetalleProyecto(proyectoId) {
    const p = DB.data.proyectos.find(item => item.id === proyectoId);
    if (!p) return;

    const inv = DB.data.usuarios.find(u => u.id === p.investigador_id);
    const status = KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega);
    const dev = KPIEngine.calculateTimeDeviation(p);
    const apps = DB.data.aplicaciones.filter(a => a.proyecto_id === proyectoId);

    document.getElementById('dp-codigo-title').innerText = `[${p.codigo}] ${p.nombre}`;
    document.getElementById('dp-cliente-sub').innerText = `Cliente: ${p.cliente || 'Interno / Alsec IDD'}`;
    
    document.getElementById('dp-semaforo-badge').innerHTML = `
      <span class="badge-traffic ${status.toLowerCase()}" style="font-size:13px; padding:6px 14px;">
        <span class="traffic-dot"></span> ESTADO OTD: ${status}
      </span>
    `;

    document.getElementById('dp-categoria').innerText = p.categoria;
    document.getElementById('dp-marca').innerText = p.marca_linea;
    document.getElementById('dp-modelo').innerText = p.modelo_negocio;
    document.getElementById('dp-tecnologia').innerText = p.tecnologia;
    document.getElementById('dp-cc').innerText = p.centro_costo;

    document.getElementById('dp-etapa').innerText = p.etapa_actual;
    document.getElementById('dp-investigador').innerText = inv ? inv.nombre : 'Sin Asignar';
    document.getElementById('dp-dias-est').innerText = `${dev.diasEstimados} días`;
    document.getElementById('dp-dias-reales').innerText = `${dev.diasReales} días`;
    document.getElementById('dp-desviacion').innerText = `${dev.desviacionDias} días (${dev.porcentajeDesviacion}%)`;

    // 6 Fechas Estándar
    document.getElementById('dp-f-solicitud').innerText = p.fecha_solicitud || 'N/A';
    document.getElementById('dp-f-inicio').innerText = p.fecha_real_inicio || 'N/A';
    document.getElementById('dp-f-reasignacion').innerText = p.fecha_reasignacion || 'Ninguna';
    document.getElementById('dp-f-compromiso').innerText = p.fecha_compromiso || 'N/A';
    document.getElementById('dp-f-entrega').innerText = p.fecha_real_entrega || 'En desarrollo';
    document.getElementById('dp-f-cierre').innerText = p.fecha_cierre || 'Abierto';

    // Aplicaciones vinculadas (1:N)
    const tblApps = document.getElementById('tbl-dp-aplicaciones');
    if (apps.length === 0) {
      tblApps.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No hay aplicaciones secundarias vinculadas a este proyecto.</td></tr>';
    } else {
      tblApps.innerHTML = apps.map(a => `
        <tr>
          <td><strong>${a.codigo}</strong></td>
          <td>${a.nombre_solicitud}</td>
          <td>${a.cliente}</td>
          <td>${a.fecha_compromiso}</td>
          <td><span class="badge-etapa">${a.estado}</span></td>
        </tr>
      `).join('');
    }

    // Configurar botones de exportación individual
    document.getElementById('btn-dp-export-excel').onclick = () => ReportEngine.exportSingleProyectoExcel(proyectoId);
    document.getElementById('btn-dp-export-pdf').onclick = () => ReportEngine.exportSingleProyectoPDF(proyectoId);

    this.openModal('modal-detalle-proyecto');
  },

  openModalProyecto(id = null) {
    document.getElementById('p-id').value = id || '';
    if (id) {
      const p = DB.data.proyectos.find(item => item.id === id);
      if (!p) return;
      document.getElementById('modal-proyecto-title').innerText = 'Editar Proyecto IDD';
      document.getElementById('p-nombre').value = p.nombre;
      document.getElementById('p-categoria').value = p.categoria;
      document.getElementById('p-marca').value = p.marca_linea;
      document.getElementById('p-modelo').value = p.modelo_negocio;
      document.getElementById('p-tecnologia').value = p.tecnologia;
      document.getElementById('p-cc').value = p.centro_costo;
      document.getElementById('p-etapa').value = p.etapa_actual;
      document.getElementById('p-investigador').value = p.investigador_id;
      document.getElementById('p-fecha-compromiso').value = p.fecha_compromiso;
    } else {
      document.getElementById('modal-proyecto-title').innerText = 'Crear Nuevo Proyecto IDD';
      document.getElementById('p-nombre').value = '';
      document.getElementById('p-fecha-compromiso').value = '2026-08-30';
    }
    this.openModal('modal-proyecto');
  },

  saveProyectoForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('p-id').value);
    const data = {
      nombre: document.getElementById('p-nombre').value,
      categoria: document.getElementById('p-categoria').value,
      marca_linea: document.getElementById('p-marca').value,
      modelo_negocio: document.getElementById('p-modelo').value,
      tecnologia: document.getElementById('p-tecnologia').value,
      centro_costo: document.getElementById('p-cc').value,
      etapa_actual: document.getElementById('p-etapa').value,
      investigador_id: parseInt(document.getElementById('p-investigador').value),
      fecha_compromiso: document.getElementById('p-fecha-compromiso').value
    };

    if (id) DB.updateProject(id, data);
    else {
      data.fecha_solicitud = '2026-07-28';
      data.fecha_real_inicio = '2026-07-28';
      data.cliente = 'Cliente Solicitante';
      DB.addProject(data);
    }

    this.closeModal('modal-proyecto');
    this.renderAll();
  },

  deleteProyecto(id) {
    if (confirm('¿Eliminar proyecto y sus aplicaciones vinculadas?')) {
      DB.deleteProject(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 2: APLICACIONES
  // ---------------------------------------------------------------------------
  renderAplicacionesModule() {
    const apps = DB.data.aplicaciones;
    const tbody = document.getElementById('tbl-aplicaciones-body');

    tbody.innerHTML = apps.map(a => {
      const status = KPIEngine.getTrafficLightStatus(a.fecha_compromiso, a.fecha_real_entrega);
      const prj = DB.data.proyectos.find(p => p.id === a.proyecto_id);
      return `
        <tr>
          <td><span class="badge-traffic ${status.toLowerCase()}"><span class="traffic-dot"></span> ${status}</span></td>
          <td><strong>${a.codigo}</strong></td>
          <td>${prj ? `<a style="color:#93c5fd; font-weight:bold; cursor:pointer;" onclick="App.openDetalleProyecto(${prj.id})">${prj.nombre}</a>` : 'N/A'}</td>
          <td>${a.nombre_solicitud}</td>
          <td>${a.cliente}</td>
          <td>${a.fecha_compromiso}</td>
          <td>${a.fecha_real_entrega || 'Pendiente'}</td>
          <td><span class="badge-etapa">${a.estado}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalAplicacion(${a.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteAplicacion(${a.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  populateProjectSelect(selectId, selectedValue = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = DB.data.proyectos.map(p => 
      `<option value="${p.id}" ${selectedValue == p.id ? 'selected' : ''}>[${p.codigo}] ${p.nombre}</option>`
    ).join('');
  },

  openModalAplicacion(id = null) {
    document.getElementById('app-id').value = id || '';
    this.populateProjectSelect('app-proyecto-id');

    if (id) {
      const app = DB.data.aplicaciones.find(a => a.id === id);
      if (!app) return;
      document.getElementById('modal-aplicacion-title').innerText = 'Editar Aplicación';
      document.getElementById('app-proyecto-id').value = app.proyecto_id;
      document.getElementById('app-nombre').value = app.nombre_solicitud;
      document.getElementById('app-cliente').value = app.cliente;
      document.getElementById('app-fecha-solicitud').value = app.fecha_solicitud;
      document.getElementById('app-fecha-compromiso').value = app.fecha_compromiso;
      document.getElementById('app-estado').value = app.estado;
    } else {
      document.getElementById('modal-aplicacion-title').innerText = 'Crear Nueva Aplicación';
      document.getElementById('app-nombre').value = '';
      document.getElementById('app-cliente').value = '';
    }
    this.openModal('modal-aplicacion');
  },

  saveAplicacionForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('app-id').value);
    const data = {
      proyecto_id: parseInt(document.getElementById('app-proyecto-id').value),
      nombre_solicitud: document.getElementById('app-nombre').value,
      cliente: document.getElementById('app-cliente').value,
      fecha_solicitud: document.getElementById('app-fecha-solicitud').value,
      fecha_compromiso: document.getElementById('app-fecha-compromiso').value,
      estado: document.getElementById('app-estado').value
    };

    if (id) DB.updateAplicacion(id, data);
    else DB.addAplicacion(data);

    this.closeModal('modal-aplicacion');
    this.renderAll();
  },

  deleteAplicacion(id) {
    if (confirm('¿Eliminar aplicación?')) {
      DB.deleteAplicacion(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 3: ASISTENCIA TÉCNICA
  // ---------------------------------------------------------------------------
  renderAsistenciaModule() {
    const list = DB.data.asistencias_tecnicas;
    const tbody = document.getElementById('tbl-asistencia-body');

    tbody.innerHTML = list.map(a => {
      const status = KPIEngine.getTrafficLightStatus(a.fecha_compromiso, a.fecha_real_entrega);
      const prj = DB.data.proyectos.find(p => p.id === a.proyecto_id);
      const inv = DB.data.usuarios.find(u => u.id === a.investigador_id);
      return `
        <tr>
          <td><span class="badge-traffic ${status.toLowerCase()}"><span class="traffic-dot"></span> ${status}</span></td>
          <td><strong>${a.codigo}</strong></td>
          <td>${prj ? `<a style="color:#93c5fd; font-weight:bold; cursor:pointer;" onclick="App.openDetalleProyecto(${prj.id})">${prj.codigo}</a>` : '<em>Aislada</em>'}</td>
          <td>${a.comercial_solicitante}</td>
          <td>${inv ? inv.nombre : 'Sin asignar'}</td>
          <td>${a.descripcion}</td>
          <td><strong>${a.horas_invertidas} hrs</strong></td>
          <td>${a.fecha_compromiso}</td>
          <td><span class="badge-etapa">${a.estado}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalAsistencia(${a.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteAsistencia(${a.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openModalAsistencia(id = null) {
    document.getElementById('ast-id').value = id || '';
    const sel = document.getElementById('ast-proyecto-id');
    sel.innerHTML = '<option value="">-- Asistencia Aislada (Sin Proyecto) --</option>' + 
      DB.data.proyectos.map(p => `<option value="${p.id}">[${p.codigo}] ${p.nombre}</option>`).join('');

    if (id) {
      const ast = DB.data.asistencias_tecnicas.find(a => a.id === id);
      if (!ast) return;
      document.getElementById('modal-asistencia-title').innerText = 'Editar Asistencia Técnica';
      document.getElementById('ast-proyecto-id').value = ast.proyecto_id || '';
      document.getElementById('ast-comercial').value = ast.comercial_solicitante;
      document.getElementById('ast-investigador-id').value = ast.investigador_id;
      document.getElementById('ast-horas').value = ast.horas_invertidas;
      document.getElementById('ast-descripcion').value = ast.descripcion;
      document.getElementById('ast-fecha-compromiso').value = ast.fecha_compromiso;
      document.getElementById('ast-estado').value = ast.estado;
    } else {
      document.getElementById('modal-asistencia-title').innerText = 'Crear Asistencia Técnica';
      document.getElementById('ast-descripcion').value = '';
    }
    this.openModal('modal-asistencia');
  },

  saveAsistenciaForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('ast-id').value);
    const prjVal = document.getElementById('ast-proyecto-id').value;
    const data = {
      proyecto_id: prjVal ? parseInt(prjVal) : null,
      comercial_solicitante: document.getElementById('ast-comercial').value,
      investigador_id: parseInt(document.getElementById('ast-investigador-id').value),
      horas_invertidas: parseFloat(document.getElementById('ast-horas').value),
      descripcion: document.getElementById('ast-descripcion').value,
      fecha_solicitud: '2026-07-28',
      fecha_compromiso: document.getElementById('ast-fecha-compromiso').value,
      estado: document.getElementById('ast-estado').value
    };

    if (id) DB.updateAsistencia(id, data);
    else DB.addAsistencia(data);

    this.closeModal('modal-asistencia');
    this.renderAll();
  },

  deleteAsistencia(id) {
    if (confirm('¿Eliminar registro de asistencia técnica?')) {
      DB.deleteAsistencia(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 4: CAPACIDAD DEL PROCESO / TIME-TRACKING
  // ---------------------------------------------------------------------------
  renderCapacidadModule() {
    const records = DB.data.time_tracking;
    const usuarios = DB.data.usuarios;
    const summary = KPIEngine.calculateCapacitySummary(records, usuarios);

    document.getElementById('chart-categorias-container').innerHTML = Object.entries(summary.porCategoria).map(([cat, hrs]) => {
      const pct = summary.totalHoras > 0 ? ((hrs / summary.totalHoras) * 100).toFixed(1) : 0;
      return `<div style="margin-bottom: 8px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;"><span>${cat}</span><span><strong>${hrs} hrs</strong> (${pct}%)</span></div><div style="background: rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;"><div style="background: var(--primary); width:${pct}%; height:100%;"></div></div></div>`;
    }).join('');

    document.getElementById('chart-roles-container').innerHTML = Object.entries(summary.porRol).map(([rol, hrs]) => {
      const pct = summary.totalHoras > 0 ? ((hrs / summary.totalHoras) * 100).toFixed(1) : 0;
      return `<div style="margin-bottom: 8px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;"><span>${rol}</span><span><strong>${hrs} hrs</strong> (${pct}%)</span></div><div style="background: rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;"><div style="background: var(--accent-cyan); width:${pct}%; height:100%;"></div></div></div>`;
    }).join('');

    const tbody = document.getElementById('tbl-timetracking-body');
    tbody.innerHTML = records.map(r => {
      const u = usuarios.find(usr => usr.id === r.investigador_id);
      return `
        <tr>
          <td>${r.fecha}</td>
          <td><strong>${u ? u.nombre : 'N/A'}</strong><div style="font-size:11px; color:var(--text-muted);">${u ? u.rol : ''}</div></td>
          <td>${r.hora_inicio} - ${r.hora_fin}</td>
          <td><strong>${r.horas} hrs</strong></td>
          <td><span class="badge-etapa">${r.categoria}</span></td>
          <td>${r.subcategoria}</td>
          <td>${r.descripcion}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalTimeTracking(${r.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteTimeTracking(${r.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openModalTimeTracking(id = null) {
    document.getElementById('tt-id').value = id || '';

    if (id) {
      const rec = DB.data.time_tracking.find(t => t.id === id);
      if (!rec) return;
      document.getElementById('modal-timetracking-title').innerText = 'Editar Registro Time-Tracking';
      document.getElementById('tt-investigador').value = rec.investigador_id;
      document.getElementById('tt-fecha').value = rec.fecha;
      document.getElementById('tt-hora-inicio').value = rec.hora_inicio;
      document.getElementById('tt-hora-fin').value = rec.hora_fin;
      document.getElementById('tt-categoria').value = rec.categoria;
      document.getElementById('tt-subcategoria').value = rec.subcategoria;
      document.getElementById('tt-descripcion').value = rec.descripcion;
    } else {
      document.getElementById('modal-timetracking-title').innerText = 'Crear Registro Time-Tracking Hora a Hora';
      document.getElementById('tt-descripcion').value = '';
    }
    this.openModal('modal-timetracking');
  },

  saveTimeTrackingForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('tt-id').value);
    const data = {
      investigador_id: parseInt(document.getElementById('tt-investigador').value),
      fecha: document.getElementById('tt-fecha').value,
      hora_inicio: document.getElementById('tt-hora-inicio').value,
      hora_fin: document.getElementById('tt-hora-fin').value,
      horas: 2.0,
      categoria: document.getElementById('tt-categoria').value,
      subcategoria: document.getElementById('tt-subcategoria').value,
      descripcion: document.getElementById('tt-descripcion').value
    };

    if (id) DB.updateTimeTrackingRecord(id, data);
    else DB.addTimeTrackingRecord(data);

    this.closeModal('modal-timetracking');
    this.renderAll();
  },

  deleteTimeTracking(id) {
    if (confirm('¿Eliminar registro de tiempo?')) {
      DB.deleteTimeTrackingRecord(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 5: CAPACITACIONES
  // ---------------------------------------------------------------------------
  renderCapacitacionesModule() {
    const list = DB.data.capacitaciones;
    const tbody = document.getElementById('tbl-capacitaciones-body');

    tbody.innerHTML = list.map(c => {
      const u = DB.data.usuarios.find(usr => usr.id === c.investigador_id);
      return `
        <tr>
          <td><strong>${u ? u.nombre : 'N/A'}</strong></td>
          <td>${u ? u.rol : 'N/A'}</td>
          <td><span class="badge-etapa">${c.tipo}</span></td>
          <td>${c.tema}</td>
          <td>${c.fecha}</td>
          <td><strong>${c.horas} hrs</strong></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalCapacitacion(${c.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteCapacitacion(${c.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openModalCapacitacion(id = null) {
    document.getElementById('cap-id').value = id || '';

    if (id) {
      const cap = DB.data.capacitaciones.find(c => c.id === id);
      if (!cap) return;
      document.getElementById('modal-capacitacion-title').innerText = 'Editar Capacitación';
      document.getElementById('cap-investigador-id').value = cap.investigador_id;
      document.getElementById('cap-tipo').value = cap.tipo;
      document.getElementById('cap-tema').value = cap.tema;
      document.getElementById('cap-fecha').value = cap.fecha;
      document.getElementById('cap-horas').value = cap.horas;
    } else {
      document.getElementById('modal-capacitacion-title').innerText = 'Crear Capacitación Técnica';
      document.getElementById('cap-tema').value = '';
    }
    this.openModal('modal-capacitacion');
  },

  saveCapacitacionForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('cap-id').value);
    const data = {
      investigador_id: parseInt(document.getElementById('cap-investigador-id').value),
      tipo: document.getElementById('cap-tipo').value,
      tema: document.getElementById('cap-tema').value,
      fecha: document.getElementById('cap-fecha').value,
      horas: parseFloat(document.getElementById('cap-horas').value)
    };

    if (id) DB.updateCapacitacion(id, data);
    else DB.addCapacitacion(data);

    this.closeModal('modal-capacitacion');
    this.renderAll();
  },

  deleteCapacitacion(id) {
    if (confirm('¿Eliminar capacitación?')) {
      DB.deleteCapacitacion(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 6: HOMOLOGACIONES, EFICIENCIAS Y PRESUPUESTO
  // ---------------------------------------------------------------------------
  renderHomologacionesModule() {
    document.getElementById('tbl-presupuesto-body').innerHTML = DB.data.presupuesto.map(p => {
      const pct = ((p.gasto_real / p.asignado) * 100).toFixed(1);
      return `
        <tr>
          <td><strong>${p.nombre}</strong></td>
          <td>$${p.asignado.toLocaleString('es-CO')}</td>
          <td>$${p.gasto_real.toLocaleString('es-CO')}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:600;">${pct}%</span>
              <div style="background: rgba(255,255,255,0.1); width:100px; height:6px; border-radius:3px; overflow:hidden;">
                <div style="background:${pct > 90 ? 'var(--traffic-red)' : 'var(--primary)'}; width:${Math.min(pct, 100)}%; height:100%;"></div>
              </div>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalPresupuesto(${p.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deletePresupuesto(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('tbl-eficiencias-body').innerHTML = DB.data.eficiencias.map(e => {
      const status = KPIEngine.getTrafficLightStatus(e.fecha_compromiso, e.fecha_real_entrega);
      const inc = KPIEngine.calculateEfficiencyIncrease(e.valor_actual, e.valor_nuevo);
      return `
        <tr>
          <td><span class="badge-traffic ${status.toLowerCase()}"><span class="traffic-dot"></span> ${status}</span></td>
          <td><strong>${e.codigo}</strong></td>
          <td>${e.nombre_optimizacion}</td>
          <td><span class="badge-etapa">${e.centro_costo}</span></td>
          <td>${e.valor_actual} ${e.unidad_medida}</td>
          <td>${e.valor_nuevo} ${e.unidad_medida}</td>
          <td><strong style="color:var(--traffic-green);">+${inc}%</strong></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalEficiencia(${e.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteEficiencia(${e.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('tbl-homologaciones-body').innerHTML = DB.data.homologaciones.map(h => {
      const status = KPIEngine.getTrafficLightStatus(h.fecha_compromiso, h.fecha_real_entrega);
      return `
        <tr>
          <td><span class="badge-traffic ${status.toLowerCase()}"><span class="traffic-dot"></span> ${status}</span></td>
          <td><strong>${h.codigo}</strong></td>
          <td>${h.materia_prima}</td>
          <td>${h.proveedor}</td>
          <td><span class="badge-etapa">${h.centro_costo}</span></td>
          <td>${h.fecha_compromiso}</td>
          <td><span class="badge-etapa">${h.estado_prueba}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="App.openModalHomologacion(${h.id})">✏️ Editar</button>
              <button class="btn-danger" onclick="App.deleteHomologacion(${h.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openModalHomologacion(id = null) {
    document.getElementById('hom-id').value = id || '';
    if (id) {
      const h = DB.data.homologaciones.find(item => item.id === id);
      if (!h) return;
      document.getElementById('modal-homologacion-title').innerText = 'Editar Homologación';
      document.getElementById('hom-materia').value = h.materia_prima;
      document.getElementById('hom-proveedor').value = h.proveedor;
      document.getElementById('hom-cc').value = h.centro_costo;
      document.getElementById('hom-fecha-compromiso').value = h.fecha_compromiso;
      document.getElementById('hom-estado').value = h.estado_prueba;
    } else {
      document.getElementById('modal-homologacion-title').innerText = 'Crear Homologación';
      document.getElementById('hom-materia').value = '';
      document.getElementById('hom-proveedor').value = '';
    }
    this.openModal('modal-homologacion');
  },

  saveHomologacionForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('hom-id').value);
    const data = {
      materia_prima: document.getElementById('hom-materia').value,
      proveedor: document.getElementById('hom-proveedor').value,
      centro_costo: document.getElementById('hom-cc').value,
      fecha_solicitud: '2026-07-28',
      fecha_compromiso: document.getElementById('hom-fecha-compromiso').value,
      estado_prueba: document.getElementById('hom-estado').value
    };

    if (id) DB.updateHomologacion(id, data);
    else DB.addHomologacion(data);

    this.closeModal('modal-homologacion');
    this.renderAll();
  },

  deleteHomologacion(id) {
    if (confirm('¿Eliminar homologación?')) {
      DB.deleteHomologacion(id);
      this.renderAll();
    }
  },

  openModalEficiencia(id = null) {
    document.getElementById('efi-id').value = id || '';
    if (id) {
      const e = DB.data.eficiencias.find(item => item.id === id);
      if (!e) return;
      document.getElementById('modal-eficiencia-title').innerText = 'Editar Proyecto Eficiencia';
      document.getElementById('efi-nombre').value = e.nombre_optimizacion;
      document.getElementById('efi-cc').value = e.centro_costo;
      document.getElementById('efi-unidad').value = e.unidad_medida;
      document.getElementById('efi-valor-actual').value = e.valor_actual;
      document.getElementById('efi-valor-nuevo').value = e.valor_nuevo;
      document.getElementById('efi-fecha-compromiso').value = e.fecha_compromiso;
    } else {
      document.getElementById('modal-eficiencia-title').innerText = 'Crear Proyecto Eficiencia';
      document.getElementById('efi-nombre').value = '';
    }
    this.openModal('modal-eficiencia');
  },

  saveEficienciaForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('efi-id').value);
    const data = {
      nombre_optimizacion: document.getElementById('efi-nombre').value,
      centro_costo: document.getElementById('efi-cc').value,
      unidad_medida: document.getElementById('efi-unidad').value,
      valor_actual: parseFloat(document.getElementById('efi-valor-actual').value),
      valor_nuevo: parseFloat(document.getElementById('efi-valor-nuevo').value),
      fecha_solicitud: '2026-07-28',
      fecha_compromiso: document.getElementById('efi-fecha-compromiso').value
    };

    if (id) DB.updateEficiencia(id, data);
    else DB.addEficiencia(data);

    this.closeModal('modal-eficiencia');
    this.renderAll();
  },

  deleteEficiencia(id) {
    if (confirm('¿Eliminar proyecto de eficiencia?')) {
      DB.deleteEficiencia(id);
      this.renderAll();
    }
  },

  openModalPresupuesto(id = null) {
    document.getElementById('pre-id').value = id || '';
    if (id) {
      const p = DB.data.presupuesto.find(item => item.id === id);
      if (!p) return;
      document.getElementById('modal-presupuesto-title').innerText = 'Editar Presupuesto CC';
      document.getElementById('pre-cc').value = p.centro_costo;
      document.getElementById('pre-anio').value = p.anio;
      document.getElementById('pre-asignado').value = p.asignado;
      document.getElementById('pre-gasto').value = p.gasto_real;
    } else {
      document.getElementById('modal-presupuesto-title').innerText = 'Configurar Presupuesto por CC';
    }
    this.openModal('modal-presupuesto');
  },

  savePresupuestoForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('pre-id').value);
    const cc = document.getElementById('pre-cc').value;
    const data = {
      centro_costo: cc,
      nombre: `${cc} (${cc === '551' ? 'Aplicaciones' : cc === '561' ? 'Desarrollos' : cc === '571' ? 'Investigación' : cc === '584' ? 'Proyecto Orquídeas' : cc === '591' ? 'Nutrición Avanzada' : 'Homologación'})`,
      anio: parseInt(document.getElementById('pre-anio').value),
      asignado: parseFloat(document.getElementById('pre-asignado').value),
      gasto_real: parseFloat(document.getElementById('pre-gasto').value)
    };

    if (id) DB.updatePresupuesto(id, data);
    else DB.addPresupuesto(data);

    this.closeModal('modal-presupuesto');
    this.renderAll();
  },

  deletePresupuesto(id) {
    if (confirm('¿Eliminar presupuesto de CC?')) {
      DB.deletePresupuesto(id);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // MÓDULO 7: CATÁLOGOS (INVESTIGADORES & ROLES, LÍNEAS/MARCAS)
  // ---------------------------------------------------------------------------
  renderCatalogosModule() {
    const usuarios = DB.getUsuarios();
    document.getElementById('tbl-usuarios-body').innerHTML = usuarios.map(u => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td><div style="font-weight:600;">${u.nombre}</div></td>
        <td>${u.email}</td>
        <td><span class="badge-etapa" style="background:rgba(99,102,241,0.2); color:#a5f3fc;">${u.rol}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="App.openModalUsuario(${u.id})">✏️ Editar</button>
            <button class="btn-danger" onclick="App.deleteUsuario(${u.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    const lineas = DB.getLineas();
    document.getElementById('tbl-lineas-body').innerHTML = lineas.map((l, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td><div style="font-weight:600; color:#fff;">${l}</div></td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" onclick="App.openModalLinea('${l}')">✏️ Editar</button>
            <button class="btn-danger" onclick="App.deleteLinea('${l}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  openModalUsuario(id = null) {
    document.getElementById('u-id').value = id || '';
    if (id) {
      const u = DB.data.usuarios.find(item => item.id === id);
      if (!u) return;
      document.getElementById('modal-usuario-title').innerText = 'Editar Investigador / Rol';
      document.getElementById('u-nombre').value = u.nombre;
      document.getElementById('u-email').value = u.email;
      document.getElementById('u-rol').value = u.rol;
    } else {
      document.getElementById('modal-usuario-title').innerText = 'Crear Nuevo Investigador / Usuario';
      document.getElementById('u-nombre').value = '';
      document.getElementById('u-email').value = '';
    }
    this.openModal('modal-usuario');
  },

  saveUsuarioForm(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('u-id').value);
    const data = {
      nombre: document.getElementById('u-nombre').value,
      email: document.getElementById('u-email').value,
      rol: document.getElementById('u-rol').value
    };

    if (id) DB.updateUsuario(id, data);
    else DB.addUsuario(data);

    this.closeModal('modal-usuario');
    this.renderAll();
  },

  deleteUsuario(id) {
    if (confirm('¿Eliminar investigador / usuario del sistema?')) {
      DB.deleteUsuario(id);
      this.renderAll();
    }
  },

  openModalLinea(oldName = null) {
    document.getElementById('l-old-name').value = oldName || '';
    if (oldName) {
      document.getElementById('modal-linea-title').innerText = 'Editar Línea / Marca';
      document.getElementById('l-nombre').value = oldName;
    } else {
      document.getElementById('modal-linea-title').innerText = 'Crear Nueva Línea / Marca';
      document.getElementById('l-nombre').value = '';
    }
    this.openModal('modal-linea');
  },

  saveLineaForm(e) {
    e.preventDefault();
    const oldName = document.getElementById('l-old-name').value;
    const newName = document.getElementById('l-nombre').value;

    if (oldName) {
      DB.updateLinea(oldName, newName);
    } else {
      DB.addLinea(newName);
    }

    this.closeModal('modal-linea');
    this.renderAll();
  },

  deleteLinea(nombre) {
    if (confirm(`¿Eliminar la línea/marca "${nombre}"?`)) {
      DB.deleteLinea(nombre);
      this.renderAll();
    }
  },

  // ---------------------------------------------------------------------------
  // AUDITORÍA Y UTILS
  // ---------------------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  openAuditoriaFechaModal(proyectoId) {
    const prj = DB.data.proyectos.find(p => p.id === proyectoId);
    if (!prj) return;
    document.getElementById('af-proyecto-id').value = prj.id;
    document.getElementById('af-nueva-fecha').value = prj.fecha_compromiso;
    document.getElementById('af-justificacion').value = '';
    this.openModal('modal-auditoria-fecha');
  },

  saveAuditoriaFecha(e) {
    e.preventDefault();
    const prjId = parseInt(document.getElementById('af-proyecto-id').value);
    const nuevaFecha = document.getElementById('af-nueva-fecha').value;
    const justificacion = document.getElementById('af-justificacion').value;

    DB.updateProjectFechaCompromiso(prjId, nuevaFecha, justificacion, 'Líder IDD');
    this.closeModal('modal-auditoria-fecha');
    this.renderAll();
  },

  async loadSQLSchemaText() {
    try {
      const res = await fetch('schema.sql');
      const text = await res.text();
      document.getElementById('sql-schema-display').innerText = text;
    } catch (e) {
      document.getElementById('sql-schema-display').innerText = '-- Consulte el archivo schema.sql en el servidor.';
    }
  },

  downloadSQLSchema() {
    const content = document.getElementById('sql-schema-display').innerText;
    const blob = new Blob([content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
