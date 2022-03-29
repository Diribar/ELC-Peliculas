USE ELC_Peliculas;

/* FEEDBACK SOBRE INPUTS */;
DROP TABLE IF EXISTS inputs_rech;
DROP TABLE IF EXISTS inputs_rech_motivos;
CREATE TABLE inputs_rech_motivos (
	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	orden TINYINT UNSIGNED NOT NULL,
	comentario VARCHAR(41) NOT NULL,
	prod BOOLEAN DEFAULT 0,
	rclv BOOLEAN DEFAULT 0,
	links BOOLEAN DEFAULT 0,
	duracion SMALLINT UNSIGNED NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO inputs_rech_motivos (id, orden, duracion, comentario, prod, rclv, links)
VALUES
(1, 10, 0, 'Otro motivo', 1, 1, 1)
;
INSERT INTO inputs_rech_motivos (id, orden, duracion, comentario, prod)
VALUES
(11, 1, 0, 'Producto duplicado', 1),
(12, 2, 0, 'Errores de ortografía y/o gramática', 1),
(15, 5, 1, 'Producto ajeno a nuestro perfil', 1),
(16, 6, 90, 'Producto ofensivo a nuestro perfil', 1),
(17, 7, 180, 'Producto ofensivo con pornografía', 1)
;
INSERT INTO inputs_rech_motivos (id, orden, duracion, comentario, links)
VALUES
(21, 1, 0, 'Link reemplazado por otro más acorde', 1),
(22, 2, 0, 'Link a video no disponible', 1),
(23, 3, 10, 'Link a video sin relación con el producto', 1),
(24, 4, 10, 'Link a sitio inexistente', 1)
;
INSERT INTO inputs_rech_motivos (id, orden, duracion, comentario, rclv)
VALUES
(31, 1, 0, 'Registro duplicado', 1),
(32, 2, 5, 'Datos fáciles sin completar', 1),
(33, 3, 5, 'Información con errores', 1),
(34, 4, 10, 'Campos con spam', 1)
;

CREATE TABLE inputs_rech (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_entidad VARCHAR(20) NOT NULL,
	elc_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NOT NULL,
	motivo_id TINYINT UNSIGNED NOT NULL,
	duracion SMALLINT UNSIGNED NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,

	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (motivo_id) REFERENCES inputs_rech_motivos(id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS inputs_aprob;
CREATE TABLE inputs_aprob (
	id INT UNSIGNED UNIQUE AUTO_INCREMENT,
	elc_entidad VARCHAR(20) NOT NULL,
	elc_id INT UNSIGNED NOT NULL,
	campo VARCHAR(20) NOT NULL,
	
	input_por_id INT UNSIGNED NOT NULL,
	input_en DATETIME NULL,
	evaluado_por_id INT UNSIGNED NOT NULL,
	evaluado_en DATETIME NULL,
	
	comunicado BOOLEAN DEFAULT 0,

	PRIMARY KEY (id),
	FOREIGN KEY (input_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (evaluado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
