const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configuración de CORS
const allowedOrigins = ['http://localhost:5173', 'https://partidos-frontend.onrender.com'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Crear carpeta de uploads si no existe y servir archivos estáticos
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para obtener todos los partidos
app.get('/api/parties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partidos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({ message: 'Error al obtener partidos' });
  }
});

// Endpoint para registrar un nuevo partido
app.post('/api/parties', upload.single('logo'), async (req, res) => {
  const { nombre, sigla, ideologia, fecha_fundacion, sede_principal, color_representativo } = req.body;
  const logo_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !sigla || !fecha_fundacion) {
    return res.status(400).json({ message: 'Nombre, sigla y fecha de fundación son requeridos.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO partidos (nombre, sigla, ideologia, fecha_fundacion, sede_principal, color_representativo, logo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, sigla, ideologia, fecha_fundacion, sede_principal, color_representativo, logo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar el partido:', error);
    res.status(500).json({ message: 'Error al registrar el partido' });
  }
});

// Endpoint para actualizar un partido
app.put('/api/parties/:id', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const { nombre, sigla, ideologia, fecha_fundacion, sede_principal, color_representativo } = req.body;
  
  let logo_url = req.body.logo_url;
  if (req.file) {
    logo_url = `/uploads/${req.file.filename}`;
  }

  try {
    const result = await pool.query(
      'UPDATE partidos SET nombre = $1, sigla = $2, ideologia = $3, fecha_fundacion = $4, sede_principal = $5, color_representativo = $6, logo_url = $7 WHERE id = $8 RETURNING *',
      [nombre, sigla, ideologia, fecha_fundacion, sede_principal, color_representativo, logo_url, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Partido no encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    res.status(500).json({ message: 'Error al actualizar el partido' });
  }
});

// Endpoint para eliminar un partido (eliminación permanente)
app.delete('/api/parties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM partidos WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Partido no encontrado' });
    res.status(200).json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    res.status(500).json({ message: 'Error al eliminar el partido' });
  }
});

const PORT = process.env.PORT || 3001;

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'partidos');"
    );

    if (!tableCheck.rows[0].exists) {
      console.log('Tabla "partidos" no encontrada. Creándola ahora...');
      await pool.query(`
        CREATE TABLE partidos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            sigla VARCHAR(50) NOT NULL,
            ideologia VARCHAR(255),
            fecha_fundacion DATE NOT NULL,
            sede_principal VARCHAR(255),
            color_representativo VARCHAR(50),
            logo_url VARCHAR(255),
            fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tabla "partidos" creada exitosamente.');
    } else {
      console.log('Tabla "partidos" ya existe.');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1); // Detener la aplicación si la DB no se puede inicializar
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  initializeDatabase();
});
