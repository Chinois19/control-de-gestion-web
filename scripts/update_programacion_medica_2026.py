# -*- coding: utf-8 -*-
"""
update_programacion_medica_2026.py
───────────────────────────────────────────────────────────────────────────────
Actualiza `export const programacionMedica = [...]` en `src/data/programacionVillarrica2026.js`
combinando:
  - 1° Semestre: 'Reprogramación 19-03-2026 (2).xlsx' -> columna 'Producción 1 Sem' (y horas S1)
  - 2° Semestre: 'Programacion.RRHH.230626.xlsx'      -> columna 'Producción 2 Sem' (y horas S2)
  - Glosario   : 'Glosario.xlsx' (hoja Glosa) descombinando todas las celdas combinadas
                 y cruzando con prioridad al estamento médico y a Tipo/Sub-Actividad RCE válidos.
"""
import json, re, unicodedata, warnings, collections
from pathlib import Path
import openpyxl

warnings.filterwarnings('ignore')
ROOT = Path(__file__).resolve().parent.parent
D = ROOT / 'src' / 'data' / 'Programación Hospital de Villarrica 2026'
F_S1 = D / 'Reprogramación 19-03-2026 (2).xlsx'
F_S2 = D / 'Programacion.RRHH.230626.xlsx'
F_GLO = D / 'Glosario.xlsx'
F_JS = ROOT / 'src' / 'data' / 'programacionVillarrica2026.js'


