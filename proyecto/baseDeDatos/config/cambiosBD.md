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
RENAME TABLE c19353_elc.cam_hist_edics TO c19353_elc.edics_historial;
RENAME TABLE c19353_elc.cam_motivos_edics TO c19353_elc.edics_motivos;
RENAME TABLE c19353_elc.cam_motivos_status TO c19353_elc.st_motivos;
ALTER TABLE c19353_elc.st_motivos CHANGE agregarComent comentNeces tinyint(1) DEFAULT 0 NULL;
ALTER TABLE c19353_elc.st_motivos ADD grupo varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.st_motivos CHANGE grupo grupo varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER descripcion;

DELETE FROM c19353_elc.st_motivos;
INSERT INTO c19353_elc.st_motivos VALUES(10, 12, 'Distorsiona la memoria de lo ocurrido', 'generales', NULL, 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(11, 18, 'No pertenece a esta colección', 'técnicos', 'capitulos', 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(12, 11, 'Distorsiona la memoria del personaje', 'generales', NULL, 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(13, 17, 'Duplicado', 'técnicos', 'duplicado', 1, 1, 0, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(14, 13, 'Sensualidad vulgar', 'generales', NULL, 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(15, 18, 'Es un capítulo de una colección', 'técnicos', 'peliculas', 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(16, 14, 'Inocua, no deja una huella positiva', 'generales', NULL, 1, 0, 0, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(17, 16, 'Sin link y no la conocemos', 'generales', NULL, 1, 0, 0, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(18, 18, 'No es una colección', 'técnicos', 'colecciones', 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(19, 15, 'Valores contrarios a los del evangelio', 'generales', NULL, 1, 0, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(20, 19, 'Otro motivo técnico', 'técnicos', 'otro', 1, 1, 0, 0.0, 1);
INSERT INTO c19353_elc.st_motivos VALUES(21, 21, 'Sin película/colección', '-', NULL, 0, 1, 0, 0.1, 0);
INSERT INTO c19353_elc.st_motivos VALUES(31, 31, 'Video no disponible', '-', NULL, 0, 0, 1, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(32, 32, 'Tenemos otro link mejor', '-', NULL, 0, 0, 1, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(33, 33, 'Pertenece a otra película', '-', NULL, 0, 0, 1, 0.2, 0);
INSERT INTO c19353_elc.st_motivos VALUES(34, 34, 'No respeta los derechos de autor', '-', NULL, 0, 0, 1, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(35, 35, 'Mala calidad', '-', NULL, 0, 0, 1, 0.0, 0);
INSERT INTO c19353_elc.st_motivos VALUES(90, 90, 'Otro motivo no técnico', 'generales', 'otro', 1, 1, 0, 0.0, 1);

CREATE TABLE c19353_elc.st_errores (
	id int(10) unsigned auto_increment NOT NULL,
	entidad varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	entidad_id int(10) unsigned NOT NULL,
	nombre varchar(35) NOT NULL,
	fechaRef datetime NOT NULL,
	SD tinyint(1) DEFAULT NULL,
	IN tinyint(1) DEFAULT NULL,
	RC tinyint(1) DEFAULT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
