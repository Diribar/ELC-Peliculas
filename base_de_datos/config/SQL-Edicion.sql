USE ELC_Peliculas;

DROP TABLE IF EXISTS EDIC_peliculas;
CREATE TABLE EDIC_peliculas (
	id INT UNSIGNED AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL UNIQUE,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	duracion SMALLINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	idioma_original_id VARCHAR(2) NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(100) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,

	editada_por_id INT UNSIGNED NOT NULL,
	editada_en DATETIME NOT NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EDIC_colecciones;
CREATE TABLE EDIC_colecciones (
	id INT UNSIGNED AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL UNIQUE,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	entidad_TMDB VARCHAR(10) NULL,
	nombre_original VARCHAR(100) NULL,
	nombre_castellano VARCHAR(100) NULL,
	paises_id VARCHAR(18) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	ano_fin SMALLINT UNSIGNED NULL,
	idioma_original_id VARCHAR(2) NULL,
	cant_temporadas TINYINT UNSIGNED NULL,
	cant_capitulos SMALLINT UNSIGNED NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(50) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,

	editada_por_id INT UNSIGNED NOT NULL,
	editada_en DATETIME NOT NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EDIC_capitulos;
CREATE TABLE EDIC_capitulos (
	id INT UNSIGNED AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL UNIQUE,
	coleccion_id INT UNSIGNED NULL,
	temporada TINYINT UNSIGNED NULL,
	capitulo TINYINT UNSIGNED NULL,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	duracion TINYINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	idioma_original_id VARCHAR(2) NULL,
	direccion VARCHAR(100) NULL,
	guion VARCHAR(100) NULL,
	musica VARCHAR(100) NULL,
	actuacion VARCHAR(500) NULL,
	produccion VARCHAR(100) NULL,
	sinopsis VARCHAR(800) NULL,
	avatar VARCHAR(100) NULL,
	en_castellano_id TINYINT UNSIGNED NULL,
	en_color_id TINYINT UNSIGNED NULL,
	categoria_id VARCHAR(3) NULL,
	subcategoria_id TINYINT UNSIGNED NULL,
	publico_sugerido_id TINYINT UNSIGNED NULL,
	personaje_historico_id SMALLINT UNSIGNED NULL,
	hecho_historico_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,
	link_trailer VARCHAR(200) NULL,
	link_pelicula VARCHAR(200) NULL,

	editada_por_id INT UNSIGNED NOT NULL,
	editada_en DATETIME NOT NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,
	
	capturada_por_id INT UNSIGNED NULL,
	capturada_en DATETIME NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id),
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (personaje_historico_id) REFERENCES rclv_personajes_historicos(id),
	FOREIGN KEY (hecho_historico_id) REFERENCES rclv_hechos_historicos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (editada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturada_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
