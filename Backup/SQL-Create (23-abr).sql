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

CREATE TABLE estados_eclesiales (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pais (
	iso_id VARCHAR(2) NOT NULL UNIQUE,
	nombre VARCHAR(100) NOT NULL,
	PRIMARY KEY (iso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuarios (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	email VARCHAR(500) NOT NULL UNIQUE,
	status_usuario_id INT UNSIGNED NOT NULL DEFAULT 0,
	rol_usuario_id INT UNSIGNED NOT NULL DEFAULT 1,
	nombre VARCHAR(500) NULL,
	apellido VARCHAR(500) NULL,
	apodo VARCHAR(500) NULL,
	avatar VARCHAR(500) NULL,
	fecha_nacimiento DATE NULL,
	sexo VARCHAR(500) NULL,
	pais_id VARCHAR(2) NULL,
	estado_eclesial_id INT UNSIGNED NULL,
	contrasena VARCHAR(500) NULL,
	validacion_enviada_en DATE NULL,
	creado_en DATE NULL,
	editado_en DATE NULL,
	ultima_penalizacion_en DATE NULL,
	borrado_en DATE NULL,
	apto_permisos_usuario BOOLEAN NULL DEFAULT 1,
	apto_permisos_admin BOOLEAN NULL DEFAULT 0,
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
	FOREIGN KEY (pais_id) REFERENCES pais(iso_id),
	FOREIGN KEY (estado_eclesial_id) REFERENCES estados_eclesiales(id),
	FOREIGN KEY (ultima_penalizacion_en_rol) REFERENCES roles_usuario(id),
	FOREIGN KEY (penalizado_por) REFERENCES usuarios(id),
	FOREIGN KEY (borrado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE filtros_personales (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(100) NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	campo1 VARCHAR(500),
	valor1_id INT UNSIGNED,
	campo2 VARCHAR(500),
	valor2_id INT UNSIGNED,
	campo3 VARCHAR(500),
	valor3_id INT UNSIGNED,
	campo4 VARCHAR(500),
	valor4_id INT UNSIGNED,
	palabras_clave VARCHAR(500),
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
	tmdb_id INT UNSIGNED NOT NULL,
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
	titulo_original VARCHAR(500) NOT NULL,
	titulo_castellano VARCHAR(500) NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE peliculas (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	tmdb_id INT UNSIGNED NULL,
	fa_id INT UNSIGNED NULL,
	imdb_id INT UNSIGNED NULL,
	titulo_original VARCHAR(500) NOT NULL UNIQUE,
	titulo_castellano VARCHAR(500) NOT NULL,
	coleccion_id INT UNSIGNED NULL,
	duracion INT UNSIGNED NOT NULL,
	ano_estreno INT UNSIGNED NOT NULL,
	pais_origen_id VARCHAR(2) NULL,
	avatar VARCHAR(500) NOT NULL,
	idioma_castellano BOOLEAN NOT NULL,
	color BOOLEAN NOT NULL,
	publico_recomendado_id INT UNSIGNED NOT NULL,
	categoria_id VARCHAR(3) NOT NULL,
	subcategoria_id INT UNSIGNED NOT NULL,
	sinopsis VARCHAR(500) NOT NULL,
	precuela_de INT UNSIGNED NULL DEFAULT 0,
	secuela_de INT UNSIGNED NULL DEFAULT 0,
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
	FOREIGN KEY (pais_origen_id) REFERENCES pais(iso_id),
	FOREIGN KEY (publico_recomendado_id) REFERENCES publico_recomendado(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id),
	FOREIGN KEY (precuela_de) REFERENCES coleccion_pelicula(id),
	FOREIGN KEY (secuela_de) REFERENCES coleccion_pelicula(id),
	FOREIGN KEY (creada_por) REFERENCES usuarios(id),
	FOREIGN KEY (analizada_por) REFERENCES usuarios(id),
	FOREIGN KEY (editada_por) REFERENCES usuarios(id),
	FOREIGN KEY (revisada_por) REFERENCES usuarios(id),
	FOREIGN KEY (borrado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE usuario_pelicula (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	usuario_id INT UNSIGNED NOT NULL,
	pelicula_id INT UNSIGNED NOT NULL,
	favorita_descartada_nulo VARCHAR(2),
	vistas BOOLEAN NOT NULL DEFAULT 0,
	fe_valores INT UNSIGNED NOT NULL,
	entretiene INT UNSIGNED NOT NULL,
	calidad_filmica INT UNSIGNED NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
	FOREIGN KEY (pelicula_id) REFERENCES peliculas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comentarios (
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
