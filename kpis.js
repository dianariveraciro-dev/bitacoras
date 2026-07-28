/**
 * Motor Algebraico de Indicadores y Semáforos (kpis.js)
 * Sistema Integrado IDD - PDR V2
 */

const KPIEngine = {
  // Configuración de fecha de evaluación del sistema (por defecto hoy)
  CURRENT_DATE: new Date('2026-07-28'),

  /**
   * Determina el estado del semáforo visual de un registro (PDR 7)
   * VERDE: Entregado a tiempo OR Días restantes >= 3 días
   * AMARILLO: Pendiente de entrega con menos de 3 días para fecha compromiso
   * ROJO: Solicitud retrasada / Fecha compromiso vencida
   */
  getTrafficLightStatus(fechaCompromisoStr, fechaRealEntregaStr) {
    if (!fechaCompromisoStr) return 'VERDE';

    const fechaCompromiso = new Date(fechaCompromisoStr);
    
    // Si ya fue entregado
    if (fechaRealEntregaStr) {
      const fechaEntrega = new Date(fechaRealEntregaStr);
      return fechaEntrega <= fechaCompromiso ? 'VERDE' : 'ROJO';
    }

    // Si aún está pendiente, evaluar días restantes respecto a hoy
    const diffTime = fechaCompromiso - this.CURRENT_DATE;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'ROJO'; // Vencido
    } else if (diffDays < 3) {
      return 'AMARILLO'; // Próximo a vencer (<3 días)
    } else {
      return 'VERDE'; // Dentro del margen (>= 3 días)
    }
  },

  /**
   * Cálculo de OTD (%) (PDR 5.1)
   * OTD (%) = (Entregados a Tiempo / Total Solicitudes Evaluadas) * 100
   */
  calculateOTD(items = []) {
    if (!items || items.length === 0) return { otd: 0, aTiempo: 0, evaluados: 0, fueraTiempo: 0 };

    // Evaluados son aquellos con fecha de entrega real o cuya fecha compromiso ya pasó
    const evaluados = items.filter(item => {
      if (item.fecha_real_entrega) return true;
      const fComp = new Date(item.fecha_compromiso || item.fecha_compromiso_entrega);
      return fComp <= this.CURRENT_DATE;
    });

    if (evaluados.length === 0) return { otd: 100, aTiempo: 0, evaluados: 0, fueraTiempo: 0 };

    const aTiempo = evaluados.filter(item => {
      const status = this.getTrafficLightStatus(item.fecha_compromiso || item.fecha_compromiso_entrega, item.fecha_real_entrega);
      return status === 'VERDE';
    }).length;

    const fueraTiempo = evaluados.length - aTiempo;
    const otd = ((aTiempo / evaluados.length) * 100).toFixed(1);

    return { otd: parseFloat(otd), aTiempo, evaluados: evaluados.length, fueraTiempo };
  },

  /**
   * Desviación de Tiempos de Desarrollo (PDR 5.2)
   * Desviación (Días) = Días Reales de Desarrollo - Días Estimados (Compromiso)
   * % Desviación = [ (Días Reales - Días Estimados) / Días Estimados ] * 100
   */
  calculateTimeDeviation(proyecto) {
    if (!proyecto.fecha_real_inicio || !proyecto.fecha_compromiso) {
      return { diasReales: 0, diasEstimados: 0, desviacionDias: 0, porcentajeDesviacion: 0 };
    }

    const fInicio = new Date(proyecto.fecha_real_inicio);
    const fCompromiso = new Date(proyecto.fecha_compromiso);
    const fEntregaReal = proyecto.fecha_real_entrega ? new Date(proyecto.fecha_real_entrega) : this.CURRENT_DATE;

    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    const diasEstimados = Math.max(1, Math.round((fCompromiso - fInicio) / MS_POR_DIA));
    const diasReales = Math.max(1, Math.round((fEntregaReal - fInicio) / MS_POR_DIA));

    const desviacionDias = diasReales - diasEstimados;
    const porcentajeDesviacion = ((desviacionDias / diasEstimados) * 100).toFixed(1);

    return {
      diasEstimados,
      diasReales,
      desviacionDias,
      porcentajeDesviacion: parseFloat(porcentajeDesviacion)
    };
  },

  /**
   * % Incremento de Eficiencias (PDR 5.3)
   * % Incremento = [ (Valor Nuevo - Valor Actual) / Valor Actual ] * 100
   */
  calculateEfficiencyIncrease(valorActual, valorNuevo) {
    if (!valorActual || valorActual === 0) return 0;
    const inc = (((valorNuevo - valorActual) / valorActual) * 100).toFixed(1);
    return parseFloat(inc);
  },

  /**
   * Lead Time Total y Tiempo Activo (PDR 5.4)
   */
  calculateLeadAndActiveTime(proyecto) {
    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    let leadTime = null;
    let tiempoActivo = null;

    if (proyecto.fecha_solicitud && proyecto.fecha_cierre) {
      leadTime = Math.round((new Date(proyecto.fecha_cierre) - new Date(proyecto.fecha_solicitud)) / MS_POR_DIA);
    }

    if (proyecto.fecha_real_inicio && proyecto.fecha_real_entrega) {
      tiempoActivo = Math.round((new Date(proyecto.fecha_real_entrega) - new Date(proyecto.fecha_real_inicio)) / MS_POR_DIA);
    }

    return { leadTime, tiempoActivo };
  },

  /**
   * Ocupación y Capacidad por Rol y Categoría (PDR 4 & PDR 6 Módulo 4)
   */
  calculateCapacitySummary(records = [], usuarios = []) {
    const totalHoras = records.reduce((sum, r) => sum + parseFloat(r.horas || 0), 0);

    const porCategoria = {
      'ESTRATEGIA': 0,
      'SOPORTE DE VALOR': 0,
      'CARGA OPERATIVA': 0,
      'BIENESTAR Y CULTURA': 0,
      'TIEMPO NO LABORAL': 0
    };

    records.forEach(r => {
      if (porCategoria[r.categoria] !== undefined) {
        porCategoria[r.categoria] += parseFloat(r.horas || 0);
      }
    });

    const porRol = {
      'Director IDD': 0,
      'Líder IDD': 0,
      'Líder Técnica': 0,
      'Asistente IDD': 0
    };

    records.forEach(r => {
      const u = usuarios.find(usr => usr.id === r.investigador_id);
      if (u && porRol[u.rol] !== undefined) {
        porRol[u.rol] += parseFloat(r.horas || 0);
      }
    });

    return {
      totalHoras,
      porCategoria,
      porRol
    };
  },

  /**
   * Consolidado de Presupuesto (PDR 6 Módulo 6)
   */
  calculateBudgetSummary(presupuestoList = []) {
    const totalAsignado = presupuestoList.reduce((s, p) => s + parseFloat(p.asignado), 0);
    const totalGastoReal = presupuestoList.reduce((s, p) => s + parseFloat(p.gasto_real), 0);
    const pctEjecucion = totalAsignado > 0 ? ((totalGastoReal / totalAsignado) * 100).toFixed(1) : 0;

    return {
      totalAsignado,
      totalGastoReal,
      pctEjecucion: parseFloat(pctEjecucion)
    };
  }
};
