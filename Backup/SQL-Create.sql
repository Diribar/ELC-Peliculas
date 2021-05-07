DROP DATABASE IF EXISTS ELC_Peliculas;
CREATE DATABASE ELC_Peliculas;
USE ELC_Peliculas;

CREATE TABLE status_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles_usuario (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sexos (
	id VARCHAR(1) NOT NULL,
	nombre VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE estados_eclesiales (
	id VARCHAR(2) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	orden INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

CREATE TABLE USUARIOS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	contrasena VARCHAR(100) NOT NULL,
	status_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	rol_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	nombre VARCHAR(50) NULL,
	apellido VARCHAR(50) NULL,
	apodo VARCHAR(50) NULL,
	avatar VARCHAR(50) NULL,
	fecha_nacimiento DATE NULL,
	sexo_id VARCHAR(1) NULL,
	pais_id VARCHAR(2) NULL,
	estado_eclesial_id VARCHAR(2) NULL,
	creado_en DATE NULL,
	completado_en DATE NULL,
	editado_en DATE NULL,
	ultima_penalizacion_en DATE NULL,
	borrado_en DATE NULL,
	penalizaciones INT UNSIGNED NULL,
	ultima_penalizacion_en_rol INT UNSIGNED NULL,
	ultima_penalizacion_motivo VARCHAR(500) NULL,
	penalizado_por INT UNSIGNED NULL,
	borrado BOOLEAN NULL DEFAULT 0,
	borrado_motivo VARCHAR(500) NULL,
	borrado_por INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (status_usuario_id) REFERENCES status_usuario(id),
	FOREIGN KEY (rol_usuario_id) REFERENCES roles_usuario(id),
	FOREIGN KEY (sexo_id) REFERENCES sexos(id),
	FOREIGN KEY (pais_id) REFERENCES paises(id),
	FOREIGN KEY (estado_eclesial_id) REFERENCES estados_eclesiales(id),
	FOREIGN KEY (ultima_penalizacion_en_rol) REFERENCES roles_usuario(id),
	FOREIGN KEY (penalizado_por) REFERENCES usuarios(id),
	FOREIGN KEY (borrado_por) REFERENCES usuarios(id)
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

CREATE TABLE categorias (
	id VARCHAR(3) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subcategorias (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	categoria_id VARCHAR(3) NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE publico_recomendado (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE directores(
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE guion(
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE musica (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE actores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE productores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE colecciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NULL,
	nombre_original VARCHAR(100) NOT NULL,
	nombre_castellano VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE personajes (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hechos_historicos (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coleccion_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_coleccion_id INT UNSIGNED NULL,
	pelicula_id INT UNSIGNED NULL,
	tmdb_pelicula_id INT UNSIGNED NULL,
	titulo_original VARCHAR(100) NOT NULL UNIQUE,
	titulo_castellano VARCHAR(100) NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE fe_valores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE entretiene (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE calidad_filmica (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE PELICULAS (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id VARCHAR(20) NULL,
	fa_id VARCHAR(20) NULL,
	imdb_id VARCHAR(20) NULL,
	titulo_original VARCHAR(100) NOT NULL UNIQUE,
	titulo_castellano VARCHAR(100) NOT NULL,
	coleccion_id INT UNSIGNED NULL,
	duracion INT UNSIGNED NULL,
	ano_estreno INT UNSIGNED NULL,
	epoca_estreno INT UNSIGNED NULL,
	pais_origen_id VARCHAR(2) NULL,
	avatar VARCHAR(100) NOT NULL,
	idioma_castellano BOOLEAN NOT NULL,
	color BOOLEAN NOT NULL,
	publico_recomendado_id INT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id INT UNSIGNED NOT NULL,
	precuela_de VARCHAR(100) NULL,
	secuela_de VARCHAR(100) NULL,
	sinopsis VARCHAR(500) NOT NULL,
	creada_por INT UNSIGNED NOT NULL,
	creada_en DATE NOT NULL,
	analizada_por INT UNSIGNED NULL,
	analizada_en DATE NULL,
	aprobadaCR BOOLEAN DEFAULT 0,
	fechaFIFO DATE NULL,
	editada_por INT UNSIGNED NULL,
	editada_en DATE NULL,
	revisada_por INT UNSIGNED NULL,
	revisada_en DATE NULL,
	aprobadaED BOOLEAN DEFAULT 0,
	borrado BOOLEAN NOT NULL DEFAULT 0,
	borrado_por INT UNSIGNED NULL,
	borrado_en DATE NULL,
	borrado_motivo VARCHAR(500) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES colecciones(id),
	FOREIGN KEY (pais_origen_id) REFERENCES paises(id),
	FOREIGN KEY (publico_recomendado_id) REFERENCES publico_recomendado(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id),
	FOREIGN KEY (precuela_de) REFERENCES coleccion_pelicula(titulo_original),
	FOREIGN KEY (secuela_de) REFERENCES coleccion_pelicula(titulo_original),
	FOREIGN KEY (creada_por) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por) REFERENCES usuarios(id),
	FOREIGN KEY (editada_por) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por) REFERENCES usuarios(id),
	FOREIGN KEY (borrado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario_pelicula_calificaciones (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	fe_valores_id INT UNSIGNED NOT NULL,
	entretiene_id INT UNSIGNED NOT NULL,
	calidad_filmica_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (fe_valores_id) REFERENCES fe_valores(id),
	FOREIGN KEY (entretiene_id) REFERENCES entretiene(id),
	FOREIGN KEY (calidad_filmica_id) REFERENCES calidad_filmica(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario_pelicula_interes_en_la_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	interes_en_la_pelicula_id INT UNSIGNED NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id),
	FOREIGN KEY (interes_en_la_pelicula_id) REFERENCES interes_en_la_pelicula(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario_pelicula_favoritas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario_pelicula_comentarios (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	comentario VARCHAR(500) NOT NULL,
	creado_en DATE NOT NULL,
	editado_en DATE,
	baja_en DATE,
	baja_por_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE director_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	director_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (director_id) REFERENCES directores(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE musica_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	musica_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (musica_id) REFERENCES musica(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE guion_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	guion_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (guion_id) REFERENCES guion(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE actor_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	actor_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	personaje VARCHAR(100) NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (actor_id) REFERENCES actores(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE productor_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	productor_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (productor_id) REFERENCES productores(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE personaje_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	personaje_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (personaje_id) REFERENCES personajes(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hecho_historico_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	hecho_historico_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (hecho_historico_id) REFERENCES hechos_historicos(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
