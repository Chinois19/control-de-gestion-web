import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Search, Download, Calendar, Filter } from 'lucide-react';

const repositoryData = [
  {
    year: '2026',
    categories: [
      {
        name: 'Metas Sanitarias',
        files: [
          { name: 'Protocolo Metas Sanitarias 2026.pdf', size: '1.2 MB', date: '15 May 2026' },
          { name: 'Seguimiento Trimestre 1.xlsx', size: '4.5 MB', date: '10 Apr 2026' }
        ]
      },
      {
        name: 'Programación Anual',
        files: [
          { name: 'Programación Quirúrgica Final.pdf', size: '2.1 MB', date: '01 Mar 2026' },
          { name: 'Anexo Técnico Red.pdf', size: '800 KB', date: '20 Feb 2026' }
        ]
      },
      {
        name: 'Actas de Comité',
        files: [
          { name: 'Acta CCF - Sesión 04.pdf', size: '1.1 MB', date: '12 May 2026' },
          { name: 'Acuerdos Dirección Regional.pdf', size: '1.5 MB', date: '05 May 2026' }
        ]
      }
    ]
  },
  {
    year: '2025',
    categories: [
      {
        name: 'Histórico Gestión',
        files: [
          { name: 'Cierre Anual 2025.pdf', size: '3.2 MB', date: '10 Jan 2026' }
        ]
      }
    ]
  }
];

export default function DocumentRepository({ onBack }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.div 
      className="repository-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className="repo-header">
        <h2>Repositorio Documental Inteligente</h2>
        <p>Acceso centralizado a la normativa, protocolos y actas oficiales.</p>
      </header>

      <div className="repo-controls glass-card">
        <div className="search-box">
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Buscar documentos por nombre o categoría..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="year-selector">
          <Calendar size={20} color="var(--text-secondary)" />
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2026">Año 2026</option>
            <option value="2025">Año 2025</option>
          </select>
        </div>
      </div>

      <div className="repo-grid">
        {repositoryData.find(d => d.year === selectedYear)?.categories.map((cat, i) => (
          <div key={cat.name} className="repo-category">
            <div className="category-header">
              <Folder size={24} color="var(--accent-teal)" />
              <h3>{cat.name}</h3>
              <span className="file-count">{cat.files.length} archivos</span>
            </div>
            <div className="file-list">
              {cat.files.map(file => (
                <div key={file.name} className="file-item glass-card">
                  <div className="file-icon">
                    <FileText size={20} />
                  </div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>{file.date} • {file.size}</p>
                  </div>
                  <button className="download-btn">
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .repo-header { margin-bottom: 40px; }
        .repo-header h2 { font-size: 2.5rem; margin-bottom: 8px; }
        .repo-header p { color: var(--text-secondary); font-size: 1.1rem; }
        
        .repo-controls {
          display: flex;
          gap: 20px;
          padding: 16px 24px;
          margin-bottom: 40px;
          align-items: center;
        }
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0,0,0,0.03);
          padding: 12px 16px;
          border-radius: 12px;
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          width: 100%;
        }
        .year-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .year-selector select {
          border: none;
          outline: none;
          font-family: inherit;
          font-weight: 600;
        }

        .repo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
        }
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--accent-teal);
        }
        .category-header h3 { font-size: 1.3rem; flex: 1; }
        .file-count { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }

        .file-list { display: flex; flex-direction: column; gap: 12px; }
        .file-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
        }
        .file-icon {
          width: 40px;
          height: 40px;
          background: rgba(0,0,0,0.03);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        .file-info { flex: 1; }
        .file-info h4 { font-size: 0.95rem; margin-bottom: 4px; }
        .file-info p { font-size: 0.8rem; color: var(--text-secondary); }
        .download-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .download-btn:hover {
          background: var(--bg-primary);
          color: var(--accent-teal);
        }
      `}</style>
    </motion.div>
  );
}
