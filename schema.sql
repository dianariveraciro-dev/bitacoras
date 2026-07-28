-- =============================================================================
-- ESQUEMA DE BASE DE DATOS RELACIONAL: SISTEMA INTEGRADO IDD (PDR V2)
-- Proceso: Investigación, Desarrollo e Innovación (IDD)
-- Documento de Referencia: PDR V2 - Julio 2026
-- =============================================================================

-- 1. TABLA DE USUARIOS / INVESTIGADORES Y ROLES
CREATE TABLE usuarios (
    usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol ENUM('Director IDD', 'Líder IDD', 'Líder Técnica', 'Asistente IDD', 'Proceso Comercial / Asesor') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA NÚCLEO: BITÁCORA DE PROYECTOS (ENTIDAD PADRE)
CREATE TABLE proyectos (
    proyecto_id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_proyecto VARCHAR(50) UNIQUE NOT NULL, -- Código único generado
    nombre_proyecto VARCHAR(255) NOT NULL,
    categoria ENUM('Desarrollo', 'Investigación', 'Moonshot') NOT NULL,
    marca_linea ENUM('Alimento Nutricional', 'Be-Balance', 'Food Service', 'Industrial', 'Marca Blanca', 'Nutricure', 'Zeto') NOT NULL,
    modelo_negocio ENUM(
        'Alsec Revolution (Innovación Disruptiva)',
        'Aplicación / Soporte Técnico',
        'Comercialización',
        'Crisol-Ingrediente a la Medida',
        'Productos B2C - Líquido',
        'Productos B2C - Polvo',
        'Soluciones B2B_Internacional-Líquido',
        'Soluciones B2B_Internacional-Polvo',
        'Soluciones B2B_Nacional-Líquido',
        'Soluciones B2B_Nacional-Polvo'
    ) NOT NULL,
    tecnologia ENUM(
        'Secado por Aspersión y Microencapsulación',
        'Separación por Membranas',
        'Tratamiento Térmico UHT',
        'Procesamiento Retortable (Esterilización)',
        'Mezclado (Dry Blend / Blending)',
        'Biotecnología',
        'Hidrólisis Enzimática',
        'Extracción / Concentración',
        'Multitecnología / Combinado'
    ) NOT NULL,
    centro_costo ENUM('551', '561', '571', '584', '591', '144') NOT NULL,
    etapa_actual ENUM(
        'Por Definir / Briefing',
        'En Desarrollo (Laboratorio)',
        'En Documentación',
        'En Evaluación / Enviado a Cliente',
        'Re-formulación',
        'Prueba Piloto / Escalamiento',
        'Stand By / En Espera',
        'Estudio de Estabilidad / Vida Útil',
        'Éxito / Aprobado',
        'Cancelado / Descartado'
    ) NOT NULL DEFAULT 'Por Definir / Briefing',
    
    -- Trazabilidad de las 6 Fechas Estándar (PDR 3.1)
    fecha_solicitud_ingreso DATE NOT NULL,
    fecha_real_inicio DATE NULL,
    fecha_reasignacion DATE NULL,
    fecha_compromiso_entrega DATE NOT NULL, -- Regla de Auditoría: No borrable sin justificación
    fecha_real_entrega DATE NULL,
    fecha_cierre_proyecto DATE NULL,

    -- Cierre Comercial e Impacto (PDR 3.3)
    nombre_cliente VARCHAR(150) NULL,
    causal_cierre ENUM(
        'Ganado / Compran (Facturando)',
        'Aprobado No Compran',
        'Éxito Reformulación',
        'Rechazado por Sensorial',
        'Rechazado por Funcionalidad',
        'Rechazado por Precio / Costo Objetivo',
        'Rechazado por Vida Útil / Estabilidad',
        'Cancelado por Cliente',
        'Cancelado por Asesor / Comercial',
        'Fuera de Tiempo (Entregado Tarde)',
        'Rechazado por Regulación / Legales',
        'Rechazado por Capacidad Industrial / No Viable'
    ) NULL,
    ventas_anuales_estimadas DECIMAL(15, 2) DEFAULT 0.00,
    ventas_anuales_reales DECIMAL(15, 2) DEFAULT 0.00,
    
    investigador_lider_id INT NULL,
    FOREIGN KEY (investigador_lider_id) REFERENCES usuarios(usuario_id) ON DELETE SET NULL
);

-- 3. AUDITORÍA DE FECHA COMPROMISO (REGLA DE AUDITORÍA PDR 3.1)
CREATE TABLE auditoria_fecha_compromiso (
    auditoria_id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT NOT NULL,
    fecha_compromiso_anterior DATE NOT NULL,
    fecha_compromiso_nueva DATE NOT NULL,
    motivo_justificacion TEXT NOT NULL,
    usuario_modifico_id INT NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_modifico_id) REFERENCES usuarios(usuario_id)
);

-- 4. BITÁCORA DE APLICACIONES (RELACIÓN 1:N)
CREATE TABLE bitacora_aplicaciones (
    aplicacion_id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_aplicacion VARCHAR(50) UNIQUE NOT NULL,
    proyecto_id INT NOT NULL, -- FK a Proyecto Núcleo
    nombre_solicitud VARCHAR(255) NOT NULL,
    cliente VARCHAR(150) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_compromiso DATE NOT NULL,
    fecha_real_entrega DATE NULL,
    estado ENUM('Activa', 'En Evaluación Cliente', 'Completada a Tiempo', 'Completada Tarde', 'Cancelada') DEFAULT 'Activa',
    observaciones TEXT NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE CASCADE
);

