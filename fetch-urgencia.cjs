const odbc = require('odbc');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SQL_QUERY = `
SELECT  
    CASE
        WHEN o239642.PREVISION IN (
            'FONASA - A               ',
            'FONASA - B               ',
            'FONASA - C               ',
            'FONASA - D               '
        ) THEN 'Beneficiario'
        ELSE 'No Beneficiario'
    END AS C_1,
    o245244.FECHA_TOMA_MUESTRA_1 as fecha_muestra,
   
    CASE
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'A00' AND 'B99' THEN 'Ciertas enfermedades infecciosas y parasitarias'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'C00' AND 'D48' THEN 'Neoplasias'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'D50' AND 'D89' THEN 'Enfermedades de la sangre'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'E00' AND 'E99' THEN 'Enfermedades endocrinas, nutricionales y metabólicas'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'F00' AND 'F99' THEN 'Trastornos mentales y del comportamiento'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%ANSIEDAD%' THEN 'Trastornos mentales y del comportamiento'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%ANSIOSO%' THEN 'Trastornos mentales y del comportamiento'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'G00' AND 'G99' THEN 'Enfermedades del sistema nervioso'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'H00' AND 'H59' THEN 'Enfermedades del ojo y sus anexos'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'H60' AND 'H95' THEN 'Enfermedades del oído y de la apófisismastoides'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'I00' AND 'I99' THEN 'Enfermedades del sistema circulatorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'J00' AND 'J99' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%ASMA%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%RESFRIO%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%S.B.O.%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%S.B.O%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%SBO%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%NEUMONI%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%IRA%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%INFECCIÓN RESPIRATORIA%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%INFECCION RESPIRATORIA%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%INFLUEN%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%EPOC%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%RINITIS%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%RINOFARING%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%FARING%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%BRONQU%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%AH1N1%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%GRIPE%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%GRIPAL%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%RESPIRATORI%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%RINITI%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%AMIGDAL%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '% ESTADO GRIPAL%' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'K00' AND 'K93' THEN 'Enfermedades del aparato digestivo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'L00' AND 'L99' THEN 'Enfermedades de la piel y el tejido subcutáneo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'M00' AND 'M99' THEN 'Enfermedades del sistema osteomuscular y tejido correctivo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'N00' AND 'N99' THEN 'Enfermedades del aparato genitourinario'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'O00' AND 'O99' THEN 'Embarazo, parto y puerperio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%PRIMIGESTA%' THEN 'Embarazo, parto y puerperio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%EMBARAZO%' THEN 'Embarazo, parto y puerperio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%EMB%' THEN 'Embarazo, parto y puerperio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'P00' AND '096' THEN 'Ciertas afecciones originadas en el periodo perinatal'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'Q00' AND 'Q99' THEN 'Malformaciones congénitas, deformidades y anomalías cromosómicas'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'R00' AND 'R99' THEN 'Síntomas, signos y hallazgos anormales clínicos y de laboratorio, no clasificados'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'S00' AND 'T98' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%Trauma%' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%CONTUSIÓN%' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%CONTUSION%' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%TEC%' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%T.E.C.%' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%T.E.C%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%FRACTURA%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%LUXACION%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%POLICONTUSO%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '% CONSTATACION DE LESIONES%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%SIN LESIONES%' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' AND o245156.DIAGNO_1 LIKE '%ESGUINCE %' THEN 'Traumatismos, envenenamientos/causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'V01' AND 'Y98' THEN 'Causas externas de morbilidad y de mortalidad'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'Z00' AND 'Z99' THEN 'Factores que influyen en el estado de salud'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'U00' AND 'U99' THEN 'Otras situaciones especiales'
        WHEN (SUBSTR(o245156.COD_1,1,3)) = '000' THEN 'NO SE ENCUENTRA DIAGNOSTICO'
        WHEN (SUBSTR(o245156.COD_1,1,3)) IS NULL THEN 'NO PRESENTA REGISTRO'
    END AS C_2,
   
    CASE
        WHEN o239642.EDAD_ANOS < 10 THEN '(1) 0 - 9 Años'
        WHEN o239642.EDAD_ANOS < 15 THEN '(2) 10 - 14 Años'
        WHEN o239642.EDAD_ANOS < 20 THEN '(3) 15 - 19 Años'
        WHEN o239642.EDAD_ANOS < 25 THEN '(4) 20 - 24 Años'
        WHEN o239642.EDAD_ANOS < 65 THEN '(5) 25 - 64 Años'
        ELSE '(6) 65 y Años más'
    END AS C_3,
   
    o239378.FECHA_ADMISION AS E239381,
    o239378.ESTADO_ATENCION AS E239382,
    o239378.TIPO_CONSULTA AS E239385,
    o239378.PROCEDENCIA AS E239386,
    o239378.MEDIO_LLEGADA AS E239387,
    o239491.FECHA_CIERRE AS E239492,
    o239491.CATEGORIZACION AS E239498,
    o239642.RUN AS E239644,
    o239642.NOMBRE AS E239645,
    o239642.APELLIDO_PATERNO AS E239646,
    o239642.APELLIDO_MATERNO AS E239647,
    o239642.SEXO AS E239649,
    o239642.EDAD_ANOS AS E239650,
    o239642.PREVISION AS E239653,
    o239642.FEC_NACIMIENTO AS E239654,
    o239642.ETNIA_PERCEPCION AS E239662,
    o239642.ETNIA AS E239663,
    o239491.SEMANA_EPIDEMIOLOGICA AS E242763,
    o239378.ESTABLECIMIENTO_PROCEDENCIA AS E245077,
    o239378.CATEGORIZACION_LE AS E245078,
    o239491.FECHA_CIERRE_FINAL AS E245080,
    o239491.AGR_PROF_ATIENDE_2 AS E245085,
    o239491.DESTINO_INMEDIATO AS E245087,
    o239491.FUNCIONARIO_ATIENDE_1 AS E245089,
    o245156.COD_1 AS E245158,
    o245156.DIAGNO_1 AS E245159,
    o245156.GES_1 AS E245168,
    o245156.PROBLEMA_SALUD_1 AS E245173,
    o239642.GRUPO_EDAD AS E247218,
    o239642.TIPO_PACIENTE AS E247944,
    (SUBSTR(o245156.COD_1,1,3)) AS E254293,
    o239491.TIEMPO_ESPERA_D_H_M AS E280452,
    o239491.DESTINO_ALTA_DOMICILIO AS E1810778,
    SUM(o239491.TIEMPO_TOTAL_ATENCION_MINUTOS) AS E280453_SUM,
    SUM(o239491.TOTAL_MINUTOS_ESPERA) AS E280451_SUM

FROM
    URGENCIA.D_ADMISION o239378,
    URGENCIA.D_CIERRE_ATENCION o239491,
    URGENCIA.D_PACIENTE o239642,
    URGENCIA.D_DIAGNOSTICOS_H o245156,
    URGENCIA.D_SIGNOS_VITALES o245244

WHERE
    o239378.DAU = o239642.DAU
    AND o239378.DAU = o239491.DAU
    AND o239378.DAU = o245156.DAU
    AND o239378.DAU = o245244.DAU
    AND o239378.ESTABLECIMIENTO = 'VILLARRICA HOSP.'
    AND o239378.FECHA_ADMISION >= TO_DATE('20240101','YYYYMMDD')

GROUP BY
    CASE WHEN o239642.PREVISION IN ('FONASA - A               ','FONASA - B               ','FONASA - C               ','FONASA - D               ') THEN 'Beneficiario' ELSE 'No Beneficiario' END,
    o245244.FECHA_TOMA_MUESTRA_1,
    CASE
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'A00' AND 'B99' THEN 'Ciertas enfermedades infecciosas y parasitarias'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'C00' AND 'D48' THEN 'Neoplasias'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'D50' AND 'D89' THEN 'Enfermedades de la sangre'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'E00' AND 'E99' THEN 'Enfermedades endocrinas, nutricionales y metabólicas'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'F00' AND 'F99' THEN 'Trastornos mentales y del comportamiento'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'G00' AND 'G99' THEN 'Enfermedades del sistema nervioso'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'H00' AND 'H59' THEN 'Enfermedades del ojo y sus anexos'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'H60' AND 'H95' THEN 'Enfermedades del oído y de la apófisismastoides'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'I00' AND 'I99' THEN 'Enfermedades del sistema circulatorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'J00' AND 'J99' THEN 'Enfermedades del sistema respiratorio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'K00' AND 'K93' THEN 'Enfermedades del aparato digestivo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'L00' AND 'L99' THEN 'Enfermedades de la piel y el tejido subcutáneo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'M00' AND 'M99' THEN 'Enfermedades del sistema osteomuscular y tejido correctivo'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'N00' AND 'N99' THEN 'Enfermedades del aparato genitourinario'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'O00' AND 'O99' THEN 'Embarazo, parto y puerperio'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'S00' AND 'T98' THEN 'Traumatismos, envenenamientos y otras consecuencia de causa externa'
        WHEN (SUBSTR(o245156.COD_1,1,3)) BETWEEN 'Z00' AND 'Z99' THEN 'Factores que influyen en el estado de salud'
        ELSE 'Otros Diagnósticos'
    END,
    CASE
        WHEN o239642.EDAD_ANOS < 10 THEN '(1) 0 - 9 Años'
        WHEN o239642.EDAD_ANOS < 15 THEN '(2) 10 - 14 Años'
        WHEN o239642.EDAD_ANOS < 20 THEN '(3) 15 - 19 Años'
        WHEN o239642.EDAD_ANOS < 25 THEN '(4) 20 - 24 Años'
        WHEN o239642.EDAD_ANOS < 65 THEN '(5) 25 - 64 Años'
        ELSE '(6) 65 y Años más'
    END,
    o239378.FECHA_ADMISION,
    o239378.ESTADO_ATENCION,
    o239378.TIPO_CONSULTA,
    o239378.PROCEDENCIA,
    o239378.MEDIO_LLEGADA,
    o239491.FECHA_CIERRE,
    o239491.CATEGORIZACION,
    o239642.RUN,
    o239642.NOMBRE,
    o239642.APELLIDO_PATERNO,
    o239642.APELLIDO_MATERNO,
    o239642.SEXO,
    o239642.EDAD_ANOS,
    o239642.PREVISION,
    o239642.FEC_NACIMIENTO,
    o239642.ETNIA_PERCEPCION,
    o239642.ETNIA,
    o239491.SEMANA_EPIDEMIOLOGICA,
    o239378.ESTABLECIMIENTO_PROCEDENCIA,
    o239378.CATEGORIZACION_LE,
    o239491.FECHA_CIERRE_FINAL,
    o239491.AGR_PROF_ATIENDE_2,
    o239491.DESTINO_INMEDIATO,
    o239491.FUNCIONARIO_ATIENDE_1,
    o245156.COD_1,
    o245156.DIAGNO_1,
    o245156.GES_1,
    o245156.PROBLEMA_SALUD_1,
    o239642.GRUPO_EDAD,
    o239642.TIPO_PACIENTE,
    (SUBSTR(o245156.COD_1,1,3)),
    o239491.TIEMPO_ESPERA_D_H_M,
    o239491.DESTINO_ALTA_DOMICILIO
`;

