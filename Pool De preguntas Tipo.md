# POOL MAESTRO DE PREGUNTAS PARA LEVANTAMIENTO AUTOMATIZADO DE PROCESOS

**Total: 500+ preguntas estructuradas para diagnóstico empresarial integral**

---

## ÍNDICE GENERAL

### **SECCIÓN A: PROCESOS OPERACIONALES CORE (300 preguntas)**
1. [Procesos Comerciales y Ventas](#1-procesos-comerciales-y-ventas) (24 preguntas)
2. [Procesos de Atención al Cliente](#2-procesos-de-atención-al-cliente) (16 preguntas)
3. [Procesos Operacionales](#3-procesos-operacionales) (30 preguntas)
4. [Procesos Financieros](#4-procesos-financieros) (24 preguntas)
5. [Procesos de Recursos Humanos](#5-procesos-de-recursos-humanos) (18 preguntas)
6. [Procesos de Compras y Abastecimiento](#6-procesos-de-compras-y-abastecimiento) (16 preguntas)
7. [Procesos de Tecnología](#7-procesos-de-tecnología) (14 preguntas)
8. [Procesos de Calidad y Control](#8-procesos-de-calidad-y-control) (12 preguntas)
9. [Procesos de Gestión y Administración](#9-procesos-de-gestión-y-administración) (16 preguntas)
10. [Procesos de Cumplimiento y Legal](#10-procesos-de-cumplimiento-y-legal) (12 preguntas)

### **SECCIÓN B: ANÁLISIS ESTRATÉGICO Y ORGANIZACIONAL (200 preguntas)**
11. [Ecosistema Digital e Integración](#11-ecosistema-digital-e-integración) (25 preguntas)
12. [Gestión del Conocimiento](#12-gestión-del-conocimiento) (22 preguntas)
13. [Excepciones y Contingencias](#13-excepciones-y-contingencias) (20 preguntas)
14. [Métricas y Reporting](#14-métricas-y-reporting) (25 preguntas)
15. [Comunicación y Stakeholders](#15-comunicación-y-stakeholders) (18 preguntas)
16. [Costos Ocultos](#16-costos-ocultos) (15 preguntas)
17. [Gestión del Cambio](#17-gestión-del-cambio) (20 preguntas)
18. [Capacidad y Escalabilidad](#18-capacidad-y-escalabilidad) (18 preguntas)
19. [Seguridad y Compliance](#19-seguridad-y-compliance) (20 preguntas)
20. [Innovación y Mejora Continua](#20-innovación-y-mejora-continua) (17 preguntas)

### **SECCIÓN C: ANÁLISIS TRANSVERSAL**
21. [Preguntas de Automatización](#21-análisis-de-automatización) (8 preguntas)
22. [Análisis de Impacto Económico](#22-análisis-de-impacto-económico) (5 preguntas)
23. [Madurez Digital](#23-análisis-de-madurez-digital) (5 preguntas)
24. [Priorización](#24-análisis-de-priorización) (5 preguntas)

---

## ESTRUCTURA DE METADATOS POR PREGUNTA

```json
{
  "pregunta_id": "VEN_001",
  "categoria": "ventas",
  "subcategoria": "generacion_leads",
  "texto": "¿Cómo identifican a sus clientes potenciales actualmente?",
  "tipo_respuesta": "multiple_choice_with_text",
  "opciones": ["Referidos", "Web", "Redes sociales", "Eventos", "Publicidad", "Otro"],
  "industrias_aplicables": ["todas"],
  "tamaño_empresa": ["pequeña", "mediana", "grande"],
  "nivel_digitalizacion": ["bajo", "medio", "alto"],
  "prioridad_automatizacion": 8,
  "valor_para_sop": 9,
  "tiempo_respuesta_estimado": 120,
  "preguntas_dependientes": ["VEN_002", "VEN_003"],
  "keywords_trigger": ["leads", "clientes", "prospección", "marketing"],
  "pain_point_relacionado": "Falta de leads calificados",
  "insight_esperado": "Diversificación de canales de adquisición",
  "roi_category": "crecimiento_ingresos"
}
```

---

# SECCIÓN A: PROCESOS OPERACIONALES CORE

## 1. PROCESOS COMERCIALES Y VENTAS

### **1.1 GENERACIÓN DE LEADS (6 preguntas)**

**VEN_001** - ¿Cómo identifican a sus clientes potenciales actualmente?
- **Opciones:** Referidos | Web | Redes sociales | Eventos | Publicidad | Otro
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**VEN_002** - ¿Qué canales utilizan para generar leads?
- **Seguimiento:** ¿Cuál es el más efectivo? ¿Cuál el más costoso?
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**VEN_003** - ¿Utilizan algún CRM o sistema para gestionar leads?
- **Opciones:** No tenemos | Excel/Google Sheets | CRM básico | CRM avanzado | Sistema personalizado
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 60s}

**VEN_004** - ¿Cuánto tiempo pasa entre que generan un lead y lo contactan?
- **Opciones:** Inmediato | 1-4 horas | 1 día | 2-3 días | Más de 3 días
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**VEN_005** - ¿Cuántos leads generan mensualmente?
- **Opciones:** 1-10 | 11-50 | 51-200 | 201-500 | 500+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 45s}

**VEN_006** - ¿Qué porcentaje de leads se pierden por falta de seguimiento?
- **Opciones:** 0-10% | 11-25% | 26-50% | 51-75% | No sabemos
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 9, tiempo: 90s}

### **1.2 PROCESO DE VENTAS (9 preguntas)**

**VEN_007** - Descríbame paso a paso su proceso de ventas desde el primer contacto hasta el cierre
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 10, tiempo: 300s}

**VEN_008** - ¿Quién participa en el proceso de ventas?
- **Opciones:** Solo vendedores | Vendedores + gerente | Equipo multidisciplinario | Varía por cliente
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**VEN_009** - ¿Cómo determinan el precio de sus productos/servicios?
- **Opciones:** Lista fija | Fórmulas establecidas | Negociación caso a caso | Competencia | Costos + margen
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**VEN_010** - ¿Cuántas veces deben revisar una cotización antes de enviarla?
- **Opciones:** 0 revisiones | 1 revisión | 2-3 revisiones | 4+ revisiones
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**VEN_011** - ¿Cuántas oportunidades de venta manejan simultáneamente?
- **Opciones:** 1-5 | 6-15 | 16-30 | 31-50 | 50+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 45s}

**VEN_012** - ¿Cuál es su ciclo promedio de venta?
- **Opciones:** 1-7 días | 1-4 semanas | 1-3 meses | 3-6 meses | 6+ meses
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**VEN_013** - ¿Cuál es su tasa de cierre promedio?
- **Opciones:** 0-20% | 21-40% | 41-60% | 61-80% | 81-100%
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 9, tiempo: 60s}

**VEN_014** - ¿Pueden generar cotizaciones automáticamente?
- **Opciones:** Manual completo | Plantillas básicas | Semi-automatizado | Completamente automático
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 7, tiempo: 60s}

**VEN_015** - ¿Tienen visibilidad en tiempo real del pipeline de ventas?
- **Opciones:** No | Parcial | Sí, pero manual | Sí, automático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 6, tiempo: 60s}

### **1.3 GESTIÓN DE CLIENTES (9 preguntas)**

**VEN_016** - ¿Cómo mantienen la información de sus clientes actualizada?
- **Opciones:** No la actualizamos | Manualmente ad-hoc | Proceso regular manual | Automáticamente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**VEN_017** - ¿Tienen información duplicada o inconsistente de clientes?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 60s}

**VEN_018** - ¿Es difícil acceder al historial completo de un cliente?
- **Opciones:** Muy difícil | Algo difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**VEN_019** - ¿Cuántos clientes activos tienen?
- **Opciones:** 1-50 | 51-200 | 201-500 | 501-1000 | 1000+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 45s}

**VEN_020** - ¿Con qué frecuencia contactan a sus clientes?
- **Opciones:** Diario | Semanal | Mensual | Trimestral | Solo cuando hay necesidad
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 6, tiempo: 60s}

**VEN_021** - ¿Cuál es su tasa de retención de clientes?
- **Opciones:** 0-60% | 61-75% | 76-85% | 86-95% | 96-100%
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 9, tiempo: 90s}

**VEN_022** - ¿Realizan seguimiento post-venta?
- **Opciones:** No | Informal | Proceso establecido | Automatizado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**VEN_023** - ¿Cómo segmentan a sus clientes?
- **Opciones:** No segmentamos | Por volumen | Por industria | Por comportamiento | Segmentación avanzada
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 90s}

**VEN_024** - ¿Pierden oportunidades de venta cruzada o upselling?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca | No sabemos
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

## 2. PROCESOS DE ATENCIÓN AL CLIENTE

### **2.1 GESTIÓN DE CONSULTAS Y RECLAMOS (10 preguntas)**

**CLI_001** - ¿Por qué canales reciben consultas de clientes?
- **Opciones:** [Múltiple] Teléfono | Email | Chat | WhatsApp | Presencial | Redes sociales
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**CLI_002** - ¿Cómo registran y categorizan las consultas?
- **Opciones:** No registramos | Excel/Sheets | Sistema básico | Helpdesk completo
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**CLI_003** - ¿Cuánto tiempo demoran en responder una consulta típica?
- **Opciones:** < 1 hora | 1-4 horas | 4-24 horas | 1-3 días | > 3 días
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**CLI_004** - ¿Se pierden consultas entre canales?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**CLI_005** - ¿Los clientes deben repetir su problema varias veces?
- **Opciones:** Siempre | Frecuentemente | Ocasionalmente | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**CLI_006** - ¿Cuántas consultas reciben diariamente?
- **Opciones:** 1-10 | 11-50 | 51-100 | 101-200 | 200+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 45s}

**CLI_007** - ¿Qué porcentaje de casos requieren escalamiento?
- **Opciones:** 0-10% | 11-25% | 26-50% | 51-75% | 75+%
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CLI_008** - ¿Utilizan un sistema de tickets o helpdesk?
- **Opciones:** No | Sistema básico | Helpdesk completo | Sistema integrado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**CLI_009** - ¿Tienen chatbots o respuestas automatizadas?
- **Opciones:** No | Respuestas predefinidas | Chatbot básico | IA avanzada
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 6, tiempo: 60s}

**CLI_010** - ¿Pueden medir la satisfacción del cliente automáticamente?
- **Opciones:** No medimos | Manual ocasional | Encuestas regulares | Automático
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

### **2.2 SOPORTE TÉCNICO (6 preguntas)**

**CLI_011** - ¿Cómo diagnostican problemas técnicos?
- **Opciones:** Experiencia personal | Manuales | Base conocimiento | Sistema diagnóstico
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**CLI_012** - ¿Mantienen una base de conocimiento de soluciones?
- **Opciones:** No | Informal | Documentada | Sistema searchable
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**CLI_013** - ¿Cuánto tiempo toma resolver problemas técnicos complejos?
- **Opciones:** < 1 día | 1-3 días | 1 semana | > 1 semana
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CLI_014** - ¿Se repiten las mismas consultas técnicas frecuentemente?
- **Opciones:** Muy frecuente | Frecuente | Ocasional | Rara vez
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**CLI_015** - ¿Los técnicos pierden tiempo buscando información?
- **Opciones:** Mucho tiempo | Algo de tiempo | Poco tiempo | No pierden tiempo
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**CLI_016** - ¿Cómo coordinan entre soporte de primer nivel y técnicos especializados?
- **Opciones:** Ad-hoc | Proceso informal | Proceso formal | Sistema automatizado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

## 3. PROCESOS OPERACIONALES

### **3.1 GESTIÓN DE INVENTARIO (10 preguntas)**

**OPS_001** - ¿Cómo controlan el stock actual de productos?
- **Opciones:** No controlamos | Excel/manual | Sistema básico | ERP/WMS
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**OPS_002** - ¿Con qué frecuencia realizan inventarios?
- **Opciones:** Nunca | Anual | Semestral | Trimestral | Mensual | Tiempo real
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**OPS_003** - ¿Han tenido quiebres de stock que afectaron ventas?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 60s}

**OPS_004** - ¿Tienen productos que se vencen o quedan obsoletos?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca | No aplica
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**OPS_005** - ¿Cuánto tiempo dedican a contar inventario manualmente?
- **Opciones:** 0 horas | 1-5 horas/mes | 6-20 horas/mes | 21-40 horas/mes | 40+ horas/mes
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 7, tiempo: 90s}

**OPS_006** - ¿Cuántos SKUs manejan?
- **Opciones:** 1-50 | 51-200 | 201-1000 | 1001-5000 | 5000+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

**OPS_007** - ¿Utilizan códigos de barras o sistemas automatizados?
- **Opciones:** No | Códigos básicos | Escáner + sistema | RFID/avanzado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**OPS_008** - ¿Su sistema actualiza stock en tiempo real?
- **Opciones:** No | Manual | Semi-automático | Tiempo real
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**OPS_009** - ¿Pueden predecir demanda automáticamente?
- **Opciones:** No | Estimación manual | Fórmulas básicas | IA/ML
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

**OPS_010** - ¿Tienen diferencias entre el stock teórico y real?
- **Opciones:** Grandes diferencias | Algunas diferencias | Pequeñas diferencias | Sin diferencias
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

### **3.2 PRODUCCIÓN O PRESTACIÓN DE SERVICIOS (10 preguntas)**

**OPS_011** - Descríbame el proceso completo de producción/prestación de servicio
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 10, tiempo: 300s}

**OPS_012** - ¿Cómo planifican la capacidad de producción?
- **Opciones:** No planificamos | Estimación empírica | Fórmulas básicas | Sistema avanzado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**OPS_013** - ¿Tienen cuellos de botella en el proceso productivo?
- **Opciones:** Constantes | Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**OPS_014** - ¿Es difícil cumplir con los tiempos de entrega prometidos?
- **Opciones:** Muy difícil | Difícil | Manageable | Fácil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**OPS_015** - ¿Cuál es su capacidad máxima de producción?
- **Tipo_respuesta:** numeric_with_unit
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**OPS_016** - ¿Qué porcentaje de utilización tienen normalmente?
- **Opciones:** 0-30% | 31-50% | 51-70% | 71-85% | 86-100%
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**OPS_017** - ¿Qué controles de calidad implementan?
- **Opciones:** Ninguno | Inspección final | Controles en proceso | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**OPS_018** - ¿Tienen problemas de calidad recurrentes?
- **Opciones:** Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**OPS_019** - ¿Cuánto desperdicio generan por período?
- **Opciones:** 0-2% | 3-5% | 6-10% | 11-20% | 20%+ | No aplica
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**OPS_020** - ¿Quién supervisa la producción día a día?
- **Opciones:** Nadie específico | Encargado | Gerente | Sistema automatizado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

### **3.3 LOGÍSTICA Y DISTRIBUCIÓN (10 preguntas)**

**OPS_021** - ¿Cómo manejan el despacho y entrega de productos?
- **Opciones:** Transporte propio | Tercerizado | Mixto | Clientes retiran
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**OPS_022** - ¿Cómo optimizan las rutas de entrega?
- **Opciones:** No optimizamos | Experiencia | Software básico | IA/optimización
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 90s}

**OPS_023** - ¿Tienen entregas tardías frecuentes?
- **Opciones:** Muy frecuentes | Frecuentes | Ocasionales | Raras
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**OPS_024** - ¿Se pierden o dañan productos durante el transporte?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**OPS_025** - ¿Cuántos despachos realizan diariamente?
- **Opciones:** 1-5 | 6-20 | 21-50 | 51-100 | 100+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 45s}

**OPS_026** - ¿Qué información proporcionan al cliente sobre el estado del envío?
- **Opciones:** Ninguna | Solo confirmación | Tracking básico | Tracking tiempo real
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 90s}

**OPS_027** - ¿Cuál es el costo promedio de envío?
- **Tipo_respuesta:** numeric_with_currency
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

**OPS_028** - ¿Qué porcentaje de entregas son exitosas en el primer intento?
- **Opciones:** 0-60% | 61-75% | 76-85% | 86-95% | 96-100%
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**OPS_029** - ¿Es costoso el proceso de distribución actual?
- **Opciones:** Muy costoso | Costoso | Razonable | Económico
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**OPS_030** - ¿Utilizan transporte propio o tercerizado?
- **Opciones:** 100% propio | Principalmente propio | Mixto | Principalmente tercerizado | 100% tercerizado
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

## 4. PROCESOS FINANCIEROS

### **4.1 FACTURACIÓN (8 preguntas)**

**FIN_001** - ¿Cómo generan y envían facturas a los clientes?
- **Opciones:** Manual papel | Manual digital | Semi-automático | Completamente automático
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**FIN_002** - ¿Cuánto tiempo demoran en generar una factura?
- **Opciones:** < 15 min | 15-60 min | 1-4 horas | > 4 horas
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**FIN_003** - ¿Tienen errores frecuentes en facturación?
- **Opciones:** Muy frecuentes | Frecuentes | Ocasionales | Raros
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 60s}

**FIN_004** - ¿Cuántas facturas emiten mensualmente?
- **Opciones:** 1-50 | 51-200 | 201-500 | 501-1000 | 1000+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 45s}

**FIN_005** - ¿Utilizan facturación electrónica?
- **Opciones:** No | Parcialmente | Completamente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**FIN_006** - ¿Sus sistemas integran ventas con facturación automáticamente?
- **Opciones:** No | Parcialmente | Completamente
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**FIN_007** - ¿Qué porcentaje de facturas requieren correcciones?
- **Opciones:** 0-5% | 6-15% | 16-30% | 31-50% | 50%+
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**FIN_008** - ¿Los clientes se quejan del proceso de facturación?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

### **4.2 COBRANZA (8 preguntas)**

**FIN_009** - ¿Cómo hacen seguimiento a las cuentas por cobrar?
- **Opciones:** No hacemos | Excel manual | Sistema básico | CRM/ERP integrado
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**FIN_010** - ¿Cuál es su promedio de días de cobro?
- **Opciones:** 0-30 días | 31-60 días | 61-90 días | 91-120 días | 120+ días
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**FIN_011** - ¿Qué porcentaje de clientes paga fuera de término?
- **Opciones:** 0-10% | 11-25% | 26-50% | 51-75% | 75%+
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**FIN_012** - ¿Cuánto tiempo dedican a llamar clientes morosos?
- **Opciones:** 0 horas | 1-5 horas/semana | 6-15 horas/semana | 16+ horas/semana
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 90s}