def norm(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return ' '.join(s.upper().replace('?', '').split())


def num(v):
    try:
        return float(v or 0)
    except Exception:
        return 0.0


def is_med_prof(p):
    np = norm(p)
    if not np:
        return False
    non_med = ('NO MEDICO', 'TECNOLOGO', 'ENFERMER', 'MATRON', 'NUTRICION', 'KINESI',
               'TERAPEUTA', 'ASISTENTE', 'PSICOLOG', 'PSICOPEDAG', 'QUIMICO', 'FONOAUD')
    med_kw = ('MEDICO', 'PSIQUIATRA', 'FISIATRA', 'ONCOLOGO', 'GINECO', 'PEDIATRA', 'CIRUJANO')
    if any(k in np for k in non_med) and not any(k in np for k in med_kw):
        return False
    return True


def is_valid_rce_val(v):
    nv = norm(v)
    return bool(nv) and nv not in ('SIN RCE', 'N/A', 'NONE', 'SEGUN DESGLOSE', 'SIN ACTIVIDAD (CASO ESPECIALISTAS)')


def load_glosario(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb['Glosa']
    for m in list(ws.merged_cells.ranges):
        val = ws.cell(m.min_row, m.min_col).value
        ws.unmerge_cells(str(m))
        for r in range(m.min_row, m.max_row + 1):
            for c in range(m.min_col, m.max_col + 1):
                ws.cell(r, c).value = val

    rows = []
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if not any(r):
            continue
        cod_raw = r[3]
        cod = int(cod_raw) if str(cod_raw or '').strip().isdigit() else str(cod_raw or '').strip()
        rows.append(dict(
            actMinsal=str(r[0] or '').strip(),
            prof=str(r[1] or '').strip(),
            rendimiento=str(r[2] or '').strip(),
            cod=str(cod),
            actPlanilla=str(r[4] or '').strip(),
            tipoActRCE=str(r[5] or '').strip(),
            grupoRCE=str(r[6] or '').strip(),
            subActRCE=str(r[7] or '').strip(),
            rem=str(r[8] or '').strip(),
            descripcion=str(r[9] or '').strip(),
            rpe=str(r[10] or '').strip(),
        ))
    return rows


GLO_ROWS = load_glosario(F_GLO)


def lookup_glosa(aid, act_name):
    na = norm(act_name)
    sa = str(aid).strip()
    cands = [g for g in GLO_ROWS if norm(g['actPlanilla']) == na]
    if not cands and sa.isdigit():
        cands = [g for g in GLO_ROWS if g['cod'] == sa and is_med_prof(g['prof']) and g['actPlanilla']]
    if not cands:
        return None

    def score(g):
        med = 1 if is_med_prof(g['prof']) else 0
        has_tipo = 1 if is_valid_rce_val(g['tipoActRCE']) else 0
        has_sub = 1 if is_valid_rce_val(g['subActRCE']) else 0
        has_desc = 1 if g['descripcion'] else 0
        return (has_tipo and has_sub, med, has_tipo, has_sub, has_desc)

    cands_sorted = sorted(cands, key=score, reverse=True)
    best = dict(cands_sorted[0])
    for g in cands_sorted[1:]:
        if not best['descripcion'] and g['descripcion']:
            best['descripcion'] = g['descripcion']
        if (not best['rem'] or best['rem'] in ('None', 'N/A')) and g['rem'] not in ('', 'None', 'N/A'):
            best['rem'] = g['rem']
        if not best['rpe'] and g['rpe']:
            best['rpe'] = g['rpe']

    tipo = best['tipoActRCE'] if is_valid_rce_val(best['tipoActRCE']) else ''
    sub = best['subActRCE'] if is_valid_rce_val(best['subActRCE']) else ''
    grupo = best['grupoRCE'] if is_valid_rce_val(best['grupoRCE']) else ''
    return {
        'actMinsal': best['actMinsal'] or act_name,
        'rendimiento': best['rendimiento'],
        'tipoActRCE': tipo,
        'grupoRCE': grupo,
        'subActRCE': sub,
        'actRCE': sub or grupo,
        'rem': '' if best['rem'] in ('None', 'N/A') else best['rem'],
        'descripcion': '' if best['descripcion'] == 'None' else best['descripcion'],
        'rpe': '' if best['rpe'] in ('None', 'N/A') else best['rpe'],
    }


def norm_esp_planilla(e):
    s = str(e or '').strip()
    if s == 'PEDIATRIA':
        return 'PEDIATRÍA'
    if s == 'ONCOLOGÍA':
        return 'ONCOLOGÍA MÉDICA'
    return s


def read_prog(path, col_prod):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb['Programación Medica']
    rows = ws.iter_rows(values_only=True)
    hdr = list(next(rows))
    ix = {h: i for i, h in enumerate(hdr) if h}
    out = []
    for r in rows:
        if not r[ix['Id_Actividad']] or not r[ix['Especialidad']]:
            continue
        raw_id = str(r[ix['Id_Actividad']]).strip()
        aid = int(raw_id) if raw_id.isdigit() else raw_id
        prof = str(r[ix['Nombre Profesional']] or '').strip()
        if not prof or prof == 'RUN No encontrado en RRHH':
            continue
        out.append(dict(
            esp=norm_esp_planilla(r[ix['Especialidad']]),
            prof=prof,
            rut=str(r[ix['RUTSDV']] or '').strip(),
            horasContrato=num(r[ix['Total Horas semanales del contrato']]),
            proceso=str(r[ix['Proceso']] or '').strip(),
            id=aid,
            actividad=str(r[ix['Actividad']] or '').strip(),
            horas=num(r[ix['Horas asignadas']]),
            rendimiento=num(r[ix['Rendimiento por Hora']]),
            prod=round(num(r[ix[col_prod]])),
            rr=str(r[ix['Requiere rendimiento']] or '').strip(),
            tipo=str(r[ix['TIPO']] or '').strip(),
        ))
    return out


S1 = read_prog(F_S1, 'Producción 1 Sem')
S2 = read_prog(F_S2, 'Producción 2 Sem')

# Construir jerarquía Especialidad -> Profesional -> Actividades
esp_dict = {}
for sem, data in (('s1', S1), ('s2', S2)):
    for x in data:
        e_obj = esp_dict.setdefault(x['esp'], {'nombre': x['esp'], 'profs': {}})
        p_key = norm(x['prof'])
        p_obj = e_obj['profs'].setdefault(p_key, {
            'nombre': x['prof'],
            'rut': x['rut'],
            'horasContratoS1': 0.0,
            'horasContratoS2': 0.0,
            'acts': collections.OrderedDict()
        })
        if x['rut'] and not p_obj['rut']:
            p_obj['rut'] = x['rut']
        if sem == 's1' and x['horasContrato'] > p_obj['horasContratoS1']:
            p_obj['horasContratoS1'] = x['horasContrato']
        if sem == 's2' and x['horasContrato'] > p_obj['horasContratoS2']:
            p_obj['horasContratoS2'] = x['horasContrato']
            p_obj['nombre'] = x['prof']  # preferir escritura S2 si existe

        a_key = (str(x['id']), norm(x['actividad']), x['proceso'])
        a_obj = p_obj['acts'].setdefault(a_key, {
            'id': x['id'],
            'actividad': x['actividad'],
            'horas1Sem': 0.0,
            'horas2Sem': 0.0,
            'rendimiento': x['rendimiento'],
            'prod1Sem': 0,
            'prod2Sem': 0,
            'rr': x['rr'],
            'tipo': x['tipo'],
            'proceso': x['proceso'],
        })
        if sem == 's1':
            a_obj['horas1Sem'] = round(a_obj['horas1Sem'] + x['horas'], 2)
            a_obj['prod1Sem'] += x['prod']
        else:
            a_obj['horas2Sem'] = round(a_obj['horas2Sem'] + x['horas'], 2)
            a_obj['prod2Sem'] += x['prod']
            a_obj['actividad'] = x['actividad']
            if x['rendimiento']:
                a_obj['rendimiento'] = x['rendimiento']
        if x['rr'] == 'R':
            a_obj['rr'] = 'R'

result = []
for esp_name in sorted(esp_dict.keys()):
    e_obj = esp_dict[esp_name]
    profs_out = []
    for p_key, p_obj in sorted(e_obj['profs'].items(), key=lambda kv: kv[1]['nombre']):
        acts_out = []
        for a_obj in p_obj['acts'].values():
            # Horas asignadas vigentes: si tiene horas en S2 usamos S2, si solo estuvo en S1 usamos S1
            horas_vig = a_obj['horas2Sem'] if a_obj['horas2Sem'] > 0 else a_obj['horas1Sem']
            glosa = lookup_glosa(a_obj['id'], a_obj['actividad'])
            acts_out.append({
                'id': a_obj['id'],
                'actividad': a_obj['actividad'],
                'horas': round(horas_vig, 2),
                'horas1Sem': round(a_obj['horas1Sem'], 2),
                'horas2Sem': round(a_obj['horas2Sem'], 2),
                'rendimiento': a_obj['rendimiento'],
                'prod1Sem': a_obj['prod1Sem'],
                'prod2Sem': a_obj['prod2Sem'],
                'rr': a_obj['rr'],
                'tipo': a_obj['tipo'],
                'proceso': a_obj['proceso'],
                'glosa': glosa,
            })
        h_asig = round(sum(a['horas'] for a in acts_out), 2)
        p1 = sum(a['prod1Sem'] for a in acts_out)
        p2 = sum(a['prod2Sem'] for a in acts_out)
        h_cont = p_obj['horasContratoS2'] if p_obj['horasContratoS2'] > 0 else p_obj['horasContratoS1']
        profs_out.append({
            'nombre': p_obj['nombre'],
            'rut': p_obj['rut'],
            'totalHorasContrato': h_cont,
            'totalHorasAsignadas': h_asig,
            'prod1Sem': p1,
            'prod2Sem': p2,
            'totalProd': p1 + p2,
            'actividades': acts_out,
        })
    e_h = round(sum(p['totalHorasAsignadas'] for p in profs_out), 2)
    e_p1 = sum(p['prod1Sem'] for p in profs_out)
    e_p2 = sum(p['prod2Sem'] for p in profs_out)
    result.append({
        'nombre': esp_name,
        'numProfesionales': len(profs_out),
        'totalHorasAsignadas': e_h,
        'prod1Sem': e_p1,
        'prod2Sem': e_p2,
        'totalProd': e_p1 + e_p2,
        'profesionales': profs_out,
    })

js_text = F_JS.read_text(encoding='utf-8')
marker_start = 'export const programacionMedica = '
marker_end = '\nexport const programacionProfesionales = '
i1 = js_text.index(marker_start)
i2 = js_text.index(marker_end)
new_block = marker_start + json.dumps(result, ensure_ascii=False, indent=2) + ';'
F_JS.write_text(js_text[:i1] + new_block + js_text[i2:], encoding='utf-8')
print(f'Actualizado programacionMedica: {len(result)} especialidades | '
      f'S1={sum(e["prod1Sem"] for e in result):,} | S2={sum(e["prod2Sem"] for e in result):,} | '
      f'Total={sum(e["totalProd"] for e in result):,}')
