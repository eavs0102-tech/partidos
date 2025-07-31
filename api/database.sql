CREATE DATABASE IF NOT EXISTS partidos_politicos;

USE partidos_politicos;

CREATE TABLE IF NOT EXISTS partidos (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  sigla VARCHAR(50) NOT NULL,
  ideologia VARCHAR(100),
  fecha_fundacion DATE,
  sede VARCHAR(255),
  color VARCHAR(7),
  logo_url VARCHAR(2048),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);
