/**
 * Módulo de Exportación de Informes PDF y Excel (reports.js)
 * Sistema Integrado IDD - PDR V2 (Soporte Ficha Individual de Proyecto)
 */

const ReportEngine = {
  exportToExcel(data, fileName, sheetName = 'Informe IDD') {
    if (window.XLSX) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      this.exportToCSV(data, fileName);
    }
  },

  exportToCSV(data, fileName) {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    let csv = keys.join(',') + '\n';

    data.forEach(row => {
      csv += keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportToPDF(title, headers, rows, fileName) {
    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('SISTEMA INTEGRADO IDD - PDR V2', 14, 15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Informe Gerencial: ${title}`, 14, 23);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 150, 23);

      if (doc.autoTable) {
        doc.autoTable({
          startY: 35,
          head: [headers],
          body: rows,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          alternateRowStyles: { fillColor: [241, 245, 249] }
        });
      }

      doc.save(`${fileName}.pdf`);
    } else {
      window.print();
    }
  },

  // ---------------------------------------------------------------------------
  // INFORMES DE PROYECTO INDIVIDUAL
  // ---------------------------------------------------------------------------
  exportSingleProyectoExcel(proyectoId) {
    const p = DB.data.proyectos.find(item => item.id === proyectoId);
    if (!p) return;

    const inv = DB.data.usuarios.find(u => u.id === p.investigador_id);
    const status = KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega);
    const dev = KPIEngine.calculateTimeDeviation(p);
    const apps = DB.data.aplicaciones.filter(a => a.proyecto_id === proyectoId);

    const mainData = [{
      'Código Proyecto': p.codigo,
      'Nombre Proyecto': p.nombre,
      'Categoría': p.categoria,
      'Línea / Marca': p.marca_linea,
      'Modelo Negocio': p.modelo_negocio,
      'Tecnología': p.tecnologia,
      'Centro Costos': p.centro_costo,
      'Etapa Funnel': p.etapa_actual,
      'Investigador Líder': inv ? inv.nombre : 'N/A',
      'Cliente': p.cliente,
      'Estado Semáforo': status,
      'Fecha Solicitud': p.fecha_solicitud,
      'Fecha Compromiso': p.fecha_compromiso,
      'Fecha Real Entrega': p.fecha_real_entrega || 'Pendiente',
      'Días Estimados': dev.diasEstimados,
      'Días Reales': dev.diasReales,
      'Desviación Días': dev.desviacionDias,
      '% Desviación': `${dev.porcentajeDesviacion}%`,
      'Ventas Estimadas ($)': p.ventas_estimadas,
      'Ventas Reales ($)': p.ventas_reales,
      'Aplicaciones Vinculadas': apps.length
    }];

    this.exportToExcel(mainData, `Ficha_Proyecto_${p.codigo}`, `Ficha ${p.codigo}`);
  },

  exportSingleProyectoPDF(proyectoId) {
    const p = DB.data.proyectos.find(item => item.id === proyectoId);
    if (!p) return;

    const inv = DB.data.usuarios.find(u => u.id === p.investigador_id);
    const status = KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega);
    const dev = KPIEngine.calculateTimeDeviation(p);
    const apps = DB.data.aplicaciones.filter(a => a.proyecto_id === proyectoId);

    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`FICHA TÉCNICA DE PROYECTO: ${p.codigo}`, 14, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 150, 23);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(p.nombre, 14, 40);

      const headers = ['Atributo', 'Detalle'];
      const rows = [
        ['Categoría', p.categoria],
        ['Línea / Marca', p.marca_linea],
        ['Modelo de Negocio', p.modelo_negocio],
        ['Tecnología', p.tecnologia],
        ['Centro de Costos', p.centro_costo],
        ['Etapa Funnel', p.etapa_actual],
        ['Investigador Líder', inv ? inv.nombre : 'N/A'],
        ['Cliente', p.cliente || 'Interno'],
        ['Semáforo Cumplimiento', status],
        ['Fecha Solicitud / Ingreso', p.fecha_solicitud],
        ['Fecha Compromiso de Entrega', p.fecha_compromiso],
        ['Fecha Real de Entrega', p.fecha_real_entrega || 'En Desarrollo / Pendiente'],
        ['Días Estimados vs Reales', `${dev.diasEstimados} días est. / ${dev.diasReales} días reales`],
        ['Desviación de Tiempos', `${dev.desviacionDias} días (${dev.porcentajeDesviacion}%)`],
        ['Ventas Estimadas ($)', `$${p.ventas_estimadas.toLocaleString('es-CO')}`],
        ['Aplicaciones Vinculadas', `${apps.length} solicitudes`]
      ];

      if (doc.autoTable) {
        doc.autoTable({
          startY: 45,
          head: [headers],
          body: rows,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 4 }
        });
      }

      doc.save(`Ficha_Proyecto_${p.codigo}.pdf`);
    } else {
      window.print();
    }
  },

  // ---------------------------------------------------------------------------
  // EXPORTACIONES GLOBALES
  // ---------------------------------------------------------------------------
  exportProyectosExcel() {
    const data = DB.data.proyectos.map(p => {
      const inv = DB.data.usuarios.find(u => u.id === p.investigador_id);
      const status = KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega);
      return {
        'Código': p.codigo,
        'Nombre Proyecto': p.nombre,
        'Categoría': p.categoria,
        'Línea / Marca': p.marca_linea,
        'Modelo Negocio': p.modelo_negocio,
        'Tecnología': p.tecnologia,
        'Centro Costo': p.centro_costo,
        'Etapa Funnel': p.etapa_actual,
        'Investigador Líder': inv ? inv.nombre : 'N/A',
        'Fecha Compromiso': p.fecha_compromiso,
        'Semáforo Cumplimiento': status,
        'Ventas Estimadas ($)': p.ventas_estimadas,
        'Cliente': p.cliente
      };
    });
    this.exportToExcel(data, 'Informe_Proyectos_IDD', 'Proyectos IDD');
  },

  exportProyectosPDF() {
    const headers = ['Código', 'Proyecto', 'Categoría', 'Línea', 'CC', 'Etapa', 'F. Compromiso', 'Semáforo'];
    const rows = DB.data.proyectos.map(p => [
      p.codigo,
      p.nombre,
      p.categoria,
      p.marca_linea,
      p.centro_costo,
      p.etapa_actual,
      p.fecha_compromiso,
      KPIEngine.getTrafficLightStatus(p.fecha_compromiso, p.fecha_real_entrega)
    ]);
    this.exportToPDF('Reporte de Bitácora de Proyectos Núcleo', headers, rows, 'Informe_Proyectos_IDD');
  },

  exportAplicacionesExcel() {
    const data = DB.data.aplicaciones.map(a => {
      const prj = DB.data.proyectos.find(p => p.id === a.proyecto_id);
      return {
        'Código': a.codigo,
        'Proyecto Vinculado': prj ? prj.nombre : 'N/A',
        'Solicitud': a.nombre_solicitud,
        'Cliente': a.cliente,
        'Fecha Solicitud': a.fecha_solicitud,
        'Fecha Compromiso': a.fecha_compromiso,
        'Fecha Entrega Real': a.fecha_real_entrega || 'Pendiente',
        'Estado': a.estado
      };
    });
    this.exportToExcel(data, 'Informe_Aplicaciones_IDD', 'Aplicaciones');
  },

  exportAplicacionesPDF() {
    const headers = ['Código', 'Proyecto Vinculado', 'Solicitud Aplicación', 'Cliente', 'F. Compromiso', 'Estado'];
    const rows = DB.data.aplicaciones.map(a => {
      const prj = DB.data.proyectos.find(p => p.id === a.proyecto_id);
      return [a.codigo, prj ? prj.codigo : 'N/A', a.nombre_solicitud, a.cliente, a.fecha_compromiso, a.estado];
    });
    this.exportToPDF('Reporte de Aplicaciones Vinculadas', headers, rows, 'Informe_Aplicaciones_IDD');
  },

  exportAsistenciaExcel() {
    const data = DB.data.asistencias_tecnicas.map(a => {
      const inv = DB.data.usuarios.find(u => u.id === a.investigador_id);
      return {
        'Código': a.codigo,
        'Comercial Solicitante': a.comercial_solicitante,
        'Investigador Asignado': inv ? inv.nombre : 'N/A',
        'Descripción Requerimiento': a.descripcion,
        'Horas Invertidas': a.horas_invertidas,
        'Fecha Compromiso': a.fecha_compromiso,
        'Estado': a.estado
      };
    });
    this.exportToExcel(data, 'Informe_Asistencias_Tecnicas_IDD', 'Asistencias Técnicas');
  },

  exportAsistenciaPDF() {
    const headers = ['Código', 'Comercial Solicitante', 'Investigador', 'Descripción', 'Horas', 'F. Compromiso', 'Estado'];
    const rows = DB.data.asistencias_tecnicas.map(a => {
      const inv = DB.data.usuarios.find(u => u.id === a.investigador_id);
      return [a.codigo, a.comercial_solicitante, inv ? inv.nombre : 'N/A', a.descripcion, `${a.horas_invertidas} hrs`, a.fecha_compromiso, a.estado];
    });
    this.exportToPDF('Reporte de Asistencia Técnica Comercial', headers, rows, 'Informe_Asistencias_Tecnicas_IDD');
  },

  exportTimeTrackingExcel() {
    const data = DB.data.time_tracking.map(t => {
      const u = DB.data.usuarios.find(usr => usr.id === t.investigador_id);
      return {
        'Fecha': t.fecha,
        'Investigador': u ? u.nombre : 'N/A',
        'Rol': u ? u.rol : 'N/A',
        'Horario': `${t.hora_inicio} - ${t.hora_fin}`,
        'Horas': t.horas,
        'Categoría PDR': t.categoria,
        'Subcategoría': t.subcategoria,
        'Descripción Actividad': t.descripcion
      };
    });
    this.exportToExcel(data, 'Informe_Capacidad_TimeTracking_IDD', 'Time-Tracking');
  },

  exportTimeTrackingPDF() {
    const headers = ['Fecha', 'Investigador', 'Rol', 'Horario', 'Horas', 'Categoría', 'Actividad'];
    const rows = DB.data.time_tracking.map(t => {
      const u = DB.data.usuarios.find(usr => usr.id === t.investigador_id);
      return [t.fecha, u ? u.nombre : 'N/A', u ? u.rol : '', `${t.hora_inicio}-${t.hora_fin}`, `${t.horas} hrs`, t.categoria, t.descripcion];
    });
    this.exportToPDF('Reporte Diario de Capacidad (Time-Tracking)', headers, rows, 'Informe_Capacidad_TimeTracking_IDD');
  },

  exportCapacitacionesExcel() {
    const data = DB.data.capacitaciones.map(c => {
      const u = DB.data.usuarios.find(usr => usr.id === c.investigador_id);
      return {
        'Investigador': u ? u.nombre : 'N/A',
        'Rol': u ? u.rol : 'N/A',
        'Tipo': c.tipo,
        'Tema Formación Técnica': c.tema,
        'Fecha': c.fecha,
        'Horas Acumuladas': c.horas
      };
    });
    this.exportToExcel(data, 'Informe_Capacitaciones_IDD', 'Capacitaciones');
  },

  exportCapacitacionesPDF() {
    const headers = ['Investigador', 'Rol', 'Tipo', 'Tema Formación Técnica', 'Fecha', 'Horas'];
    const rows = DB.data.capacitaciones.map(c => {
      const u = DB.data.usuarios.find(usr => usr.id === c.investigador_id);
      return [u ? u.nombre : 'N/A', u ? u.rol : 'N/A', c.tipo, c.tema, c.fecha, `${c.horas} hrs`];
    });
    this.exportToPDF('Reporte de Formación Técnica y Capacitaciones', headers, rows, 'Informe_Capacitaciones_IDD');
  },

  exportHomologacionesEficienciasExcel() {
    const dataEficiencias = DB.data.eficiencias.map(e => ({
      'Código': e.codigo,
      'Optimización': e.nombre_optimizacion,
      'CC': e.centro_costo,
      'Valor Actual': e.valor_actual,
      'Valor Nuevo': e.valor_nuevo,
      'Unidad': e.unidad_medida,
      '% Incremento Eficiencia': KPIEngine.calculateEfficiencyIncrease(e.valor_actual, e.valor_nuevo)
    }));
    this.exportToExcel(dataEficiencias, 'Informe_Eficiencias_Homologaciones_IDD', 'Eficiencias');
  },

  exportHomologacionesEficienciasPDF() {
    const headers = ['Código', 'Optimización Proceso', 'Centro Costo', 'Valor Actual', 'Valor Nuevo', '% Incremento'];
    const rows = DB.data.eficiencias.map(e => [
      e.codigo,
      e.nombre_optimizacion,
      e.centro_costo,
      `${e.valor_actual} ${e.unidad_medida}`,
      `${e.valor_nuevo} ${e.unidad_medida}`,
      `+${KPIEngine.calculateEfficiencyIncrease(e.valor_actual, e.valor_nuevo)}%`
    ]);
    this.exportToPDF('Reporte de Proyectos de Optimización y Eficiencia', headers, rows, 'Informe_Eficiencias_IDD');
  },

  exportCatalogosExcel() {
    const dataUsr = DB.getUsuarios().map(u => ({
      'ID': u.id,
      'Nombre Completo': u.nombre,
      'Email': u.email,
      'Rol': u.rol
    }));
    this.exportToExcel(dataUsr, 'Informe_Catalogos_Investigadores_IDD', 'Investigadores');
  },

  exportCatalogosPDF() {
    const headers = ['ID', 'Nombre Completo', 'Correo Electrónico', 'Rol Asignado'];
    const rows = DB.getUsuarios().map(u => [u.id, u.nombre, u.email, u.rol]);
    this.exportToPDF('Catálogo de Investigadores, Equipo IDD y Roles', headers, rows, 'Informe_Catalogos_Investigadores_IDD');
  }
};
