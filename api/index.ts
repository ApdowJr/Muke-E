import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

export default app;
