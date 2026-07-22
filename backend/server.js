import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { allSeeds } from '../frontend/src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'db.json');
const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do frontend (React/Vite)
app.use(express.static(join(__dirname, '../frontend/dist')));


import { supabase } from './supabase.js';

app.get('/api/:entity', async (req, res) => {
  const { data, error } = await supabase.from(req.params.entity).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/:entity/:id', async (req, res) => {
  const { data, error } = await supabase.from(req.params.entity).select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

app.post('/api/:entity', async (req, res) => {
  const { data, error } = await supabase.from(req.params.entity).insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/:entity/:id', async (req, res) => {
  const { data, error } = await supabase.from(req.params.entity).update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/:entity/:id', async (req, res) => {
  const { error } = await supabase.from(req.params.entity).delete().eq('id', req.params.id);
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
