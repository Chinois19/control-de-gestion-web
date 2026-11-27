import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const normSearch = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function MultiSelectSearch({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Todas...',
  searchPlaceholder = 'Buscar...',
  minWidth = '240px',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else if (!open) {
      setQuery('');
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = normSearch(query).trim();
    if (!q) return options;
    const tokens = q.split(/\s+/).filter(Boolean);
    return options.filter((o) => {
      const lbl = normSearch(o.label);
      return tokens.every((t) => lbl.includes(t));
    });
  }, [options, query]);

  const toggleValue = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectedOptions = options.filter((o) => selectedValues.includes(o.value));

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth, width: '100%' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          minHeight: '34px',
          padding: '4px 10px',
          borderRadius: '8px',
          border: open ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, alignItems: 'center' }}>
          {selectedOptions.length === 0 ? (
            <span style={{ color: '#64748b', fontWeight: 600 }}>{placeholder}</span>
          ) : selectedOptions.length <= 2 ? (
            selectedOptions.map((o) => (
              <span
                key={o.value}
                onClick={(e) => { e.stopPropagation(); toggleValue(o.value); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: '#eef2ff', color: '#4338ca', padding: '2px 7px',
                  borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem', maxWidth: '180px',
                }}
                title={o.label}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                <X size={11} style={{ flexShrink: 0 }} />
              </span>
            ))
          ) : (
            <span style={{
              background: '#eef2ff', color: '#4338ca', padding: '2px 8px',
              borderRadius: '6px', fontWeight: 700, fontSize: '0.71rem',
            }}>
              {selectedOptions.length} seleccionadas
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              title="Limpiar selección"
              style={{
                border: 'none', background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={15} style={{ color: '#64748b', transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
        </div>
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          minWidth: '300px',
          background: 'white',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          boxShadow: '0 14px 32px rgba(15,23,42,0.16)',
          zIndex: 60,
          overflow: 'hidden',
        }}>
          {/* Buscador interno */}
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  padding: '6px 26px 6px 30px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.76rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'white',
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{
                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Lista con checkboxes */}
          <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '4px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                Sin coincidencias
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleValue(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      background: checked ? '#eef2ff' : 'transparent',
                      color: checked ? '#312e81' : '#1e293b',
                      fontWeight: checked ? 700 : 500,
                    }}
                  >
                    <span style={{
                      width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                      border: checked ? '1.5px solid #4f46e5' : '1.5px solid #cbd5e1',
                      background: checked ? '#4f46e5' : 'white',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <Check size={11} color="white" strokeWidth={3} />}
                    </span>
                    <span style={{ lineHeight: 1.35 }}>{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
