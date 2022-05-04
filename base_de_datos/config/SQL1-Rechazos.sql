USE ELC_Peliculas;

/* MOTIVOS DE RECHAZO DE ALTAS */;
DROP TABLE IF EXISTS altas_motivos_rech;
CREATE TABLE altas_motivos_rech (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(41) NOT NULL,
	prod BOOLEAN DEFAULT 0,
	rclv BOOLEAN DEFAULT 0,
	links BOOLEAN DEFAULT 0,
	duracion SMALLINT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO altas_motivos_rech (id, orden, duracion, comentario, prod, rclv, links)
VALUES
(100, 100, 0, 'Otro motivo', 1, 1, 1)
;
INSERT INTO altas_motivos_rech (id, orden, duracion, comentario, prod)
VALUES
(11, 1, 0, 'Producto duplicado', 1),
(12, 2, 1, 'Producto ajeno a nuestro perfil', 1),
(13, 3, 90, 'Producto ofensivo a nuestro perfil', 1),
(14, 4, 180, 'Producto ofensivo con pornografía', 1)
;
INSERT INTO altas_motivos_rech (id, orden, duracion, comentario, links)
VALUES
(21, 1, 0, 'Link reemplazado por otro más acorde', 1),
(22, 2, 0, 'Link a video no disponible', 1),
(23, 3, 10, 'Link a video sin relación con el producto', 1),
(24, 4, 10, 'Link a sitio inexistente', 1)
;
INSERT INTO altas_motivos_rech (id, orden, duracion, comentario, rclv)
VALUES
(31, 1, 0, 'Registro duplicado', 1),
(32, 2, 10, 'Spam', 1)
;
/* RECHAZO DE ALTAS */;
DROP TABLE IF EXISTS altas_registros_rech;
CREATE TABLE altas_registros_rech (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	entidad VARCHAR(20) NOT NULL,
	entidad_id INT UNSIGNED NOT NULL,
	motivo_id TINYINT UNSIGNED NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,
	status_registro_id TINYINT UNSIGNED NOT NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (motivo_id) REFERENCES altas_motivos_rech(id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES aux_status_registro(id)	
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* MOTIVOS DE RECHAZO DE EDICIONES */;
DROP TABLE IF EXISTS edic_motivos_rech;
CREATE TABLE edic_motivos_rech (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(40) NOT NULL,
	avatar BOOLEAN DEFAULT 0,
	prod BOOLEAN DEFAULT 0,
	rclv BOOLEAN DEFAULT 0,
	links BOOLEAN DEFAULT 0,
	duracion SMALLINT UNSIGNED NOT NULL,
	info_erronea BOOLEAN DEFAULT 0,
	otros BOOLEAN DEFAULT 0,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO edic_motivos_rech (id, orden, duracion, comentario, avatar, prod, rclv, links, otros)
VALUES (100, 100, 0, 'Otro motivo', 1, 1, 1, 1, 1);
INSERT INTO edic_motivos_rech (id, orden, duracion, comentario, prod, rclv, links,info_erronea)
VALUES
(1, 1, 0, 'Es mejor la versión actual', 1, 1, 1, 0),
(2, 2, 0, 'Ortografía, gramática, sintaxis', 1, 1, 0, 0),
(3, 3, 0, 'Información errónea', 1, 1, 1, 1),
(4, 4, 10, 'Spam', 1, 1, 0, 0)
;
INSERT INTO edic_motivos_rech (id, orden, duracion, comentario, avatar)
VALUES
(11, 11, 0, 'La imagen original es más adecuada', 1),
(12, 12, 10, 'La imagen no corresponde al producto', 1),
(13, 13, 0, 'Imagen de poca nitidez', 1),
(14, 14, 1, 'No es un archivo válido de imagen', 1)
;
INSERT INTO edic_motivos_rech (id, orden, duracion, comentario, rclv)
VALUES (21, 21, 5, 'Datos fáciles sin completar', 1);
/* APROBACION DE EDICIONES */;
DROP TABLE IF EXISTS edic_registros_aprob;
CREATE TABLE edic_registros_aprob (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	entidad VARCHAR(20) NOT NULL,
	entidad_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NOT NULL,
	titulo VARCHAR(21) NOT NULL,
	valor_aceptado VARCHAR(20) NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/* RECHAZO DE EDICIONES */;
DROP TABLE IF EXISTS edic_registros_rech;
CREATE TABLE edic_registros_rech (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	entidad VARCHAR(20) NOT NULL,
	entidad_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NOT NULL,
	titulo VARCHAR(21) NOT NULL,
	valor_rechazado VARCHAR(20) NOT NULL,
	valor_aceptado VARCHAR(20) NOT NULL,
	
	motivo_id TINYINT UNSIGNED NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (motivo_id) REFERENCES edic_motivos_rech(id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
