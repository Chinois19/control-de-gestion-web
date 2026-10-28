import win32com.client
import json
import gzip
import os
import datetime

excel_path = r"C:\Users\Minsal\Desktop\Libro de Pabellón - Control de Gestión Web.xls"
out_dir = r"c:\Users\Minsal\OneDrive\Aplicaciones Antigravity\Control de Gestion Web\public\data"
out_json = os.path.join(out_dir, "libro_pabellon_cached.json")
out_gz = os.path.join(out_dir, "libro_pabellon_cached.json.gz")

def format_duration(diff_days):
    if diff_days is None:
        return "0.00:00:00"
    try:
        val = float(diff_days)
    except:
        return "0.00:00:00"
    total_seconds = round(val * 86400)
    days = total_seconds // 86400
    hours = (total_seconds % 86400) // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{days}.{hours:02d}:{minutes:02d}:{seconds:02d}"

def clean_str(v):
    if v is None:
        return ""
    s = str(v).strip()
    if s == "-":
        return ""
    if s.endswith(".0") and s[:-2].isdigit():
        return s[:-2]
    return s

def mask_rut(rut_num, dv):
    if not rut_num:
        return ""
    prefix = rut_num[:3] if len(rut_num) >= 3 else rut_num
    return f"{prefix}***-{dv}"

def mask_name(ap_pat, ap_mat, nombres):
    inits = " ".join([f"{w[0]}." for w in nombres.split() if w])
    return " ".join([x for x in (ap_pat, ap_mat, inits) if x]) or "SIN NOMBRE"

# Load existing map of num_le -> especialidad andexisting records from current cache
existing_records = []
esp_by_num_le = {}
esp_by_familia = {
    "CIRUGIA OFTALMOLOGICA": "OFTALMOLOGIA",
    "ODONTOLOGIA": "ODONTOLOGIA",
    "GASTROENTEROLOGIA": "CIRUGIA GENERAL ADULTO",
    "TRAUMATOLOGIA": "TRAUMATOLOGIA Y ORTOPEDIA",
    "UROLOGIA Y NEFROLOGIA": "UROLOGIA",
    "OBSTETRICIA Y GINECOLOGIA": "OBSTETRICIA Y GINECOLOGIA",
    "OTORRINOLARINGOLOGIA": "OTORRINOLARINGOLOGIA",
    "TEGUMENTOS": "CIRUGIA GENERAL ADULTO",
    "PARED ABDOMINAL": "CIRUGIA GENERAL ADULTO",
    "PROCTOLOGIA": "CIRUGIA GENERAL ADULTO",
    "CIRUGIA VASCULAR": "CIRUGIA GENERAL ADULTO",
    "MAMA": "OBSTETRICIA Y GINECOLOGIA"
}

if os.path.exists(out_json):
    with open(out_json, "rb") as f:
        old_data = json.loads(f.read().decode("utf-8"))
        existing_records = old_data.get("records", [])
        for rec in existing_records:
            nle = rec.get("num_le")
            esp = rec.get("especialidad")
            fam = rec.get("familia_iq")
            if nle and esp:
                esp_by_num_le[nle] = esp
            if fam and esp and fam not in esp_by_familia:
                esp_by_familia[fam] = esp

existing_keys = set(
    (r.get("num_le"), r.get("fecha_cirugia"), r.get("intervencion"))
    for r in existing_records
)

