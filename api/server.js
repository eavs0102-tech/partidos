require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'https://partidos-frontend.onrender.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(uploadsDir));

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const pool = mysql.createPool({
  connectTimeout: 30000, // 30 segundos de tiempo de espera
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

// Endpoint para registrar un nuevo partido (con subida de logo)
app.post('/api/parties', upload.single('logo'), async (req, res) => {
  try {
    const { nombre, sigla, ideologia, fechaFundacion, sede, color } = req.body;
    let logoUrl = null;
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const newParty = {
      id: uuidv4(),
      nombre,
      sigla,
      ideologia,
      fecha_fundacion: fechaFundacion, // Mapeo a snake_case
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

// Endpoint para actualizar un partido (con subida de logo)
app.put('/api/parties/:id', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const { nombre, sigla, ideologia, fechaFundacion, sede, color } = req.body;

  let logoUrl = req.body.logoUrl; // Mantiene la URL existente por defecto
  if (req.file) {
    logoUrl = `/uploads/${req.file.filename}`; // Actualiza con la nueva URL si se sube archivo
  }

  try {
    const [result] = await pool.query(
      'UPDATE partidos SET nombre = ?, sigla = ?, ideologia = ?, fecha_fundacion = ?, sede = ?, color = ?, logo_url = ? WHERE id = ?',
      [nombre, sigla, ideologia, fechaFundacion, sede, color, logoUrl, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    // Devolver el partido actualizado para que el frontend pueda refrescar el estado
    const [[updatedParty]] = await pool.query('SELECT * FROM partidos WHERE id = ?', [id]);
    res.json({ message: 'Partido actualizado correctamente', data: updatedParty });

  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar el partido' });
  }
});

// Endpoint para "eliminar" un partido (soft delete)
app.delete('/api/parties/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM partidos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    res.status(200).json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar el partido' });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