**FIN_013** - ¿Tienen pérdidas por incobrables?
- **Opciones:** Nunca | < 1% ventas | 1-3% ventas | 3-5% ventas | > 5% ventas
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**FIN_014** - ¿Cuánto tienen en cuentas por cobrar actualmente?
- **Tipo_respuesta:** numeric_with_currency
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**FIN_015** - ¿Qué métodos de pago aceptan?
- **Opciones:** [Múltiple] Efectivo | Transferencia | Tarjetas | Cheques | Digital wallets
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**FIN_016** - ¿Ofrecen descuentos por pronto pago?
- **Opciones:** No | Ocasionalmente | Política formal | Automático
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

### **4.3 CONTROL FINANCIERO (8 preguntas)**

**FIN_017** - ¿Cómo controlan el flujo de caja diariamente?
- **Opciones:** No controlamos | Excel manual | Sistema básico | Dashboard tiempo real
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**FIN_018** - ¿Tienen problemas de liquidez frecuentes?
- **Opciones:** Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**FIN_019** - ¿Es difícil conocer la rentabilidad por producto/cliente?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**FIN_020** - ¿Realizan presupuestos y los comparan con resultados reales?
- **Opciones:** No | Anualmente | Trimestralmente | Mensualmente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**FIN_021** - ¿Con qué frecuencia revisan resultados financieros?
- **Opciones:** Nunca | Anualmente | Trimestralmente | Mensualmente | Semanalmente | Diariamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**FIN_022** - ¿Quién autoriza gastos y con qué límites?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 180s}

**FIN_023** - ¿Tienen gastos no planificados recurrentes?
- **Opciones:** Muy frecuentes | Frecuentes | Ocasionales | Raros
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**FIN_024** - ¿Cuántas transacciones procesan mensualmente?
- **Opciones:** 1-100 | 101-500 | 501-2000 | 2001-5000 | 5000+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

## 5. PROCESOS DE RECURSOS HUMANOS

### **5.1 RECLUTAMIENTO Y SELECCIÓN (6 preguntas)**

**RH_001** - ¿Cómo identifican necesidades de personal nuevo?
- **Opciones:** Reactivo | Planificación básica | Planificación formal | Predictivo
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 120s}

**RH_002** - ¿Por qué canales publican ofertas de trabajo?
- **Opciones:** [Múltiple] Referidos | LinkedIn | Portales empleo | Universidades | Redes sociales
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 90s}

