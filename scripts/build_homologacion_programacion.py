# -*- coding: utf-8 -*-
"""
Genera Homologacion_Programacion_Medica_2026.xlsx
 - 1° semestre  : 'Reprogramación 19-03-2026 (2).xlsx'  -> columna 'Producción 1 Sem'
 - 2° semestre  : 'Programacion.RRHH.230626.xlsx'        -> columna 'Producción 2 Sem'
 - Año 2026     : suma de ambos semestres
 - Glosario     : Glosario.xlsx (hoja Glosa), expandiendo celdas combinadas (merged cells)
                  y cruzando por nombre de Actividad Planilla (con prioridad a estamento Médico
                  y a entradas con Tipo Actividad RCE y Sub-Actividad RCE válidas).
 - Producción   : public/data/actividades_medicina_cached.json (RCE especialistas),
                  solo año 2026, estado_hora EJECUTADA (NSP como complementario).
"""
import json, unicodedata, difflib, warnings, collections
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

warnings.filterwarnings('ignore')
ROOT = Path(__file__).resolve().parent.parent
D = ROOT / 'src' / 'data' / 'Programación Hospital de Villarrica 2026'
F_S1 = D / 'Reprogramación 19-03-2026 (2).xlsx'
F_S2 = D / 'Programacion.RRHH.230626.xlsx'
F_GLO = D / 'Glosario.xlsx'
F_RCE = ROOT / 'public' / 'data' / 'actividades_medicina_cached.json'
OUT = D / 'Homologacion_Programacion_Medica_2026.xlsx'


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
    # Descombinar y propagar el valor de cada rango combinado en Glosario.xlsx
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
            rend=str(r[2] or '').strip(),
            cod=cod,
            planilla=str(r[4] or '').strip(),
            tipo=str(r[5] or '').strip(),
            act=str(r[6] or '').strip(),
            sub=str(r[7] or '').strip(),
            rem=str(r[8] or '').strip(),
            desc=str(r[9] or '').strip(),
            rpe=str(r[10] or '').strip(),
        ))
    return rows


GLO_ROWS = load_glosario(F_GLO)


def lookup_glosa(aid, act_name):
    na = norm(act_name)
    # 1° coincidencia exacta por nombre de actividad en la planilla
    cands = [g for g in GLO_ROWS if norm(g['planilla']) == na]
    # 2° si no hay coincidencia por nombre, buscar por código SOLO en filas de estamento médico
    if not cands and isinstance(aid, int):
        cands = [g for g in GLO_ROWS if g['cod'] == aid and is_med_prof(g['prof']) and g['planilla']]
    if not cands:
        return None

    # Priorizar filas que sean de estamento médico y que tengan Tipo Actividad RCE + Sub-Actividad RCE válidos
    def score(g):
        med = 1 if is_med_prof(g['prof']) else 0
        has_tipo = 1 if is_valid_rce_val(g['tipo']) else 0
        has_sub = 1 if is_valid_rce_val(g['sub']) else 0
        has_desc = 1 if g['desc'] else 0
        return (has_tipo and has_sub, med, has_tipo, has_sub, has_desc)

    cands_sorted = sorted(cands, key=score, reverse=True)
    best = dict(cands_sorted[0])
    # Completar descripción/REM si otra fila de la misma actividad los trae
    for g in cands_sorted[1:]:
        if not best['desc'] and g['desc']:
            best['desc'] = g['desc']
        if (not best['rem'] or best['rem'] in ('None', 'N/A')) and g['rem'] not in ('', 'None', 'N/A'):
            best['rem'] = g['rem']
        if not best['rpe'] and g['rpe']:
            best['rpe'] = g['rpe']
    return best


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
        out.append(dict(
            prof=str(r[ix['Nombre Profesional']] or '').strip(),
            proceso=str(r[ix['Proceso']] or '').strip(),
            esp=str(r[ix['Especialidad']]).strip(),
            id=aid,
            act=str(r[ix['Actividad']] or '').strip(),
            horas=num(r[ix['Horas asignadas']]),
            rend=num(r[ix['Rendimiento por Hora']]),
            prod=num(r[ix[col_prod]]),
            rr=str(r[ix['Requiere rendimiento']] or '').strip()))
    return out


