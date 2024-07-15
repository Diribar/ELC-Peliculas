ALTER TABLE c19353_elc.prod_1peliculas DROP FOREIGN KEY prod_1peliculas_ibfk_16;
ALTER TABLE c19353_elc.prod_1peliculas DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.prod_2colecciones DROP FOREIGN KEY prod_2colecciones_ibfk_15;
ALTER TABLE c19353_elc.prod_2colecciones DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.prod_3capitulos DROP FOREIGN KEY prod_3capitulos_ibfk_17;
ALTER TABLE c19353_elc.prod_3capitulos DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.rclv_1personajes DROP FOREIGN KEY rclv_1personajes_ibfk_06;
ALTER TABLE c19353_elc.rclv_1personajes DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.rclv_2hechos DROP FOREIGN KEY rclv_2hechos_ibfk_10;
ALTER TABLE c19353_elc.rclv_2hechos DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.rclv_3temas DROP FOREIGN KEY rclv_3temas_ibfk_9;
ALTER TABLE c19353_elc.rclv_3temas DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.rclv_4eventos DROP FOREIGN KEY rclv_4eventos_ibfk_7;
ALTER TABLE c19353_elc.rclv_4eventos DROP COLUMN motivo_id;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano DROP FOREIGN KEY rclv_5epocas_del_ano_ibfk_9;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano DROP COLUMN motivo_id;

RENAME TABLE c19353_elc.cam_hist_status TO c19353_elc.st_historial;
ALTER TABLE c19353_elc.st_historial MODIFY COLUMN statusFinalEn datetime DEFAULT utc_timestamp() NOT NULL;
RENAME TABLE c19353_elc.cam_hist_edics TO c19353_elc.edics_historial;
RENAME TABLE c19353_elc.cam_motivos_edics TO c19353_elc.edics_motivos;
RENAME TABLE c19353_elc.cam_motivos_status TO c19353_elc.st_motivos;
ALTER TABLE c19353_elc.st_motivos CHANGE agregarComent comentNeces tinyint(1) DEFAULT 0 NULL;
ALTER TABLE c19353_elc.st_motivos ADD grupo varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.st_motivos CHANGE grupo grupo varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER descripcion;

CREATE TABLE c19353_elc.st_errores (
	id int(10) unsigned auto_increment NOT NULL,
	entidad varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	entidad_id int(10) unsigned NOT NULL,
	nombre varchar(35) NOT NULL,
	fechaRef datetime NOT NULL,
	`ST` tinyint(1) DEFAULT NULL,
  	`IN` tinyint(1) DEFAULT NULL,
  	`RC` tinyint(1) DEFAULT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