**RH_003** - ¿Cuánto tiempo demoran en cubrir una vacante?
- **Opciones:** 1-2 semanas | 3-4 semanas | 1-2 meses | 2-3 meses | 3+ meses
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**RH_004** - ¿Cuántas personas contratan anualmente?
- **Opciones:** 1-5 | 6-15 | 16-30 | 31-50 | 50+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 45s}

**RH_005** - ¿Cuál es su tasa de rotación de personal?
- **Opciones:** 0-10% | 11-20% | 21-30% | 31-50% | 50%+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

**RH_006** - ¿Qué porcentaje de nuevos empleados no pasa el período de prueba?
- **Opciones:** 0-5% | 6-15% | 16-30% | 31-50% | 50%+
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

### **5.2 GESTIÓN DE PLANILLAS (6 preguntas)**

**RH_007** - ¿Cómo registran asistencia y horas trabajadas?
- **Opciones:** No registramos | Manual/papel | Excel | Sistema básico | Biométrico/avanzado
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 120s}

**RH_008** - ¿Quién calcula las planillas de pago?
- **Opciones:** Externa | RRHH manual | Semi-automático | Completamente automático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**RH_009** - ¿Cuánto tiempo dedican a calcular planillas?
- **Opciones:** 0 horas | 1-4 horas | 5-15 horas | 16-30 horas | 30+ horas
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 90s}

**RH_010** - ¿Tienen errores frecuentes en pagos?
- **Opciones:** Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 60s}

**RH_011** - ¿Cuántos empleados tienen en planilla?
- **Opciones:** 1-10 | 11-25 | 26-50 | 51-100 | 100+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 45s}

**RH_012** - ¿Es complejo manejar diferentes tipos de contrato?
- **Opciones:** Muy complejo | Complejo | Manageable | Simple
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

### **5.3 EVALUACIÓN DE DESEMPEÑO (6 preguntas)**

**RH_013** - ¿Cómo evalúan el rendimiento de sus empleados?
- **Opciones:** No evaluamos | Informal | Proceso formal | Sistema integral
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 120s}

**RH_014** - ¿Tienen metas claras definidas para cada puesto?
- **Opciones:** No | Muy generales | Específicas | SMART + tracking
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**RH_015** - ¿Con qué frecuencia dan retroalimentación?
- **Opciones:** Nunca | Anual | Semestral | Trimestral | Mensual | Continua
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**RH_016** - ¿Es difícil medir objetivamente el desempeño?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**RH_017** - ¿Los empleados saben qué se espera de ellos?
- **Opciones:** No | Vagamente | Claramente | Muy claramente
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**RH_018** - ¿Utilizan evaluaciones 360 grados?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistema formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

## 6. PROCESOS DE COMPRAS Y ABASTECIMIENTO

### **6.1 GESTIÓN DE PROVEEDORES (8 preguntas)**

**COM_001** - ¿Cómo seleccionan y evalúan proveedores?
- **Opciones:** Ad-hoc | Criterios básicos | Proceso formal | Sistema scoring
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**COM_002** - ¿Mantienen un registro de proveedores aprobados?
- **Opciones:** No | Lista básica | Base de datos | Sistema integrado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**COM_003** - ¿Tienen problemas de calidad con proveedores?
- **Opciones:** Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**COM_004** - ¿Sufren retrasos en entregas frecuentemente?
- **Opciones:** Muy frecuentes | Frecuentes | Ocasionales | Raros
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**COM_005** - ¿Es difícil comparar precios entre proveedores?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**COM_006** - ¿Cuántos proveedores activos tienen?
- **Opciones:** 1-10 | 11-25 | 26-50 | 51-100 | 100+
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 45s}

**COM_007** - ¿Realizan evaluaciones periódicas de proveedores?
- **Opciones:** No | Anual | Semestral | Trimestral | Continua
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**COM_008** - ¿Cómo negocian precios y condiciones?
- **Opciones:** No negociamos | Ad-hoc | Proceso estructurado | Sistema formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

### **6.2 PROCESO DE COMPRAS (8 preguntas)**

**COM_009** - ¿Cómo determinan qué necesitan comprar y cuándo?
- **Opciones:** Reactivo | Stock mínimo | Planificación | Predictivo
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**COM_010** - ¿Quién autoriza las compras?
- **Opciones:** Cualquiera | Gerente | Por montos | Sistema workflow
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**COM_011** - ¿Cuánto tiempo toma procesar una orden de compra?
- **Opciones:** < 1 día | 1-3 días | 4-7 días | 1-2 semanas | 2+ semanas
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**COM_012** - ¿Tienen compras de emergencia frecuentes?
- **Opciones:** Muy frecuentes | Frecuentes | Ocasionales | Raras
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**COM_013** - ¿Es difícil hacer seguimiento a órdenes pendientes?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**COM_014** - ¿Cuántas órdenes de compra generan mensualmente?
- **Opciones:** 1-20 | 21-50 | 51-100 | 101-200 | 200+
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 45s}

**COM_015** - ¿Cómo solicitan cotizaciones?
- **Opciones:** Teléfono/email | Formularios | Portal proveedor | Sistema integrado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 90s}

**COM_016** - ¿Cuál es su gasto promedio mensual en compras?
- **Tipo_respuesta:** numeric_with_currency
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

## 7. PROCESOS DE TECNOLOGÍA

### **7.1 GESTIÓN DE SISTEMAS (8 preguntas)**

**TI_001** - ¿Qué sistemas informáticos utilizan actualmente?
- **Tipo_respuesta:** multiple_text
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 180s}

**TI_002** - ¿Cómo respaldan información crítica?
- **Opciones:** No respaldamos | Manual ocasional | Automático básico | Estrategia completa
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**TI_003** - ¿Cuánto tiempo pierden por fallas de sistemas?
- **Opciones:** 0 horas | 1-5 horas/mes | 6-20 horas/mes | 21+ horas/mes
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**TI_004** - ¿Tienen sistemas que no se comunican entre sí?
- **Opciones:** Todos aislados | Mayoría aislados | Algunos integrados | Mayoría integrados | Todos integrados
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 90s}

**TI_005** - ¿Es difícil obtener reportes consolidados?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**TI_006** - ¿Sus sistemas están en la nube o on-premise?
- **Opciones:** Todo on-premise | Mayoría on-premise | Mixto | Mayoría cloud | Todo cloud
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**TI_007** - ¿Pueden acceder a sistemas remotamente?
- **Opciones:** No | Limitadamente | Mayoría sistemas | Todos los sistemas
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

**TI_008** - ¿Quién maneja el soporte técnico interno?
- **Opciones:** Nadie específico | Usuario avanzado | Técnico dedicado | Equipo TI | Tercerizado
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **7.2 GESTIÓN DE DATOS (6 preguntas)**

**TI_009** - ¿Cómo almacenan y organizan información importante?
- **Opciones:** Papel | Archivos locales | Servidor compartido | Cloud organizado | Sistema de gestión
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**TI_010** - ¿Es difícil encontrar información cuando la necesitan?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**TI_011** - ¿Tienen información duplicada en varios lugares?
- **Opciones:** Mucha duplicación | Alguna duplicación | Poca duplicación | Sin duplicación
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**TI_012** - ¿Confían en la calidad de sus datos?
- **Opciones:** No confiamos | Poca confianza | Confianza moderada | Mucha confianza
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**TI_013** - ¿Quién tiene acceso a qué información?
- **Opciones:** Todos a todo | Control básico | Control por roles | Control granular
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**TI_014** - ¿Realizan análisis de datos para tomar decisiones?
- **Opciones:** No | Análisis básico | Reportes regulares | Analytics avanzado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

## 8. PROCESOS DE CALIDAD Y CONTROL

### **8.1 CONTROL DE CALIDAD (6 preguntas)**

**CAL_001** - ¿Qué controles de calidad implementan en sus procesos?
- **Opciones:** Ninguno | Inspección final | Controles básicos | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**CAL_002** - ¿Cómo miden la satisfacción del cliente?
- **Opciones:** No medimos | Feedback informal | Encuestas ocasionales | Sistema formal
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**CAL_003** - ¿Qué porcentaje de productos/servicios requieren reproceso?
- **Opciones:** 0-2% | 3-5% | 6-10% | 11-20% | 20%+
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**CAL_004** - ¿Reciben quejas recurrentes sobre calidad?
- **Opciones:** Frecuentes | Ocasionales | Raras | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**CAL_005** - ¿Cuántas inspecciones de calidad realizan?
- **Tipo_respuesta:** numeric_with_frequency
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**CAL_006** - ¿Tienen procedimientos documentados?
- **Opciones:** No | Algunos básicos | Mayoría documentados | Todo documentado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 10, tiempo: 60s}

### **8.2 MEJORA CONTINUA (6 preguntas)**

**CAL_007** - ¿Cómo identifican oportunidades de mejora?
- **Opciones:** No identificamos | Ad-hoc | Proceso formal | Sistema continuo
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 120s}

**CAL_008** - ¿Involucran a empleados en sugerencias de mejora?
- **Opciones:** No | Informalmente | Programa formal | Sistema de incentivos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**CAL_009** - ¿Miden el impacto de las mejoras implementadas?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CAL_010** - ¿Es difícil implementar cambios en la organización?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CAL_011** - ¿Tienen resistencia al cambio por parte del personal?
- **Opciones:** Mucha resistencia | Alguna resistencia | Poca resistencia | Sin resistencia
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**CAL_012** - ¿Realizan auditorías internas?
- **Opciones:** No | Ocasionales | Regulares | Continuas
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

## 9. PROCESOS DE GESTIÓN Y ADMINISTRACIÓN

### **9.1 PLANIFICACIÓN ESTRATÉGICA (6 preguntas)**

**ADM_001** - ¿Cómo definen objetivos y metas empresariales?
- **Opciones:** No definimos | Informalmente | Proceso formal | Metodología avanzada
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 120s}

**ADM_002** - ¿Con qué frecuencia revisan el cumplimiento de metas?
- **Opciones:** Nunca | Anualmente | Trimestralmente | Mensualmente | Semanalmente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**ADM_003** - ¿Es difícil medir el progreso hacia los objetivos?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**ADM_004** - ¿Los empleados entienden cómo contribuyen a los objetivos?
- **Opciones:** No entienden | Entienden poco | Entienden bien | Muy claro
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**ADM_005** - ¿Cómo comunican la estrategia al equipo?
- **Opciones:** No comunicamos | Reuniones ocasionales | Comunicación regular | Sistema formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**ADM_006** - ¿Utilizan balanced scorecard u otra metodología?
- **Opciones:** No | BSC básico | BSC completo | Otra metodología
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

