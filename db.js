/**
 * Base de datos reactiva y almacenamiento persistente (db.js)
 * Sistema Integrado IDD - PDR V2 (Con CRUD de Catálogos: Investigadores & Líneas/Marcas)
 */

const STORAGE_KEY = 'IDD_SYSTEM_DATABASE_V2';

const initialDatabase = {
  usuarios: [
    { id: 1, nombre: 'Dra. María Elena Gómez', email: 'mgomez@alsec.com', rol: 'Director IDD' },
    { id: 2, nombre: 'Ing. Carlos Rodríguez', email: 'crodriguez@alsec.com', rol: 'Líder IDD' },
    { id: 3, nombre: 'Ing. Laura Restrepo', email: 'lrestrepo@alsec.com', rol: 'Líder Técnica' },
    { id: 4, nombre: 'Ing. Andrés Jaramillo', email: 'ajaramillo@alsec.com', rol: 'Asistente IDD' },
    { id: 5, nombre: 'Lic. Sofia Morales', email: 'smorales@alsec.com', rol: 'Proceso Comercial / Asesor' }
  ],

  lineas: [
    'Alimento Nutricional',
    'Be-Balance',
    'Food Service',
    'Industrial',
    'Marca Blanca',
    'Nutricure',
    'Zeto'
  ],

  proyectos: [
    {
      id: 101,
      codigo: 'PRJ-2026-001',
      nombre: 'Microencapsulación de Omega-3 de Alta Concentración',
      categoria: 'Desarrollo',
      marca_linea: 'Nutricure',
      modelo_negocio: 'Soluciones B2B_Nacional-Polvo',
      tecnologia: 'Secado por Aspersión y Microencapsulación',
      centro_costo: '561',
      etapa_actual: 'En Desarrollo (Laboratorio)',
      fecha_solicitud: '2026-06-01',
      fecha_real_inicio: '2026-06-05',
      fecha_reasignacion: null,
      fecha_compromiso: '2026-08-15',
      fecha_real_entrega: null,
      fecha_cierre: null,
      cliente: 'NutriSalud S.A.',
      causal_cierre: null,
      ventas_estimadas: 450000000,
      ventas_reales: 0,
      investigador_id: 2
    },
    {
      id: 102,
      codigo: 'PRJ-2026-002',
      nombre: 'Bebida Funcional UHT Proteica Be-Balance',
      categoria: 'Desarrollo',
      marca_linea: 'Be-Balance',
      modelo_negocio: 'Productos B2C - Líquido',
      tecnologia: 'Tratamiento Térmico UHT',
      centro_costo: '561',
      etapa_actual: 'En Evaluación / Enviado a Cliente',
      fecha_solicitud: '2026-04-10',
      fecha_real_inicio: '2026-04-15',
      fecha_reasignacion: null,
      fecha_compromiso: '2026-07-20',
      fecha_real_entrega: '2026-07-18',
      fecha_cierre: null,
      cliente: 'Distribuidora Global Nutrición',
      causal_cierre: null,
      ventas_estimadas: 820000000,
      ventas_reales: 0,
      investigador_id: 3
    },
    {
      id: 103,
      codigo: 'PRJ-2026-003',
      nombre: 'Extracción Enzimática de Péptidos Bioactivos',
      categoria: 'Investigación',
      marca_linea: 'Alimento Nutricional',
      modelo_negocio: 'Alsec Revolution (Innovación Disruptiva)',
      tecnologia: 'Hidrólisis Enzimática',
      centro_costo: '571',
      etapa_actual: 'Prueba Piloto / Escalamiento',
      fecha_solicitud: '2026-02-15',
      fecha_real_inicio: '2026-03-01',
      fecha_reasignacion: null,
      fecha_compromiso: '2026-07-30',
      fecha_real_entrega: null,
      fecha_cierre: null,
      cliente: 'Alsec Internal Research',
      causal_cierre: null,
      ventas_estimadas: 1200000000,
      ventas_reales: 0,
      investigador_id: 1
    },
    {
      id: 104,
      codigo: 'PRJ-2026-004',
      nombre: 'Queso Análogo Retortable Industrial',
      categoria: 'Desarrollo',
      marca_linea: 'Food Service',
      modelo_negocio: 'Crisol-Ingrediente a la Medida',
      tecnologia: 'Procesamiento Retortable (Esterilización)',
      centro_costo: '551',
      etapa_actual: 'Éxito / Aprobado',
      fecha_solicitud: '2026-01-10',
      fecha_real_inicio: '2026-01-15',
      fecha_reasignacion: null,
      fecha_compromiso: '2026-05-30',
      fecha_real_entrega: '2026-05-25',
      fecha_cierre: '2026-06-05',
      cliente: 'Comestibles del Valle',
      causal_cierre: 'Ganado / Compran (Facturando)',
      ventas_estimadas: 350000000,
      ventas_reales: 380000000,
      investigador_id: 2
    },
    {
      id: 105,
      codigo: 'PRJ-2026-005',
      nombre: 'Estabilización de Probióticos por Liofilización Moonshot',
      categoria: 'Moonshot',
      marca_linea: 'Zeto',
      modelo_negocio: 'Alsec Revolution (Innovación Disruptiva)',
      tecnologia: 'Biotecnología',
      centro_costo: '584',
      etapa_actual: 'Stand By / En Espera',
      fecha_solicitud: '2026-03-01',
      fecha_real_inicio: '2026-03-10',
      fecha_reasignacion: '2026-05-10',
      fecha_compromiso: '2026-07-25',
      fecha_real_entrega: null,
      fecha_cierre: null,
      cliente: 'Proyecto Orquídeas Taskforce',
      causal_cierre: null,
      ventas_estimadas: 2500000000,
      ventas_reales: 0,
      investigador_id: 3
    },
    {
      id: 106,
      codigo: 'PRJ-2026-006',
      nombre: 'Homologación Maltodextrina Orgánica Proveedor B',
      categoria: 'Desarrollo',
      marca_linea: 'Marca Blanca',
      modelo_negocio: 'Aplicación / Soporte Técnico',
      tecnologia: 'Mezclado (Dry Blend / Blending)',
      centro_costo: '144',
      etapa_actual: 'En Documentación',
      fecha_solicitud: '2026-06-15',
      fecha_real_inicio: '2026-06-20',
      fecha_reasignacion: null,
      fecha_compromiso: '2026-07-27',
      fecha_real_entrega: null,
      fecha_cierre: null,
      cliente: 'Operaciones Internas',
      causal_cierre: null,
      ventas_estimadas: 0,
      ventas_reales: 0,
      investigador_id: 4
    }
  ],

  auditoria_fechas: [
    {
      id: 1,
      proyecto_id: 105,
      fecha_anterior: '2026-06-30',
      fecha_nueva: '2026-07-25',
      justificacion: 'Reformulación de soporte de matriz debido a pruebas preliminares de viabilidad.',
      usuario: 'Ing. Carlos Rodríguez',
      timestamp: '2026-05-10 14:30:00'
    }
  ],

  aplicaciones: [
    {
      id: 201,
      codigo: 'APP-2026-01',
      proyecto_id: 102,
      nombre_solicitud: 'Prueba de Solubilidad en Frío Bebida Be-Balance',
      cliente: 'Distribuidora Global Nutrición',
      fecha_solicitud: '2026-06-10',
      fecha_compromiso: '2026-07-25',
      fecha_real_entrega: '2026-07-24',
      estado: 'Completada a Tiempo',
      observaciones: 'Percepción organoléptica favorable.'
    },
    {
      id: 202,
      codigo: 'APP-2026-02',
      proyecto_id: 101,
      nombre_solicitud: 'Evaluación de Rendimiento en Mezcla Seca',
      cliente: 'NutriSalud S.A.',
      fecha_solicitud: '2026-07-01',
      fecha_compromiso: '2026-07-29',
      fecha_real_entrega: null,
      estado: 'Activa',
      observaciones: 'Próxima a vencer.'
    },
    {
      id: 203,
      codigo: 'APP-2026-03',
      proyecto_id: 104,
      nombre_solicitud: 'Ensayo de Viscosidad en Salsa Retortable',
      cliente: 'Comestibles del Valle',
      fecha_solicitud: '2026-05-01',
      fecha_compromiso: '2026-05-20',
      fecha_real_entrega: '2026-05-18',
      estado: 'Completada a Tiempo',
      observaciones: 'Viscosidad óptima a 121°C.'
    }
  ],

  asistencias_tecnicas: [
    {
      id: 301,
      codigo: 'AST-2026-11',
      proyecto_id: 101,
      comercial_solicitante: 'Lic. Sofia Morales',
      investigador_id: 2,
      descripcion: 'Asesoría técnica presencial a NutriSalud sobre dosificación de Omega-3.',
      fecha_solicitud: '2026-07-05',
      fecha_compromiso: '2026-07-15',
      fecha_real_entrega: '2026-07-14',
      horas_invertidas: 12.5,
      estado: 'Atendida'
    },
    {
      id: 302,
      codigo: 'AST-2026-12',
      proyecto_id: null,
      comercial_solicitante: 'Lic. Sofia Morales',
      investigador_id: 3,
      descripcion: 'Revisión de ficha técnica y vida útil para cliente potencial B2B México.',
      fecha_solicitud: '2026-07-10',
      fecha_compromiso: '2026-07-27',
      fecha_real_entrega: '2026-07-28',
      horas_invertidas: 6.0,
      estado: 'Atendida'
    },
    {
      id: 303,
      codigo: 'AST-2026-13',
      proyecto_id: 102,
      comercial_solicitante: 'Lic. Sofia Morales',
      investigador_id: 4,
      descripcion: 'Acompañamiento a prueba piloto en planta de cliente.',
      fecha_solicitud: '2026-07-20',
      fecha_compromiso: '2026-08-05',
      fecha_real_entrega: null,
      horas_invertidas: 8.0,
      estado: 'En Proceso'
    }
  ],

  time_tracking: [
    {
      id: 401,
      investigador_id: 2,
      fecha: '2026-07-27',
      hora_inicio: '08:00',
      hora_fin: '10:00',
      horas: 2.0,
      categoria: 'SOPORTE DE VALOR',
      subcategoria: 'Asistencia Técnica Comercial',
      descripcion: 'Atención a consultas técnicas de dosificación con la comercial Sofia Morales.',
      proyecto_id: 101
    },
    {
      id: 402,
      investigador_id: 2,
      fecha: '2026-07-27',
      hora_inicio: '10:00',
      hora_fin: '13:00',
      horas: 3.0,
      categoria: 'CARGA OPERATIVA',
      subcategoria: 'Ensayos de Laboratorio',
      descripcion: 'Pruebas de secado por aspersión en planta piloto.',
      proyecto_id: 101
    },
    {
      id: 403,
      investigador_id: 2,
      fecha: '2026-07-27',
      hora_inicio: '14:00',
      hora_fin: '16:00',
      horas: 2.0,
      categoria: 'ESTRATEGIA',
      subcategoria: 'Comité Semanal IDD',
      descripcion: 'Revisión de avance de proyectos y asignación de capacidad.',
      proyecto_id: null
    },
    {
      id: 404,
      investigador_id: 3,
      fecha: '2026-07-27',
      hora_inicio: '08:00',
      hora_fin: '12:00',
      horas: 4.0,
      categoria: 'CARGA OPERATIVA',
      subcategoria: 'Documentación Técnica',
      descripcion: 'Elaboración de informe de estabilidad UHT.',
      proyecto_id: 102
    },
    {
      id: 405,
      investigador_id: 3,
      fecha: '2026-07-27',
      hora_inicio: '13:00',
      hora_fin: '15:00',
      horas: 2.0,
      categoria: 'SOPORTE DE VALOR',
      subcategoria: 'Capacitación Técnica Dictada',
      descripcion: 'Capacitación al equipo de laboratorio sobre UHT y Retortable.',
      proyecto_id: 102
    },
    {
      id: 406,
      investigador_id: 4,
      fecha: '2026-07-27',
      hora_inicio: '08:00',
      hora_fin: '12:00',
      horas: 4.0,
      categoria: 'CARGA OPERATIVA',
      subcategoria: 'Ensayos de Laboratorio',
      descripcion: 'Ejecución de mediciones de viscosidad y pH.',
      proyecto_id: 106
    },
    {
      id: 407,
      investigador_id: 4,
      fecha: '2026-07-27',
      hora_inicio: '13:00',
      hora_fin: '15:00',
      horas: 2.0,
      categoria: 'BIENESTAR Y CULTURA',
      subcategoria: 'Capacitación Técnica Recibida',
      descripcion: 'Asistencia al taller de reología y emulsiones.',
      proyecto_id: null
    }
  ],

  capacitaciones: [
    {
      id: 501,
      investigador_id: 3,
      tipo: 'Dictada',
      tema: 'Aseguramiento de Pruebas Piloto en Tratamiento UHT',
      fecha: '2026-07-27',
      horas: 2.0,
      proyecto_id: 102
    },
    {
      id: 502,
      investigador_id: 4,
      tipo: 'Recibida',
      tema: 'Taller de Reología Aplicada y Caracterización de Emulsiones',
      fecha: '2026-07-27',
      horas: 2.0,
      proyecto_id: null
    },
    {
      id: 503,
      investigador_id: 2,
      tipo: 'Recibida',
      tema: 'Seminario de Microencapsulación Nutracéutica Avanzada',
      fecha: '2026-06-15',
      horas: 8.0,
      proyecto_id: 101
    }
  ],

  homologaciones: [
    {
      id: 601,
      codigo: 'HOM-2026-01',
      proyecto_id: 106,
      materia_prima: 'Maltodextrina DE 10-15 Organic',
      proveedor: 'Ingredion Bio',
      centro_costo: '144',
      estado_prueba: 'En Evaluación/Prueba',
      fecha_solicitud: '2026-06-15',
      fecha_compromiso: '2026-07-27',
      fecha_real_entrega: null
    },
    {
      id: 602,
      codigo: 'HOM-2026-02',
      proyecto_id: 101,
      materia_prima: 'Aceite de Pescado Refinado 50% DHA',
      proveedor: 'DSM Nutritional',
      centro_costo: '561',
      estado_prueba: 'Aprobada',
      fecha_solicitud: '2026-05-01',
      fecha_compromiso: '2026-06-01',
      fecha_real_entrega: '2026-05-28'
    }
  ],

  eficiencias: [
    {
      id: 701,
      codigo: 'EFI-2026-01',
      proyecto_id: 104,
      nombre_optimizacion: 'Reducción de Tiempo de Ciclo de Esterilización Retortable',
      centro_costo: '551',
      valor_actual: 45.0,
      valor_nuevo: 32.0,
      unidad_medida: 'minutos/lote',
      fecha_solicitud: '2026-04-01',
      fecha_compromiso: '2026-05-15',
      fecha_real_entrega: '2026-05-10'
    },
    {
      id: 702,
      codigo: 'EFI-2026-02',
      proyecto_id: 103,
      nombre_optimizacion: 'Incremento de Rendimiento de Hidrólisis Enzimática',
      centro_costo: '571',
      valor_actual: 68.5,
      valor_nuevo: 84.0,
      unidad_medida: '% rendimiento',
      fecha_solicitud: '2026-05-10',
      fecha_compromiso: '2026-08-01',
      fecha_real_entrega: null
    }
  ],

  presupuesto: [
    { id: 801, centro_costo: '551', nombre: '551 (Aplicaciones)', anio: 2026, asignado: 150000000, gasto_real: 112000000 },
    { id: 802, centro_costo: '561', nombre: '561 (Desarrollos)', anio: 2026, asignado: 480000000, gasto_real: 360000000 },
    { id: 803, centro_costo: '571', nombre: '571 (Investigación)', anio: 2026, asignado: 600000000, gasto_real: 420000000 },
    { id: 804, centro_costo: '584', nombre: '584 (Proyecto Orquídeas)', anio: 2026, asignado: 850000000, gasto_real: 510000000 },
    { id: 805, centro_costo: '591', nombre: '591 (Nutrición Avanzada)', anio: 2026, asignado: 320000000, gasto_real: 215000000 },
    { id: 806, centro_costo: '144', nombre: '144 (Homologación)', anio: 2026, asignado: 95000000, gasto_real: 68000000 }
  ]
};

