USE ELC_Peliculas;

/* EDICION DE RCLV */;
DROP TABLE IF EXISTS rclv_4edicion;
CREATE TABLE rclv_4edicion (
	id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
	personaje_id INT UNSIGNED DEFAULT NULL,
	hecho_id INT UNSIGNED DEFAULT NULL,
	valor_id INT UNSIGNED DEFAULT NULL,
	dia_del_ano_id SMALLINT UNSIGNED NULL,
	ano SMALLINT NULL,
	nombre VARCHAR(30) NULL UNIQUE,
	proceso_canonizacion_id VARCHAR(3) NULL,
	rol_iglesia_id VARCHAR(3) NULL,

	editado_por_id INT UNSIGNED NOT NULL,
	editado_en DATETIME NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (dia_del_ano_id) REFERENCES rclv_dias(id),
	FOREIGN KEY (proceso_canonizacion_id) REFERENCES rclv_proc_canoniz(id),
	FOREIGN KEY (rol_iglesia_id) REFERENCES aux_roles_iglesia(id),
	FOREIGN KEY (editado_por_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