### **9.2 COMUNICACIÓN INTERNA (5 preguntas)**

**ADM_007** - ¿Cómo se comunican entre diferentes áreas/equipos?
- **Opciones:** Email | WhatsApp | Reuniones | Plataforma colaborativa | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**ADM_008** - ¿Tienen problemas de comunicación entre áreas?
- **Opciones:** Frecuentes | Ocasionales | Raros | Nunca
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**ADM_009** - ¿La información importante llega tarde a quien la necesita?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**ADM_010** - ¿Realizan reuniones regulares de coordinación?
- **Opciones:** No | Esporádicas | Regulares | Sistemáticas
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**ADM_011** - ¿Cómo mantienen informado al personal sobre cambios?
- **Opciones:** No informamos | Email | Reuniones | Canal formal | Múltiples canales
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

### **9.3 GESTIÓN DOCUMENTAL (5 preguntas)**

**ADM_012** - ¿Cómo organizan y almacenan documentos importantes?
- **Opciones:** Papel/archivos | Folders computador | Drive compartido | Sistema documental
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**ADM_013** - ¿Pierden tiempo buscando documentos?
- **Opciones:** Mucho tiempo | Algo de tiempo | Poco tiempo | No pierden tiempo
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**ADM_014** - ¿Trabajan con versiones desactualizadas de documentos?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**ADM_015** - ¿Tienen control de versiones de documentos?
- **Opciones:** No | Control básico | Sistema formal | Automático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**ADM_016** - ¿Quién puede acceder a qué documentos?
- **Opciones:** Todos a todo | Control básico | Control por roles | Control granular
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

## 10. PROCESOS DE CUMPLIMIENTO Y LEGAL

### **10.1 CUMPLIMIENTO NORMATIVO (6 preguntas)**

**LEG_001** - ¿Qué regulaciones específicas debe cumplir su empresa?
- **Tipo_respuesta:** multiple_text
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 180s}

**LEG_002** - ¿Cómo mantienen actualizados los cambios normativos?
- **Opciones:** No nos actualizamos | Asesor externo | Monitoreo interno | Sistema automático
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**LEG_003** - ¿Han tenido multas o sanciones por incumplimiento?
- **Opciones:** Frecuentes | Ocasionales | Raras | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**LEG_004** - ¿Es costoso mantenerse al día con regulaciones?
- **Opciones:** Muy costoso | Costoso | Moderado | Económico
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**LEG_005** - ¿Quién es responsable del cumplimiento en cada área?
- **Opciones:** Nadie específico | Gerente general | Especialista | Equipo dedicado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**LEG_006** - ¿Pueden demostrar cumplimiento cuando hay auditorías?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

### **10.2 GESTIÓN DE CONTRATOS (6 preguntas)**

**LEG_007** - ¿Cómo manejan contratos con clientes y proveedores?
- **Opciones:** Papel/archivo | Digital básico | Sistema organizado | Plataforma especializada
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**LEG_008** - ¿Realizan seguimiento a vencimientos de contratos?
- **Opciones:** No | Manual ocasional | Recordatorios básicos | Sistema automático
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 90s}

**LEG_009** - ¿Se vencen contratos sin renovar por olvido?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 60s}

**LEG_010** - ¿Es lento el proceso de aprobación de contratos?
- **Opciones:** Muy lento | Lento | Razonable | Rápido
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**LEG_011** - ¿Quién revisa y aprueba contratos?
- **Opciones:** Gerente general | Área legal | Comité | Sistema workflow
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**LEG_012** - ¿Tienen templates estandarizados de contratos?
- **Opciones:** No | Básicos | Completos | Sistema inteligente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

---

# SECCIÓN B: ANÁLISIS ESTRATÉGICO Y ORGANIZACIONAL

## 11. ECOSISTEMA DIGITAL E INTEGRACIÓN

### **11.1 INTEGRACIÓN DE SISTEMAS (5 preguntas)**

**DIG_001** - ¿Cuántos sistemas/aplicaciones diferentes utiliza su equipo diariamente?
- **Opciones:** 1-3 | 4-6 | 7-10 | 11-15 | Más de 15
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 6, tiempo: 60s}

**DIG_002** - ¿Sus sistemas principales "hablan" entre sí automáticamente?
- **Opciones:** No | Algunos | Mayoría | Todos
- **Seguimiento:** Si NO: ¿Qué información deben transferir manualmente?
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 90s}

**DIG_003** - ¿Cuántas veces al día su equipo debe cambiar entre aplicaciones diferentes?
- **Opciones:** 1-5 veces | 6-15 veces | 16-30 veces | Más de 30 veces
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**DIG_004** - ¿Tienen el mismo dato en múltiples sistemas?
- **Opciones:** Sí, mucha duplicación | Alguna duplicación | Poca duplicación | No
- **Seguimiento:** ¿Cómo mantienen la consistencia?
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 90s}

**DIG_005** - ¿Cuánto tiempo pierden semanalmente por problemas de integración?
- **Opciones:** 0 horas | 1-3 horas | 4-8 horas | Más de 8 horas
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

### **11.2 EXPERIENCIA DIGITAL (10 preguntas)**

**DIG_006** - ¿Sus empleados necesitan recordar múltiples usuarios y contraseñas?
- **Opciones:** Sí, muchos | Algunos | Pocos | Single Sign-On
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 6, tiempo: 60s}

**DIG_007** - ¿Cuánto tiempo demora un empleado nuevo en tener acceso a todos los sistemas?
- **Opciones:** Mismo día | 2-3 días | 1 semana | Más de 1 semana
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**DIG_008** - ¿Sus sistemas funcionan bien en dispositivos móviles?
- **Opciones:** No funcionan | Funcionan mal | Funcionan bien | Optimizados móvil
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 6, tiempo: 60s}

**DIG_009** - ¿Pueden sus empleados trabajar efectivamente desde cualquier ubicación?
- **Opciones:** No | Limitadamente | Mayoría tareas | Todas las tareas
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

**DIG_010** - ¿Sus sistemas se caen o funcionan lento frecuentemente?
- **Opciones:** Muy frecuente | Frecuente | Ocasional | Raro
- **Seguimiento:** ¿Cuánto tiempo de productividad pierden por semana?
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**DIG_011** - ¿Confían en la veracidad de los datos que ven en sus sistemas?
- **Opciones:** No confiamos | Poca confianza | Confianza moderada | Mucha confianza
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**DIG_012** - ¿Pueden obtener reportes en tiempo real de sus operaciones?
- **Opciones:** No | Algunos reportes | Mayoría reportes | Todos tiempo real
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**DIG_013** - ¿Exportan datos de un sistema para importarlos en otro regularmente?
- **Opciones:** Diariamente | Semanalmente | Mensualmente | Nunca
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 60s}

**DIG_014** - ¿Pueden acceder fácilmente a datos históricos cuando los necesitan?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**DIG_015** - ¿Qué harían si su sistema principal no funciona por 4 horas?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 180s}

### **11.3 AUTOMATIZACIÓN ACTUAL (10 preguntas)**

**DIG_016** - ¿Qué tareas repetitivas realizan actualmente de forma manual?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 9, tiempo: 240s}

**DIG_017** - ¿Utilizan algún tipo de automatización actualmente?
- **Opciones:** No | Macros básicos | Scripts | RPA | IA/ML
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 90s}

**DIG_018** - ¿Tienen procesos donde un humano solo "pasa" información de un sistema a otro?
- **Opciones:** Muchos procesos | Algunos procesos | Pocos procesos | Ninguno
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 8, tiempo: 90s}

**DIG_019** - ¿Sus sistemas envían notificaciones automáticas cuando algo requiere atención?
- **Opciones:** No | Algunas básicas | Mayoría casos | Inteligentes
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**DIG_020** - ¿Pueden generar documentos automáticamente?
- **Opciones:** No | Templates básicos | Semi-automático | Completamente automático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 7, tiempo: 60s}

**DIG_021** - ¿Realizan respaldos automáticos de información crítica?
- **Opciones:** No | Manual ocasional | Automático básico | Sistema completo
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**DIG_022** - ¿Pueden trabajar offline si es necesario?
- **Opciones:** No | Muy limitado | Algunas funciones | Completamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**DIG_023** - ¿Tienen documentado qué hacer si fallan sistemas críticos?
- **Opciones:** No | Planes básicos | Documentado completo | Probado regularmente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

**DIG_024** - ¿Monitorean proactivamente la salud de sus sistemas?
- **Opciones:** No | Monitoreo básico | Alertas automáticas | Dashboard completo
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

**DIG_025** - ¿Han probado restaurar desde backup?
- **Opciones:** Nunca | Una vez | Ocasionalmente | Regularmente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

## 12. GESTIÓN DEL CONOCIMIENTO

### **12.1 DOCUMENTACIÓN ORGANIZACIONAL (5 preguntas)**

**KNOW_001** - ¿Dónde documentan los procedimientos importantes de su empresa?
- **Opciones:** No documentamos | Email/WhatsApp | Word/Excel | Wiki/Confluence | Sistema especializado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 10, tiempo: 120s}

**KNOW_002** - ¿Su documentación actual está actualizada?
- **Opciones:** Muy desactualizada | Algo desactualizada | Mayormente actual | Completamente actual
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

**KNOW_003** - ¿Es fácil para un empleado encontrar información sobre cómo hacer algo?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**KNOW_004** - ¿Tienen diferentes versiones de instrucciones para el mismo proceso?
- **Opciones:** Sí, muchas versiones | Algunas inconsistencias | Pocas inconsistencias | Versión única
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**KNOW_005** - ¿Quién es responsable de mantener la documentación actualizada?
- **Opciones:** Nadie específico | Varios sin coordinación | Persona designada | Proceso formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

### **12.2 CONOCIMIENTO TÁCITO (5 preguntas)**

**KNOW_006** - ¿Hay empleados "indispensables" porque solo ellos saben hacer ciertas tareas?
- **Opciones:** Muchos | Algunos | Pocos | Ninguno
- **Seguimiento:** ¿Qué pasaría si esa persona se va de vacaciones 2 semanas?
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 10, tiempo: 120s}

**KNOW_007** - ¿Nuevos empleados aprenden principalmente preguntando a compañeros?
- **Opciones:** Completamente | Principalmente | Algo | Poco
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**KNOW_008** - ¿Tienen empleados que "resuelven todo" pero nadie más sabe cómo lo hacen?
- **Opciones:** Sí, varios | Algunos | Pocos | No
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 10, tiempo: 60s}

