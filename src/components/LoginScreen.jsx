import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Shield, AlertCircle, LogIn, Activity } from 'lucide-react';

// ─── DEFAULT USERS (stored/augmented in localStorage) ───────────────────────
// Passwords are stored as SHA-256 hex strings for basic obfuscation.
// For a production environment, use a backend with bcrypt.
const DEFAULT_USERS = [
  {
    username: 'admin',
    // Password: admin
    passwordHash: '52fdbb5244d8af87bee2718bb1b6e412e5652e78a8f6ad7aded254d027b6a734',
    role: 'admin',
    name: 'Administrador',
    department: 'Control de Gestión'
  },
  {
    username: 'gestion',
    // Password: gestion
    passwordHash: 'beee2f1944cc8b998fe1c2a86b414bf2894669d285adb4899b0f59c617dd707c',
    role: 'user',
    name: 'Usuario Gestión',
    department: 'Control de Gestión'
  }
];

const STORAGE_KEY = 'cgv_users';
const SESSION_KEY = 'cgv_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// ─── SIMPLE HASH FUNCTION (SHA-256 via Web Crypto API) ──────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cgv-salt-2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── USER STORAGE ────────────────────────────────────────────────────────────
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let changed = false;
      const updated = parsed.map(user => {
        const defaultUser = DEFAULT_USERS.find(d => d.username === user.username);
        if (defaultUser && user.passwordHash !== defaultUser.passwordHash) {
          changed = true;
          return { ...user, passwordHash: defaultUser.passwordHash };
        }
        return user;
      });

      // Asegurar que existan todos los usuarios por defecto
      DEFAULT_USERS.forEach(defaultUser => {
        if (!updated.some(u => u.username === defaultUser.username)) {
          updated.push(defaultUser);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    }
  } catch (_) { /* ignore */ }
  // Seed defaults on first run
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// ─── SESSION MANAGEMENT ──────────────────────────────────────────────────────
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch (_) {
    return null;
  }
}

export function createSession(user) {
  const session = {
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
    loginAt: Date.now(),
    expiresAt: Date.now() + SESSION_TIMEOUT_MS
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function destroySession() {
  localStorage.removeItem(SESSION_KEY);
}

export function refreshSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    session.expiresAt = Date.now() + SESSION_TIMEOUT_MS;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) { /* ignore */ }
}

// ─── LOGIN SCREEN COMPONENT ──────────────────────────────────────────────────
export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setError('');
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockedUntil) return;

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Artificial delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 600));

      const hash = await hashPassword(password);
      const users = getStoredUsers();
      const user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.passwordHash === hash
      );

      if (user) {
        const session = createSession(user);
        setAttempts(0);
        onLogin(session);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          const lockTime = Date.now() + 5 * 60 * 1000; // 5 minute lockout
          setLockedUntil(lockTime);
          setError('Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.');
        } else {
          setError(`Credenciales incorrectas. Intento ${newAttempts} de 5.`);
        }
        setPassword('');
      }
    } catch (err) {
      setError('Error del sistema. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
            }}
          >
            <Activity size={32} color="white" />
          </motion.div>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.5px'
          }}>
            CG <span style={{ color: '#60a5fa' }}>Villarrica</span>
          </h1>
          <p style={{
            margin: '6px 0 0',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            Control de Gestión — Hospital de Villarrica
          </p>
        </div>

        {/* Security badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '20px', padding: '6px 14px', marginBottom: '28px'
        }}>
          <Shield size={13} color="#10b981" />
          <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            ACCESO RESTRINGIDO — INFORMACIÓN CONFIDENCIAL
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.3px' }}>
              USUARIO
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="rgba(255,255,255,0.3)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                disabled={isLocked || loading}
                autoComplete="username"
                autoCapitalize="none"
                placeholder="nombre.usuario"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.3px' }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="rgba(255,255,255,0.3)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                disabled={isLocked || loading}
                autoComplete="current-password"
                placeholder="••••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 40px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                disabled={isLocked}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', padding: '10px 12px'
                }}
              >
                <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <p style={{ margin: 0, color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>{error}</p>
                  {isLocked && (
                    <p style={{ margin: '4px 0 0', color: 'rgba(248,113,113,0.7)', fontSize: '0.75rem' }}>
                      Desbloqueo en {timeLeft}s
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLocked || loading || !username || !password}
            whileHover={!isLocked && !loading ? { scale: 1.02 } : {}}
            whileTap={!isLocked && !loading ? { scale: 0.98 } : {}}
            style={{
              marginTop: '4px',
              padding: '14px',
              background: isLocked
                ? 'rgba(100,116,139,0.3)'
                : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isLocked || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
              opacity: (!username || !password) ? 0.5 : 1,
              boxShadow: !isLocked ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                />
                Verificando...
              </>
            ) : isLocked ? (
              <>
                <Lock size={16} />
                Bloqueado ({timeLeft}s)
              </>
            ) : (
              <>
                <LogIn size={16} />
                Ingresar al Sistema
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.5px' }}>
            DEPARTAMENTO DE CONTROL DE GESTIÓN
          </p>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.12)', fontSize: '0.68rem' }}>
            Hospital de Villarrica • Acceso monitoreado y registrado
          </p>
        </div>
      </motion.div>
    </div>
  );
}
