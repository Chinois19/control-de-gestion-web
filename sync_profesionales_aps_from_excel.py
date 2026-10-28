import win32com.client
import json
import gzip
import os
import datetime

excel_path = r"C:\Users\Minsal\Desktop\RUP APS REM 2026 (Control de Gestión Web).xls"
out_dir = r"c:\Users\Minsal\OneDrive\Aplicaciones Antigravity\Control de Gestion Web\public\data"
out_json = os.path.join(out_dir, "profesionales_aps_cached.json")
out_gz = os.path.join(out_dir, "profesionales_aps_cached.json.gz")

print(f"Abriendo {excel_path} via Excel COM...")
excel = win32com.client.DispatchEx("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False

try:
    wb = excel.Workbooks.Open(excel_path, ReadOnly=True)
    records = []
    max_date_str = ""
    min_date_str = "9999-99-99"

    for sheet in wb.Sheets:
        name = sheet.Name
        if not name.startswith("Nomina"):
            continue
        used = sheet.UsedRange
        rows = used.Value
        if not rows or len(rows) < 2:
            continue
        headers = [str(h).strip() if h is not None else "" for h in rows[0]]
        col_idx = {h: i for i, h in enumerate(headers)}
        print(f"Procesando hoja '{name}' ({len(rows)-1} filas)...")

        def g(col_name):
            return col_idx.get(col_name)

        idx_rango = g("Rangos de edad")
        idx_act = g("Actividad")
        idx_tc = g("Tipo consulta")
        idx_c1 = g("Codigo 1")
        idx_d1 = g("Diagnostico 1")
        idx_a1 = g("Auge 1")
        idx_ps1 = g("Problema salud 1")
        idx_c2 = g("Codigo 2")
        idx_d2 = g("Diagnostico 2")
        idx_eh = g("Estado hora")
        idx_ea = g("Estado atencion")
        idx_edad = g("Edad años pac rup")
        idx_cta = g("Cta cte")
        idx_prev = g("Prevision")
        idx_etnia = g("Percepcion etnia")
        idx_ur = g("Urbano rural")
        idx_com = g("Comuna")
        idx_sexo = g("Sexo")
        idx_ben = g("Beneficiario")
        idx_ficha = g("Ficha")
        idx_p1 = g("Prestacion 1")
        idx_p2 = g("Prestacion 2")
        idx_p3 = g("Prestacion 3")
        idx_p4 = g("Prestacion 4")
        idx_p5 = g("Prestacion 5")
        idx_rut_p = g("Rut profesional")
        idx_nom_p = g("Nombres profesional")
        idx_ap1_p = g("Apellido pat profesional")
        idx_ap2_p = g("Apellido mat profesional")
        idx_agrup = g("Agrupacion")
        idx_poli = g("Policlinico")
        idx_fnac = g("Fecha Nac")
        idx_gact = g("Grupo Actividad")
        idx_fat = g("Fecha atencion: Día  (DD-Mon-YYYY)")
        idx_acc = g("Accion A Tomar")
        idx_calle = g("Situacion Calle")
        idx_disc = g("Es Discapacitada")
        idx_sen = g("Es Sename")
        idx_emb = g("Es Embarazada")

        def clean_val(v):
            if v is None:
                return None
            s = str(v).strip()
            if s == "" or s == "-":
                return None
            if s.endswith(".0") and s[:-2].isdigit():
                return s[:-2]
            return s

        for r in rows[1:]:
            f_val = r[idx_fat] if idx_fat is not None else None
            if f_val is None:
                continue
            if hasattr(f_val, "strftime"):
                f_str = f_val.strftime("%Y-%m-%d")
            else:
                f_str = str(f_val)[:10]
            if f_str < "2025-01-01":
                continue

            if f_str > max_date_str:
                max_date_str = f_str
            if f_str < min_date_str:
                min_date_str = f_str

            obj = {}
            v = clean_val(r[idx_rango]) if idx_rango is not None else None
            if v: obj["rango_edad"] = v
            v = clean_val(r[idx_act]) if idx_act is not None else None
            if v: obj["actividad"] = v
            v = clean_val(r[idx_tc]) if idx_tc is not None else None
            if v: obj["tipo_consulta"] = v
            v = clean_val(r[idx_c1]) if idx_c1 is not None else None
            if v: obj["codigo_diag_1"] = v
            v = clean_val(r[idx_d1]) if idx_d1 is not None else None
            if v: obj["diagnostico_1"] = v
            v = clean_val(r[idx_a1]) if idx_a1 is not None else None
            if v: obj["auge_1"] = v
            v = clean_val(r[idx_ps1]) if idx_ps1 is not None else None
            if v: obj["problema_salud_1"] = v
            v = clean_val(r[idx_c2]) if idx_c2 is not None else None
            if v: obj["codigo_diag_2"] = v
            v = clean_val(r[idx_d2]) if idx_d2 is not None else None
            if v: obj["diagnostico_2"] = v
            v = clean_val(r[idx_eh]) if idx_eh is not None else None
            if v: obj["estado_hora"] = v
            v = clean_val(r[idx_ea]) if idx_ea is not None else None
            if v: obj["estado_atencion"] = v

            edad_v = r[idx_edad] if idx_edad is not None else None
            if edad_v is not None and str(edad_v).strip() not in ("", "-"):
                try:
                    obj["edad"] = int(float(edad_v))
                except:
                    pass

            v = clean_val(r[idx_cta]) if idx_cta is not None else None
            if v: obj["cta_cte"] = v
            v = clean_val(r[idx_prev]) if idx_prev is not None else None
            if v: obj["prevision"] = v
            v = clean_val(r[idx_etnia]) if idx_etnia is not None else None
            if v: obj["pueblo_originario"] = v
            v = clean_val(r[idx_ur]) if idx_ur is not None else None
            if v: obj["urbano_rural"] = v
            v = clean_val(r[idx_com]) if idx_com is not None else None
            if v: obj["comuna"] = v
            v = clean_val(r[idx_sexo]) if idx_sexo is not None else None
            if v: obj["sexo"] = v
            v = clean_val(r[idx_ben]) if idx_ben is not None else None
            if v: obj["beneficiario"] = v
            v = clean_val(r[idx_ficha]) if idx_ficha is not None else None
            if v: obj["ficha"] = v

            prests = []
            for pidx in (idx_p1, idx_p2, idx_p3, idx_p4, idx_p5):
                pv = clean_val(r[pidx]) if pidx is not None else None
                if pv:
                    prests.append(pv)
            if prests:
                obj["prestacion_1"] = prests[0]
                if len(prests) > 1:
                    obj["prestaciones"] = prests

            v = clean_val(r[idx_rut_p]) if idx_rut_p is not None else None
            if v: obj["profesional_rut"] = v

            nom = clean_val(r[idx_nom_p]) if idx_nom_p is not None else ""
            ap1 = clean_val(r[idx_ap1_p]) if idx_ap1_p is not None else ""
            ap2 = clean_val(r[idx_ap2_p]) if idx_ap2_p is not None else ""
            prof = " ".join([x for x in (nom, ap1, ap2) if x]).strip()
            if prof:
                obj["profesional_nombre"] = prof

            v = clean_val(r[idx_agrup]) if idx_agrup is not None else None
            if v: obj["agrupacion"] = v
            v = clean_val(r[idx_poli]) if idx_poli is not None else None
            if v: obj["policlinico"] = v

            fn_val = r[idx_fnac] if idx_fnac is not None else None
            if fn_val is not None:
                if hasattr(fn_val, "strftime"):
                    obj["fecha_nac"] = fn_val.strftime("%Y-%m-%d")
                else:
                    s_fn = clean_val(fn_val)
                    if s_fn:
                        obj["fecha_nac"] = s_fn[:10]

            v = clean_val(r[idx_gact]) if idx_gact is not None else None
            if v: obj["grupo_actividad"] = v

            obj["fecha_atencion"] = f_str

            v = clean_val(r[idx_acc]) if idx_acc is not None else None
            if v: obj["accion_a_tomar"] = v

            if idx_calle is not None and str(r[idx_calle]).strip().upper() == "SI":
                obj["situacion_calle"] = True
            if idx_disc is not None and str(r[idx_disc]).strip().upper() == "SI":
                obj["es_discapacitada"] = True
            if idx_sen is not None and str(r[idx_sen]).strip().upper() == "SI":
                obj["es_sename"] = True
            if idx_emb is not None and str(r[idx_emb]).strip().upper() == "SI":
                obj["es_embarazada"] = True

            records.append(obj)

    wb.Close(False)
finally:
    excel.Quit()

print(f"Total registros RUP APS 2026 desde Excel: {len(records)} (Rango: {min_date_str} a {max_date_str})")

old_records_2025 = []
if os.path.exists(out_gz):
    try:
        with gzip.open(out_gz, "rb") as f:
            old_data = json.loads(f.read().decode("utf-8"))
            old_records_2025 = [
                r for r in old_data.get("records", [])
                if r.get("fecha_atencion", "").startswith("2025")
            ]
        print(f"Conservando {len(old_records_2025)} registros históricos de 2025.")
    except Exception as e:
        print(f"Aviso al leer caché previo: {e}")

all_records = old_records_2025 + records

output = {
    "lastUpdated": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    "totalRecords": len(all_records),
    "records": all_records
}

json_bytes = json.dumps(output, ensure_ascii=False).encode("utf-8")
with open(out_json, "wb") as f:
    f.write(json_bytes)

with gzip.open(out_gz, "wb", compresslevel=9) as f:
    f.write(json_bytes)

print(f"Guardado exitosamente: {len(json_bytes)/(1024*1024):.2f} MB JSON, {os.path.getsize(out_gz)/(1024*1024):.2f} MB GZ")