**KNOW_009** - ¿Cuánto tiempo demora un empleado nuevo en ser productivo?
- **Opciones:** 1-2 semanas | 1 mes | 2-3 meses | 3+ meses
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**KNOW_010** - ¿Han perdido conocimiento importante cuando alguien se fue de la empresa?
- **Opciones:** Sí, mucho | Algo | Poco | No
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 10, tiempo: 60s}

### **12.3 CAPACITACIÓN Y ONBOARDING (5 preguntas)**

**KNOW_011** - ¿Tienen un proceso formal de inducción para empleados nuevos?
- **Opciones:** No | Muy básico | Proceso estructurado | Sistema completo
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**KNOW_012** - ¿Cómo capacitan a empleados en nuevos procesos o herramientas?
- **Opciones:** Aprenden solos | Mentoreo informal | Capacitación formal | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**KNOW_013** - ¿Miden si las capacitaciones fueron efectivas?
- **Opciones:** No | Feedback informal | Evaluaciones básicas | Métricas completas
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**KNOW_014** - ¿Tienen material de capacitación estandarizado?
- **Opciones:** No | Documentos básicos | Material completo | Sistema multimedia
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**KNOW_015** - ¿Empleados experimentados están dispuestos a enseñar a otros?
- **Opciones:** No | Algunos | Mayoría | Cultura fuerte
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **12.4 ACCESO A INFORMACIÓN (4 preguntas)**

**KNOW_016** - ¿Dónde buscan información cuando tienen dudas? (Ranking 1-5)
- **Opciones:** Preguntar compañeros | Google | Manuales internos | Sistemas ayuda | Trial & error
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**KNOW_017** - ¿Cuánto tiempo pierden buscando información que saben que existe?
- **Opciones:** < 30 min/día | 30-60 min/día | 1-2 horas/día | > 2 horas/día
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**KNOW_018** - ¿Tienen un lugar centralizado donde buscar información interna?
- **Opciones:** No | Parcial | Sí, pero desorganizado | Sí, bien organizado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**KNOW_019** - ¿Repiten las mismas preguntas frecuentemente entre empleados?
- **Opciones:** Muy frecuente | Frecuente | Ocasional | Raro
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

### **12.5 COLABORACIÓN (3 preguntas)**

**KNOW_020** - ¿Cómo comparten conocimientos entre equipos?
- **Opciones:** No hay intercambio | Informal | Reuniones regulares | Sistema formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 120s}

**KNOW_021** - ¿Celebran "lecciones aprendidas" después de proyectos importantes?
- **Opciones:** Nunca | Rara vez | Ocasionalmente | Siempre
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**KNOW_022** - ¿Pueden encontrar información sobre clientes/proyectos antiguos fácilmente?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

## 13. EXCEPCIONES Y CONTINGENCIAS

### **13.1 MANEJO DE CASOS ESPECIALES (5 preguntas)**

**EXC_001** - ¿Qué porcentaje de sus procesos siguen el "camino normal" vs casos especiales?
- **Opciones:** < 50% normal | 50-70% normal | 70-90% normal | 90%+ normal
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**EXC_002** - ¿Quién autoriza desviaciones del proceso estándar?
- **Opciones:** Cualquiera | Supervisor | Gerente | Proceso formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**EXC_003** - ¿Documentan las excepciones y por qué ocurrieron?
- **Opciones:** No | Ocasionalmente | Regularmente | Siempre
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**EXC_004** - ¿Casos especiales terminan siendo "el nuevo normal" sin actualizar procesos?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

**EXC_005** - ¿Tienen procesos diferentes para clientes "VIP" o especiales?
- **Opciones:** Sí, muy diferentes | Algunas diferencias | Pequeñas diferencias | Proceso único
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

### **13.2 GESTIÓN DE CRISIS (5 preguntas)**

**EXC_006** - ¿Qué hacen cuando tienen una "emergencia" que interrumpe operaciones normales?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 180s}

**EXC_007** - ¿Tienen identificados sus "procesos críticos" que no pueden parar?
- **Opciones:** No | Algunos identificados | Mayoría identificados | Todos mapeados
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**EXC_008** - ¿Cómo comunican internamente cuando hay una crisis operacional?
- **Opciones:** Ad-hoc | WhatsApp/informal | Proceso definido | Sistema formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**EXC_009** - ¿Han tenido que "inventar" soluciones sobre la marcha?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**EXC_010** - ¿Tienen un plan de contingencia para sus procesos más importantes?
- **Opciones:** No | Planes básicos | Documentado | Probado regularmente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

### **13.3 ADAPTABILIDAD (5 preguntas)**

**EXC_011** - ¿Con qué frecuencia deben adaptar procesos por cambios externos?
- **Opciones:** Constantemente | Mensualmente | Trimestralmente | Anualmente | Nunca
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**EXC_012** - ¿Qué tan rápido pueden implementar cambios en procesos cuando es necesario?
- **Opciones:** Varios meses | 1 mes | 1 semana | Mismo día
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**EXC_013** - ¿Resisten cambios en procesos o los adoptan fácilmente?
- **Opciones:** Mucha resistencia | Alguna resistencia | Adopción moderada | Adopción rápida
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**EXC_014** - ¿Pueden manejar picos de demanda sin afectar calidad?
- **Opciones:** No | Con dificultad | Moderadamente bien | Muy bien
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**EXC_015** - ¿Tienen procesos estacionales o que varían según época del año?
- **Opciones:** Sí, muy variables | Algunas variaciones | Pequeñas variaciones | Constantes
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

### **13.4 RESOLUCIÓN DE PROBLEMAS (5 preguntas)**

**EXC_016** - ¿Cómo identifican la causa raíz cuando algo sale mal?
- **Opciones:** Trial and error | Intuición/experiencia | Análisis básico | Metodología formal
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 120s}

**EXC_017** - ¿Los mismos problemas se repiten frecuentemente?
- **Opciones:** Muy frecuente | Frecuente | Ocasional | Raro
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**EXC_018** - ¿Quién tiene autoridad para "parar la línea" cuando hay un problema serio?
- **Opciones:** Nadie | Solo gerencia | Supervisores | Cualquier empleado
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**EXC_019** - ¿Aprenden de los errores o tienden a repetirse?
- **Opciones:** Se repiten | Aprenden poco | Aprenden moderadamente | Aprenden mucho
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 60s}

**EXC_020** - ¿Tienen un proceso para escalamiento cuando los problemas no se pueden resolver localmente?
- **Opciones:** No | Ad-hoc | Proceso informal | Sistema formal
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

## 14. MÉTRICAS Y REPORTING

### **14.1 MEDICIÓN ACTUAL (5 preguntas)**

**METR_001** - ¿Qué números revisan semanalmente para saber cómo va el negocio?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 180s}

**METR_002** - ¿Cómo miden si un proceso está funcionando bien?
- **Opciones:** No medimos | Indicadores básicos | Métricas formales | KPIs avanzados
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**METR_003** - ¿Tienen metas cuantificables para sus procesos principales?
- **Opciones:** No | Metas generales | Metas específicas | Metas SMART
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**METR_004** - ¿Pueden medir el tiempo que toma completar procesos importantes?
- **Opciones:** No | Estimaciones | Medición ocasional | Medición sistemática
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**METR_005** - ¿Saben cuánto les cuesta ejecutar cada proceso?
- **Opciones:** No idea | Estimaciones vagas | Cálculos básicos | Costeo detallado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

### **14.2 REPORTING Y DASHBOARDS (5 preguntas)**

**METR_006** - ¿Qué reportes generan regularmente?
- **Tipo_respuesta:** text_area
- **Seguimiento:** ¿Los leen realmente? ¿Son útiles?
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 180s}

**METR_007** - ¿Cuánto tiempo dedican a generar reportes?
- **Opciones:** < 2 horas/semana | 2-5 horas/semana | 5-10 horas/semana | > 10 horas/semana
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 60s}

**METR_008** - ¿Sus reportes se generan automáticamente o manualmente?
- **Opciones:** 100% manual | Mayoría manual | Mixto | Mayoría automático | 100% automático
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 7, tiempo: 60s}

**METR_009** - ¿Pueden ver métricas importantes en tiempo real?
- **Opciones:** No | Algunas métricas | Mayoría métricas | Dashboard tiempo real
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**METR_010** - ¿Sus reportes muestran tendencias o solo números actuales?
- **Opciones:** Solo actuales | Comparación período anterior | Tendencias básicas | Analytics avanzado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

### **14.3 TOMA DE DECISIONES (5 preguntas)**

**METR_011** - ¿Cómo toman decisiones importantes? ¿Con datos o intuición?
- **Opciones:** 100% intuición | Mayoría intuición | Mixto | Mayoría datos | 100% datos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**METR_012** - ¿Pueden predecir problemas antes de que ocurran?
- **Opciones:** No | Ocasionalmente | Frecuentemente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**METR_013** - ¿Comparan su rendimiento con períodos anteriores?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**METR_014** - ¿Saben qué factores impactan más sus resultados?
- **Opciones:** No sabemos | Intuición | Análisis básico | Análisis avanzado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**METR_015** - ¿Pueden simular "qué pasaría si" cambiamos algo?
- **Opciones:** No | Estimaciones manuales | Modelos básicos | Simulación avanzada
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

### **14.4 ANÁLISIS DE CALIDAD (5 preguntas)**

**METR_016** - ¿Miden la calidad de sus procesos? ¿Cómo?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 180s}

**METR_017** - ¿Saben cuántos errores cometen en procesos importantes?
- **Opciones:** No sabemos | Estimaciones | Conteo básico | Tracking sistemático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**METR_018** - ¿Miden la satisfacción de "clientes internos" de sus procesos?
- **Opciones:** No | Feedback informal | Encuestas ocasionales | Medición regular
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**METR_019** - ¿Pueden identificar cuándo un proceso se está degradando?
- **Opciones:** No | Cuando ya es problema | Señales tempranas | Alertas automáticas
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**METR_020** - ¿Comparan su rendimiento con mejores prácticas de la industria?
- **Opciones:** No | Ocasionalmente | Regularmente | Benchmarking formal
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

### **14.5 MÉTRICAS DE EFICIENCIA (5 preguntas)**

