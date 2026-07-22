import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { allSeeds } from '../data/seedData';

// ============================================================
// useEntity — Hook genérico CRUD com API backend (Supabase)
// ============================================================

const STORAGE_PREFIX = 'portocais_';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const useApi = true; // Sempre usar a API (backend unificado com Supabase)

function dispatchEntityUpdate(entityName) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('entity-updated', { detail: entityName }));
  }
}

function getStorageKey(entityName) {
  return `${STORAGE_PREFIX}${entityName}`;
}

function buildApiUrl(entityName, id) {
  return `${API_BASE_URL}/api/${entityName}${id ? `/${id}` : ''}`;
}

async function fetchApi(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeStoredData(raw) {
  if (typeof raw !== 'string') return raw;
  if (!raw.includes('2025')) return raw;

  return raw.replace(/2025/g, '2026');
}

function loadFromStorage(entityName) {
  const key = getStorageKey(entityName);
  const stored = localStorage.getItem(key);
  if (stored) {
    const normalized = normalizeStoredData(stored);
    try {
      const parsed = JSON.parse(normalized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn(`Failed to parse localStorage for ${entityName}`, e);
      return [];
    }
  }
  // Initialize with seed data if available
  const seed = allSeeds[entityName];
  if (seed) {
    localStorage.setItem(key, JSON.stringify(seed));
    return [...seed];
  }
  return [];
}

function saveToStorage(entityName, data) {
  localStorage.setItem(getStorageKey(entityName), JSON.stringify(data));
}

function appendLogEntry(entityName, action, user) {
  if (entityName === 'logsSistema' || typeof window === 'undefined') return;

  const now = new Date().toISOString();
  const details = `${user?.nome || user?.email || 'Sistema'} realizou ${action} em ${entityName}.`;
  const logEntry = {
    id: Date.now(),
    tipo: 'Sistema',
    mensagem: `${action} ${entityName}`,
    detalhe: details,
    usuario: user?.nome || user?.email || 'Sistema',
    data: now,
  };

  const storageKey = getStorageKey('logsSistema');
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const updated = [...existing, logEntry];
  localStorage.setItem(storageKey, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('entity-updated', { detail: 'logsSistema' }));
}

export function useEntity(entityName) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!useApi) {
      setItems(loadFromStorage(entityName));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchApi(buildApiUrl(entityName))
      .then((data) => {
        setItems(data || []);
      })
      .catch(() => {
        setItems(loadFromStorage(entityName));
      })
      .finally(() => setLoading(false));
  }, [entityName]);

  useEffect(() => {
    const handleEntityUpdated = (event) => {
      if (event?.detail === entityName) {
        if (useApi) {
          fetchApi(buildApiUrl(entityName))
            .then((data) => setItems(data || []))
            .catch(() => setItems(loadFromStorage(entityName)));
          return;
        }
        setItems(loadFromStorage(entityName));
      }
    };
    window.addEventListener('entity-updated', handleEntityUpdated);
    return () => window.removeEventListener('entity-updated', handleEntityUpdated);
  }, [entityName]);

  const refresh = useCallback(async () => {
    if (useApi) {
      const data = await fetchApi(buildApiUrl(entityName));
      setItems(data || []);
      return;
    }

    setItems(loadFromStorage(entityName));
  }, [entityName]);

  const getAll = useCallback(async () => {
    if (useApi) {
      return await fetchApi(buildApiUrl(entityName));
    }
    return loadFromStorage(entityName);
  }, [entityName]);

  const getById = useCallback(async (id) => {
    if (useApi) {
      return await fetchApi(buildApiUrl(entityName, id));
    }
    const data = loadFromStorage(entityName);
    return data.find(item => item.id === id) || null;
  }, [entityName]);

  const create = useCallback(async (newItem) => {
    if (useApi) {
      const created = await fetchApi(buildApiUrl(entityName), {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      setItems((prev) => [...prev, created]);
      dispatchEntityUpdate(entityName);
      appendLogEntry(entityName, 'criar', user);
      return created;
    }

    const data = loadFromStorage(entityName);
    const maxId = data.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const item = { ...newItem, id: maxId + 1 };
    const updated = [...data, item];
    saveToStorage(entityName, updated);
    setItems(updated);
    dispatchEntityUpdate(entityName);
    appendLogEntry(entityName, 'criar', user);
    return item;
  }, [entityName, user]);

  const update = useCallback(async (id, updates) => {
    if (useApi) {
      const updatedItem = await fetchApi(buildApiUrl(entityName, id), {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
      dispatchEntityUpdate(entityName);
      appendLogEntry(entityName, 'editar', user);
      return updatedItem;
    }

    const data = loadFromStorage(entityName);
    const updated = data.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveToStorage(entityName, updated);
    setItems(updated);
    dispatchEntityUpdate(entityName);
    appendLogEntry(entityName, 'editar', user);
    return updated.find(item => item.id === id);
  }, [entityName, user]);

  const remove = useCallback(async (id) => {
    if (useApi) {
      await fetchApi(buildApiUrl(entityName, id), {
        method: 'DELETE',
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
      dispatchEntityUpdate(entityName);
      appendLogEntry(entityName, 'remover', user);
      return;
    }

    const data = loadFromStorage(entityName);
    const updated = data.filter(item => item.id !== id);
    saveToStorage(entityName, updated);
    setItems(updated);
    dispatchEntityUpdate(entityName);
    appendLogEntry(entityName, 'remover', user);
  }, [entityName, user]);

  const clear = useCallback(() => {
    saveToStorage(entityName, []);
    setItems([]);
    dispatchEntityUpdate(entityName);
  }, [entityName]);

  const filter = useCallback((predicate) => {
    const data = loadFromStorage(entityName);
    return data.filter(predicate);
  }, [entityName]);

  const count = useCallback((predicate) => {
    const data = loadFromStorage(entityName);
    return predicate ? data.filter(predicate).length : data.length;
  }, [entityName]);

  return {
    items,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
    clear,
    filter,
    count,
    refresh,
  };
}