async function fetchFromODBC() {
  const connectionString = "DSN=dwh.dssasur.cl;Uid=ghperez;Pwd=Josefa20";
  console.log("Conectando a Oracle DWH via ODBC (DSN=dwh.dssasur.cl)...");
  
  let connection;
  try {
    connection = await odbc.connect(connectionString);
    console.log("¡Conexión establecida con éxito!");
    
    console.log("Ejecutando consulta SQL de Consultas de Urgencia...");
    const rawResults = await connection.query(SQL_QUERY);
    console.log(`Consulta finalizada. Registros recuperados: ${rawResults.length}`);

    // Map fields
    const mappedRecords = rawResults.map((r, i) => ({
      id: `DAU-${r.E239644 || i}`,
      fecha_admision: r.E239381 ? new Date(r.E239381).toISOString().split('T')[0] : null,
      year: r.E239381 ? new Date(r.E239381).getFullYear() : null,
      month: r.E239381 ? new Date(r.E239381).getMonth() + 1 : null,
      estado_atencion: r.E239382 || 'Atendido',
      tipo_consulta: r.E239385 || 'Médica',
      procedencia: r.E239386 || 'Domicilio',
      medio_llegada: r.E239387 || 'Particular',
      categorizacion: r.E239498 || 'C3',
      sexo: r.E239649 === 'M' ? 'Masculino' : (r.E239649 === 'F' ? 'Femenino' : r.E239649),
      edad: parseInt(r.E239650, 10) || 0,
      grupo_edad: r.C_3,
      prevision: r.E239653 ? r.E239653.trim() : 'Sin Registro',
      beneficiario: r.C_1,
      diagnostico_grupo: r.C_2,
      cod_cie10: r.E245158,
      diagnostico_desc: r.E245159,
      destino_inmediato: r.E245087,
      tiempo_espera_minutos: parseInt(r.E280451_SUM, 10) || 0
    }));

    const outputFilePath = path.join(__dirname, 'public', 'data', 'urgencia_cached.json');
    const outputFilePathGz = path.join(__dirname, 'public', 'data', 'urgencia_cached.json.gz');
    const payload = {
      lastUpdated: new Date().toISOString(),
      fuente: 'Oracle Discoverer DWH (Direct ODBC Query)',
      total_registros: mappedRecords.length,
      records: mappedRecords
    };

    const jsonBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');
    fs.writeFileSync(outputFilePath, jsonBuffer);
    const gzipped = zlib.gzipSync(jsonBuffer, { level: 9 });
    fs.writeFileSync(outputFilePathGz, gzipped);

    console.log(`Caché actualizado en: ${outputFilePath} (${(jsonBuffer.length / (1024*1024)).toFixed(2)} MB)`);
    console.log(`Caché comprimido en: ${outputFilePathGz} (${(gzipped.length / (1024*1024)).toFixed(2)} MB)`);

  } catch (err) {
    console.error("Error durante la conexión ODBC o ejecución de consulta:", err.message);
    console.log("Asegúrate de estar conectado a la VPN institucional del Servicio de Salud Araucanía Sur.");
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

fetchFromODBC();