**METR_021** - ¿Saben cuánto tiempo "real" vs "total" toma un proceso?
- **Opciones:** No | Estimaciones | Medición básica | Análisis detallado
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**METR_022** - ¿Miden cuántas veces deben "rehacer" trabajo?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**METR_023** - ¿Saben qué porcentaje de tiempo sus recursos están productivos?
- **Opciones:** No idea | Estimaciones | Cálculos básicos | Tracking detallado
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**METR_024** - ¿Pueden identificar cuellos de botella en sus procesos?
- **Opciones:** No | Intuición | Análisis básico | Análisis sistemático
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**METR_025** - ¿Miden ROI de mejoras que implementan?
- **Opciones:** No | Estimaciones | Cálculos básicos | Medición rigurosa
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

## 15. COMUNICACIÓN Y STAKEHOLDERS

### **15.1 COMUNICACIÓN INTERNA (5 preguntas)**

**COM_001** - ¿Cómo se enteran de cambios importantes en procesos?
- **Opciones:** Se enteran cuando falla | Email | Reuniones | Chat | Sistema formal
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 120s}

**COM_002** - ¿Información importante llega a tiempo a quien la necesita?
- **Opciones:** Nunca | Rara vez | Frecuentemente | Siempre
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**COM_003** - ¿Tienen problemas de comunicación entre áreas/departamentos?
- **Opciones:** Graves problemas | Algunos problemas | Problemas menores | Sin problemas
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**COM_004** - ¿Realizan reuniones regulares de coordinación?
- **Opciones:** No | Esporádicas | Regulares pero largas | Regulares y eficientes
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**COM_005** - ¿Cómo mantienen informado al equipo sobre objetivos y prioridades?
- **Opciones:** No informamos | Email ocasional | Reuniones regulares | Sistema integral
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 120s}

### **15.2 FEEDBACK Y SUGERENCIAS (5 preguntas)**

**COM_006** - ¿Empleados pueden sugerir mejoras a procesos fácilmente?
- **Opciones:** No hay canal | Canal informal | Proceso formal | Sistema incentivado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**COM_007** - ¿Involucran a empleados de primera línea en diseño de procesos?
- **Opciones:** Nunca | Ocasionalmente | Frecuentemente | Siempre
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**COM_008** - ¿Cómo manejan quejas internas sobre procesos ineficientes?
- **Opciones:** Las ignoramos | Las escuchamos | Las analizamos | Las resolvemos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**COM_009** - ¿Celebran cuando alguien identifica un problema o mejora?
- **Opciones:** No | Informalmente | Reconocimiento formal | Sistema de recompensas
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 7, tiempo: 60s}

**COM_010** - ¿Empleados sienten que pueden influir en cómo se hacen las cosas?
- **Opciones:** No pueden influir | Poca influencia | Influencia moderada | Mucha influencia
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **15.3 COORDINACIÓN INTER-ÁREA (5 preguntas)**

**COM_011** - ¿Diferentes áreas entienden cómo su trabajo afecta a otros?
- **Opciones:** No entienden | Entienden poco | Entienden bien | Total comprensión
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**COM_012** - ¿Tienen conflictos frecuentes entre áreas sobre procesos?
- **Opciones:** Conflictos constantes | Conflictos frecuentes | Conflictos ocasionales | Sin conflictos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**COM_013** - ¿Existe colaboración natural entre áreas o requiere intervención?
- **Opciones:** Requiere intervención | Colaboración forzada | Colaboración natural | Colaboración fluida
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**COM_014** - ¿Cómo resuelven cuando un proceso involucra múltiples áreas?
- **Opciones:** Ad-hoc | Coordinación informal | Proceso definido | Sistema automático
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**COM_015** - ¿Áreas diferentes tienen prioridades conflictivas?
- **Opciones:** Siempre conflicto | Frecuente conflicto | Ocasional conflicto | Alineación total
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **15.4 COMUNICACIÓN EXTERNA (3 preguntas)**

**COM_016** - ¿Clientes entienden sus procesos cuando es necesario?
- **Opciones:** No entienden | Entienden poco | Entienden bien | Transparencia total
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**COM_017** - ¿Proveedores conocen sus requerimientos de proceso?
- **Opciones:** No conocen | Conocen poco | Conocen bien | Integración total
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**COM_018** - ¿Comunican proactivamente cuando hay cambios que afectan externos?
- **Opciones:** No comunicamos | Comunicamos tarde | Comunicación oportuna | Comunicación proactiva
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

## 16. COSTOS OCULTOS

### **16.1 COSTOS DE TIEMPO (5 preguntas)**

**COST_001** - ¿Cuánto tiempo pierden semanalmente en reuniones improductivas?
- **Opciones:** 0 horas | < 2 horas | 2-5 horas | 5-10 horas | > 10 horas
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**COST_002** - ¿Cuánto tiempo dedican a buscar información que debería estar disponible?
- **Opciones:** 0 tiempo | < 1 hora/día | 1-2 horas/día | 2-4 horas/día | > 4 horas/día
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**COST_003** - ¿Cuánto tiempo pierden esperando aprobaciones?
- **Opciones:** 0 tiempo | < 2 horas/semana | 2-8 horas/semana | 8-20 horas/semana | > 20 horas/semana
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**COST_004** - ¿Cuánto tiempo dedican a "coordinación" vs trabajo productivo?
- **Opciones:** 0-10% | 11-25% | 26-40% | 41-60% | > 60%
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**COST_005** - ¿Empleados hacen trabajo "extra" para compensar procesos ineficientes?
- **Opciones:** Nunca | Ocasionalmente | Frecuentemente | Constantemente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

### **16.2 COSTOS DE ERRORES (5 preguntas)**

**COST_006** - ¿Cuánto les cuesta típicamente corregir un error importante?
- **Opciones:** < $100k CLP | $100-500k CLP | $500k-1M CLP | > 1M CLP
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**COST_007** - ¿Tienen costos por re-trabajo frecuente?
- **Opciones:** No | Ocasionalmente | Frecuentemente | Constantemente
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 60s}

**COST_008** - ¿Han perdido clientes por errores en procesos?
- **Opciones:** Nunca | 1-2 clientes | 3-5 clientes | > 5 clientes
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**COST_009** - ¿Tienen costos regulares por incumplimientos o multas?
- **Opciones:** Nunca | Rara vez | Ocasionalmente | Frecuentemente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**COST_010** - ¿Cuánto gastan "apagando incendios" vs trabajo planificado?
- **Opciones:** 0-10% | 11-25% | 26-50% | > 50%
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

### **16.3 COSTOS DE OPORTUNIDAD (5 preguntas)**

**COST_011** - ¿Han perdido oportunidades de negocio por procesos lentos?
- **Opciones:** Nunca | 1-2 oportunidades | 3-5 oportunidades | > 5 oportunidades
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**COST_012** - ¿Empleados clave pierden tiempo en tareas administrativas?
- **Opciones:** No | < 20% tiempo | 20-40% tiempo | > 40% tiempo
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 90s}

**COST_013** - ¿Procesos ineficientes les impiden crecer más rápido?
- **Opciones:** No | Poco impacto | Impacto moderado | Gran limitante
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 60s}

**COST_014** - ¿Gastan más en recursos humanos para compensar ineficiencias?
- **Opciones:** No | Algunos roles extra | Varios roles extra | Muchos roles extra
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**COST_015** - ¿Inversiones en tecnología no dan el ROI esperado por procesos mal definidos?
- **Opciones:** No aplica | ROI completo | ROI parcial | ROI muy bajo
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

## 17. GESTIÓN DEL CAMBIO

### **17.1 APERTURA AL CAMBIO (5 preguntas)**

**CHG_001** - ¿Cómo reacciona su equipo típicamente a cambios en procesos?
- **Opciones:** Resistencia fuerte | Escepticismo | Apertura cautelosa | Entusiasmo | Varía mucho
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**CHG_002** - ¿Han tenido iniciativas de cambio que fracasaron? ¿Por qué?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 180s}

**CHG_003** - ¿Involucran al equipo en diseñar cambios o se los imponen?
- **Opciones:** Los imponemos | Poca participación | Participación moderada | Diseño colaborativo
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**CHG_004** - ¿Explican el "por qué" cuando implementan cambios?
- **Opciones:** No explicamos | Explicación básica | Explicación completa | Comunicación integral
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**CHG_005** - ¿Tienen "early adopters" que ayudan con cambios?
- **Opciones:** No | Algunos informales | Champions designados | Red de promotores
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

### **17.2 BARRERAS AL CAMBIO (5 preguntas)**

**CHG_006** - ¿Cuáles son las principales resistencias cuando proponen cambios?
- **Opciones:** [Múltiple] Trabajo adicional | Desconfianza tecnología | Pérdida control | Falta tiempo | No ven beneficio
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 120s}

**CHG_007** - ¿Empleados sienten que cambios constantes los agobian?
- **Opciones:** Muy agobiados | Algo agobiados | Poco agobiados | No agobiados
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

**CHG_008** - ¿Tienen personas que se oponen sistemáticamente a cambios?
- **Opciones:** Muchas personas | Algunas personas | Pocas personas | Ninguna
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

**CHG_009** - ¿Falta de capacitación es una barrera para adoptar cambios?
- **Opciones:** Gran barrera | Barrera moderada | Barrera menor | No es barrera
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CHG_010** - ¿Cambios anteriores generaron más trabajo sin beneficios claros?
- **Opciones:** Frecuentemente | Ocasionalmente | Rara vez | Nunca
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

### **17.3 CAPACIDAD DE ADAPTACIÓN (5 preguntas)**

**CHG_011** - ¿Qué tan rápido su organización puede adaptarse a cambios externos?
- **Opciones:** Muy lento | Lento | Moderado | Rápido | Muy rápido
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CHG_012** - ¿Aprenden de cambios anteriores para hacer futuros cambios mejor?
- **Opciones:** No aprendemos | Aprendemos poco | Aprendemos moderadamente | Aprendemos mucho
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**CHG_013** - ¿Tienen flexibilidad para experimentar con nuevas formas de trabajo?
- **Opciones:** Nula flexibilidad | Poca flexibilidad | Flexibilidad moderada | Mucha flexibilidad
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CHG_014** - ¿Pueden implementar cambios pequeños rápidamente?
- **Opciones:** No | Con dificultad | Moderadamente | Muy rápido
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CHG_015** - ¿Su cultura favorece estabilidad o innovación?
- **Opciones:** Estabilidad total | Principalmente estabilidad | Equilibrio | Principalmente innovación | Innovación total
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **17.4 LIDERAZGO DEL CAMBIO (5 preguntas)**

**CHG_016** - ¿Líderes modelan los cambios que piden implementar?
- **Opciones:** Nunca | Ocasionalmente | Frecuentemente | Siempre
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