-- 5. BITÁCORA DE ASISTENCIA TÉCNICA (AISLADA O VINCULADA 1:N)
CREATE TABLE bitacora_asistencia_tecnica (
    asistencia_id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_asistencia VARCHAR(50) UNIQUE NOT NULL,
    proyecto_id INT NULL, -- NULL indica Asistencia Técnica aislada
    comercial_solicitante VARCHAR(150) NOT NULL,
    investigador_asignado_id INT NOT NULL,
    descripcion_requerimiento TEXT NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_compromiso DATE NOT NULL,
    fecha_real_entrega DATE NULL,
    horas_invertidas DECIMAL(6, 2) DEFAULT 0.00,
    estado ENUM('Pendiente', 'En Proceso', 'Atendida', 'Cancelada') DEFAULT 'Pendiente',
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE SET NULL,
    FOREIGN KEY (investigador_asignado_id) REFERENCES usuarios(usuario_id)
);

-- 6. MÓDULO DE CAPACIDAD DEL PROCESO (TIME-TRACKING DIARIO HORA A HORA - PDR 4)
CREATE TABLE capacidad_time_tracking (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    investigador_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_dedicadas DECIMAL(4, 2) NOT NULL,
    categoria ENUM(
        'ESTRATEGIA',
        'SOPORTE DE VALOR',
        'CARGA OPERATIVA',
        'BIENESTAR Y CULTURA',
        'TIEMPO NO LABORAL'
    ) NOT NULL,
    subcategoria VARCHAR(150) NOT NULL, -- ej: Asistencia Técnica, Ensayos, Pilotos, Capacitación Dictada/Recibida
    descripcion_actividad TEXT NOT NULL,
    proyecto_id INT NULL,
    FOREIGN KEY (investigador_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE SET NULL
);

-- 7. BITÁCORA DE CAPACITACIONES (PDR 6 - MÓDULO 5)
CREATE TABLE bitacora_capacitaciones (
    capacitacion_id INT PRIMARY KEY AUTO_INCREMENT,
    investigador_id INT NOT NULL,
    tipo ENUM('Recibida', 'Dictada') NOT NULL,
    tema_capacitacion VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    horas_acumuladas DECIMAL(5, 2) NOT NULL,
    proyecto_id INT NULL,
    FOREIGN KEY (investigador_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE SET NULL
);

-- 8. BITÁCORA DE HOMOLOGACIONES (PDR 6 - MÓDULO 6)
CREATE TABLE bitacora_homologaciones (
    homologacion_id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_homologacion VARCHAR(50) UNIQUE NOT NULL,
    proyecto_id INT NULL,
    materia_prima VARCHAR(200) NOT NULL,
    proveedor VARCHAR(150) NOT NULL,
    centro_costo ENUM('144', '551', '561', '571', '584', '591') DEFAULT '144',
    estado_prueba ENUM('En Evaluación/Prueba', 'Aprobada', 'Rechazada') DEFAULT 'En Evaluación/Prueba',
    fecha_solicitud DATE NOT NULL,
    fecha_compromiso DATE NOT NULL,
    fecha_real_entrega DATE NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE SET NULL
);

-- 9. BITÁCORA DE EFICIENCIAS (PDR 5.3 & PDR 6 - MÓDULO 6)
CREATE TABLE bitacora_eficiencias (
    eficiencia_id INT PRIMARY KEY AUTO_INCREMENT,
    codigo_eficiencia VARCHAR(50) UNIQUE NOT NULL,
    proyecto_id INT NULL,
    nombre_optimizacion VARCHAR(255) NOT NULL,
    centro_costo ENUM('551', '561', '571', '584', '591', '144') NOT NULL,
    valor_actual DECIMAL(12, 2) NOT NULL,
    valor_nuevo DECIMAL(12, 2) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL, -- ej: kg/h, $, min, %
    porcentaje_incremento DECIMAL(6, 2) GENERATED ALWAYS AS (((valor_nuevo - valor_actual) / valor_actual) * 100) STORED,
    fecha_solicitud DATE NOT NULL,
    fecha_compromiso DATE NOT NULL,
    fecha_real_entrega DATE NULL,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(proyecto_id) ON DELETE SET NULL
);

-- 10. EJECUCIÓN PRESUPUESTAL POR CENTRO DE COSTOS (PDR 6 - MÓDULO 6)
CREATE TABLE presupuesto_ejecucion (
    presupuesto_id INT PRIMARY KEY AUTO_INCREMENT,
    centro_costo ENUM('551', '561', '571', '584', '591', '144') NOT NULL,
    nombre_centro_costo VARCHAR(150) NOT NULL,
    anio INT NOT NULL,
    presupuesto_asignado DECIMAL(15, 2) NOT NULL,
    gasto_real DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    porcentaje_ejecucion DECIMAL(6, 2) GENERATED ALWAYS AS ((gasto_real / presupuesto_asignado) * 100) STORED
);
