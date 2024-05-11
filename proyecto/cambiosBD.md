- Misceláneas
RENAME TABLE c19353_elc.aux_sexos TO c19353_elc.aux_generos;
RENAME TABLE c19353_elc.aux_novedades_elc TO c19353_elc.aux_novedades;
ALTER TABLE c19353_elc.aux_novedades MODIFY COLUMN comentario varchar(100) NOT NULL;

- Tabla GENEROS
ALTER TABLE c19353_elc.aux_generos MODIFY COLUMN id varchar(3) NOT NULL;
ALTER TABLE c19353_elc.aux_generos MODIFY COLUMN nombre varchar(10) NOT NULL;
ALTER TABLE c19353_elc.aux_generos CHANGE nombre pers varchar(10) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_generos ADD rclvs varchar(10) DEFAULT NULL NULL AFTER pers;
ALTER TABLE c19353_elc.aux_generos ADD loLa varchar(3) DEFAULT NULL NULL AFTER rclvs;
ALTER TABLE c19353_elc.aux_generos CHANGE letra_final letraFinal varchar(2) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN varon;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN mujer;

- Tabla CANONS
ALTER TABLE c19353_elc.rclv_canons MODIFY COLUMN orden tinyint(1) unsigned NOT NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MS varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FS varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MP varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FP varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MFP varchar(20) DEFAULT NULL NULL;

- Tablas ROLES_IGLESIA
RENAME TABLE c19353_elc.aux_roles_iglesia TO c19353_elc.rclv_roles_iglesia;
ALTER TABLE c19353_elc.rclv_roles_iglesia ADD MS varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_roles_iglesia ADD FS varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_roles_iglesia ADD MP varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_roles_iglesia ADD FP varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_roles_iglesia ADD MFP varchar(20) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN plural;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN grupo;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN usuario;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN personaje;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN varon;
ALTER TABLE c19353_elc.rclv_roles_iglesia DROP COLUMN mujer;

- Tabla HOY-ESTAMOS
CREATE TABLE c19353_elc.rclv_hoy_estamos (id tinyint(3) unsigned auto_increment NOT NULL, CONSTRAINT `PRIMARY` PRIMARY KEY (id))
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
ALTER TABLE c19353_elc.rclv_hoy_estamos ADD entidad varchar(20) NOT NULL;
ALTER TABLE c19353_elc.rclv_hoy_estamos ADD genero_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_hoy_estamos ADD comentario varchar(35) NOT NULL;
ALTER TABLE c19353_elc.rclv_hoy_estamos ADD CONSTRAINT rclv_hoy_estamos_generos FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tablas PERSONAJES
ALTER TABLE c19353_elc.rclv_1personajes CHANGE apodo nombreAltern varchar(35) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_1personajes MODIFY COLUMN sexo_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_1personajes CHANGE sexo_id genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_1personajes ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER apMar_id;

- Tabla HECHOS
ALTER TABLE c19353_elc.rclv_2hechos ADD nombreAltern varchar(35) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_2hechos ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_2hechos ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER ama;
ALTER TABLE c19353_elc.rclv_2hechos ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER hoyEstamos_id;
ALTER TABLE c19353_elc.rclv_2hechos ADD CONSTRAINT rclv_2hechos_genero FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_2hechos ADD CONSTRAINT rclv_2hechos_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES c19353_elc.rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla TEMAS
ALTER TABLE c19353_elc.rclv_3temas ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_3temas ADD CONSTRAINT rclv_3temas_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla EVENTOS
ALTER TABLE c19353_elc.rclv_4eventos MODIFY COLUMN nombre varchar(45) NOT NULL;
ALTER TABLE c19353_elc.rclv_4eventos ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_4eventos ADD CONSTRAINT rclv_4eventos_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_4eventos ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER avatar;
ALTER TABLE c19353_elc.rclv_4eventos ADD CONSTRAINT rclv_4eventos_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES c19353_elc.rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla ÉPOCAS DEL AÑO
ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD CONSTRAINT rclv_5epocas_del_ano_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla EDICION RCLV
ALTER TABLE c19353_elc.rclv_9edicion MODIFY COLUMN nombre varchar(45) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE apodo nombreAltern varchar(35) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_9edicion MODIFY COLUMN sexo_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE sexo_id genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE avatar avatar varchar(25) DEFAULT NULL NULL AFTER prioridad_id;
ALTER TABLE c19353_elc.rclv_9edicion ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER ama;
ALTER TABLE c19353_elc.rclv_9edicion ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER hoyEstamos_id;
ALTER TABLE c19353_elc.rclv_9edicion ADD CONSTRAINT rclv_9edicion_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES c19353_elc.rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla USUARIOS
ALTER TABLE c19353_elc.usuarios CHANGE sexo_id genero_id varchar(1) DEFAULT NULL NULL;

MODIFICACIONES -----------------------------------

