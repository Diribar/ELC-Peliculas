USE ELC_Peliculas;

/* FEEDBACK SOBRE INPUTS */;
DROP TABLE IF EXISTS edic_rech;
DROP TABLE IF EXISTS edic_rech_motivos;
CREATE TABLE edic_rech_motivos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(40) NOT NULL,
	avatar BOOLEAN DEFAULT 0,
	prod BOOLEAN DEFAULT 0,
	rclv BOOLEAN DEFAULT 0,
	links BOOLEAN DEFAULT 0,
	duracion SMALLINT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/* MOTIVOS PARA EDICIONES */;
INSERT INTO edic_rech_motivos (id, orden, duracion, comentario, avatar, prod, rclv, links)
VALUES (100, 100, 0, 'Otro motivo', 1, 1, 1, 1);
INSERT INTO edic_rech_motivos (id, orden, duracion, comentario, prod, rclv, links)
VALUES
(1, 1, 0, 'Campo completado con información errónea', 1, 1, 1),
(2, 2, 0, 'Errores de ortografía y/o gramática', 1, 1, 0),
(3, 3, 10, 'Campos con spam', 1, 1, 0)
;
INSERT INTO edic_rech_motivos (id, orden, duracion, comentario, avatar)
VALUES
(11, 11, 0, 'La imagen original es más adecuada', 1),
(12, 12, 0, 'La imagen no se corresponde con el producto', 1),
(13, 13, 0, 'Imagen de poca nitidez', 1),
(14, 14, 0, 'No existe ningún archivo válido de imagen', 1)
;
INSERT INTO edic_rech_motivos (id, orden, duracion, comentario, rclv)
VALUES (21, 21, 5, 'Datos fáciles sin completar', 1);
CREATE TABLE edic_rech (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_entidad VARCHAR(20) NOT NULL,
	elc_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NULL,
	motivo_id TINYINT UNSIGNED NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (motivo_id) REFERENCES edic_rech_motivos(id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
DROP TABLE IF EXISTS edic_aprob;
CREATE TABLE edic_aprob (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_entidad VARCHAR(20) NOT NULL,
	elc_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,
	
	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* FEEDBACK SOBRE ALTAS */;
DROP TABLE IF EXISTS altas_rech;
DROP TABLE IF EXISTS altas_rech_motivos;
CREATE TABLE altas_rech_motivos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(41) NOT NULL,
	prod BOOLEAN DEFAULT 0,
	rclv BOOLEAN DEFAULT 0,
	links BOOLEAN DEFAULT 0,
	duracion SMALLINT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO altas_rech_motivos (id, orden, duracion, comentario, prod, rclv, links)
VALUES
(100, 100, 0, 'Otro motivo', 1, 1, 1)
;
INSERT INTO altas_rech_motivos (id, orden, duracion, comentario, prod)
VALUES
(11, 1, 0, 'Producto duplicado', 1),
(12, 2, 1, 'Producto ajeno a nuestro perfil', 1),
(13, 3, 90, 'Producto ofensivo a nuestro perfil', 1),
(14, 4, 180, 'Producto ofensivo con pornografía', 1)
;
INSERT INTO altas_rech_motivos (id, orden, duracion, comentario, links)
VALUES
(21, 1, 0, 'Link reemplazado por otro más acorde', 1),
(22, 2, 0, 'Link a video no disponible', 1),
(23, 3, 10, 'Link a video sin relación con el producto', 1),
(24, 4, 10, 'Link a sitio inexistente', 1)
;
INSERT INTO altas_rech_motivos (id, orden, duracion, comentario, rclv)
VALUES
(31, 1, 0, 'Registro duplicado', 1),
(32, 2, 10, 'Spam', 1)
;
CREATE TABLE altas_rech (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_entidad VARCHAR(20) NOT NULL,
	elc_id INT UNSIGNED NOT NULL,
	motivo_id TINYINT UNSIGNED NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (motivo_id) REFERENCES altas_rech_motivos(id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)	
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
