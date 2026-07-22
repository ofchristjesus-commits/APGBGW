import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { supabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do frontend (React/Vite)
app.use(express.static(join(__dirname, '../frontend/dist')));


const entityToTable = {
  autorizacoesCredito: 'autorizacoes_credito',
  logsSistema: 'logs_sistema'
};

const getTableName = (entity) => entityToTable[entity] || entity;

const snakeToCamel = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
const camelToSnake = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const convertKeys = (obj, converter) => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, converter));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[converter(key)] = convertKeys(obj[key], converter);
      return acc;
    }, {});
  }
  return obj;
};

app.get('/api/:entity', async (req, res) => {
  const { data, error } = await supabase.from(getTableName(req.params.entity)).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(convertKeys(data, snakeToCamel));
});

app.get('/api/:entity/:id', async (req, res) => {
  const { data, error } = await supabase.from(getTableName(req.params.entity)).select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(convertKeys(data, snakeToCamel));
});

app.post('/api/:entity', async (req, res) => {
  const dbData = convertKeys(req.body, camelToSnake);
  const { data, error } = await supabase.from(getTableName(req.params.entity)).insert(dbData).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(convertKeys(data, snakeToCamel));
});

app.put('/api/:entity/:id', async (req, res) => {
  const dbData = convertKeys(req.body, camelToSnake);
  const { data, error } = await supabase.from(getTableName(req.params.entity)).update(dbData).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(convertKeys(data, snakeToCamel));
});

app.delete('/api/:entity/:id', async (req, res) => {
  const { error } = await supabase.from(getTableName(req.params.entity)).delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});


// Redirecionar qualquer outra requisição para o index.html (SPA routing do React)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT} (0.0.0.0)`);
});