print('Leyendo 1° semestre (Reprogramación 19-03-2026 (2).xlsx)…')
S1 = read_prog(F_S1, 'Producción 1 Sem')
print('Leyendo 2° semestre (Programacion.RRHH.230626.xlsx)…')
S2 = read_prog(F_S2, 'Producción 2 Sem')

# Agregación Especialidad x Actividad
agg = {}
profs = collections.defaultdict(set)
for sem, data in (('s1', S1), ('s2', S2)):
    for x in data:
        k = (x['esp'], x['id'], norm(x['act']))
        a = agg.setdefault(k, dict(esp=x['esp'], id=x['id'], act=x['act'], rr=x['rr'], s1=0.0, s2=0.0, h1=0.0, h2=0.0, proc=set()))
        a[sem] += x['prod']
        a['h1' if sem == 's1' else 'h2'] += x['horas']
        if x['proceso']:
            a['proc'].add(x['proceso'])
        if x['prod'] > 0 or x['horas'] > 0:
            profs[k].add(x['prof'])
        if x['rr'] == 'R':
            a['rr'] = 'R'

# Producción RCE 2026
rce = json.load(open(F_RCE, encoding='utf8'))
recs = [r for r in rce['records'] if str(r.get('fecha_atencion', ''))[:4] == '2026']
print('RCE 2026:', len(recs), 'registros | actualizado', rce.get('lastUpdated'))
rce_esp = collections.Counter(norm(r['especialidad']) for r in recs if r.get('especialidad'))
ejec = collections.Counter()   # (esp_norm, tipo|sub) EJECUTADA
nsp = collections.Counter()    # NO SE PRESENTO
pairs = collections.Counter()
for r in recs:
    e = norm(r.get('especialidad'))
    t = norm(r.get('tipo_consulta'))
    a = norm(r.get('actividad'))
    key = f"{t}|{a}"
    keys = [key]
    if t == 'SALUD MENTAL ESPECIALIDAD' and a.startswith('CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA'):
        keys.append('SALUD MENTAL ESPECIALIDAD|CONSULTORIA DE SALUD MENTAL ESPECIALIDAD OTORGADA')
    if t == 'TELEMEDICINA CONTROL' and a == 'TELECONSULTA CONTROL':
        keys.append('TELEMEDICINA CONTROL|TELEINTERCONSULTA SINCRONICA CONTROL')
    if t == 'TELEMEDICINA NUEVA' and a == 'TELECONSULTA NUEVA':
        keys.append('TELEMEDICINA NUEVA|TELEINTERCONSULTA SINCRONICA NUEVA')
    est = norm(r.get('estado_hora'))
    if est == 'EJECUTADA':
        for rk in keys:
            ejec[(e, rk)] += 1
        pairs[key] += 1
    elif est == 'NO SE PRESENTO':
        for rk in keys:
            nsp[(e, rk)] += 1

