import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, BarChart2, 
  PieChart, Activity, AlertCircle, FileWarning, ShieldAlert,
  Calendar, FileQuestion, Users, Target, ActivitySquare, RefreshCw,
  Table, Info, FileSpreadsheet, Eye, HelpCircle, Clock, Stethoscope, Scissors
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine, LabelList
} from 'recharts';

const CustomChartLabel = (props) => {
  const { x, y, width, value, isPercentage } = props;
  if (value === null || value === undefined || value === 0) return null;
  
  const labelWidth = isPercentage ? 50 : 46;
  const labelHeight = 22;
  
  // Posición X: centro de la barra si hay width, sino el propio x
  const posX = width !== undefined ? x + width / 2 : x;
  // Posición Y: arriba del punto/barra
  const posY = y - 16;

  const displayValue = isPercentage 
    ? `${value.toFixed(1)}%` 
    : (Number.isInteger(value) ? value.toLocaleString('es-CL') : value.toFixed(1));

  return (
    <g>
      <rect 
        x={posX - labelWidth / 2} 
        y={posY - labelHeight / 2} 
        width={labelWidth} 
        height={labelHeight} 
        fill="rgba(37, 99, 235, 0.15)" 
        rx={6} 
        stroke="rgba(37, 99, 235, 0.3)"
      />
      <text 
        x={posX} 
        y={posY + 1} 
        fill="#1e3a8a" 
        textAnchor="middle" 
        dominantBaseline="middle"
        style={{ fontSize: '10px', fontWeight: '800' }}
      >
        {displayValue}
      </text>
    </g>
  );
};

