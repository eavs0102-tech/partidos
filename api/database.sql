CREATE TABLE partidos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  sigla VARCHAR(50) NOT NULL,
  ideologia VARCHAR(100),
  fecha_fundacion DATE,
  sede_principal VARCHAR(255),
  color_representativo VARCHAR(50),
  logo_url VARCHAR(255)
);