# Mapeo especialidad planilla -> especialidad RCE
esp_prog = sorted({k[0] for k in agg})
MANUAL_ESP = {
    'CARDIOLOGÍA ADULTO': 'CARDIOLOGIA',
    'CIRUGÍA GENERAL ADULTO': 'CIRUGIA GENERAL',
    'CIRUGÍA PEDIÁTRICA': 'CIRUGIA INFANTIL',
    'DERMATOLOGÍA': 'DERMATOLOGIA',
    'ENDOCRINOLOGÍA ADULTO': 'ENDOCRINOLOGIA ADULTO',
    'GASTROENTEROLOGÍA ADULTO': 'GASTROENTEROLOGIA ADULTO',
    'GERIATRÍA': 'GERIATRIA',
    'GINECOLOGÍA ADULTO': 'GINECOLOGIA',
    'HEMATOLOGÍA ADULTO': 'HEMATOLOGIA',
    'INFECTOLOGÍA ADULTO': 'INFECTOLOGIA',
    'MASTOLOGÍA': 'MASTOLOGIA',
    'MEDICINA FAMILIAR': 'MEDICINA FAMILIAR',
    'MEDICINA FÍSICA Y REHABILITACIÓN ADULTO (FISIATRÍA ADULTO)': 'FISIATRIA',
    'MEDICINA INTERNA': 'MEDICINA INTERNA',
    'NEFROLOGÍA ADULTO': 'NEFROLOGIA',
    'NEONATOLOGÍA': 'PEDIATRIA NEONATOLOGIA',
    'NEUMOLOGÍA PEDIÁTRICA (BRONCOPULMONAR INFANTIL)': 'BRONCOPULMONAR INFANTIL',
    'NEUROCIRUGÍA': 'NEUROCIRUGIA',
    'NEUROLOGÍA ADULTO': 'NEUROLOGIA ADULTO',
    'NEUROLOGÍA PEDIÁTRICA': 'NEUROLOGIA INFANTIL',
    'OBSTETRICIA': 'OBSTETRICIA',
    'OFTALMOLOGÍA': 'OFTALMOLOGIA',
    'OTORRINOLARINGOLOGÍA': 'OTORRINOLARINGOLOGIA',
    'PEDIATRÍA': 'PEDIATRIA',
    'PSIQUIATRÍA ADULTO': 'PSIQUIATRIA ADULTO',
    'PSIQUIATRÍA PEDIÁTRICA Y DE LA ADOLESCENCIA': 'PSIQUIATRIA INFANTIL',
    'RADIOLOGÍA ADULTO (IMAGENOLOGÍA ADULTO)': 'RADIOLOGIA',
    'REUMATOLOGÍA': 'REUMATOLOGIA',
    'TRAUMATOLOGÍA Y ORTOPEDIA ADULTO': 'TRAUMATOLOGIA Y ORTOPEDIA',
    'TRAUMATOLOGÍA Y ORTOPEDIA PEDIÁTRICA': 'TRAUMATOLOGIA INFANTIL',
    'UROLOGÍA ADULTO': 'UROLOGIA',
}
esp_map = {}
for e in esp_prog:
    n = norm(e)
    if e in MANUAL_ESP and MANUAL_ESP[e] in rce_esp:
        esp_map[e] = (MANUAL_ESP[e], 'Exacta' if MANUAL_ESP[e] == n else 'Homologada')
    elif n in rce_esp:
        esp_map[e] = (n, 'Exacta')
    else:
        base = n.replace(' ADULTO', '').replace(' INFANTIL', '').replace(' PEDIATRICA', '')
        cand = difflib.get_close_matches(n, list(rce_esp), n=1, cutoff=0.6) or difflib.get_close_matches(base, list(rce_esp), n=1, cutoff=0.6)
        esp_map[e] = (cand[0], 'Aproximada') if cand else ('', 'Sin equivalente RCE')

# Hoja homologación
rows = []
for (esp, aid, _), a in sorted(agg.items(), key=lambda kv: (kv[0][0], str(kv[0][1]).zfill(8), kv[0][2])):
    g = lookup_glosa(aid, a['act'])
    total = a['s1'] + a['s2']
    em, _ = esp_map[esp]
    has_rce = bool(g and is_valid_rce_val(g['tipo']) and is_valid_rce_val(g['sub']))
    if a['rr'] != 'R':
        estado = 'No requiere rendimiento (NR)'
    elif not g:
        estado = 'Sin glosa en Glosario'
    elif not has_rce:
        estado = 'Sin RCE de especialistas'
    else:
        estado = 'Homologada'
    tipo_out = g['tipo'] if (g and is_valid_rce_val(g['tipo'])) else (g['tipo'] or g['act'] if g else '')
    sub_out = g['sub'] if (g and is_valid_rce_val(g['sub'])) else (g['sub'] if g else '')
    key = f"{norm(g['tipo'])}|{norm(g['sub'])}" if has_rce else ''
    ex = ejec.get((em, key), 0) if key and em else 0
    ns = nsp.get((em, key), 0) if key and em else 0
    rows.append([esp, em, aid, a['act'], a['rr'], len(profs[(esp, aid, norm(a['act']))]),
                 round(a['h1'], 1), round(a['h2'], 1),
                 a['s1'], a['s2'], total,
                 tipo_out, sub_out, key, g['rem'] if g else '', g['rpe'] if g else '', estado,
                 ex, ns, None, None, ''])