- Tabla Canons
INSERT INTO c19353_elc.rclv_canons VALUES('ST', 1, 'Santo/a', 'Santo', 'Santa', 'Santos', 'Santas', 'Santos');
INSERT INTO c19353_elc.rclv_canons VALUES('BT', 2, 'Beato/a', 'Beato', 'Beata', 'Beatos', 'Beatas', 'Beatos');
INSERT INTO c19353_elc.rclv_canons VALUES('VN', 3, 'Venerable', 'Venerable', 'Venerable', 'Venerables', 'Venerables', 'Venerable');
INSERT INTO c19353_elc.rclv_canons VALUES('SD', 4, 'Siervo/a de Dios', 'Siervo de Dios', 'Sierva de Dios', 'Siervos de Dios', 'Siervas de Dios', 'Siervos de Dios');
INSERT INTO c19353_elc.rclv_canons VALUES('NN', 5, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');
INSERT INTO c19353_elc.rclv_canons VALUES('VC', 9, '', '', '', '', '', '');

- Tabla Roles Iglesia
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('LA', 1, 'Laico/a', 'Laico', 'Laica', 'Laicos', 'Laicas', 'Laicos');
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('LS', 2, 'Laico/a soltero/a', 'Laico soltero', 'Laica soltera', 'Laicos solteros', 'Laicas solteras', 'Laicos solteros');
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('LC', 3, 'Laico/a casado/a', 'Laico casado', 'Laica casada', 'Laicos casados', 'Laicas casadas', 'Laicos casados');
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('RE', 4, 'Religioso/a', 'Religioso', 'Religiosa', 'Religiosos', 'Religiosas', 'Religiosos');
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('SC', 5, 'Sacerdote', 'Sacerdote', NULL, 'Sacerdotes', NULL, NULL);
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('PP', 6, 'Papa', 'Papa', NULL, 'Papas', NULL, NULL);
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('AP', 7, 'Apóstol', 'Apóstol', NULL, 'Apóstoles', NULL, NULL);
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('SF', 8, 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia');
INSERT INTO c19353_elc.rclv_roles_iglesia VALUES('NN', 9, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');

- Tabla Generos
UPDATE c19353_elc.aux_generos SET orden=1, pers='Varón', rclvs='Masc.', loLa=NULL, letraFinal='o' WHERE id='M';
INSERT INTO c19353_elc.aux_generos VALUES('F', 2, 'Mujer', 'Fem.', NULL, 'a');
INSERT INTO c19353_elc.aux_generos VALUES('P', 3, 'Grupo', 'Plural', NULL, NULL);
INSERT INTO c19353_elc.aux_generos VALUES('MS', 4, NULL, NULL, 'lo', 'o');
INSERT INTO c19353_elc.aux_generos VALUES('FS', 5, NULL, NULL, 'la', 'a');
INSERT INTO c19353_elc.aux_generos VALUES('MP', 6, NULL, NULL, 'los', 'os');
INSERT INTO c19353_elc.aux_generos VALUES('FP', 7, NULL, NULL, 'las', 'as');
INSERT INTO c19353_elc.aux_generos VALUES('MFP', 8, NULL, NULL, 'los', 'os');

- Tabla Personajes
UPDATE c19353_elc.rclv_1personajes SET genero_id='FS' WHERE genero_id='M';
UPDATE c19353_elc.rclv_1personajes SET genero_id='MS' WHERE genero_id='V';
UPDATE c19353_elc.rclv_1personajes SET genero_id='MFP' WHERE genero_id='X';
UPDATE c19353_elc.rclv_1personajes SET canon_id='ST' WHERE canon_id LIKE 'ST_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='BT' WHERE canon_id LIKE 'BT_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='VN' WHERE canon_id LIKE 'VN_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='SD' WHERE canon_id LIKE 'SD_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='NN' WHERE canon_id LIKE 'NN_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='VC' WHERE canon_id LIKE 'VAC';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='AP' WHERE rolIglesia_id LIKE 'AP_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LA' WHERE rolIglesia_id LIKE 'LA_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LC' WHERE rolIglesia_id LIKE 'LC_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LS' WHERE rolIglesia_id LIKE 'LS_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='NN' WHERE rolIglesia_id LIKE 'NN_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='RE' WHERE rolIglesia_id LIKE 'RE_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='SC' WHERE rolIglesia_id LIKE 'SC_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='SF' WHERE rolIglesia_id LIKE 'SF_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='PP' WHERE rolIglesia_id LIKE 'PP_';

- Tabla Usuarios
UPDATE c19353_elc.usuarios SET genero_id='F' WHERE genero_id='M';
UPDATE c19353_elc.usuarios SET genero_id='M' WHERE genero_id='V';

- ELIMINAR
DELETE FROM c19353_elc.rclv_canons WHERE CHAR_LENGTH(id) > 2;
DELETE FROM c19353_elc.rclv_roles_iglesia WHERE CHAR_LENGTH(id) > 2;
DELETE FROM c19353_elc.aux_generos WHERE id='X';
DELETE FROM c19353_elc.aux_generos WHERE id='V';