**CHG_017** - ¿Gerentes tienen tiempo para liderar cambios o están muy ocupados operando?
- **Opciones:** Solo operación | Principalmente operación | Equilibrio | Tiempo para cambio
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**CHG_018** - ¿Hay consecuencias por no adoptar cambios aprobados?
- **Opciones:** No hay consecuencias | Consecuencias menores | Consecuencias claras | Enforcement estricto
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

**CHG_019** - ¿Reconocen/premian a quienes adoptan cambios exitosamente?
- **Opciones:** No | Reconocimiento informal | Reconocimiento formal | Sistema de incentivos
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 7, tiempo: 60s}

**CHG_020** - ¿Tienen sponsors ejecutivos visibles para cambios importantes?
- **Opciones:** No | Sponsor nominal | Sponsor activo | Liderazgo fuerte
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

## 18. CAPACIDAD Y ESCALABILIDAD

### **18.1 CAPACIDAD ACTUAL (5 preguntas)**

**CAP_001** - ¿Pueden manejar 50% más volumen con procesos actuales?
- **Opciones:** Imposible | Con mucha dificultad | Con dificultad | Sin problema
- **Seguimiento:** ¿Dónde sería el primer cuello de botella?
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**CAP_002** - ¿Qué porcentaje de capacidad utilizan normalmente?
- **Opciones:** < 50% | 50-70% | 70-85% | 85-95% | > 95%
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CAP_003** - ¿Pueden redistribuir trabajo cuando alguien está sobrecargado?
- **Opciones:** No | Con dificultad | Moderadamente | Fácilmente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CAP_004** - ¿Tienen visibilidad de quién está ocupado vs disponible?
- **Opciones:** No | Poca visibilidad | Visibilidad moderada | Visibilidad completa
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**CAP_005** - ¿Procesos funcionan igual de bien con volumen alto vs bajo?
- **Opciones:** Muy diferente | Algo diferente | Poco diferente | Igual performance
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

### **18.2 ESCALABILIDAD DE PROCESOS (5 preguntas)**

**CAP_006** - ¿Necesitarían contratar proporcionalmente más gente para crecer?
- **Opciones:** Sí, linealmente | Más que linealmente | Menos que linealmente | No necesariamente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**CAP_007** - ¿Procesos se vuelven más complejos cuando crecen?
- **Opciones:** Mucho más complejos | Algo más complejos | Poca diferencia | Igual complejidad
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CAP_008** - ¿Pueden estandarizar procesos para que sean menos dependientes de personas específicas?
- **Opciones:** Muy difícil | Difícil | Moderadamente fácil | Fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**CAP_009** - ¿Su infraestructura tecnológica puede crecer con el negocio?
- **Opciones:** No | Con inversión grande | Con ajustes menores | Escala automáticamente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 90s}

**CAP_010** - ¿Procesos funcionan igual en diferentes ubicaciones?
- **Opciones:** No aplica | Muy diferente | Algo diferente | Exactamente igual
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

### **18.3 FLEXIBILIDAD OPERACIONAL (4 preguntas)**

**CAP_011** - ¿Pueden ajustar operaciones rápidamente según demanda?
- **Opciones:** No | Con dificultad | Moderadamente | Muy ágil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CAP_012** - ¿Empleados pueden trabajar en diferentes procesos según necesidad?
- **Opciones:** No | Algunos empleados | Mayoría empleados | Todos polivalentes
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CAP_013** - ¿Pueden subcontratar partes de procesos si es necesario?
- **Opciones:** No | Con dificultad | Moderadamente | Fácilmente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**CAP_014** - ¿Procesos funcionan bien con trabajo remoto/híbrido?
- **Opciones:** No funcionan | Funcionan mal | Funcionan bien | Optimizados remoto
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

### **18.4 PLANIFICACIÓN DE CAPACIDAD (4 preguntas)**

**CAP_015** - ¿Planifican capacidad futura o reaccionan cuando hay problemas?
- **Opciones:** Solo reactivo | Principalmente reactivo | Algo proactivo | Muy proactivo
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**CAP_016** - ¿Pueden predecir cuándo necesitarán más capacidad?
- **Opciones:** No | Con poca precisión | Con precisión moderada | Con alta precisión
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**CAP_017** - ¿Saben cuánto tiempo toma aumentar capacidad cuando es necesario?
- **Opciones:** No sabemos | Estimaciones vagas | Estimaciones buenas | Datos precisos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**CAP_018** - ¿Pueden manejar diferentes tipos de productos/servicios con mismos procesos?
- **Opciones:** No | Con modificaciones | Con ajustes menores | Procesos flexibles
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

## 19. SEGURIDAD Y COMPLIANCE

### **19.1 SEGURIDAD DE PROCESOS (5 preguntas)**

**SEC_001** - ¿Quién puede ver/modificar información sensible en sus procesos?
- **Opciones:** Cualquiera | Control básico | Control por roles | Control granular
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**SEC_002** - ¿Tienen trazabilidad de quién hizo qué y cuándo?
- **Opciones:** No | Trazabilidad básica | Trazabilidad completa | Auditoria automática
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**SEC_003** - ¿Empleados pueden acceder a información que no necesitan para su trabajo?
- **Opciones:** Acceso total | Mucho acceso extra | Poco acceso extra | Solo lo necesario
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**SEC_004** - ¿Cómo previenen errores accidentales en procesos críticos?
- **Opciones:** No prevenimos | Capacitación | Controles básicos | Controles automáticos
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**SEC_005** - ¿Tienen controles para prevenir fraude en procesos financieros?
- **Opciones:** No | Controles básicos | Controles formales | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

### **19.2 CUMPLIMIENTO NORMATIVO (5 preguntas)**

**SEC_006** - ¿Sus procesos cumplen todas las regulaciones aplicables?
- **Opciones:** No sabemos | Creemos que sí | Mayoría cumple | Cumplimiento total
- **Seguimiento:** ¿Cómo lo verifican?
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**SEC_007** - ¿Se mantienen actualizados con cambios normativos?
- **Opciones:** No | Asesor ocasional | Monitoreo regular | Sistema automático
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 90s}

**SEC_008** - ¿Pueden demostrar cumplimiento cuando hay auditorías?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**SEC_009** - ¿Han tenido multas o sanciones por incumplimiento?
- **Opciones:** Frecuentes | Ocasionales | Raras | Nunca
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 60s}

**SEC_010** - ¿Procesos generan la documentación necesaria para compliance?
- **Opciones:** No | Documentación básica | Documentación completa | Automática
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

### **19.3 GESTIÓN DE RIESGOS (5 preguntas)**

**SEC_011** - ¿Han identificado qué puede salir mal en procesos críticos?
- **Opciones:** No | Identificación básica | Análisis formal | Matriz completa
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 120s}

**SEC_012** - ¿Tienen controles para mitigar riesgos identificados?
- **Opciones:** No | Controles básicos | Controles formales | Sistema integral
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 90s}

**SEC_013** - ¿Monitorean indicadores de riesgo en tiempo real?
- **Opciones:** No | Monitoreo básico | Alertas automáticas | Dashboard integral
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**SEC_014** - ¿Tienen planes de respuesta para riesgos materializados?
- **Opciones:** No | Plans básicos | Documentado | Probado regularmente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**SEC_015** - ¿Comunican riesgos efectivamente a stakeholders relevantes?
- **Opciones:** No | Comunicación básica | Reportes regulares | Dashboard tiempo real
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

### **19.4 CONTINUIDAD DE NEGOCIO (5 preguntas)**

**SEC_016** - ¿Tienen identificados procesos que no pueden parar?
- **Opciones:** No | Algunos identificados | Mayoría identificados | Todos mapeados
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**SEC_017** - ¿Tienen planes probados para mantener procesos críticos durante crisis?
- **Opciones:** No | Plans básicos | Documentado | Probado regularmente
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 9, tiempo: 120s}

**SEC_018** - ¿Pueden trabajar desde ubicaciones alternativas si es necesario?
- **Opciones:** No | Con dificultad | Moderadamente | Sin problema
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**SEC_019** - ¿Tienen respaldos de información crítica probados regularmente?
- **Opciones:** No | Respaldos sin probar | Probados ocasionalmente | Probados regularmente
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 90s}

**SEC_020** - ¿Saben cuánto tiempo pueden estar sin procesos críticos antes de impacto severo?
- **Opciones:** No sabemos | Estimaciones vagas | Análisis básico | RTO definidos
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

## 20. INNOVACIÓN Y MEJORA CONTINUA

### **20.1 CULTURA DE MEJORA (5 preguntas)**

**INN_001** - ¿Empleados buscan activamente formas de mejorar procesos?
- **Opciones:** No | Algunos empleados | Mayoría empleados | Cultura fuerte
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**INN_002** - ¿Celebran mejoras pequeñas o solo grandes cambios?
- **Opciones:** Solo grandes | Principalmente grandes | Mejoras pequeñas | Kaizen culture
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

**INN_003** - ¿Tienen tiempo dedicado para pensar en mejoras?
- **Opciones:** No | Tiempo personal | Tiempo asignado | Tiempo estructurado
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 7, tiempo: 60s}

**INN_004** - ¿Miden el impacto de mejoras implementadas?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 60s}

**INN_005** - ¿Comparten mejoras exitosas entre diferentes áreas?
- **Opciones:** No | Informalmente | Proceso formal | Sistema integral
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

### **20.2 IDENTIFICACIÓN DE OPORTUNIDADES (5 preguntas)**

**INN_006** - ¿Cómo identifican qué procesos necesitan mejora?
- **Opciones:** [Múltiple] Quejas clientes | Análisis datos | Sugerencias empleados | Benchmarking | Auditorías
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 120s}

**INN_007** - ¿Priorizan mejoras por impacto o por facilidad de implementación?
- **Opciones:** Solo facilidad | Principalmente facilidad | Equilibrio | Principalmente impacto | Solo impacto
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 90s}

**INN_008** - ¿Buscan inspiración en otras industrias?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 7, tiempo: 60s}

**INN_009** - ¿Analizan por qué ciertos procesos funcionan mejor que otros?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 9, tiempo: 90s}

**INN_010** - ¿Involucran a clientes en identificar oportunidades de mejora?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

### **20.3 EXPERIMENTACIÓN (4 preguntas)**

**INN_011** - ¿Pueden probar cambios pequeños antes de implementar completamente?
- **Opciones:** No | Con dificultad | Moderadamente | Fácilmente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

**INN_012** - ¿Tienen tolerancia al fracaso en experimentos de mejora?
- **Opciones:** Intolerancia total | Baja tolerancia | Tolerancia moderada | Alta tolerancia
- **Metadata:** {prioridad_automatizacion: 4, valor_sop: 8, tiempo: 60s}