HDR = ['Especialidad (planilla)', 'Especialidad RCE (mapeada)', 'Id actividad', 'Actividad programada', 'R/NR', 'N° profesionales',
       'Horas 1° Sem', 'Horas 2° Sem', 'Prod. 1° Sem (Reprogramación)', 'Prod. 2° Sem (Programacion.RRHH)', 'Meta año 2026',
       'Tipo Actividad RCE', 'Sub-Actividad RCE', 'Clave RCE (Tipo|Sub)', 'REM', 'RPE', 'Estado homologación',
       'Ejecutadas RCE 2026 (clave y especialidad)', 'NSP RCE 2026 (complementario)', '% Cumplimiento', 'Brecha (Real - Meta)',
       'Observación / Corrección manual']

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Homologación'
ws.append(HDR)
for i, r in enumerate(rows, start=2):
    r[19] = f'=IF(AND(Q{i}="Homologada",K{i}>0),R{i}/K{i},"")'
    r[20] = f'=IF(Q{i}="Homologada",R{i}-K{i},"")'
    ws.append(r)

hfill = PatternFill('solid', fgColor='1E3A8A')
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill
    c.alignment = Alignment(wrap_text=True, vertical='center')
ws.row_dimensions[1].height = 45
widths = [34, 28, 9, 52, 6, 10, 10, 10, 14, 14, 12, 26, 34, 52, 7, 8, 24, 16, 14, 12, 12, 40]
for i, w in enumerate(widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'E2'
ws.auto_filter.ref = ws.dimensions
fills = {'Homologada': 'D1FAE5', 'Sin RCE de especialistas': 'FEF3C7', 'Sin glosa en Glosario': 'FEE2E2', 'No requiere rendimiento (NR)': 'DBEAFE'}
for row in ws.iter_rows(min_row=2):
    row[16].fill = PatternFill('solid', fgColor=fills.get(row[16].value, 'FFFFFF'))
    row[19].number_format = '0.0%'

# Hoja Catálogo único de Actividades Programadas -> Glosario RCE
ws_cat = wb.create_sheet('Catálogo Actividades RCE')
ws_cat.append(['Id actividad', 'Actividad programada (planilla)', 'R/NR', 'Tipo Actividad RCE (Glosario)', 'Sub-Actividad RCE (Glosario)',
               'Clave RCE (Tipo|Sub)', 'REM', 'RPE', 'Estado homologación', 'Meta 1° Sem', 'Meta 2° Sem', 'Meta Año 2026'])
cat_agg = {}
for r in rows:
    ck = (str(r[2]), r[3])
    c = cat_agg.setdefault(ck, [r[2], r[3], r[4], r[11], r[12], r[13], r[14], r[15], r[16], 0.0, 0.0, 0.0])
    c[9] += r[8]; c[10] += r[9]; c[11] += r[10]
for _, c in sorted(cat_agg.items(), key=lambda kv: (kv[0][0].zfill(8), kv[0][1])):
    ws_cat.append(c)
for c in ws_cat[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill; c.alignment = Alignment(wrap_text=True)
for i, w in enumerate([12, 54, 6, 28, 36, 52, 7, 8, 24, 13, 13, 13], 1):
    ws_cat.column_dimensions[get_column_letter(i)].width = w
for row in ws_cat.iter_rows(min_row=2):
    row[8].fill = PatternFill('solid', fgColor=fills.get(row[8].value, 'FFFFFF'))
ws_cat.freeze_panes = 'C2'; ws_cat.auto_filter.ref = ws_cat.dimensions

# Hoja Comparación por especialidad x clave (evita doble conteo de ejecutadas)
cmp = collections.OrderedDict()
for r in rows:
    if r[16] != 'Homologada':
        continue
    k = (r[0], r[1], r[13], r[11], r[12])
    c = cmp.setdefault(k, [0, 0, 0, r[17], r[18]])
    c[0] += r[8]; c[1] += r[9]; c[2] += r[10]
ws2 = wb.create_sheet('Comparación Esp x Clave')
ws2.append(['Especialidad (planilla)', 'Especialidad RCE', 'Tipo Actividad RCE', 'Sub-Actividad RCE', 'Meta 1° Sem', 'Meta 2° Sem', 'Meta año 2026',
            'Ejecutadas RCE 2026', 'NSP RCE 2026 (complementario)', '% Cumplimiento', 'Brecha'])
for i, (k, v) in enumerate(sorted(cmp.items()), start=2):
    ws2.append([k[0], k[1], k[3], k[4], v[0], v[1], v[2], v[3], v[4], f'=IF(G{i}>0,H{i}/G{i},"")', f'=H{i}-G{i}'])
for c in ws2[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill; c.alignment = Alignment(wrap_text=True)
for i, w in enumerate([34, 30, 28, 36, 11, 11, 12, 13, 14, 12, 10], 1):
    ws2.column_dimensions[get_column_letter(i)].width = w
for row in ws2.iter_rows(min_row=2):
    row[9].number_format = '0.0%'
ws2.freeze_panes = 'C2'; ws2.auto_filter.ref = ws2.dimensions

# Hoja mapeo especialidades
ws3 = wb.create_sheet('Mapeo Especialidades')
ws3.append(['Especialidad planilla', 'Especialidad RCE (editable)', 'Tipo de coincidencia', 'Atenciones RCE 2026'])
for e in esp_prog:
    n, t = esp_map[e]
    ws3.append([e, n, t, rce_esp.get(n, 0)])
for c in ws3[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill
for i, w in enumerate([40, 40, 22, 16], 1):
    ws3.column_dimensions[get_column_letter(i)].width = w
ws3.freeze_panes = 'A2'

# Hoja claves RCE observadas
ws4 = wb.create_sheet('Claves RCE observadas')
ws4.append(['Clave Tipo|Sub (RCE 2026)', 'Ejecutadas 2026', 'En Glosario Médico'])
glo_keys = {r[13] for r in rows if r[13]}
for k, n in pairs.most_common():
    ws4.append([k, n, 'Sí' if k in glo_keys else 'NO – revisar'])
for c in ws4[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill
for i, w in enumerate([70, 16, 16], 1):
    ws4.column_dimensions[get_column_letter(i)].width = w

# Resumen
cnt = collections.Counter(r[16] for r in rows)
meta_h = sum(r[10] for r in rows if r[16] == 'Homologada')
ejec_h = sum(v[3] for v in cmp.values())
nsp_h = sum(v[4] for v in cmp.values())
ws5 = wb.create_sheet('Resumen', 0)
ws5.append(['Fuente / criterio', 'Detalle'])
for l in [
    ('1° semestre', 'Reprogramación 19-03-2026 (2).xlsx · columna Producción 1 Sem'),
    ('2° semestre', 'Programacion.RRHH.230626.xlsx · columna Producción 2 Sem'),
    ('Meta año 2026', 'Suma de ambos semestres (Prod. 1° Sem + Prod. 2° Sem)'),
    ('Producción', f"RCE especialistas, solo 2026, estado EJECUTADA (NSP complementario). Corte RCE actual: {rce.get('lastUpdated')}"),
    ('Pares Especialidad x Actividad', len(rows)),
    ('Meta año total (todas las actividades)', round(sum(r[10] for r in rows))),
    ('Meta año homologada en RCE (1° Sem + 2° Sem)', round(meta_h)),
    ('Ejecutadas RCE 2026 en claves homologadas', ejec_h),
    ('NSP RCE 2026 en claves homologadas (complementario)', nsp_h),
]:
    ws5.append(list(l))
ws5.append([]); ws5.append(['Estado homologación', 'N° pares Esp x Act', 'Meta 1° Sem', 'Meta 2° Sem', 'Meta Año 2026'])
for k, v in cnt.items():
    m1 = round(sum(r[8] for r in rows if r[16] == k))
    m2 = round(sum(r[9] for r in rows if r[16] == k))
    ws5.append([k, v, m1, m2, m1 + m2])
for c in ws5[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = hfill
ws5.column_dimensions['A'].width = 44; ws5.column_dimensions['B'].width = 75
for col in ('C', 'D', 'E'):
    ws5.column_dimensions[col].width = 16

wb.save(OUT)
print('OK ->', OUT)
print(dict(cnt), '| S1 total', round(sum(r[8] for r in rows)), '| S2 total', round(sum(r[9] for r in rows)),
      '| Meta Homologada:', round(meta_h), '| Ejecutadas Homologadas:', ejec_h)
