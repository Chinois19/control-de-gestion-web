import os
import sys
import json
import gzip
import datetime
import xlrd

def sync_urgencia_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = r"C:\Users\Minsal\Desktop\Escritorio\Consultas de Urgencia 2021-2026.xls"
    urgencia_json_path = os.path.join(base_dir, "public", "data", "urgencia_cached.json")
    urgencia_gz_path = os.path.join(base_dir, "public", "data", "urgencia_cached.json.gz")
    c2_json_path = os.path.join(base_dir, "public", "data", "urgencia_tiempos_c2_cached.json")
    c2_gz_path = os.path.join(base_dir, "public", "data", "urgencia_tiempos_c2_cached.json.gz")

    print("=== Iniciando sincronización de Consultas de Urgencia ===")
    
    # 1. Cargar urgencia_cached.json existente
    if not os.path.exists(urgencia_json_path):
        print(f"Error: {urgencia_json_path} no encontrado.")
        return False
    
    with open(urgencia_json_path, "r", encoding="utf-8") as f:
        urg_data = json.load(f)
    existing_urg_recs = urg_data.get("records", [])
    print(f"Registros existentes en urgencia_cached.json: {len(existing_urg_recs)}")

    # 2. Cargar urgencia_tiempos_c2_cached.json existente
    if not os.path.exists(c2_json_path):
        print(f"Error: {c2_json_path} no encontrado.")
        return False

    with open(c2_json_path, "r", encoding="utf-8") as f:
        c2_data = json.load(f)
    existing_c2_recs = c2_data.get("records", [])
    print(f"Registros existentes en urgencia_tiempos_c2_cached.json: {len(existing_c2_recs)}")

    # 3. Leer Excel con datos hasta el 20 de Octubre
    if not os.path.exists(excel_path):
        print(f"Aviso: Archivo Excel no encontrado en {excel_path}.")
        return False

    print(f"Leyendo Excel oficial: {excel_path}...")
    wb = xlrd.open_workbook(excel_path, on_demand=True)
    last_sheet = wb.sheet_by_index(len(wb.sheet_names()) - 1)
    print(f"Última hoja '{last_sheet.name}' cargada con {last_sheet.nrows} filas.")

    # 4. Extraer registros nuevos (posteriores al 13/10/2026)
    new_urg_recs = []
    new_c2_recs = []
    current_urg_id = len(existing_urg_recs) + 1
    current_c2_id = len(existing_c2_recs) + 1

    for r in range(1, last_sheet.nrows):
        val_fec = last_sheet.cell_value(r, 37)
        try:
            dt = xlrd.xldate_as_datetime(val_fec, 0)
            d_str = dt.strftime("%Y-%m-%d")
            if d_str > "2026-10-13":
                row = last_sheet.row_values(r)
                
                # Cálculo de tiempo de espera y timestamps
                fec_adm = row[37]
                col45 = row[45] # Edad en días con fracción decimal de hora de admisión
                time_fraction = (col45 - int(col45)) if isinstance(col45, (int, float)) else 0
                exact_adm = fec_adm + time_fraction
                adm_dt = xlrd.xldate_as_datetime(exact_adm, 0)
                
                cierre = row[35]
                cierre_dt = xlrd.xldate_as_datetime(cierre, 0) if isinstance(cierre, (int, float)) and cierre > 0 else adm_dt
                
                if isinstance(cierre, (int, float)) and cierre > 0 and time_fraction > 0:
                    t_espera = max(0, round((cierre - exact_adm) * 24 * 60))
                else:
                    t_espera = 0

                prev = str(row[9]).strip() if row[9] else "Sin Registro"
                beneficiario = "Beneficiario" if prev.upper().startswith("FONASA") else "No Beneficiario"
                
                cat = str(row[48]).strip() or "C3"
                sel = str(row[39]).strip() or "C3"
                
                sexo_raw = str(row[40]).strip().upper()
                if sexo_raw.startswith("H") or sexo_raw.startswith("MASC"):
                    sexo = "HOMBRE"
                elif sexo_raw.startswith("M") or sexo_raw.startswith("FEM"):
                    sexo = "MUJER"
                else:
                    sexo = str(row[40]).strip()

                diag_grp = str(row[36]).strip() if row[36] else "NO PRESENTA REGISTRO"
                diag_cod = str(row[26]).strip() if row[26] else None
                diag_desc = str(row[27]).strip() if row[27] else None
                destino = str(row[50]).strip() if row[50] else "ALTA DOMICILIO"
                
                tipo_cons = str(row[38]).strip() or "ADULTO"
                
                # Record de Urgencia General (100% anonimizado)
                new_urg_recs.append({
                    "id": f"AT-{current_urg_id}",
                    "fecha_admision": d_str,
                    "year": dt.year,
                    "month": dt.month,
                    "estado_atencion": str(row[34]).strip() or "CERRADO",
                    "tipo_consulta": tipo_cons,
                    "procedencia": "DOMICILIO",
                    "medio_llegada": "PROPIOS MEDIOS",
                    "categorizacion": cat,
                    "sexo": sexo,
                    "edad": int(row[43]) if isinstance(row[43], (int, float)) else 0,
                    "grupo_edad": str(row[13]).strip() or "Adulto",
                    "prevision": prev,
                    "beneficiario": beneficiario,
                    "diagnostico_grupo": diag_grp,
                    "cod_cie10": diag_cod,
                    "diagnostico_desc": diag_desc,
                    "destino_inmediato": destino,
                    "tiempo_espera_minutos": t_espera
                })
                current_urg_id += 1

                # Record de Tiempos C2 (100% anonimizado)
                if "GINECO" in tipo_cons.upper():
                    esp = "MEDICO GINECO-OBSTETRA"
                elif "MATRON" in str(row[25]).upper() or "MATRON" in str(row[47]).upper():
                    esp = "MATRON(A)"
                else:
                    esp = "MEDICO ADULTO Y NIÑO"

                dau_anon = f"DAU-{current_c2_id}"
                new_c2_recs.append({
                    "id": dau_anon,
                    "dau": dau_anon,
                    "year": dt.year,
                    "month": dt.month,
                    "fecha_admision": adm_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "fecha_inicio_atencion": adm_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "fecha_toma_muestra": adm_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "fecha_cierre_final": cierre_dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "estado_atencion": str(row[34]).strip() or "CERRADO",
                    "tipo_consulta": tipo_cons,
                    "categorizacion_urgencia": cat,
                    "selector_demanda": sel,
                    "tipo_especialidad": esp,
                    "tiempo_espera_minutos": t_espera,
                    "rango_espera": "Menor o igual a 30 minutos" if t_espera <= 30 else "Mayor a 30 Min.",
                    "cumple_meta_30m": t_espera <= 30,
                    "edad": int(row[43]) if isinstance(row[43], (int, float)) else 0,
                    "sexo": sexo,
                    "prevision": prev,
                    "destino_inmediato": destino,
                    "esp_1": str(row[25]).strip() if row[25] else "MEDICO",
                    "esp_2": None,
                    "esp_3": None,
                    "esp_4": None,
                    "esp_5": None
                })
                current_c2_id += 1
        except Exception as e:
            pass

    print(f"Nuevos registros incorporados: {len(new_urg_recs)} para Urgencia General, {len(new_c2_recs)} para Tiempos C2.")

    # 5. Guardar urgencia_cached.json y .json.gz con RFC 1952 header (1f 8b)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    urg_data["lastUpdated"] = now_iso
    urg_data["records"] = existing_urg_recs + new_urg_recs
    urg_data["total_registros"] = len(urg_data["records"])

    json_str_urg = json.dumps(urg_data, ensure_ascii=False)
    with open(urgencia_json_path, "w", encoding="utf-8") as f:
        f.write(json_str_urg)
    with gzip.open(urgencia_gz_path, "wb", compresslevel=9) as f:
        f.write(json_str_urg.encode("utf-8"))
    print(f"Urgencia general guardada: {len(urg_data['records'])} registros. Tamaño GZ: {os.path.getsize(urgencia_gz_path):,} bytes.")

    # 6. Guardar urgencia_tiempos_c2_cached.json y .json.gz
    c2_data["lastUpdated"] = now_iso
    c2_data["records"] = existing_c2_recs + new_c2_recs
    c2_data["total_registros"] = len(c2_data["records"])

    json_str_c2 = json.dumps(c2_data, ensure_ascii=False)
    with open(c2_json_path, "w", encoding="utf-8") as f:
        f.write(json_str_c2)
    with gzip.open(c2_gz_path, "wb", compresslevel=9) as f:
        f.write(json_str_c2.encode("utf-8"))
    print(f"Tiempos C2 guardado: {len(c2_data['records'])} registros. Tamaño GZ: {os.path.getsize(c2_gz_path):,} bytes.")

    print("=== Sincronización completada con éxito ===")
    return True

if __name__ == "__main__":
    sync_urgencia_data()
