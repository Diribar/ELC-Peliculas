ALTER TABLE c19353_elc.aux_novedades CHANGE versionELC versionElc varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;

ALTER TABLE c19353_elc.usuarios CHANGE visita_id cliente_id varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.usuarios CHANGE versionElcUltimoLogin versionElc varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER cliente_id;
ALTER TABLE c19353_elc.usuarios CHANGE fechaUltimoLogin fechaUltNaveg date DEFAULT utc_date() NULL;
ALTER TABLE c19353_elc.usuarios CHANGE fechaUltNaveg fechaUltNaveg date DEFAULT utc_date() NULL AFTER versionElc;
ALTER TABLE c19353_elc.usuarios CHANGE rolUsuario_id rolUsuario_id tinyint(3) unsigned DEFAULT 1 NULL AFTER fechaUltNaveg;
ALTER TABLE c19353_elc.usuarios ADD diasSinCartelBenefs smallint(5) unsigned DEFAULT 0 NULL AFTER rolUsuario_id;
ALTER TABLE c19353_elc.usuarios CHANGE diasLogin diasNaveg smallint(5) unsigned DEFAULT 1 NULL AFTER fechaRevisores;
RENAME TABLE c19353_elc.usuarios TO c19353_elc.us_usuarios;
ALTER TABLE c19353_elc.us_usuarios MODIFY COLUMN diasNaveg smallint(5) unsigned NOT NULL;
ALTER TABLE c19353_elc.us_usuarios ADD visitaCreadaEn datetime NULL AFTER diasNaveg;
UPDATE c19353_elc.us_usuarios SET visitaCreadaEn=creadoEn;
ALTER TABLE c19353_elc.us_usuarios MODIFY COLUMN visitaCreadaEn datetime NOT NULL;

RENAME TABLE c19353_elc.aux_logins_del_dia TO c19353_elc.aux_navegs_del_dia;
ALTER TABLE c19353_elc.aux_navegs_del_dia CHANGE visita_id cliente_id varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER id;
ALTER TABLE c19353_elc.aux_navegs_del_dia MODIFY COLUMN cliente_id varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER id;
ALTER TABLE c19353_elc.aux_navegs_del_dia CHANGE fecha fecha varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER usuario_id;
ALTER TABLE c19353_elc.aux_navegs_del_dia ADD visitaCreadaEn varchar(10) NOT NULL;
ALTER TABLE c19353_elc.aux_navegs_del_dia ADD diasNaveg smallint(5) unsigned NOT NULL;

RENAME TABLE c19353_elc.aux_logins_acums TO c19353_elc.aux_navegs_acums;
ALTER TABLE c19353_elc.aux_navegs_acums CHANGE usLogueado logins smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums MODIFY COLUMN usSinLogin smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums CHANGE visitaSinUs visitas smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD altasDelDia smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD transicion smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD unoATres smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD unoADiez smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD masDeDiez smallint(5) unsigned DEFAULT 0 NULL;
ALTER TABLE c19353_elc.aux_navegs_acums ADD masDeTreinta smallint(5) unsigned DEFAULT 0 NULL;

CREATE TABLE c19353_elc.us_visitas (
	id int(10) unsigned auto_increment NOT NULL,
	cliente_id varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL,
	versionElc varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
	fechaUltNaveg date DEFAULT utc_date() NULL,
	rolUsuario_id tinyint(3) unsigned DEFAULT 1 NULL,
	diasSinCartelBenefs smallint(5) unsigned DEFAULT 1 NULL,
	diasNaveg smallint(5) unsigned DEFAULT 1 NULL,
	visitaCreadaEn datetime DEFAULT utc_timestamp() NULL,
	mostrarCartelBienvenida tinyint(1) DEFAULT 1 NULL,
	mostrarCartelCookies tinyint(1) DEFAULT 1 NULL,

	CONSTRAINT `PRIMARY` PRIMARY KEY (id),
	CONSTRAINT cliente_id UNIQUE KEY (cliente_id),
	CONSTRAINT rolUsuario_id FOREIGN KEY (rolUsuario_id) REFERENCES c19353_elc.us_roles(id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE c19353_elc.aux_fidelidad_clientes (
  fecha date NOT NULL,
  id smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  anoMes varchar(7) NOT NULL,
  altasDelDia smallint(5) unsigned DEFAULT 0,
  transicion smallint(5) unsigned DEFAULT 0,
  unoATres smallint(5) unsigned DEFAULT 0,
  unoADiez smallint(5) unsigned DEFAULT 0,
  masDeDiez smallint(5) unsigned DEFAULT 0,
  masDeTreinta smallint(5) unsigned DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
