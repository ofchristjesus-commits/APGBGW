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


const loadDb = () => {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify(allSeeds, null, 2), 'utf-8');
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
};

const saveDb = (db) => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
};

const getCollection = (db, name) => db[name] || [];
const setCollection = (db, name, collection) => ({ ...db, [name]: collection });

app.get('/api/:entity', (req, res) => {
  const db = loadDb();
  const collection = getCollection(db, req.params.entity);
  res.json(collection);
});

app.get('/api/:entity/:id', (req, res) => {
  const db = loadDb();
  const collection = getCollection(db, req.params.entity);
  const item = collection.find((item) => String(item.id) === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/:entity', (req, res) => {
  const db = loadDb();
  const collection = getCollection(db, req.params.entity);
  const maxId = collection.reduce((max, item) => Math.max(max, item.id || 0), 0);
  const newItem = { ...req.body, id: maxId + 1 };
  const updated = [...collection, newItem];
  saveDb(setCollection(db, req.params.entity, updated));
  res.status(201).json(newItem);
});

app.put('/api/:entity/:id', (req, res) => {
  const db = loadDb();
  const collection = getCollection(db, req.params.entity);
  const item = collection.find((item) => String(item.id) === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  const updatedItem = { ...item, ...req.body };
  const updated = collection.map((entry) => (String(entry.id) === req.params.id ? updatedItem : entry));
  saveDb(setCollection(db, req.params.entity, updated));
  res.json(updatedItem);
});

app.delete('/api/:entity/:id', (req, res) => {
  const db = loadDb();
  const collection = getCollection(db, req.params.entity);
  const updated = collection.filter((entry) => String(entry.id) !== req.params.id);
  saveDb(setCollection(db, req.params.entity, updated));
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
