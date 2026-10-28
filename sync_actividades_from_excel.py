import win32com.client
import json
import gzip
import os
import datetime

excel_path = r"C:\Users\Minsal\Desktop\RCE ESPECIALIDADES (Control de Gestión WEB).xls"
out_dir = r"c:\Users\Minsal\OneDrive\Aplicaciones Antigravity\Control de Gestion Web\public\data"
out_json = os.path.join(out_dir, "actividades_medicina_cached.json")
out_gz = os.path.join(out_dir, "actividades_medicina_cached.json.gz")

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
        if not name.startswith("NOMINA"):
            continue
        used = sheet.UsedRange
        rows = used.Value
        if not rows or len(rows) < 2:
            continue
        headers = [str(h).strip() if h is not None else "" for h in rows[0]]
        col_idx = {h: i for i, h in enumerate(headers)}
        print(f"Procesando hoja '{name}' ({len(rows)-1} filas)...")

        idx_espec = col_idx.get("Especialidad")
        idx_nombres = col_idx.get("Nombres")
        idx_ap_pat = col_idx.get("Apellido Pat")
        idx_ap_mat = col_idx.get("Apellido Mat")
        idx_poli = col_idx.get("Policlinico")
        idx_tipo_cons = col_idx.get("Tipo Consulta")
        idx_act = col_idx.get("Actividad")
        idx_diag1 = col_idx.get("Diagnostico 1")
        idx_prest1 = col_idx.get("Prestacion 1")
        idx_est_aten = col_idx.get("Estado Atencion")
        idx_est_hora = col_idx.get("Estado Hora")
        idx_fecha = col_idx.get("Fecha Atencion: Día  (DD-Mon-YYYY)")
        if idx_fecha is None:
            idx_fecha = col_idx.get("Fecha Atencion: Día  (DD/MM/YYYY HH24:MI)")
        idx_pert = col_idx.get("Pertinencia")
        idx_t_pert = col_idx.get("Tiempo Establecido Pertinencia")
        idx_sobre = col_idx.get("Sobrecupo")
        idx_video = col_idx.get("Videoconsulta")
        idx_auge1 = col_idx.get("Auge 1")
        idx_prob_salud = col_idx.get("Problema Salud")
        idx_est_auge = col_idx.get("Estado Auge")
        idx_hip = col_idx.get("Hip Diagnostica")
        idx_contra = col_idx.get("Contrareferir")
        idx_contra_est = col_idx.get("Contrareferir Establecimiento")
        idx_accion = col_idx.get("Accion A Tomar")

        def clean_val(v):
            if v is None:
                return None
            s = str(v).strip()
            if s == "" or s == "-":
                return None
            return s

        for r in rows[1:]:
            f_val = r[idx_fecha] if idx_fecha is not None else None
            if f_val is None:
                continue
            if hasattr(f_val, "strftime"):
                f_str = f_val.strftime("%Y-%m-%d")
            else:
                f_str = str(f_val)[:10]
            if f_str < "2024-01-01" or f_str > "2026-12-31":
                continue

            if f_str > max_date_str:
                max_date_str = f_str
            if f_str < min_date_str:
                min_date_str = f_str

            obj = {}
            esp = clean_val(r[idx_espec]) if idx_espec is not None else None
            if esp:
                obj["especialidad"] = esp

            nom = clean_val(r[idx_nombres]) if idx_nombres is not None else ""
            ap1 = clean_val(r[idx_ap_pat]) if idx_ap_pat is not None else ""
            ap2 = clean_val(r[idx_ap_mat]) if idx_ap_mat is not None else ""
            prof = " ".join([x for x in (nom, ap1, ap2) if x]).strip()
            if prof:
                obj["profesional_nombre"] = prof

            poli = clean_val(r[idx_poli]) if idx_poli is not None else None
            if poli:
                obj["policlinico"] = poli

            tc = clean_val(r[idx_tipo_cons]) if idx_tipo_cons is not None else None
            if tc:
                obj["tipo_consulta"] = tc

            act = clean_val(r[idx_act]) if idx_act is not None else None
            if act:
                obj["actividad"] = act

            d1 = clean_val(r[idx_diag1]) if idx_diag1 is not None else None
            if d1:
                obj["diagnostico_1"] = d1

            p1 = clean_val(r[idx_prest1]) if idx_prest1 is not None else None
            if p1:
                obj["prestacion_1"] = p1

            ea = clean_val(r[idx_est_aten]) if idx_est_aten is not None else None
            if ea:
                obj["estado_atencion"] = ea

            eh = clean_val(r[idx_est_hora]) if idx_est_hora is not None else None
            if eh:
                obj["estado_hora"] = eh

            obj["fecha_atencion"] = f_str

            pert = clean_val(r[idx_pert]) if idx_pert is not None else None
            if pert:
                obj["pertinencia"] = pert

            tpert = clean_val(r[idx_t_pert]) if idx_t_pert is not None else None
            if tpert:
                obj["tiempo_establecido_pertinencia"] = tpert

            sobre = clean_val(r[idx_sobre]) if idx_sobre is not None else None
            if sobre:
                obj["sobrecupo"] = sobre

            video = clean_val(r[idx_video]) if idx_video is not None else None
            if video:
                obj["videoconsulta"] = video

            auge = (clean_val(r[idx_auge1]) if idx_auge1 is not None else None) or \
                   (clean_val(r[idx_prob_salud]) if idx_prob_salud is not None else None) or \
                   (clean_val(r[idx_est_auge]) if idx_est_auge is not None else None)
            if auge:
                obj["auge_1"] = auge

            hip = clean_val(r[idx_hip]) if idx_hip is not None else None
            if hip:
                obj["hip_diagnostica"] = hip

            contra = clean_val(r[idx_contra]) if idx_contra is not None else None
            if contra:
                obj["contrareferir"] = contra

            contra_e = clean_val(r[idx_contra_est]) if idx_contra_est is not None else None
            if contra_e:
                obj["contrareferir_establecimiento"] = contra_e

            acc = clean_val(r[idx_accion]) if idx_accion is not None else None
            if acc:
                obj["accion_a_tomar"] = acc

            records.append(obj)

    wb.Close(False)
finally:
    excel.Quit()

print(f"Total registros 2024-2026: {len(records)} (Rango: {min_date_str} a {max_date_str})")

output = {
    "lastUpdated": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    "totalRecords": len(records),
    "records": records
}

json_bytes = json.dumps(output, ensure_ascii=False).encode("utf-8")
with open(out_json, "wb") as f:
    f.write(json_bytes)

with gzip.open(out_gz, "wb", compresslevel=9) as f:
    f.write(json_bytes)

print(f"Guardado exitosamente: {len(json_bytes)/(1024*1024):.2f} MB JSON, {os.path.getsize(out_gz)/(1024*1024):.2f} MB GZ")