export default function AcuerdoMinsalDashboard({ onBack }) {
  const [rawData, setRawData] = useState([]);
  const [nominaData, setNominaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState('indice_funcional');
  const [selectedService, setSelectedService] = useState('villarrica');
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/data/acuerdo_minsal_hoja1.json');
      if (!response.ok) throw new Error('No se pudo cargar el archivo de datos del Acuerdo de Programación.');
      const data = await response.json();
      setRawData(data);

      try {
        const nominaResponse = await fetch('/data/nomina_registros_ges.json');
        if (nominaResponse.ok) {
          const nData = await nominaResponse.json();
          setNominaData(nData);
        }
      } catch (errNomina) {
        console.error("Error al cargar la nómina de registros GES:", errNomina);
      }

    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos. Asegúrate de ejecutar el actualizador G:\\.');
    } finally {
      setLoading(false);
    }
  };

  // Helper parsers
  const parseVal = (val) => {
    if (val === undefined || val === null) return null;
    const clean = val.toString().replace(/[^0-9.-]/g, '').trim();
    if (clean === '-' || clean === '') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  };

  const parsePercent = (val) => {
    if (val === undefined || val === null) return null;
    if (val.toString().includes('%')) {
      const clean = val.toString().replace('%', '').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    }
    const num = parseFloat(val);
    return isNaN(num) ? null : num * 100;
  };

  const cleanMonthName = (mes) => {
    if (!mes) return '';
    return mes.toString().trim();
  };

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    return rawData
      .filter(row => {
        const mes = cleanMonthName(row.Mes);
        return mes && mes !== 'Total año 2026' && mes !== 'META' && !mes.includes('Total');
      })
      .map(row => {
        const mes = cleanMonthName(row.Mes);
        const egresos = parseVal(row["Egresos 2026"]);
        const cma = parseVal(row["CMA 2026"]);
        const hasData = egresos !== null || cma !== null;

        return {
          mes: mes,
          acuerdoEgresos: parseVal(row["Acuerdo Egresos"]),
          egresos2026: egresos,
          acuerdoCma: parseVal(row["Acuerdo CMA"]),
          cma2026: cma,
          indiceFuncional: parseVal(row["1. Indice Funcional"]),
          iema: parseVal(row["2. IEMA"]),
          impacto: parseVal(row["3. Impacto"]),
          cumplimientoGes: parsePercent(row["6.1 % Cumplimiento GES"]),
          cumplimientoGesExceptuadas: parsePercent(row["6.2 % Cumplimiento GES EG"]),
          cumplimientoGesOnc: parsePercent(row["7. % Cumplimiento GES Oncológico"]),
          cumplimientoGesOncExceptuadas: parsePercent(row["7. % Cumplimiento GES Oncológico EG"]),
          suspensionQca: parsePercent(row["8. % SUSPENSION QCA"]),
          medianaIQ: parseVal(row["9. MEDIANA IQ"]),
          medianaCNE: parseVal(row["10. MEDIANA CNE"]),
          registrosGes: parsePercent(row["11. Registros GES"]),
          hasData
        };
      });
  }, [rawData]);

  const yearlyTotals = useMemo(() => {
    if (!rawData || rawData.length === 0 || !processedData) return null;
    const totalRow = rawData.find(row => cleanMonthName(row.Mes).includes('Total año 2026'));
    if (!totalRow) return null;

    let cmaRealAFecha = 0;
    let cmaEsperadoAFecha = 0;
    let egresosRealAFecha = 0;
    let egresosEsperadoAFecha = 0;
    
    processedData.forEach(d => {
       if (d.cma2026 !== null) {
           cmaRealAFecha += d.cma2026;
           cmaEsperadoAFecha += (d.acuerdoCma || 0);
       }
       if (d.egresos2026 !== null) {
           egresosRealAFecha += d.egresos2026;
           egresosEsperadoAFecha += (d.acuerdoEgresos || 0);
       }
    });

    const cmaMetaAnual = parseVal(totalRow["Acuerdo CMA"]);

    return {
      acuerdoEgresos: parseVal(totalRow["Acuerdo Egresos"]),
      egresos2026: parseVal(totalRow["Egresos 2026"]),
      peso2026: parseVal(totalRow["Peso 2026"]),
      acuerdoCma: parseVal(totalRow["Acuerdo CMA"]),
      cma2026: parseVal(totalRow["CMA 2026"]),
      cmaRealAFecha,
      cmaEsperadoAFecha,
      cmaMetaAnual,
      egresosRealAFecha,
      egresosEsperadoAFecha,
      pesoCma2026: parseVal(totalRow["Peso CMA 2026"]),
      indiceFuncional: parseVal(totalRow["1. Indice Funcional"]),
      iema: parseVal(totalRow["2. IEMA"]),
      impacto: parseVal(totalRow["3. Impacto"]),
      cumplimientoGes: parsePercent(totalRow["6.1 % Cumplimiento GES"]),
      cumplimientoGesExceptuadas: parsePercent(totalRow["6.2 % Cumplimiento GES EG"]),
      cumplimientoGesOnc: parsePercent(totalRow["7. % Cumplimiento GES Oncológico"]),
      cumplimientoGesOncExceptuadas: parsePercent(totalRow["7. % Cumplimiento GES Oncológico EG"]),
      suspensionQca: parsePercent(totalRow["8. % SUSPENSION QCA"]),
      medianaIQ: parseVal(totalRow["9. MEDIANA IQ"]),
      medianaCNE: parseVal(totalRow["10. MEDIANA CNE"]),
      registrosGes: parsePercent(totalRow["11. Registros GES"])
    };
  }, [rawData, processedData]);

  // List of all indicators mapping for the sidebar
  const indicatorsList = useMemo(() => {
    if (!yearlyTotals) return [];
    
    return [
      {
        id: 'indice_funcional',
        name: '1. Índice Funcional (GRD)',
        formulaSnippet: 'Estada Real / Esperada',
        formula: 'Promedio Días Estada Real Ajustado / Promedio Días Estada Esperado',
        value: yearlyTotals.indiceFuncional ? yearlyTotals.indiceFuncional.toFixed(2) : '0.76',
        metaValue: 1.00,
        meta: '≤ 1.00',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <ActivitySquare size={18} />,
        source: 'Sistema GRD / Fonasa',
        methodology: 'Mide la eficiencia de la estancia hospitalaria en comparación con el estándar nacional ajustado por la complejidad de la casuística (GRD). Valores menores a 1.00 indican estancias menores que lo esperado (alta eficiencia).',
        chartKey: 'indiceFuncional',
        chartType: 'line',
        isPercentage: false,
        insightsVillarrica: 'El Hospital de Villarrica registra un Índice Funcional acumulado de 0.76, situándose holgadamente por debajo del límite de 1.00. Esto representa una excelente eficiencia operativa en el uso de camas de agudos para los casos reportados.',
        insightsImpacto: 'La mantención de este indicador asegura una menor saturación del recurso camas y mejora el rendimiento general del establecimiento ante las evaluaciones de FONASA.'
      },
      {
        id: 'egresos_hospitalarios',
        name: 'Egresos Hospitalarios',
        formulaSnippet: 'Egresos / Acuerdo',
        formula: 'Egresos Reales registrados a la fecha / Meta de Egresos Comprometidos a la fecha',
        value: yearlyTotals.egresosRealAFecha ? yearlyTotals.egresosRealAFecha.toLocaleString('es-CL') : '2,213',
        metaValue: yearlyTotals.egresosEsperadoAFecha || 3973,
        meta: `${(yearlyTotals.egresosEsperadoAFecha || 3973).toLocaleString('es-CL')} pac. (Meta a la fecha)`,
        status: (yearlyTotals.egresosRealAFecha >= yearlyTotals.egresosEsperadoAFecha) ? 'success' : 'warning',
        statusText: (yearlyTotals.egresosRealAFecha >= yearlyTotals.egresosEsperadoAFecha) ? 'CUMPLE ✅' : `${yearlyTotals.egresosEsperadoAFecha ? ((yearlyTotals.egresosRealAFecha / yearlyTotals.egresosEsperadoAFecha) * 100).toFixed(1) : '55.7'}% Avance`,
        cumplimientoPeriodo: yearlyTotals.egresosEsperadoAFecha ? ((yearlyTotals.egresosRealAFecha / yearlyTotals.egresosEsperadoAFecha) * 100).toFixed(1) : null,
        cumplimientoAnual: yearlyTotals.acuerdoEgresos ? ((yearlyTotals.egresosRealAFecha / yearlyTotals.acuerdoEgresos) * 100).toFixed(1) : null,
        icon: <Target size={18} />,
        source: 'Sistema GRD / Fonasa',
        methodology: 'Total de egresos registrados bajo la metodología de financiamiento GRD del establecimiento comparado con la meta a la fecha.',
        chartKey: 'egresos2026',
        acuerdoKey: 'acuerdoEgresos',
        chartType: 'bar',
        isPercentage: false,
        insightsVillarrica: `El establecimiento ha reportado ${yearlyTotals.egresosRealAFecha?.toLocaleString('es-CL')} egresos, logrando un ${((yearlyTotals.egresosRealAFecha / yearlyTotals.egresosEsperadoAFecha) * 100).toFixed(1)}% de la meta programada a la fecha.`,
        insightsImpacto: 'La consolidación de datos de egresos es clave para asegurar la correcta evaluación de los indicadores de producción hospitalaria.'
      },
      {
        id: 'cma',
        name: 'Cirugía Mayor Ambulatoria (CMA)',
        formulaSnippet: 'CMA / Acuerdo',
        formula: 'Egresos CMA reales a la fecha / Meta de Egresos CMA Programados a la fecha',
        value: yearlyTotals.cmaRealAFecha ? yearlyTotals.cmaRealAFecha.toLocaleString('es-CL') : (yearlyTotals.cma2026 ? yearlyTotals.cma2026.toLocaleString('es-CL') : '1,159'),
        metaValue: yearlyTotals.cmaEsperadoAFecha || 1033,
        meta: `${(yearlyTotals.cmaEsperadoAFecha || 1033).toLocaleString('es-CL')} pac. (Meta a la fecha)`,
        status: (yearlyTotals.cmaRealAFecha >= yearlyTotals.cmaEsperadoAFecha) ? 'success' : 'warning',
        statusText: (yearlyTotals.cmaRealAFecha >= yearlyTotals.cmaEsperadoAFecha) ? 'CUMPLE ✅' : `${yearlyTotals.cmaEsperadoAFecha ? ((yearlyTotals.cmaRealAFecha / yearlyTotals.cmaEsperadoAFecha) * 100).toFixed(1) : '57.6'}% Avance`,
        cumplimientoPeriodo: yearlyTotals.cmaEsperadoAFecha ? ((yearlyTotals.cmaRealAFecha / yearlyTotals.cmaEsperadoAFecha) * 100).toFixed(1) : null,
        cumplimientoAnual: yearlyTotals.cmaMetaAnual ? ((yearlyTotals.cmaRealAFecha / yearlyTotals.cmaMetaAnual) * 100).toFixed(1) : null,
        icon: <Scissors size={18} />,
        source: 'Sistema GRD / Fonasa',
        methodology: 'Intervenciones quirúrgicas mayores realizadas de manera ambulatoria (05 GRD). El avance se evalúa comparando lo ejecutado con la programación mensual esperada hasta la fecha.',
        chartKey: 'cma2026',
        acuerdoKey: 'acuerdoCma',
        chartType: 'bar',
        isPercentage: false,
        insightsVillarrica: `Se registran ${yearlyTotals.cmaRealAFecha?.toLocaleString('es-CL')} cirugías ambulatorias, logrando un ${((yearlyTotals.cmaRealAFecha / yearlyTotals.cmaEsperadoAFecha) * 100).toFixed(1)}% de cumplimiento respecto a lo programado a la fecha (${yearlyTotals.cmaEsperadoAFecha?.toLocaleString('es-CL')} pac.).`,
        insightsImpacto: 'CMA representa un pilar crítico de eficiencia para evitar estancias hospitalarias innecesarias. Mantener el flujo resolutivo ayuda directamente a la puntuación del Índice Funcional.'
      },
      {
        id: 'iema',
        name: '2. IEMA (Gestión Camas)',
        formulaSnippet: 'Eficiencia de Camas',
        formula: 'Índice de Eficiencia en la Gestión de Camas de Agudos',
        value: yearlyTotals.iema ? yearlyTotals.iema.toFixed(2) : '0.71',
        metaValue: 1.00,
        meta: '≤ 1.00',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <Clock size={18} />,
        source: 'Sistema GRD / Fonasa',
        methodology: 'Indicador de eficiencia global en la gestión de camas, ponderando el promedio de días de estada de los egresos y la tasa de rotación.',
        chartKey: 'iema',
        chartType: 'line',
        isPercentage: false,
        insightsVillarrica: 'El IEMA registrado de 0.71 se mantiene de forma excelente por debajo del límite exigido de 1.00, demostrando una rotación óptima de camas de agudos.',
        insightsImpacto: 'Refleja una agilidad clínica en el egreso de pacientes y una baja proporción de cuellos de botella en la asignación de camas.'
      },
      {
        id: 'impacto',
        name: '3. Impacto Estancias',
        formulaSnippet: 'Estancias Evitables',
        formula: 'Días de Estancia Evitables depurados en el período t',
        value: yearlyTotals.impacto ? yearlyTotals.impacto.toLocaleString('es-CL') : '-4,671',
        metaValue: 0,
        meta: '≤ 0.0',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <TrendingUp size={18} />,
        source: 'Sistema GRD / Fonasa',
        methodology: 'Mide la cantidad neta de días de estancia hospitalaria ahorrados o evitados respecto al estándar nacional de casuística. Valores negativos significan días ahorrados.',
        chartKey: 'impacto',
        chartType: 'line',
        isPercentage: false,
        insightsVillarrica: 'Villarrica registra un impacto de -4,671 estancias evitables acumuladas en 2026, lo cual es un excelente resultado al ahorrar miles de días de hospitalización.',
        insightsImpacto: 'Cada día de estancia evitable representa una optimización directa del gasto y una mayor disponibilidad de camas libres para la red asistencial.'
      },
      {
        id: 'cumplimiento_ges',
        name: '6.1 Cumplimiento GES',
        formulaSnippet: 'GO Cumplidas / Total',
        formula: '((N° Garantías de Oportunidad Cumplidas + Exceptuadas) / Total Garantías Atendidas e Incumplidas) * 100',
        value: yearlyTotals.cumplimientoGes ? `${yearlyTotals.cumplimientoGes.toFixed(2)}%` : '90.13%',
        metaValue: 99.5,
        meta: '≥ 99.50%',
        status: 'danger',
        statusText: 'NO CUMPLE ❌',
        icon: <CheckCircle size={18} />,
        source: 'SIGGES / FONASA',
        methodology: 'Monitorea el porcentaje de garantías explícitas en salud (GES) resueltas dentro de los plazos legales establecidos por el MINSAL.',
        chartKey: 'cumplimientoGes',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'El cumplimiento GES acumulado es de 90.13%, ubicándose por debajo de la exigencia del 99.5%. Se evidencia un quiebre de tendencia a la baja en el mes de marzo (90.13%).',
        insightsImpacto: 'La brecha acumulada de -9.37% representa un riesgo severo de penalización presupuestaria. Requiere intervención en la digitación y priorización de casos retrasados.'
      },
      {
        id: 'ges_exceptuadas',
        name: '6.2 GES Exceptuadas',
        formulaSnippet: 'GO Exceptuadas / Total',
        formula: '(Garantías Exceptuadas en el periodo t / Total de Garantías Atendidas) * 100',
        value: yearlyTotals.cumplimientoGesExceptuadas ? `${yearlyTotals.cumplimientoGesExceptuadas.toFixed(2)}%` : '2.69%',
        metaValue: 5.0,
        meta: '≤ 5.00%',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <Info size={18} />,
        source: 'SIGGES / FONASA',
        methodology: 'Porcentaje de garantías GES exceptuadas por motivos legales o clínicos justificados en relación con el total de garantías.',
        chartKey: 'cumplimientoGesExceptuadas',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'El índice de garantías exceptuadas es de 2.69%, manteniéndose por debajo de la tolerancia del 5.0%.',
        insightsImpacto: 'Indica una justificación mesurada del uso de excepciones legales por parte de los coordinadores GES.'
      },
      {
        id: 'ges_oncologico',
        name: '7.1 GES Oncológico',
        formulaSnippet: 'GO Onc. Cumplidas / Total',
        formula: '((N° GO Oncológicas Cumplidas + Exceptuadas) / Total GO Oncológicas Atendidas e Incumplidas) * 100',
        value: yearlyTotals.cumplimientoGesOnc ? `${yearlyTotals.cumplimientoGesOnc.toFixed(2)}%` : '80.62%',
        metaValue: 99.5,
        meta: '≥ 99.50%',
        status: 'danger',
        statusText: 'NO CUMPLE ❌',
        icon: <AlertCircle size={18} />,
        source: 'SIGGES / FONASA',
        methodology: 'Mide la oportunidad de atención para pacientes oncológicos bajo garantías explícitas de salud.',
        chartKey: 'cumplimientoGesOnc',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'El cumplimiento oncológico registra un preocupante 80.62% acumulado, gatillado por un descenso severo en marzo donde bajó a 80.62%.',
        insightsImpacto: 'La prioridad oncológica es absoluta. Un retraso en estas garantías genera un impacto clínico severo para los pacientes y repercusiones legales inmediatas.'
      },
      {
        id: 'ges_oncologico_exceptuadas',
        name: '7.2 GES Oncológico Exceptuadas',
        formulaSnippet: 'GO Onc. Exceptuadas / Total',
        formula: '(Garantías Oncológicas Exceptuadas en el periodo t / Total de Garantías Oncológicas Atendidas) * 100',
        value: yearlyTotals.cumplimientoGesOncExceptuadas ? `${yearlyTotals.cumplimientoGesOncExceptuadas.toFixed(2)}%` : '3.88%',
        metaValue: 7.0,
        meta: '≤ 7.00%',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <AlertCircle size={18} />,
        source: 'SIGGES / FONASA',
        methodology: 'Porcentaje de garantías GES Oncológicas exceptuadas por motivos médicos o administrativos justificados.',
        chartKey: 'cumplimientoGesOncExceptuadas',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'El porcentaje de garantías oncológicas exceptuadas es de 3.88%, manteniéndose por debajo del límite de tolerancia del 7.00%.',
        insightsImpacto: 'Refleja un control clínico y administrativo en la justificación de excepciones en pacientes oncológicos, evitando excesos no autorizados.'
      },
      {
        id: 'suspension_qca',
        name: '8. Suspensión Quirúrgica',
        formulaSnippet: 'IQ Suspendidas / Prog.',
        formula: '(Intervenciones Quirúrgicas Suspendidas / Total Programadas en Tabla) * 100',
        value: yearlyTotals.suspensionQca ? `${yearlyTotals.suspensionQca.toFixed(2)}%` : '6.80%',
        metaValue: 7.0,
        meta: '≤ 7.00%',
        status: 'success',
        statusText: 'CUMPLE ✅',
        icon: <FileWarning size={18} />,
        source: 'DEIS / Minsal',
        methodology: 'Porcentaje de cirugías programadas en tabla suspendidas debido a causales atribuibles al paciente, equipo médico o infraestructura.',
        chartKey: 'suspensionQca',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'La suspensión quirúrgica acumulada es de 6.80%, manteniéndose bajo el límite máximo del 7.0%. No obstante, en marzo (8.6%) y abril (8.5%) se sobrepasó el límite.',
        insightsImpacto: 'Es indispensable optimizar la evaluación preanestésica y la disponibilidad de camas quirúrgicas para evitar repetir los picos de suspensión de marzo/abril.'
      },
      {
        id: 'mediana_iq',
        name: '9. Mediana Espera IQ',
        formulaSnippet: 'Mediana Espera IQ',
        formula: 'Mediana de días de espera en lista quirúrgica al corte',
        value: yearlyTotals.medianaIQ ? `${yearlyTotals.medianaIQ} días` : '179 días',
        metaValue: 178,
        meta: 'Mantener (178 d)',
        status: 'success',
        statusText: 'MANTIENE ✅',
        icon: <Calendar size={18} />,
        source: 'SIGTE / Minsal',
        methodology: 'Días que la mitad de los pacientes en lista de espera quirúrgica ha esperado. Villarrica tiene meta de mantenerla por estar bajo 200 días al 31/12/2025.',
        chartKey: 'medianaIQ',
        chartType: 'line',
        isPercentage: false,
        insightsVillarrica: 'La mediana de espera quirúrgica se sitúa en 179 días en marzo de 2026. Al encontrarse cerca de la línea base (178 días), se considera un estado estable de cumplimiento.',
        insightsImpacto: 'La mantención de la mediana quirúrgica por debajo del umbral crítico de 200 días preserva al hospital dentro del grupo de mejor desempeño en listas de espera.'
      },
      {
        id: 'mediana_cne',
        name: '10. Mediana Espera CNE',
        formulaSnippet: 'Espera Consultas CNE',
        formula: 'Mediana de días de espera para Consulta Nueva de Especialidad',
        value: yearlyTotals.medianaCNE ? `${yearlyTotals.medianaCNE} días` : '308 días',
        metaValue: 215,
        meta: 'Reducir 30% (215 d)',
        status: 'danger',
        statusText: 'BRECHA ❌',
        icon: <Users size={18} />,
        source: 'SIGTE / Minsal',
        methodology: 'Días de espera del percentil 50 de la lista de espera de especialidades. Con una línea base de 308 días al 31/12/2025, la meta del MINSAL exige disminuirla un 30% (~215 días).',
        chartKey: 'medianaCNE',
        chartType: 'line',
        isPercentage: false,
        insightsVillarrica: 'La lista de espera para primera consulta registra 308 días en marzo de 2026, sin registrar variación respecto a la línea base. Existe una brecha de 93 días respecto a la meta.',
        insightsImpacto: 'Se requiere una estrategia agresiva de consultas de especialidad, telemedicina y limpieza administrativa de la lista de espera de consultas para lograr la meta.'
      },
      {
        id: 'registros_ges',
        name: '11. Registros GES',
        formulaSnippet: 'Digitación ≤ 5d',
        formula: '(Registros GES digitados en SIGGES en plazo ≤ 5 días hábiles / Total de Registros GES) * 100',
        value: yearlyTotals.registrosGes ? `${yearlyTotals.registrosGes.toFixed(2)}%` : '64.45%',
        metaValue: 80.0,
        meta: '≥ 80.00%',
        status: 'danger',
        statusText: 'NO CUMPLE ❌',
        icon: <FileSpreadsheet size={18} />,
        source: 'SIGGES / Minsal',
        methodology: 'Porcentaje de registros y garantías de oportunidad GES ingresados a la plataforma nacional SIGGES dentro de los 5 días hábiles de su ocurrencia.',
        chartKey: 'registrosGes',
        chartType: 'line',
        isPercentage: true,
        insightsVillarrica: 'El porcentaje de registros ingresados a tiempo es de 64.45% en marzo, marcando una brecha de -15.55% respecto al estándar mínimo del 80%.',
        insightsImpacto: 'La demora en la digitación no altera la atención del paciente pero sí penaliza administrativamente la evaluación oficial del establecimiento en los informes trimestrales.'
      }
    ];
  }, [yearlyTotals]);

  // Find the selected indicator object
  const activeIndicator = useMemo(() => {
    return indicatorsList.find(ind => ind.id === selectedId) || indicatorsList[0];
  }, [indicatorsList, selectedId]);

  // Generate chart data based on active indicator
  const chartData = useMemo(() => {
    return processedData.map(d => {
      const val = d[activeIndicator.chartKey];
      return {
        name: d.mes,
        Valor: val !== null ? parseFloat(val.toFixed(2)) : null,
        ...(activeIndicator.acuerdoKey ? { Acuerdo: d[activeIndicator.acuerdoKey] } : {})
      };
    });
  }, [processedData, activeIndicator]);

  const yAxisDomain = useMemo(() => {
    const vals = chartData.map(d => d.Valor).filter(v => v !== null && v !== undefined);
    if (vals.length === 0) return [0, 100];
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    
    if (activeIndicator.metaValue !== undefined && typeof activeIndicator.metaValue === 'number') {
      min = Math.min(min, activeIndicator.metaValue);
      max = Math.max(max, activeIndicator.metaValue);
    }
    
    const diff = max - min;
    const pad = diff === 0 ? 0.2 : diff * 0.2;
    
    const isPositiveOnly = activeIndicator.id !== 'impacto';
    const finalMin = isPositiveOnly ? Math.max(0, min - pad) : (min - pad);
    const finalMax = max + pad;
    
    return [finalMin, finalMax];
  }, [chartData, activeIndicator]);

  const stackedChartData = useMemo(() => {
    if (!nominaData || nominaData.length === 0) return [];
    
    const monthsOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const activeMonths = Array.from(new Set(nominaData.map(d => d.mesDigitacion)))
      .sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b));
      
    return activeMonths.map(month => {
      const monthRecords = nominaData.filter(d => d.mesDigitacion === month);
      const counts = {
        name: month,
        '<=5 DIAS': 0,
        '6 A 30 DIAS': 0,
        '31 A 60 DIAS': 0,
        '61 A 90 DIAS': 0,
        '91 A 120 DIAS': 0,
        'MAS 120 DIAS': 0
      };
      
      monthRecords.forEach(r => {
        const rng = r.rangoDias;
        if (counts[rng] !== undefined) {
          counts[rng]++;
        }
      });
      
      return counts;
    });
  }, [nominaData]);

  const topFails = useMemo(() => {
    if (!nominaData || nominaData.length === 0) return [];
    
    const failsMap = {};
    nominaData.forEach(r => {
      const key = `${r.problema} - ${r.etapa}`;
      if (!failsMap[key]) {
        failsMap[key] = {
          problema: r.problema,
          etapa: r.etapa,
          count: 0,
          total: 0
        };
      }
      failsMap[key].total++;
      if (r.rangoDias !== '<=5 DIAS') {
        failsMap[key].count++;
      }
    });
    
    return Object.values(failsMap)
      .filter(f => f.count > 0)
      .map(f => ({
        ...f,
        pct: (f.count / f.total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [nominaData]);

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', color: 'var(--text-dark)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <RefreshCw size={54} color="var(--primary-accent)" />
        </motion.div>
        <h3>Cargando Acuerdo de Programación 2026...</h3>
        <p>Conectando con base de datos del Acuerdo MINSAL del Hospital de Villarrica</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dark)' }}>
        <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2>Error de Acceso a Datos</h2>
        <p style={{ maxWidth: '600px', margin: '20px auto', color: '#64748b' }}>{error}</p>
        <button className="preset-btn" onClick={fetchData} style={{ padding: '10px 20px', borderRadius: '8px' }}>Reintentar Carga</button>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--text-dark)', padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#334155'
            }}
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ActivitySquare size={24} color="#0ea5e9" />
              Estadísticas del Acuerdo de Programación 2026
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Fórmulas y metas oficiales del acuerdo firmado por el Hospital de Villarrica. Monitoreo mensual de indicadores de gestión.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Sidebar (Left) + Content (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Indicators List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '845px', overflowY: 'auto', paddingRight: '16px', paddingBottom: '16px' }}>
          {indicatorsList.map((ind) => {
            const isSelected = selectedId === ind.id;
            return (
              <motion.div
                key={ind.id}
                whileHover={{ y: -2, x: 2 }}
                onClick={() => setSelectedId(ind.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '18px 22px',
                  borderRadius: '20px',
                  background: isSelected ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#ffffff',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 10px 25px rgba(37, 99, 235, 0.12)' : '0 4px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {/* Accent line on selected */}
                {isSelected && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: '#2563eb' }} />
                )}
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? '#1e3a8a' : '#334155', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.3' }}>
                      <span style={{ color: isSelected ? '#3b82f6' : '#64748b', display: 'inline-flex', flexShrink: 0 }}>{ind.icon}</span>
                      {ind.name}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      {ind.value}
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: isSelected ? '#2563eb' : '#94a3b8', fontStyle: 'italic', fontWeight: 700 }}>
                        {ind.formulaSnippet}
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        background: ind.status === 'success' ? '#dcfce7' : ind.status === 'warning' ? '#ffedd5' : '#fee2e2',
                        color: ind.status === 'success' ? '#15803d' : ind.status === 'warning' ? '#c2410c' : '#b91c1c',
                        fontWeight: 800,
                        letterSpacing: '0.2px',
                        border: ind.status === 'success' ? '1px solid rgba(21, 128, 61, 0.15)' : ind.status === 'warning' ? '1px solid rgba(194, 65, 12, 0.15)' : '1px solid rgba(185, 28, 28, 0.15)'
                      }}>
                        {ind.statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Temporal Evolution & Insights */}
        {activeIndicator && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Main Graphic Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              
              {/* Header and Selectors */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Evolución Temporal del Indicador: <span style={{ color: '#2563eb' }}>{activeIndicator.name.replace(/^\d+\.\s*/, '')}</span>
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Fuente oficial: {activeIndicator.source}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏥 Hospital de Villarrica
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERÍODO:</span>
                    <select 
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700, background: '#f8fafc', color: '#0f172a' }}
                    >
                      <option value="2026">Año 2026</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Formula Callout Block (Left-border Callout Style) */}
              <div style={{ 
                background: 'rgba(14, 165, 233, 0.03)', 
                borderLeft: '4px solid #0ea5e9', 
                padding: '16px 20px', 
                borderRadius: '8px 16px 16px 8px', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Info size={18} color="#0ea5e9" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.5px' }}>
                      FÓRMULA OFICIAL MINSAL
                    </p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                      {activeIndicator.formula}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                      <strong>Metodología:</strong> {activeIndicator.methodology}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                    Evolución Mensual
                  </p>
                  
                  {/* Etiquetas de Cumplimiento */}
                  {(activeIndicator.cumplimientoPeriodo || activeIndicator.cumplimientoAnual) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeIndicator.cumplimientoPeriodo && (
                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>% Período:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1d4ed8' }}>{activeIndicator.cumplimientoPeriodo}%</span>
                        </div>
                      )}
                      {activeIndicator.cumplimientoAnual && (
                        <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>% Anual:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e3a8a' }}>{activeIndicator.cumplimientoAnual}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ height: '360px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {activeIndicator.id === 'registros_ges' ? (
                      <BarChart data={stackedChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltipStacked />} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                        <Bar dataKey="<=5 DIAS" stackId="a" fill="#10b981" name="Dentro de Plazo (≤5 días)" />
                        <Bar dataKey="6 A 30 DIAS" stackId="a" fill="#f59e0b" name="Retraso Leve (6-30)" />
                        <Bar dataKey="31 A 60 DIAS" stackId="a" fill="#ea580c" name="Retraso Moderado (31-60)" />
                        <Bar dataKey="61 A 90 DIAS" stackId="a" fill="#dc2626" name="Retraso Grave (61-90)" />
                        <Bar dataKey="91 A 120 DIAS" stackId="a" fill="#b91c1c" name="Retraso Crítico (91-120)" />
                        <Bar dataKey="MAS 120 DIAS" stackId="a" fill="#581c87" name="Fuera de Rango (>120)" />
                      </BarChart>
                    ) : activeIndicator.chartType === 'bar' ? (
                      <BarChart data={chartData} margin={{ top: 35, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip isPercentage={activeIndicator.isPercentage} />} />
                        <Legend />
                        <Bar name="Programado (Acuerdo)" dataKey="Acuerdo" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        <Bar name="Ejecutado Real" dataKey="Valor" fill="#2563eb" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="Valor" content={<CustomChartLabel isPercentage={activeIndicator.isPercentage} />} />
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 35, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={yAxisDomain} />
                        <Tooltip content={<CustomTooltip isPercentage={activeIndicator.isPercentage} />} />
                        {activeIndicator.metaValue !== undefined && typeof activeIndicator.metaValue === 'number' && (
                          <ReferenceLine 
                            y={activeIndicator.metaValue} 
                            stroke="#ef4444" 
                            strokeDasharray="4 4" 
                            label={{ 
                              value: `Meta: ${activeIndicator.meta}`, 
                              fill: '#ef4444', 
                              position: 'insideBottomRight', 
                              fontSize: 10, 
                              fontWeight: 700 
                            }} 
                          />
                        )}
                        <Line 
                          name={activeIndicator.name.replace(/^\d+\.\s*/, '')} 
                          type="monotone" 
                          dataKey="Valor" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          dot={{ r: 5, fill: '#2563eb', strokeWidth: 2 }} 
                          activeDot={{ r: 8 }}
                          connectNulls={false}
                        >
                          <LabelList dataKey="Valor" content={<CustomChartLabel isPercentage={activeIndicator.isPercentage} />} />
                        </Line>
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Bottom Insights Card */}
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#2563eb" />
                Análisis de Rendimiento vs Compromiso de Gestión
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                
                {/* Column 1: Estatus de Villarrica */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                    Estatus de Villarrica
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                    {activeIndicator.insightsVillarrica}
                  </p>
                </div>

                {/* Column 2: Calidad y Seguridad */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                    Impacto y Proyección
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                    {activeIndicator.insightsImpacto}
                  </p>
                </div>

              </div>
            </div>

            {/* Bottleneck Analysis Table (Only for Indicator 11 - Registros GES) */}
            {activeIndicator.id === 'registros_ges' && topFails.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#ef4444" />
                  Puntos Críticos de Demora en Registro (Top 5 Incumplimientos)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Detalle de problemas y etapas de salud donde se concentran los mayores retrasos de digitación (&gt;5 días hábiles) en el Hospital de Villarrica.
                </p>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 700 }}>Problema de Salud (GES)</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700 }}>Etapa / Estado de Salud</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Casos Retrasados</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Tasa de Retraso</th>
                        <th style={{ padding: '10px 12px', fontWeight: 700 }}>Acción Correctiva Propuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFails.map((fail, idx) => {
                        let suggestion = "Revisar proceso de notificación local.";
                        if (fail.problema.includes("VIH")) {
                          suggestion = "Digitalización inmediata al ingreso de la notificación obligatoria. Técnico GES exclusivo para VIH.";
                        } else if (fail.problema.includes("INFARTO") || fail.problema.includes("MIOCARDIO")) {
                          suggestion = "Automatizar envío de ECG a digitación en urgencia. Cargar plantilla preestablecida.";
                        } else if (fail.problema.includes("REFRACCIÓN") || fail.problema.includes("LENTES")) {
                          suggestion = "Establecer canal directo con Unidad de Oftalmología para reportar entregas semanalmente.";
                        } else if (fail.problema.includes("AYUDAS")) {
                          suggestion = "Controlar firmas de entrega en bodega kinesiológica y digitalizar en el día de retiro.";
                        } else if (fail.problema.includes("HIPOACUSIA")) {
                          suggestion = "Coordinación con Otorrinolaringología para entrega y registro simultáneo de audífonos.";
                        }
                        
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'transparent' : '#fafafa' }}>
                            <td style={{ padding: '12px 12px', fontWeight: 700, color: '#1e293b' }}>{fail.problema}</td>
                            <td style={{ padding: '12px 12px', color: '#475569' }}>{fail.etapa}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, color: '#ef4444' }}>{fail.count}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                background: fail.pct > 70 ? '#ffebee' : '#fff3e0', 
                                color: fail.pct > 70 ? '#c62828' : '#e65100', 
                                fontWeight: 800,
                                fontSize: '0.78rem'
                              }}>
                                {fail.pct.toFixed(1)}%
                              </span>
                            </td>
                            <td style={{ padding: '12px 12px', color: '#15803d', fontWeight: 600 }}>{suggestion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// Custom Tooltip component for Stacked Bar Chart
const CustomTooltipStacked = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, entry) => acc + (entry.value || 0), 0);
    return (
      <div style={{ background: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }}>
        <p style={{ fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a', fontSize: '0.88rem' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {payload.slice().reverse().map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>{entry.name}:</span>
              </div>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>
                {entry.value} ({total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800 }}>
            <span style={{ color: '#0f172a' }}>Total Registros:</span>
            <span style={{ color: '#2563eb' }}>{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, isPercentage }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <p style={{ fontWeight: 800, margin: '0 0 6px 0', color: '#1e293b', fontSize: '0.82rem' }}>{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', margin: '4px 0' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ color: '#64748b' }}>{entry.name}:</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>
              {entry.value !== null ? (isPercentage ? `${entry.value}%` : entry.value.toLocaleString('es-CL')) : 'Sin reporte'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
