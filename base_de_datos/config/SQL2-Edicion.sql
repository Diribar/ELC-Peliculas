USE ELC_Peliculas;

DROP TABLE IF EXISTS EDIC_RCLV;
CREATE TABLE EDIC_RCLV (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_id SMALLINT UNSIGNED NOT NULL,
	elc_entidad VARCHAR(20) NOT NULL,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	ano SMALLINT NULL,
	nombre VARCHAR(30) NULL,
	proceso_canonizacion_id VARCHAR(3) NULL,
	rol_iglesia_id VARCHAR(3) NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	status_registro_id TINYINT UNSIGNED DEFAULT 2,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES dias_del_ano(id),
	FOREIGN KEY (proceso_canonizacion_id) REFERENCES procesos_canonizacion(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES roles_iglesia(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EDIC_productos;
CREATE TABLE EDIC_productos (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_id INT UNSIGNED NOT NULL,
	elc_entidad VARCHAR(11) NOT NULL,
	coleccion_id INT UNSIGNED NOT NULL,
	temporada TINYINT UNSIGNED DEFAULT NULL,
	capitulo TINYINT UNSIGNED NOT NULL,
	TMDB_id VARCHAR(10) NULL UNIQUE,
	FA_id VARCHAR(10) NULL UNIQUE,
	IMDB_id VARCHAR(10) NULL UNIQUE,
	entidad_TMDB VARCHAR(10) NULL,
	nombre_original VARCHAR(50) NULL,
	nombre_castellano VARCHAR(50) NULL,
	duracion SMALLINT UNSIGNED NULL,
	ano_estreno SMALLINT UNSIGNED NULL,
	ano_fin SMALLINT UNSIGNED NULL,
	paises_id VARCHAR(18) NULL,
	idioma_original_id VARCHAR(2) NULL,
	cant_temporadas TINYINT UNSIGNED NULL,
	cant_capitulos SMALLINT UNSIGNED NULL,
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
	personaje_id SMALLINT UNSIGNED NULL,
	hecho_id SMALLINT UNSIGNED NULL,
	valor_id SMALLINT UNSIGNED NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME NOT NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (coleccion_id) REFERENCES PROD_colecciones(id),	
	FOREIGN KEY (en_castellano_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (en_color_id) REFERENCES si_no_parcial(id),
	FOREIGN KEY (idioma_original_id) REFERENCES idiomas(id),
	FOREIGN KEY (categoria_id) REFERENCES categorias(id),
	FOREIGN KEY (subcategoria_id) REFERENCES categorias_sub(id),
	FOREIGN KEY (publico_sugerido_id) REFERENCES publicos_sugeridos(id),
	FOREIGN KEY (personaje_id) REFERENCES rclv_personajes(id),
	FOREIGN KEY (hecho_id) REFERENCES rclv_hechos(id),
	FOREIGN KEY (valor_id) REFERENCES rclv_valores(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EDIC_links_prods;
CREATE TABLE EDIC_links_prods (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	ELC_id INT UNSIGNED NULL,
	url VARCHAR(100) NOT NULL UNIQUE,
	link_tipo_id TINYINT UNSIGNED NOT NULL,
	link_prov_id TINYINT UNSIGNED NOT NULL,
	gratuito BOOLEAN NOT NULL,

	editado_por_id INT UNSIGNED NULL,
	editado_en DATETIME NULL,
	status_registro_id TINYINT UNSIGNED DEFAULT 1,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (ELC_id) REFERENCES links_prods(id),
	FOREIGN KEY (link_tipo_id) REFERENCES links_tipos(id),
	FOREIGN KEY (link_prov_id) REFERENCES links_provs(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
