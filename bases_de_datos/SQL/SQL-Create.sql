DROP DATABASE IF EXISTS ELC_Peliculas;
CREATE DATABASE ELC_Peliculas;
USE ELC_Peliculas;

CREATE TABLE paises (
	id VARCHAR(2) NOT NULL UNIQUE,
	alpha3code VARCHAR(3) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	continente VARCHAR(20) NOT NULL,
	idioma VARCHAR(50) NOT NULL,
	zona_horaria VARCHAR(10) NOT NULL,
	bandera VARCHAR(100) NOT NULL,
	orden INT NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE estados_eclesiales (
	id VARCHAR(2) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	orden INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE roles_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE sexos (
	id VARCHAR(1) NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	letra_final VARCHAR(1) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE status_registro_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE USUARIOS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	status_registro_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	rol_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	nombre VARCHAR(50) NULL,
	apellido VARCHAR(50) NULL,
	apodo VARCHAR(50) NULL,
	avatar VARCHAR(100) NULL,
	fecha_nacimiento DATE NULL,
	sexo_id VARCHAR(1) NULL,
	pais_id VARCHAR(2) NULL,
	estado_eclesial_id VARCHAR(2) NULL,
	creado_en DATE NULL,
	completado_en DATE NULL,
	editado_en DATE NULL,
	autorizado_data_entry BOOLEAN NOT NULL DEFAULT 0,
	borrado BOOLEAN NULL DEFAULT 0,
	borrado_en DATE NULL,
	borrado_motivo VARCHAR(500) NULL,
	borrado_por INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (status_registro_usuario_id) REFERENCES status_registro_usuario(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (sexo_id) REFERENCES sexos(id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (estado_eclesial_id) REFERENCES estados_eclesiales(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE penalizaciones_motivos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	duracion INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE penalizaciones_usuarios (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	fecha DATE NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	rol_usuario_id INT UNSIGNED NOT NULL,
	penalizado_por_id INT UNSIGNED NULL,
	penalizacion_id INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (penalizado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (penalizacion_id) REFERENCES penalizaciones_motivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE categorias (
	id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE categorias_sub (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(20) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE listado_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE menu_opciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	url VARCHAR(50) NOT NULL,
	titulo VARCHAR(50) NOT NULL,
	vista VARCHAR(20) NOT NULL,
	comentario VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE colecciones_cabecera (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id VARCHAR(20) NULL,
	rubro VARCHAR(20) NOT NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NULL,
	ano_fin INT UNSIGNED NULL,
	pais_id VARCHAR(2) NOT NULL,
	productor VARCHAR(50) NULL,
	sinopsis VARCHAR(800) NOT NULL,
	avatar VARCHAR(100) NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE colecciones_peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	pelicula_id INT UNSIGNED NULL,
	tmdb_id VARCHAR(20) NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	coleccion_id INT UNSIGNED NOT NULL,
	orden_secuencia INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES colecciones_cabecera(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE epocas_estreno (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(20) NOT NULL,
	ano_comienzo INT UNSIGNED NOT NULL,
	ano_fin INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE publicos_recomendados (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE eventos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL,
	fecha VARCHAR(20) NOT NULL,
	distancia INT UNSIGNED NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE personajes_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE hechos_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE PELICULAS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id VARCHAR(20) NULL,
	fa_id VARCHAR(20) NULL,
	imdb_id VARCHAR(20) NULL,
	nombre_original VARCHAR(100) NOT NULL UNIQUE,
	nombre_castellano VARCHAR(100) NOT NULL,
	coleccion_pelicula_id INT UNSIGNED NULL,
	duracion INT UNSIGNED NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	pais_id VARCHAR(2) NOT NULL,
	director VARCHAR(50) NOT NULL,
	guion VARCHAR(50) NOT NULL,
	musica VARCHAR(50) NOT NULL,
	actores VARCHAR(500) NOT NULL,
	productor VARCHAR(50) NOT NULL,
	avatar VARCHAR(100) NOT NULL,
	idioma_castellano BOOLEAN NOT NULL,
	color BOOLEAN NOT NULL,
	publico_recomendado_id INT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id INT UNSIGNED NOT NULL,
	personaje_historico_id INT UNSIGNED NULL,
	hecho_historico_id INT UNSIGNED NULL,
	sugerida_para_evento_id INT UNSIGNED NULL,
	sinopsis VARCHAR(800) NOT NULL,
	creada_por_id INT UNSIGNED NOT NULL,
	creada_en DATE NOT NULL,
	analizada_por_id INT UNSIGNED NULL,
	analizada_en DATE NULL,
	aprobada BOOLEAN DEFAULT 0,
	fechaFIFO DATE NULL,
	editada_por_id INT UNSIGNED NULL,
	editada_en DATE NULL,
	revisada_por_id INT UNSIGNED NULL,
	revisada_en DATE NULL,
	borrado BOOLEAN NOT NULL DEFAULT 0,
	borrado_por_id INT UNSIGNED NULL,
	borrado_en DATE NULL,
	borrado_motivo VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_pelicula_id) REFERENCES colecciones_peliculas(id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (publico_recomendado_id) REFERENCES publicos_recomendados(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES hechos_historicos(id),
	FOREIGN KEY (sugerida_para_evento_id) REFERENCES eventos(id),
	FOREIGN KEY (creada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (borrado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE fe_valores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE entretiene (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE calidad_filmica (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(30) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE us_pel_calificaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	fe_valores_id INT UNSIGNED NOT NULL,
	entretiene_id INT UNSIGNED NOT NULL,
	calidad_filmica_id INT UNSIGNED NOT NULL,
	resultado DECIMAL(3,2) UNSIGNED NOT NULL DEFAULT 1,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (fe_valores_id) REFERENCES fe_valores(id),
	FOREIGN KEY (entretiene_id) REFERENCES entretiene(id),
	FOREIGN KEY (calidad_filmica_id) REFERENCES calidad_filmica(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE us_pel_interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	interes_en_la_pelicula_id INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (interes_en_la_pelicula_id) REFERENCES interes_en_la_pelicula(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE filtros_personales (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	campo1 VARCHAR(100),
	valor1_id INT UNSIGNED,
	campo2 VARCHAR(100),
	valor2_id INT UNSIGNED,
	campo3 VARCHAR(100),
	valor3_id INT UNSIGNED,
	campo4 VARCHAR(100),
	valor4_id INT UNSIGNED,
	palabras_clave VARCHAR(100),
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
