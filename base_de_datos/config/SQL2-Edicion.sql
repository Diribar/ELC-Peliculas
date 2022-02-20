USE ELC_Peliculas;

DROP TABLE IF EXISTS EDIC_personajes_historicos
DROP TABLE IF EXISTS EDIC_hechos_historicos
DROP TABLE IF EXISTS EDIC_valores

CREATE TABLE EDIC_personajes_historicos (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	ano SMALLINT NULL,
	nombre VARCHAR(30) NULL UNIQUE,
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
CREATE TABLE EDIC_hechos_historicos (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	ano SMALLINT NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	status_registro_id TINYINT UNSIGNED DEFAULT 2,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES dias_del_ano(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE EDIC_valores (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	ELC_id INT UNSIGNED NOT NULL,
	nombre VARCHAR(30) NOT NULL UNIQUE,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
	status_registro_id TINYINT UNSIGNED DEFAULT 2,
	capturado_por_id INT UNSIGNED NULL,
	capturado_en DATETIME NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (capturado_por_id) REFERENCES usuarios(id),
	FOREIGN KEY (status_registro_id) REFERENCES status_registro_prod(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