print(f"Abriendo {excel_path} via Excel COM...")
excel = win32com.client.DispatchEx("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False

added = 0
try:
    wb = excel.Workbooks.Open(excel_path, ReadOnly=True)
    sheet = wb.Sheets("Base Libro de Pabellón")
    rows = sheet.UsedRange.Value
    print(f"Procesando 'Base Libro de Pabellón' ({len(rows)-1} filas)...")

    for r in rows[1:]:
        f_iq = r[27] if r[27] is not None else r[28]
        if f_iq is None:
            continue
        f_str = f_iq.strftime("%Y-%m-%d") if hasattr(f_iq, "strftime") else str(f_iq)[:10]
        num_le = clean_str(r[10])
        interv = clean_str(r[37])

        key = (num_le, f_str, interv)
        if key in existing_keys:
            continue

        ap_pat = clean_str(r[4])
        ap_mat = clean_str(r[5])
        nombres = clean_str(r[3])
        paciente = mask_name(ap_pat, ap_mat, nombres)

        rut_num = clean_str(r[1])
        dv = clean_str(r[2])
        rut_masked = mask_rut(rut_num, dv)
        rut_raw = f"{rut_num}{dv}"

        cirujano = clean_str(r[43]) or " ".join([x for x in (clean_str(r[44]), clean_str(r[45]), clean_str(r[46])) if x]) or "SIN REGISTRO"
        seg_cir = clean_str(r[47]) or " ".join([x for x in (clean_str(r[48]), clean_str(r[49]), clean_str(r[50])) if x])
        anest = clean_str(r[55]) or " ".join([x for x in (clean_str(r[56]), clean_str(r[57]), clean_str(r[58])) if x])

        c4 = clean_str(r[35])
        tipo_base = clean_str(r[33])
        if c4 == "Cirugía Mayor":
            tipo_cirugia3 = "Cirugía Mayor" if tipo_base == "Mayor" else "Cirugía Mayor Ambulatoria"
            tipo_act = "Cirugia Mayor"
        elif c4 == "Cirugía Menor":
            tipo_cirugia3 = "Cirugía Menor"
            tipo_act = "Cirugia Menor"
        elif c4 == "Procedimientos":
            tipo_cirugia3 = "Procedimientos"
            tipo_act = "Procedimientos"
        else:
            tipo_cirugia3 = f"Cirugía {tipo_base}" if tipo_base else "Cirugía Mayor"
            tipo_act = c4

        tipo_iq_raw = clean_str(r[32]) or "Electiva"
        is_urg = "URGENCIA" in tipo_iq_raw.upper()
        procedencia = "URGENCIA" if is_urg else "ATENCION ABIERTA"
        urgencia = "SI" if is_urg else "NO"

        prev = clean_str(r[13]) or clean_str(r[17])
        is_mai = "FONASA" in prev.upper()
        reint_no_prog = "SI" if clean_str(r[60]) == "SI" else "NO"
        edad_str = clean_str(r[19])
        try:
            menor_15 = "SI" if int(float(edad_str)) < 15 else "NO"
        except:
            menor_15 = "NO"

        pct_raw = r[38]
        try:
            pct = int(float(pct_raw)) if pct_raw is not None else 100
        except:
            pct = 100

        fam = clean_str(r[34])
        esp = esp_by_num_le.get(num_le) or esp_by_familia.get(fam, fam)
        gestor = clean_str(r[41]) or "Cirugia Institucional"
        if gestor == "Cirugía Institucional":
            gestor = "Cirugia Institucional"

        existing_records.append({
            "num_le": num_le,
            "fecha_cirugia": f_str,
            "paciente": paciente,
            "rut": rut_masked,
            "edad": edad_str,
            "sexo": clean_str(r[15]),
            "prevision": prev,
            "especialidad": esp,
            "cirujano": cirujano,
            "segundo_cirujano": seg_cir,
            "anestesiologo": anest,
            "intervencion": interv,
            "familia_iq": fam,
            "estado": clean_str(r[14]) or "Cerrado",
            "tipo_cirugia": tipo_cirugia3,
            "tipo_actividad": tipo_act,
            "urgencia": urgencia,
            "procedencia": procedencia,
            "tipo_gestor": gestor,
            "tipo_paciente": gestor,
            "forma_pago": "Segun Registro",
            "reintervencion_no_prog": reint_no_prog,
            "mai": "SI" if is_mai else "NO",
            "menor_15": menor_15,
            "duracion": format_duration(r[62]),
            "ges": clean_str(r[39]) or "NO GES",
            "dias_espera": clean_str(r[25]) or "0",
            "tipo_iq": tipo_iq_raw,
            "porcentaje_cirugia": pct,
            "es_intervencion_principal": pct == 100,
            "_rut_raw": rut_raw
        })
        existing_keys.add(key)
        added += 1

    wb.Close(False)
finally:
    excel.Quit()

print(f"Agregados {added} nuevos registros desde Excel. Total registros: {len(existing_records)}")

payload = {
    "lastUpdated": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    "fuente": "Oracle Discoverer DWH (Direct ODBC Query - Producción Quirúrgica)",
    "total_registros": len(existing_records),
    "records": existing_records
}

json_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
with open(out_json, "wb") as f:
    f.write(json_bytes)

with gzip.open(out_gz, "wb", compresslevel=9) as f:
    f.write(json_bytes)

print(f"Guardado exitosamente: {len(json_bytes)/(1024*1024):.2f} MB JSON, {os.path.getsize(out_gz)/(1024*1024):.2f} MB GZ")
