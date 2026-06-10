import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Shield, User, Key, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getStoredUsers, saveUsers } from './LoginScreen';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cgv-salt-2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const ROLE_LABELS = {
  admin: { label: 'Administrador', color: '#6366f1', bg: '#ede9fe' },
  user: { label: 'Usuario', color: '#0ea5e9', bg: '#e0f2fe' }
};

export default function UserManagementPanel({ onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', department: '', password: '', role: 'user' });
  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsers(getStoredUsers());
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUser.username.trim() || !newUser.name.trim() || !newUser.password) {
      setFormError('Usuario, nombre y contraseña son obligatorios.');
      return;
    }
    if (newUser.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      setFormError('Ya existe un usuario con ese nombre.');
      return;
    }

    setSaving(true);
    try {
      const hash = await hashPassword(newUser.password);
      const updated = [...users, {
        username: newUser.username.trim(),
        name: newUser.name.trim(),
        department: newUser.department.trim() || 'Hospital de Villarrica',
        passwordHash: hash,
        role: newUser.role
      }];
      saveUsers(updated);
      setUsers(updated);
      setNewUser({ username: '', name: '', department: '', password: '', role: 'user' });
      setShowForm(false);
      setFormSuccess(`Usuario "${newUser.username}" creado exitosamente.`);
      setTimeout(() => setFormSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (username) => {
    if (username === currentUser.username) return; // Can't delete yourself
    if (!window.confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return;
    const updated = users.filter(u => u.username !== username);
    saveUsers(updated);
    setUsers(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(8px)', zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        style={{
          background: 'white', borderRadius: '20px', padding: '32px',
          width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: '#ede9fe', borderRadius: '12px' }}>
              <Shield size={20} color="#6366f1" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Gestión de Usuarios</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Administre el acceso al sistema</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#475569" />
          </button>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {formSuccess && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: '8px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
              <Check size={15} color="#059669" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, color: '#065f46', fontSize: '0.82rem', fontWeight: 600 }}>{formSuccess}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {users.map(u => {
            const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.user;
            const isSelf = u.username === currentUser.username;
            return (
              <div key={u.username} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: isSelf ? '#f0f9ff' : '#f8fafc',
                border: `1px solid ${isSelf ? '#bae6fd' : '#e2e8f0'}`,
                borderRadius: '12px', padding: '14px 16px'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${roleInfo.color}22, ${roleInfo.color}44)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={18} color={roleInfo.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{u.name}</span>
                    {isSelf && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '2px 7px', borderRadius: '10px' }}>TÚ</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{u.department}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  color: roleInfo.color, background: roleInfo.bg, flexShrink: 0
                }}>
                  {roleInfo.label}
                </span>
                {!isSelf && (
                  <button
                    onClick={() => handleDelete(u.username)}
                    style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 size={14} color="#dc2626" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add user form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '16px', overflow: 'hidden' }}
            >
              <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Nuevo Usuario</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { key: 'username', label: 'Usuario (login)', placeholder: 'j.perez', type: 'text' },
                  { key: 'name', label: 'Nombre completo', placeholder: 'Juan Pérez', type: 'text' },
                  { key: 'department', label: 'Departamento', placeholder: 'Control de Gestión', type: 'text' },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.key === 'department' ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={newUser[f.key]}
                      onChange={e => setNewUser(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                ))}
                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Contraseña (mín. 8 car.)</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '9px 36px 9px 32px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Rol</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none', background: 'white' }}
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div style={{ display: 'flex', gap: '7px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '9px 12px', marginTop: '12px' }}>
                  <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ margin: 0, color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>{formError}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Guardando...' : 'Crear Usuario'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Toggle add form */}
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFormError(''); }}
            style={{
              width: '100%', padding: '12px', background: 'none',
              border: '2px dashed #cbd5e1', borderRadius: '12px',
              color: '#64748b', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', transition: 'all 0.2s', fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Plus size={16} /> Agregar nuevo usuario
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
