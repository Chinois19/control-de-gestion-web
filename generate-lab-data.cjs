const fs = require('fs');
const path = require('path');

const targetMonths = [
  { y: 2025, m: 6, days: 31 }, // July is 0-indexed month 6
  { y: 2025, m: 10, days: 30 }, // Nov is month 10
  { y: 2026, m: 3, days: 30 }  // Apr is month 3
];

const prestacionesFonasa = [
  { codigo: '0301045', glosa: 'HEMOGRAMA', seccion: 'Hematología', baseCant: 1800, codLis: 'HEMO-01', glosaLis: 'HEMOGRAMA COMPLETO' },
  { codigo: '0301036', glosa: 'TIEMPO DE PROTROMBINA', seccion: 'Hematología', baseCant: 900, codLis: 'TP-01', glosaLis: 'PROTROMBINA' },
  { codigo: '0301051', glosa: 'VELOCIDAD DE SEDIMENTACIÓN (VHS)', seccion: 'Hematología', baseCant: 600, codLis: 'VHS-01', glosaLis: 'VHS' },
  { codigo: '0302047', glosa: 'GLICEMIA', seccion: 'Bioquímica', baseCant: 2100, codLis: 'GLI-01', glosaLis: 'GLUCOSA EN SANGRE' },
  { codigo: '0302057', glosa: 'NITRÓGENO UREICO (UREMIA)', seccion: 'Bioquímica', baseCant: 1500, codLis: 'BUN-01', glosaLis: 'NITROGENO UREICO' },
  { codigo: '0302023', glosa: 'CREATININA', seccion: 'Bioquímica', baseCant: 1900, codLis: 'CREA-01', glosaLis: 'CREATININA EN SANGRE' },
  { codigo: '0302067', glosa: 'PERFIL LIPÍDICO', seccion: 'Bioquímica', baseCant: 1200, codLis: 'LIP-01', glosaLis: 'PERFIL LIPIDICO' },
  { codigo: '0302075', glosa: 'TRANSAMINASAS GOT/GPT', seccion: 'Bioquímica', baseCant: 1400, codLis: 'TRANS-01', glosaLis: 'GOT/GPT' },
  { codigo: '0306001', glosa: 'UROCULTIVO', seccion: 'Microbiología', baseCant: 800, codLis: 'URO-01', glosaLis: 'UROCULTIVO C/ ANTIBIOGRAMA' },
  { codigo: '0306005', glosa: 'HEMOCULTIVO AEROBIO', seccion: 'Microbiología', baseCant: 400, codLis: 'HEMOC-01', glosaLis: 'HEMOCULTIVO' },
  { codigo: '0305030', glosa: 'PROTEÍNA C REACTIVA (PCR)', seccion: 'Inmunología', baseCant: 1100, codLis: 'PCR-01', glosaLis: 'PCR CUANTITATIVA' },
  { codigo: '0305015', glosa: 'FACTOR REUMATOIDEO', seccion: 'Inmunología', baseCant: 400, codLis: 'FR-01', glosaLis: 'FACTOR REUMATOIDEO' },
  { codigo: '0305041', glosa: 'V.D.R.L.', seccion: 'Inmunología', baseCant: 700, codLis: 'VDRL-01', glosaLis: 'VDRL SUERO' },
  { codigo: '0303024', glosa: 'HORMONA ESTIMULANTE TIROIDES (TSH)', seccion: 'Hormonas', baseCant: 900, codLis: 'TSH-01', glosaLis: 'TSH ULTRASENSIBLE' },
  { codigo: '0303022', glosa: 'TIROXINA LIBRE (T4 L)', seccion: 'Hormonas', baseCant: 800, codLis: 'T4L-01', glosaLis: 'T4 LIBRE' },
  { codigo: '0309022', glosa: 'ORINA COMPLETA', seccion: 'Otros', baseCant: 1600, codLis: 'ORI-01', glosaLis: 'EXAMEN ORINA COMPLETA' }
];

const procedencias = ['atencion_abierta', 'atencion_cerrada', 'urgencia'];
const previsiones = ['FONASA', 'ISAPRE', 'PARTICULAR', 'CAPREDENA', 'DIPRECA'];
const origenes = ['Hospital Villarrica', 'Cesfam Villarrica', 'Cesfam Los Volcanes', 'DSM Pucón', 'Hospital Pucón', 'Consultorio Loncoche'];
const servicios = ['Medicina Interna', 'Pediatría', 'Cirugía', 'Urgencia Adulto', 'Urgencia Pediátrica', 'Ginecología', 'Traumatología', 'Ambulatorio'];
const sexos = ['Masculino', 'Femenino'];
const edades = ['< 15 años', '15 - 64 años', '65+ años'];

const records = [];

targetMonths.forEach(tm => {
  for (let day = 1; day <= tm.days; day++) {
    const d = new Date(tm.y, tm.m, day);
    const dateStr = d.toISOString().split('T')[0];

    prestacionesFonasa.forEach(prest => {
      procedencias.forEach(proc => {
        let dailyBase = prest.baseCant / 30;
        dailyBase = dailyBase * (0.8 + Math.random() * 0.4);
        if (proc === 'atencion_cerrada') dailyBase *= 0.3;
        if (proc === 'urgencia') dailyBase *= 0.4;
        
        let iter = Math.max(1, Math.round(dailyBase / 5));
        
        for (let i = 0; i < iter; i++) {
          const cantidad = Math.max(1, Math.round(5 + Math.random() * 5));
          
          const rPrev = Math.random();
          let prevision = 'FONASA';
          if (rPrev > 0.85) prevision = 'ISAPRE';
          else if (rPrev > 0.95) prevision = 'PARTICULAR';
          
          let origen = 'Hospital Villarrica';
          if (proc === 'atencion_abierta') {
            const rOrig = Math.random();
            if (rOrig < 0.3) origen = 'Cesfam Villarrica';
            else if (rOrig < 0.5) origen = 'Cesfam Los Volcanes';
            else if (rOrig < 0.7) origen = 'DSM Pucón';
            else if (rOrig < 0.8) origen = 'Hospital Pucón';
            else origen = 'Consultorio Loncoche';
          }

          let tat = 2.5 + Math.random() * 2;
          if (proc === 'urgencia') tat = 0.5 + Math.random() * 1.5;

          const rechazadas = Math.random() < 0.05 ? Math.floor(Math.random() * 2) : 0;
          
          records.push({
            fecha_ejecucion: dateStr,
            seccion_laboratorio: prest.seccion,
            procedencia: proc,
            codigo_fonasa: prest.codigo,
            glosa_fonasa: prest.glosa,
            codigo_lis: prest.codLis,
            glosa_lis: prest.glosaLis,
            cantidad_produccion: cantidad,
            tat_promedio_horas: parseFloat(tat.toFixed(2)),
            muestras_rechazadas: rechazadas,
            prevision: prevision,
            origen: origen,
            servicio_solicitante: servicios[Math.floor(Math.random() * servicios.length)],
            sexo_paciente: sexos[Math.floor(Math.random() * sexos.length)],
            edad_paciente: edades[Math.floor(Math.random() * edades.length)]
          });
        }
      });
    });
  }
});

const output = {
  lastUpdated: new Date().toISOString(),
  records
};

const outputPath = path.join(__dirname, 'public', 'data', 'laboratory_cached.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Successfully generated ${records.length} records with dates in ${outputPath}`);
