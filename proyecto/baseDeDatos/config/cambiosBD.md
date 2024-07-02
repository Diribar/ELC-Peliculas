cam_motivos_status
- revisar campos
- actualizar registros

RENAME TABLE c19353_elc.cam_hist_status TO c19353_elc.st_historial;
RENAME TABLE c19353_elc.cam_motivos_status TO c19353_elc.st_motivos;
RENAME TABLE c19353_elc.cam_hist_edics TO c19353_elc.edics_historial;
RENAME TABLE c19353_elc.cam_motivos_edics TO c19353_elc.edics_motivos;

CREATE TABLE c19353_elc.st_correc_motivo (
	id int(10) unsigned auto_increment NOT NULL,
	entidad varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	entidad_id int(10) unsigned NOT NULL,
	nombre varchar(35) NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
CREATE TABLE c19353_elc.st_correc_status (
	id int(10) unsigned auto_increment NOT NULL,
	entidad varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	entidad_id int(10) unsigned NOT NULL,
	nombre varchar(35) NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY (id)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
