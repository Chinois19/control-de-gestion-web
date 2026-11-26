# -*- coding: utf-8 -*-
"""
Corrige y actualiza Glosario.xlsx (hoja 'Glosa') con las definiciones validadas en RCE 2026:
  1. Corrige el typo 'SALUD MENTAL ESPECIALDIAD/ENLACE' -> 'SALUD MENTAL ESPECIALIDAD/ENLACE' (#59, #17, #126).
  2. Agrega fila médica para #11 'Consultoría en salud presencial' -> CONSULTORIAS DE MEDICOS ESPECIALISTAS OTORGADAS | CONSULTORIA.
  3. Agrega fila médica para #14 'Gestión de Casos' -> SALUD MENTAL ESPECIALIDAD/ENLACE | GESTION DE CASOS.
  4. Agrega fila de referencia para 'Ingreso Salud Mental (Uni / Multi / Dos Profesional)' -> SALUD MENTAL ESPECIALIDAD | CONSULTA NUEVA SALUD MENTAL (INGRESO)*.
"""
import warnings
from pathlib import Path
import openpyxl

warnings.filterwarnings('ignore')
F_GLO = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'Programación Hospital de Villarrica 2026' / 'Glosario.xlsx'

wb = openpyxl.load_workbook(F_GLO)
ws = wb['Glosa']

# 1. Corregir typo SALUD MENTAL ESPECIALDIAD/ENLACE -> SALUD MENTAL ESPECIALIDAD/ENLACE
fixed_typos = 0
for r in range(2, ws.max_row + 1):
    for c in (6, 7, 8):
        v = ws.cell(r, c).value
        if isinstance(v, str) and 'ESPECIALDIAD' in v:
            ws.cell(r, c).value = v.replace('ESPECIALDIAD', 'ESPECIALIDAD')
            fixed_typos += 1

# Verificar si ya existen las filas que vamos a agregar para no duplicar en re-ejecuciones
existing_keys = set()
for r in range(2, ws.max_row + 1):
    existing_keys.add((str(ws.cell(r, 2).value or '').strip(), str(ws.cell(r, 4).value or '').strip(), str(ws.cell(r, 5).value or '').strip()))

to_add = [
    (
        'Consultoría en salud presencial',
        'Médico',
        '',
        11,
        'Consultoría en salud presencial',
        'CONSULTORIAS DE MEDICOS ESPECIALISTAS OTORGADAS',
        None,
        'CONSULTORIA',
        'N/A',
        'Consultoría otorgada por médico especialista (incluye presencial y/o en red) registrada en RCE bajo CONSULTORIAS DE MEDICOS ESPECIALISTAS OTORGADAS | CONSULTORIA.',
        'N°11'
    ),
    (
        'Gestión de Casos',
        'Médico',
        '',
        14,
        'Gestión de Casos',
        'SALUD MENTAL ESPECIALIDAD/ENLACE',
        None,
        'GESTION DE CASOS',
        '6',
        'Seguimiento y coordinación de casos clínicos complejos; en RCE Especialistas se registra en SALUD MENTAL ESPECIALIDAD/ENLACE | GESTION DE CASOS.',
        'N°11'
    ),
    (
        'Consulta Ingreso Salud Mental (RCE)',
        'Psiquiatra',
        '1.3',
        '',
        'Consulta Ingreso Salud Mental (RCE)',
        'SALUD MENTAL ESPECIALIDAD',
        None,
        'CONSULTA NUEVA SALUD MENTAL (INGRESO)',
        '6',
        'Todo registro en RCE bajo SALUD MENTAL ESPECIALIDAD cuya subactividad contenga (INGRESO) — Uniprofesional, Multiprofesional o Dos Profesional — cuenta como Ingreso de Salud Mental (distinto de Consulta Nueva de especialidad presencial).',
        'N°11'
    ),
]

added = 0
for row_vals in to_add:
    key = (str(row_vals[1]).strip(), str(row_vals[3]).strip(), str(row_vals[4]).strip())
    if key not in existing_keys:
        ws.append(list(row_vals))
        added += 1

wb.save(F_GLO)
print(f'Glosario.xlsx actualizado: {fixed_typos} typos corregidos, {added} filas médicas agregadas.')
