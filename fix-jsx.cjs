const fs = require('fs');
let lines = fs.readFileSync('src/components/ActividadesMedicinaDashboard.jsx', 'utf8').split('\n');

// After line 1024 (index 1023: '      )}') the file has orphaned old NSP JSX
// The correct structure should be:
//   line 1024 (idx 1023): '      )}'  <- closes resumen tab
//   line 1025 (idx 1024): ''
//   NEW: {/* Indicadores de Gestión */} tab
//   ...
//   '    </div>'
//   '  );'
//   '}'
// The orphan runs from idx 1025 to idx 1148 (')}'  '}' '}')
// We need to remove lines 1026-1152 and insert the new Indicadores tab

// Find the resumen tab close at index 1023
console.log('Line 1024 (idx 1023):', lines[1023]);
console.log('Line 1025 (idx 1024):', lines[1024]);
console.log('Line 1026 (idx 1025):', lines[1025]);

// The correct ending: after the resumen ')}'  (idx 1023) and blank (idx 1024),
// we remove everything from idx 1025 onward and replace with the Indicadores tab + closing

const indicadoresTab = `
      {/* Tab: Indicadores de Gestión */}
      {activeTab === 'indicadores' && (() => {
        const indicators = [
          {
            key: 'nsp',
            title: '% No Se Presentó (NSP)',
            shortTitle: '% NSP',
            icon: XCircle,
            color: '#ef4444',
            colorBg: '#fef2f2',
            borderColor: '#fca5a5',
            definition: 'Porcentaje de pacientes citados que no asistieron a su consulta médica de especialidad en el período evaluado.',
            formula: 'N° NSP / Total Citados × 100',
            value: \`\${indicadoresData.nsp.pct}%\`,
            sub: \`\${indicadoresData.nsp.n.toLocaleString('es-CL')} NSP de \${indicadoresData.nsp.total.toLocaleString('es-CL')} citas\`,
            trend: indicadoresData.nsp.trend,
            metaLabel: 'Umbral crítico: 20%',
            isGood: (v) => v < 20
          },
          {
            key: 'pertinencia',
            title: '% Pertinencia de Consulta',
            shortTitle: '% Pertinencia',
            icon: CheckCircle2,
            color: '#10b981',
            colorBg: '#f0fdf4',
            borderColor: '#6ee7b7',
            definition: 'Porcentaje de consultas evaluadas en las que el profesional confirmó que la derivación fue pertinente (campo Pertinencia = S).',
            formula: 'N° Pertinentes (S) / Total Evaluados × 100',
            value: \`\${indicadoresData.pertinencia.pct}%\`,
            sub: \`\${indicadoresData.pertinencia.n.toLocaleString('es-CL')} pertinentes de \${indicadoresData.pertinencia.total.toLocaleString('es-CL')} evaluados\`,
            trend: indicadoresData.pertinencia.trend,
            metaLabel: 'Meta: ≥ 80%',
            isGood: (v) => v >= 80
          }
        ];

        const active = indicators.find(i => i.key === selectedIndicator) || indicators[0];
        const ActiveIcon = active.icon;
        const trendData = active.trend;
        const lastVal = trendData.length ? trendData[trendData.length - 1].value : 0;
        const good = active.isGood(lastVal);
        const maxVal = trendData.length ? Math.max(...trendData.map(d => d.value)) : 0;
        const minVal = trendData.length ? Math.min(...trendData.map(d => d.value)) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={22} color="#6366f1" />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e293b' }}>Indicadores de Gestión Clínica</h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Haz clic en un indicador para ver su evolución mensual · Datos desde Ene 2025</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'stretch' }}>

              {/* LEFT: Indicator cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {indicators.map(ind => {
                  const IndIcon = ind.icon;
                  const isActive = ind.key === selectedIndicator;
                  const indLastVal = ind.trend.length ? ind.trend[ind.trend.length - 1].value : 0;
                  const indGood = ind.isGood(indLastVal);
                  return (
                    <div
                      key={ind.key}
                      onClick={() => setSelectedIndicator(ind.key)}
                      style={{
                        background: isActive ? ind.colorBg : '#ffffff',
                        border: isActive ? \`2.5px solid \${ind.color}\` : '1.5px solid #e2e8f0',
                        borderLeft: \`5px solid \${ind.color}\`,
                        borderRadius: 16,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? \`0 8px 24px \${ind.color}22\` : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ background: isActive ? ind.color : '#f1f5f9', color: isActive ? 'white' : '#64748b', width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IndIcon size={15} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isActive ? '#1e293b' : '#475569' }}>{ind.shortTitle}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: indGood ? '#dcfce7' : '#fef2f2', color: indGood ? '#15803d' : '#dc2626' }}>
                          {indGood ? '✅ OK' : '⚠️ Alerta'}
                        </span>
                      </div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: ind.color, lineHeight: 1, marginBottom: 4 }}>{ind.value}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 10 }}>{ind.sub}</div>
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Definición</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4, marginBottom: 8 }}>{ind.definition}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Fórmula:</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: ind.color, fontStyle: 'italic' }}>{ind.formula}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>{ind.metaLabel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Chart panel */}
              <div style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: \`1.5px solid \${active.borderColor}\`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ background: active.color, color: 'white', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ActiveIcon size={16} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Evolución Mensual: {active.shortTitle}</h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{active.formula} · {active.metaLabel}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: active.color }}>{active.value}</div>
                    <div style={{ fontSize: '0.72rem', color: good ? '#15803d' : '#dc2626', fontWeight: 700 }}>
                      {good ? '✅ Dentro del umbral' : '⚠️ Fuera del umbral'}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData} margin={{ top: 14, right: 20, left: 0, bottom: 40 }} barCategoryGap="8%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" height={55} interval={0} />
                      <YAxis tickFormatter={v => \`\${v}%\`} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                      <Tooltip
                        formatter={(v) => [\`\${v}%\`, active.shortTitle]}
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: \`1px solid \${active.color}44\`, borderRadius: 12, color: 'white', fontSize: '0.82rem' }}
                        cursor={{ fill: \`\${active.color}11\` }}
                      />
                      <Bar dataKey="value" name={active.shortTitle} fill={active.colorBg} stroke={active.color} strokeWidth={2} radius={[5,5,0,0]}>
                        <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: active.color, fontWeight: 700 }} formatter={v => \`\${v}%\`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  {[
                    { label: 'Valor Actual', val: active.value, color: active.color },
                    { label: 'Máximo registrado', val: \`\${maxVal}%\`, color: '#f59e0b' },
                    { label: 'Mínimo registrado', val: \`\${minVal}%\`, color: '#6366f1' }
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 8px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
`;

// Truncate at line 1025 (index 1024) and append new content
lines = lines.slice(0, 1025);
lines.push(indicadoresTab);

fs.writeFileSync('src/components/ActividadesMedicinaDashboard.jsx', lines.join('\n'), 'utf8');
console.log('Done. Total lines:', lines.join('\n').split('\n').length);

// Verify
const finalContent = fs.readFileSync('src/components/ActividadesMedicinaDashboard.jsx', 'utf8');
console.log('Has indicadores tab:', finalContent.includes("activeTab === 'indicadores'"));
console.log('Has selectedIndicator:', finalContent.includes('selectedIndicator'));
console.log('Has indicadoresData:', finalContent.includes('indicadoresData'));
