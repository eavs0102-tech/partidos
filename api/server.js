require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Endpoint para obtener todos los partidos
app.get('/api/parties', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partidos WHERE activo = true ORDER BY fecha_registro DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// Endpoint para registrar un nuevo partido
app.post('/api/parties', async (req, res) => {
  try {
    const { nombre, sigla, ideologia, fechaFundacion, sede, color, logoUrl } = req.body;

    const newParty = {
      id: uuidv4(),
      nombre,
      sigla,
      ideologia,
      fecha_fundacion: fechaFundacion,
      sede,
      color,
      logo_url: logoUrl,
      activo: true
    };

    await pool.query('INSERT INTO partidos SET ?', newParty);

    res.status(201).json({ success: true, data: newParty });
  } catch (error) {
    console.error('Error al registrar el partido:', error);
    res.status(500).json({ success: false, message: 'Error al registrar el partido.', error: error.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
