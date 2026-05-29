import { useState, useEffect, createContext, useContext, useCallback } from 'react'

// Contexto global para toasts
const ToastContext = createContext(null)

let _addToast = null

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => { _addToast = addToast }, [addToast])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        .toast-item {
          padding: 12px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          animation: slideIn .2s ease;
          min-width: 240px;
        }
        .toast-item.success { background: rgba(52,211,153,.15); border: 1px solid rgba(52,211,153,.3); color: var(--success); }
        .toast-item.error   { background: rgba(248,113,113,.15); border: 1px solid rgba(248,113,113,.3); color: var(--danger); }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </ToastContext.Provider>
  )
}

// Hook para usar toasts desde cualquier componente
export function useToast() {
  const ctx = useContext(ToastContext)
  return {
    success: (msg) => ctx?.(msg, 'success') || _addToast?.(msg, 'success'),
    error:   (msg) => ctx?.(msg, 'error')   || _addToast?.(msg, 'error'),
  }
}

// Componente vacío (los toasts se renderizan en ToastProvider)
export default function Toast() { return null }
