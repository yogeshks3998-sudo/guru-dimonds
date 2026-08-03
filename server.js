import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { app as apiApp } from './dist-server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const distPath = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 5000);

app.use(apiApp);
app.use(express.static(distPath, { index: false }));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Guru Diamonds production server listening on ${port}`);
});