**INN_013** - ¿Documentan qué funciona y qué no en experimentos?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 9, tiempo: 60s}

**INN_014** - ¿Pueden revertir cambios si no funcionan como esperado?
- **Opciones:** Muy difícil | Difícil | Relativamente fácil | Muy fácil
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

### **20.4 ADOPCIÓN DE TECNOLOGÍA (3 preguntas)**

**INN_015** - ¿Evalúan regularmente nuevas tecnologías para mejorar procesos?
- **Opciones:** No | Ocasionalmente | Regularmente | Sistemáticamente
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 90s}

**INN_016** - ¿Pueden implementar nuevas herramientas rápidamente cuando hay una buena oportunidad?
- **Opciones:** Muy lento | Lento | Moderado | Rápido
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 7, tiempo: 60s}

**INN_017** - ¿Usan datos para evaluar si experimentos fueron exitosos?
- **Opciones:** No | Datos básicos | Análisis formal | Analytics avanzado
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

---

# SECCIÓN C: ANÁLISIS TRANSVERSAL

## 21. ANÁLISIS DE AUTOMATIZACIÓN

**AUT_001** - Para cada proceso identificado: ¿Este proceso se ejecuta siempre de la misma manera?
- **Opciones:** Nunca igual | Pocas veces igual | Frecuentemente igual | Siempre igual
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 9, tiempo: 90s}

**AUT_002** - ¿Las reglas de decisión son claras y consistentes?
- **Opciones:** No hay reglas | Reglas vagas | Reglas claras | Reglas documentadas
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 10, tiempo: 90s}

**AUT_003** - ¿Qué información necesita para ejecutar este proceso?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 120s}

**AUT_004** - ¿Esta información está disponible digitalmente?
- **Opciones:** No | Parcialmente | Mayormente | Completamente
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 8, tiempo: 60s}

**AUT_005** - ¿Cuánto tiempo promedio toma ejecutar este proceso?
- **Tipo_respuesta:** numeric_with_time_unit
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

**AUT_006** - ¿Con qué frecuencia se ejecuta este proceso?
- **Opciones:** Anualmente | Mensualmente | Semanalmente | Diariamente | Varias veces/día
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**AUT_007** - ¿Qué pasa si este proceso se retrasa o falla?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**AUT_008** - ¿Quién más se ve afectado si este proceso no funciona bien?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

## 22. ANÁLISIS DE IMPACTO ECONÓMICO

**ECO_001** - ¿Cuánto les cuesta ejecutar este proceso actualmente? (tiempo, recursos, errores)
- **Tipo_respuesta:** numeric_with_currency
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 9, tiempo: 120s}

**ECO_002** - ¿Qué beneficio económico tendría mejorar este proceso?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 180s}

**ECO_003** - ¿Cuántas personas están involucradas en este proceso?
- **Tipo_respuesta:** numeric
- **Metadata:** {prioridad_automatizacion: 7, valor_sop: 8, tiempo: 60s}

**ECO_004** - ¿Qué porcentaje de su tiempo dedican a este proceso?
- **Tipo_respuesta:** percentage
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 8, tiempo: 60s}

**ECO_005** - ¿Han calculado el costo de los errores en este proceso?
- **Opciones:** No | Estimación básica | Cálculo detallado | Tracking continuo
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 9, tiempo: 90s}

## 23. ANÁLISIS DE MADUREZ DIGITAL

**DIG_026** - ¿Qué herramientas digitales usan actualmente?
- **Tipo_respuesta:** multiple_text
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 180s}

**DIG_027** - ¿Están dispuestos a cambiar la forma de trabajar para mejorar?
- **Opciones:** No dispuestos | Poco dispuestos | Moderadamente dispuestos | Muy dispuestos
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 60s}

**DIG_028** - ¿Qué tan cómodo está su equipo con la tecnología?
- **Opciones:** Muy incómodo | Poco cómodo | Moderadamente cómodo | Muy cómodo
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 7, tiempo: 60s}

**DIG_029** - ¿Han implementado cambios tecnológicos antes? ¿Cómo resultó?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 5, valor_sop: 8, tiempo: 180s}

**DIG_030** - ¿Qué presupuesto considerarían para mejorar procesos?
- **Opciones:** $0-1M CLP | $1-5M CLP | $5-15M CLP | $15-50M CLP | $50M+ CLP
- **Metadata:** {prioridad_automatizacion: 6, valor_sop: 8, tiempo: 90s}

## 24. ANÁLISIS DE PRIORIZACIÓN

**PRI_001** - ¿Cuáles considera que son sus 3 procesos más críticos?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 10, tiempo: 180s}

**PRI_002** - ¿Qué procesos les causan más dolores de cabeza?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 10, tiempo: 180s}

**PRI_003** - ¿Dónde creen que tienen las mayores oportunidades de mejora?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 9, valor_sop: 10, tiempo: 180s}

**PRI_004** - ¿Qué procesos, si mejoraran, tendrían mayor impacto en el negocio?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 10, valor_sop: 10, tiempo: 180s}

**PRI_005** - ¿Cuáles son sus principales desafíos operacionales actuales?
- **Tipo_respuesta:** text_area
- **Metadata:** {prioridad_automatizacion: 8, valor_sop: 10, tiempo: 180s}

---

## CRITERIOS DE SELECCIÓN INTELIGENTE

### **ALGORITMO DE SELECCIÓN POR CONTEXTO**

```javascript
// Pseudo-código para selección automática de preguntas
function seleccionarPreguntas(empresa) {
  let preguntasSeleccionadas = [];
  
  // PREGUNTAS OBLIGATORIAS (siempre incluir)
  preguntasSeleccionadas.push(...PREGUNTAS_CORE_OBLIGATORIAS);
  
  // SELECCIÓN POR INDUSTRIA
  if (empresa.industria === "retail") {
    preguntasSeleccionadas.push(...PREGUNTAS_INVENTARIO);
    preguntasSeleccionadas.push(...PREGUNTAS_ATENCION_CLIENTE);
  } else if (empresa.industria === "servicios") {
    preguntasSeleccionadas.push(...PREGUNTAS_GESTION_CLIENTES);
    preguntasSeleccionadas.push(...PREGUNTAS_FACTURACION);
  }
  
  // SELECCIÓN POR TAMAÑO
  if (empresa.empleados > 50) {
    preguntasSeleccionadas.push(...PREGUNTAS_RRHH_AVANZADAS);
    preguntasSeleccionadas.push(...PREGUNTAS_COMPLIANCE);
  }
  
  // SELECCIÓN POR MADUREZ DIGITAL
  if (empresa.madurezDigital === "baja") {
    preguntasSeleccionadas.push(...PREGUNTAS_DIGITALIZACION_BASICA);
  } else {
    preguntasSeleccionadas.push(...PREGUNTAS_INTEGRACION_AVANZADA);
  }
  
  // PRIORIZACIÓN Y LÍMITE
  return priorizarYLimitar(preguntasSeleccionadas, 35);
}
```

### **MATRIX DE SELECCIÓN POR INDUSTRIA**

| **Industria** | **Preguntas Core** | **Preguntas Específicas** | **Total Estimado** |
|---------------|-------------------|---------------------------|-------------------|
| **Contabilidad** | VEN_001-024, FIN_001-024 | LEG_001-012, METR_001-025 | 32-38 preguntas |
| **Retail** | VEN_001-024, OPS_001-030 | CLI_001-016, COST_001-015 | 35-42 preguntas |
| **Manufactura** | OPS_001-030, CAL_001-012 | COM_001-016, CAP_001-018 | 34-40 preguntas |
| **Servicios** | CLI_001-016, RH_001-018 | KNOW_001-022, COM_001-018 | 30-36 preguntas |
| **SaaS/Tech** | TI_001-014, DIG_001-030 | INN_001-017, CHG_001-020 | 36-44 preguntas |

### **TIEMPO ESTIMADO DE COMPLETADO**

**Por Sección:**
- Procesos Core (20-25 preguntas): 25-35 minutos
- Análisis Estratégico (10-15 preguntas): 15-25 minutos
- Preguntas Transversales (5-8 preguntas): 10-15 minutos

**Total Estimado:** 50-75 minutos (según industria y tamaño)

### **REGLAS DE NEGOCIO PARA FORMULARIOS ADAPTATIVOS**

1. **Máximo 40 preguntas por formulario** para evitar fatiga
2. **Mínimo 25 preguntas** para profundidad suficiente
3. **Agrupación lógica** por procesos para flow natural
4. **Preguntas de seguimiento condicionales** basadas en respuestas
5. **Progreso guardado** cada 5 preguntas completadas
6. **Estimación de tiempo restante** dinámica

### **VALIDACIÓN Y CALIDAD**

**Indicadores de Calidad del Formulario:**
- Tasa de completado > 85%
- Tiempo promedio dentro de rango esperado
- Menos de 3 preguntas sin responder por formulario
- Score de satisfacción post-completado > 4.0/5.0

**Métricas de Efectividad:**
- Procesos identificados vs. realidad (validación cliente)
- Precisión de SOPs generados (score de validación)
- Relevancia de propuestas de automatización (acceptance rate)

---

## CASOS DE USO POR INDUSTRIA

### **CASO 1: CONSULTORÍA CONTABLE (50 empleados)**
**Preguntas Seleccionadas:**
- Core: VEN_007-015, FIN_001-024, CLI_001-010 (25 preguntas)
- Específicas: LEG_001-006, RH_007-012, KNOW_001-010 (16 preguntas)
- **Total: 41 preguntas, ~65 minutos**

### **CASO 2: E-COMMERCE RETAIL (15 empleados)**
**Preguntas Seleccionadas:**
- Core: VEN_001-024, OPS_001-020, CLI_011-016 (32 preguntas)
- Específicas: DIG_001-010, COST_001-010 (20 preguntas)
- **Total: 38 preguntas, ~55 minutos**

### **CASO 3: STARTUP SAAS (8 empleados)**
**Preguntas Seleccionadas:**
- Core: VEN_001-015, TI_001-014, CLI_001-016 (24 preguntas)
- Específicas: DIG_016-025, CAP_001-010, INN_001-010 (20 preguntas)
- **Total: 35 preguntas, ~50 minutos**

---

**Este pool maestro de 500+ preguntas estructuradas permite generar formularios adaptativos únicos para cada empresa, maximizando la relevancia y minimizando la fatiga del usuario, mientras captura toda la información necesaria para un diagnóstico integral y generación automática de SOPs y propuestas de automatización.**