const DB = {
  data: null,

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
        if (!this.data.lineas) this.data.lineas = JSON.parse(JSON.stringify(initialDatabase.lineas));
      } catch (e) {
        console.error('Error al leer LocalStorage, reseteando BD:', e);
        this.data = JSON.parse(JSON.stringify(initialDatabase));
        this.save();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(initialDatabase));
      this.save();
    }
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(initialDatabase));
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD USUARIOS / INVESTIGADORES Y ROLES
  // ---------------------------------------------------------------------------
  getUsuarios() {
    return this.data.usuarios;
  },

  addUsuario(usr) {
    const nextId = Math.max(...this.data.usuarios.map(u => u.id), 0) + 1;
    const newUsr = { id: nextId, ...usr };
    this.data.usuarios.push(newUsr);
    this.save();
    return newUsr;
  },

  updateUsuario(id, updateData) {
    const u = this.data.usuarios.find(usr => usr.id === id);
    if (!u) return null;
    Object.assign(u, updateData);
    this.save();
    return u;
  },

  deleteUsuario(id) {
    this.data.usuarios = this.data.usuarios.filter(u => u.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD LÍNEAS / MARCAS
  // ---------------------------------------------------------------------------
  getLineas() {
    return this.data.lineas || initialDatabase.lineas;
  },

  addLinea(nombre) {
    if (!this.data.lineas.includes(nombre)) {
      this.data.lineas.push(nombre);
      this.save();
    }
    return nombre;
  },

  updateLinea(oldName, newName) {
    const index = this.data.lineas.indexOf(oldName);
    if (index !== -1) {
      this.data.lineas[index] = newName;
      // Actualizar referencias en proyectos
      this.data.proyectos.forEach(p => {
        if (p.marca_linea === oldName) p.marca_linea = newName;
      });
      this.save();
    }
  },

  deleteLinea(nombre) {
    this.data.lineas = this.data.lineas.filter(l => l !== nombre);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD PROYECTOS
  // ---------------------------------------------------------------------------
  getProjects(filters = {}) {
    return this.data.proyectos.filter(p => {
      if (filters.investigador_id && p.investigador_id != filters.investigador_id) return false;
      if (filters.marca_linea && p.marca_linea !== filters.marca_linea) return false;
      if (filters.centro_costo && p.centro_costo !== filters.centro_costo) return false;
      if (filters.categoria && p.categoria !== filters.categoria) return false;
      if (filters.etapa && p.etapa_actual !== filters.etapa) return false;
      return true;
    });
  },

  addProject(proyecto) {
    const nextId = Math.max(...this.data.proyectos.map(p => p.id), 100) + 1;
    const codigo = proyecto.codigo || `PRJ-2026-${String(nextId).padStart(3, '0')}`;
    const newPrj = { id: nextId, codigo, ...proyecto };
    this.data.proyectos.push(newPrj);
    this.save();
    return newPrj;
  },

  updateProject(id, updateData) {
    const prj = this.data.proyectos.find(p => p.id === id);
    if (!prj) return null;
    Object.assign(prj, updateData);
    this.save();
    return prj;
  },

  deleteProject(id) {
    this.data.proyectos = this.data.proyectos.filter(p => p.id !== id);
    this.data.aplicaciones = this.data.aplicaciones.filter(a => a.proyecto_id !== id);
    this.save();
  },

  updateProjectFechaCompromiso(proyectoId, nuevaFecha, justificacion, usuarioNombre) {
    const prj = this.data.proyectos.find(p => p.id === proyectoId);
    if (!prj) throw new Error('Proyecto no encontrado');

    const fechaAnterior = prj.fecha_compromiso;
    prj.fecha_compromiso = nuevaFecha;

    const auditId = Math.max(...this.data.auditoria_fechas.map(a => a.id), 0) + 1;
    this.data.auditoria_fechas.push({
      id: auditId,
      proyecto_id: proyectoId,
      fecha_anterior: fechaAnterior,
      fecha_nueva: nuevaFecha,
      justificacion: justificacion,
      usuario: usuarioNombre || 'Usuario Sistema',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    this.save();
    return prj;
  },

  // ---------------------------------------------------------------------------
  // CRUD APLICACIONES
  // ---------------------------------------------------------------------------
  addAplicacion(app) {
    const nextId = Math.max(...this.data.aplicaciones.map(a => a.id), 200) + 1;
    const codigo = `APP-2026-${String(nextId).padStart(2, '0')}`;
    const newApp = { id: nextId, codigo, ...app };
    this.data.aplicaciones.push(newApp);
    this.save();
    return newApp;
  },

  updateAplicacion(id, updateData) {
    const app = this.data.aplicaciones.find(a => a.id === id);
    if (!app) return null;
    Object.assign(app, updateData);
    this.save();
    return app;
  },

  deleteAplicacion(id) {
    this.data.aplicaciones = this.data.aplicaciones.filter(a => a.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD ASISTENCIA TÉCNICA
  // ---------------------------------------------------------------------------
  addAsistencia(ast) {
    const nextId = Math.max(...this.data.asistencias_tecnicas.map(a => a.id), 300) + 1;
    const codigo = `AST-2026-${String(nextId).padStart(2, '0')}`;
    const newAst = { id: nextId, codigo, ...ast };
    this.data.asistencias_tecnicas.push(newAst);
    this.save();
    return newAst;
  },

  updateAsistencia(id, updateData) {
    const ast = this.data.asistencias_tecnicas.find(a => a.id === id);
    if (!ast) return null;
    Object.assign(ast, updateData);
    this.save();
    return ast;
  },

  deleteAsistencia(id) {
    this.data.asistencias_tecnicas = this.data.asistencias_tecnicas.filter(a => a.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD TIME-TRACKING
  // ---------------------------------------------------------------------------
  addTimeTrackingRecord(record) {
    const nextId = Math.max(...this.data.time_tracking.map(t => t.id), 400) + 1;
    const newRec = { id: nextId, ...record };
    this.data.time_tracking.push(newRec);

    if (record.subcategoria && record.subcategoria.includes('Capacitación')) {
      const tipo = record.subcategoria.includes('Dictada') ? 'Dictada' : 'Recibida';
      const capId = Math.max(...this.data.capacitaciones.map(c => c.id), 500) + 1;
      this.data.capacitaciones.push({
        id: capId,
        investigador_id: record.investigador_id,
        tipo: tipo,
        tema: record.descripcion,
        fecha: record.fecha,
        horas: parseFloat(record.horas),
        proyecto_id: record.proyecto_id || null
      });
    }

    this.save();
    return newRec;
  },

  updateTimeTrackingRecord(id, updateData) {
    const rec = this.data.time_tracking.find(t => t.id === id);
    if (!rec) return null;
    Object.assign(rec, updateData);
    this.save();
    return rec;
  },

  deleteTimeTrackingRecord(id) {
    this.data.time_tracking = this.data.time_tracking.filter(t => t.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD CAPACITACIONES
  // ---------------------------------------------------------------------------
  addCapacitacion(cap) {
    const nextId = Math.max(...this.data.capacitaciones.map(c => c.id), 500) + 1;
    const newCap = { id: nextId, ...cap };
    this.data.capacitaciones.push(newCap);
    this.save();
    return newCap;
  },

  updateCapacitacion(id, updateData) {
    const cap = this.data.capacitaciones.find(c => c.id === id);
    if (!cap) return null;
    Object.assign(cap, updateData);
    this.save();
    return cap;
  },

  deleteCapacitacion(id) {
    this.data.capacitaciones = this.data.capacitaciones.filter(c => c.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD HOMOLOGACIONES
  // ---------------------------------------------------------------------------
  addHomologacion(hom) {
    const nextId = Math.max(...this.data.homologaciones.map(h => h.id), 600) + 1;
    const codigo = `HOM-2026-${String(nextId).padStart(2, '0')}`;
    const newHom = { id: nextId, codigo, ...hom };
    this.data.homologaciones.push(newHom);
    this.save();
    return newHom;
  },

  updateHomologacion(id, updateData) {
    const hom = this.data.homologaciones.find(h => h.id === id);
    if (!hom) return null;
    Object.assign(hom, updateData);
    this.save();
    return hom;
  },

  deleteHomologacion(id) {
    this.data.homologaciones = this.data.homologaciones.filter(h => h.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD EFICIENCIAS
  // ---------------------------------------------------------------------------
  addEficiencia(efi) {
    const nextId = Math.max(...this.data.eficiencias.map(e => e.id), 700) + 1;
    const codigo = `EFI-2026-${String(nextId).padStart(2, '0')}`;
    const newEfi = { id: nextId, codigo, ...efi };
    this.data.eficiencias.push(newEfi);
    this.save();
    return newEfi;
  },

  updateEficiencia(id, updateData) {
    const efi = this.data.eficiencias.find(e => e.id === id);
    if (!efi) return null;
    Object.assign(efi, updateData);
    this.save();
    return efi;
  },

  deleteEficiencia(id) {
    this.data.eficiencias = this.data.eficiencias.filter(e => e.id !== id);
    this.save();
  },

  // ---------------------------------------------------------------------------
  // CRUD PRESUPUESTO
  // ---------------------------------------------------------------------------
  addPresupuesto(pre) {
    const nextId = Math.max(...this.data.presupuesto.map(p => p.id), 800) + 1;
    const newPre = { id: nextId, ...pre };
    this.data.presupuesto.push(newPre);
    this.save();
    return newPre;
  },

  updatePresupuesto(id, updateData) {
    const pre = this.data.presupuesto.find(p => p.id === id);
    if (!pre) return null;
    Object.assign(pre, updateData);
    this.save();
    return pre;
  },

  deletePresupuesto(id) {
    this.data.presupuesto = this.data.presupuesto.filter(p => p.id !== id);
    this.save();
  }
};

DB.init();
