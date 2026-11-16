# Fundamento normativo: ¿Cómo se cuentan los egresos? (REM 20 / Censo Diario de Camas)

Documentos fuente (en esta misma carpeta):
- `Manual_Censo_Diario_de_Camas_y_Pacientes.pdf` (DEIS-MINSAL) → "Manual Censo"
- `Manual_Usuario_REM20_2014.pdf` (DEIS-MINSAL) → "Manual REM20"

## 1. Evidencia textual en los manuales

| # | Fuente | Qué establece |
|---|--------|---------------|
| 1 | Manual Censo, p.7, "Egresos diarios" | "Es la salida de un paciente de las unidades de hospitalización que ha ocupado una cama de dotación, **del hospital**. El egreso puede darse por alta médica, traslado a otro establecimiento, defunción, retiro voluntario del paciente u otro." |
| 2 | Manual Censo, p.3 y p.7 | "Si un paciente ingresa desde otro nivel de cuidados del hospital, constituye un **ingreso por traslado en ese nivel de cuidados, pero no debe considerarse como un ingreso al establecimiento**." |
| 3 | Manual Censo, p.4, datos mínimos del censo | El censo registra por separado: *Pacientes de alta*, *Pacientes trasladados a otras unidades funcionales del mismo hospital* y *Pacientes fallecidos*; y los ingresos como *desde fuera del hospital* e *ingresados por traslado desde otras unidades del mismo hospital*. |
| 4 | Manual REM20, p.4, Figura 3 (formulario por servicio clínico) | Bloque **Egresos Mensuales**: *Alta al Hogar u otro Establecimiento* + *Traslado a otro Servicio del Hospital* + *Fallecidos* = **Total Egresos**. Bloque Ingreso Mensual: *Desde fuera u otro hospital* (Urgencia, APS, CAE, Otros Hospitales, Otra Procedencia) + *De Servicios del mismo Hospital* = Total Ingresos. Además: *Existencia Mes Siguiente*, *Ingreso Egreso mismo Día*, *Días Cama* y *Día Estada de los Egresados*. |
| 5 | Manual REM20, p.19, Figura 19 (Reporte Ingresos, Egresos y Estadía) | Columnas Egreso: **Total / Alta / Traslados / Fallecidos**; Ingreso: Urgencia, APS, CAE, Otros Hospitales, Otra Procedencia, Servicio Mismo Hosp. |
| 6 | Manual Censo, p.4 | El paciente que ingresa al nivel se registra como ocupando cama; el censo se valida con el Informe Estadístico de Egreso Hospitalario (IEEH). Día censal = día calendario (Norma Técnica N°152, 08-08-2013). |

## 2. Conclusión (lógica correcta de egresos)

El REM 20 se registra **por servicio clínico / nivel de cuidados** (agrupación de camas) y su identidad contable es:

`Existencia mes siguiente = Existencia mes anterior + Total Ingresos − Total Egresos`

Para que esa identidad cuadre en cada nivel de cuidados, el **Total Egresos del servicio incluye los traslados a otro servicio del hospital** (porque el mismo paciente figura como "ingreso desde servicios del mismo hospital" en el servicio de destino).

Por lo tanto:

1. **Egresos del servicio (REM 20 por nivel de cuidados) = 305** (Altas + Traslados a otro servicio + Fallecidos). Es el valor que corresponde al Cuidados Medios de abril 2026 y coincide con tu cálculo manual.
2. **Egresos del establecimiento (hospital completo) = excluyen los traslados internos** (en abril, Cuidados Medios aportaría 299), porque un traslado interno "no es ingreso/egreso del establecimiento" (Manual Censo, puntos 1 y 2). Sumar los egresos de todos los servicios con traslados incluidos duplicaría pacientes.
3. Los **299** son una cifra válida, pero solo como "egresos del hospital provenientes de ese servicio" (altas + fallecidos), no como "Total Egresos" del servicio en el formulario REM 20.

## 3. Aplicación a Cuidados Medios, abril 2026 (base `censo_cached.json`, 16-11-2026)

| Condición de egreso en la base | N |
|---|---|
| Alta Hogar | 252 |
| Hospitalización Domiciliaria | 21 |
| Traslado Otro Hospital | 19 |
| Alta Voluntaria | 1 |
| Fuga Paciente | 1 |
| Fallecido | 5 |
| Traslado Servicio | 6 |
| **Total egresos del servicio (REM 20)** | **305** |
| Egresos sin traslados internos (nivel hospital) | 299 |

Mapeo a columnas del formulario REM 20 (Fig. 3):
- Alta al Hogar u otro Establecimiento: 252 + 21 + 19 + 1 + 1 = **294**
- Traslado a otro Servicio del Hospital: **6**
- Fallecidos: **5**
- Total Egresos: **305**

> Nota: el formulario solo tiene tres columnas de egreso. La asignación de *Hospitalización Domiciliaria*, *Alta Voluntaria* y *Fuga* a "Alta al Hogar u otro Establecimiento" es una interpretación razonable (el manual define egreso como "alta médica, traslado a otro establecimiento, defunción, retiro voluntario u otro") pero **debe confirmarse con la unidad de Estadística / DEIS** (estadisticashospitalarias@minsal.cl, correo citado en el Manual Censo, p.11).

## 4. Documentación complementaria recomendada para descargar

No pude descargarla automáticamente; los nombres se obtuvieron por búsqueda web y deben verificarse en las fuentes oficiales antes de citarse:
1. **Norma Técnica N°152 "Estándar de Información de gestión de camas y pacientes"** (08-08-2013), citada por el propio Manual Censo. Buscar en `deis.minsal.cl` o en Ley Chile (`leychile.cl`, Decreto Exento aprobatorio).
2. **Manual / Instructivo del Informe Estadístico de Egreso Hospitalario (IEEH)** y glosa de condición de egreso, DEIS.
3. **Manual de Series REM** vigente (REM Serie A y REM 20 actualizado, DEIS), con definiciones de la sección de hospitalización.
4. **Glosario de indicadores hospitalarios DEIS** (promedio días estada, giro de camas, letalidad, % ocupación).
5. Ordinario B52 N°2661 (13-08-2012) citado en el Manual Censo (pie de página, p.3) sobre pacientes que ingresan por pabellón o sala de parto.
