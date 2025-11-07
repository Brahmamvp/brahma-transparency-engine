// src/hooks/useWisdomMemory.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveAuditLog } from '../kernel/memoryKernel.js'; // FIX: Named import; ensure kernel export exists

// 🧠 Wisdom Memory Constants
const WISDOM_KEY = 'brahma.wisdom.memory.v1';
const MAX_MEMORIES = 100; // Cap for performance (slice oldest)

// Initial State
const initialState = {
  memories: [], // Array of { id, category, content, decisionId, timestamp, tags: [] }
  isLoading: false,
  error: null,
};

// Context
const WisdomMemoryContext = createContext(initialState);

// Reducer for memory ops (insert, update, delete, search)
const memoryReducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, memories: action.payload, isLoading: false, error: null };
    case 'INSERT':
      const newMemories = [action.payload, ...state.memories].slice(0, MAX_MEMORIES);
      return { ...state, memories: newMemories };
    case 'UPDATE':
      return {
        ...state,
        memories: state.memories.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case 'DELETE':
      return {
        ...state,
        memories: state.memories.filter((m) => m.id !== action.payload.id),
      };
    case 'SEARCH':
      return {
        ...state,
        memories: action.payload, // Filtered results
      };
    case 'LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

// Helper: Generate ID (simple UUID-like)
const generateId = () => `wisdom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper: Safe JSON ops
const safeJSON = {
  parse: (str, fallback = initialState.memories) => {
    try { return JSON.parse(str) || fallback; } catch { return fallback; }
  },
  stringify: (data) => {
    try { return JSON.stringify(data); } catch (e) { console.error('JSON stringify failed:', e); return '{}'; }
  },
};

/**
 * Wisdom Memory Provider - Relational storage for emotional/intel growth
 * @param {object} props - Children
 * @returns {JSX.Element}
 */
export const WisdomMemoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(memoryReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const hydrate = async () => {
      dispatch({ type: 'LOADING', payload: true });
      try {
        const stored = safeJSON.parse(localStorage.getItem(WISDOM_KEY));
        dispatch({ type: 'HYDRATE', payload: stored });
        // Audit hydration
        if (typeof saveAuditLog === 'function') {
          saveAuditLog('wisdom_hydrate', { count: stored.length });
        }
      } catch (error) {
        dispatch({ type: 'ERROR', payload: error.message });
      }
    };
    hydrate();
  }, []);

  // Persist on change (debounced, but here on every insert/update for simplicity)
  useEffect(() => {
    if (state.memories.length > 0) {
      localStorage.setItem(WISDOM_KEY, safeJSON.stringify(state.memories));
      // Log to kernel
      if (typeof saveAuditLog === 'function') {
        saveAuditLog({ category: 'wisdom_persist', count: state.memories.length });
      }
    }
  }, [state.memories]);

  // Actions
  const actions = {
    insert: (entry) => {
      const payload = {
        ...entry,
        id: entry.id || generateId(),
        timestamp: entry.timestamp || new Date().toISOString(),
      };
      dispatch({ type: 'INSERT', payload });
      // Log to kernel (FIX: Optional chaining for safety)
      saveAuditLog?.(payload);
      console.log(`[WisdomMemory] Inserted: ${payload.category} for Decision ID: ${payload.decisionId || 'N/A'}`);
    },

    update: (id, updates) => {
      dispatch({ type: 'UPDATE', payload: { id, ...updates } });
      saveAuditLog?.({ action: 'wisdom_update', id, changes: Object.keys(updates) });
    },

    delete: (id) => {
      dispatch({ type: 'DELETE', payload: { id } });
      saveAuditLog?.({ action: 'wisdom_delete', id });
    },

    search: (query) => {
      const results = state.memories.filter((m) => {
        const q = query.toLowerCase();
        return m.content.toLowerCase().includes(q) ||
               m.category.toLowerCase().includes(q) ||
               (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)));
      });
      dispatch({ type: 'SEARCH', payload: results });
      return results;
    },

    clear: () => {
      dispatch({ type: 'HYDRATE', payload: [] });
      localStorage.removeItem(WISDOM_KEY);
      saveAuditLog?.('wisdom_clear_all');
    },
  };

  return (
    <WisdomMemoryContext.Provider value={{ ...state, ...actions }}>
      {children}
    </WisdomMemoryContext.Provider>
  );
};

/**
 * Custom Hook - Use Wisdom Memory
 * @returns {object} - state and actions
 */
export const useWisdomMemory = () => {
  const context = useContext(WisdomMemoryContext);
  if (!context) {
    throw new Error('useWisdomMemory must be used within WisdomMemoryProvider');
  }
  return context;
};

// Example Usage in Components (e.g., Orchestrator integration)
// In llmContext: wisdomMemory: useWisdomMemory().memories
// On insert: useWisdomMemory().insert({ category: 'growth', content: 'Insight...', decisionId: '123' });

export default useWisdomMemory;
