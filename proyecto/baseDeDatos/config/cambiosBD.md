USE c19353_elc

- Misceláneas ------------------------------------
RENAME TABLE aux_sexos TO aux_generos;
RENAME TABLE aux_novedades_elc TO aux_novedades;
RENAME TABLE aux_roles_iglesia TO rclv_roles_iglesia;

- Tabla GENEROS
ALTER TABLE aux_generos MODIFY COLUMN id varchar(3) NOT NULL;
ALTER TABLE aux_generos MODIFY COLUMN nombre varchar(10) NOT NULL;
ALTER TABLE aux_generos CHANGE nombre pers varchar(10) DEFAULT NULL NULL;
ALTER TABLE aux_generos ADD rclvs varchar(10) DEFAULT NULL NULL AFTER pers;
ALTER TABLE aux_generos ADD loLa varchar(3) DEFAULT NULL NULL AFTER rclvs;
ALTER TABLE aux_generos CHANGE letra_final letraFinal varchar(2) DEFAULT NULL NULL;
ALTER TABLE aux_generos DROP COLUMN varon;
ALTER TABLE aux_generos DROP COLUMN mujer;

- Tabla CANONS
ALTER TABLE rclv_canons MODIFY COLUMN orden tinyint(1) unsigned NOT NULL;
ALTER TABLE rclv_canons ADD MS varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_canons ADD FS varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_canons ADD MP varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_canons ADD FP varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_canons ADD MFP varchar(20) DEFAULT NULL NULL;

- Tablas ROLES_IGLESIA
ALTER TABLE rclv_roles_iglesia ADD MS varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_roles_iglesia ADD FS varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_roles_iglesia ADD MP varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_roles_iglesia ADD FP varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_roles_iglesia ADD MFP varchar(20) DEFAULT NULL NULL;
ALTER TABLE rclv_roles_iglesia DROP COLUMN plural;
ALTER TABLE rclv_roles_iglesia DROP COLUMN grupo;
ALTER TABLE rclv_roles_iglesia DROP COLUMN usuario;
ALTER TABLE rclv_roles_iglesia DROP COLUMN personaje;
ALTER TABLE rclv_roles_iglesia DROP COLUMN varon;
ALTER TABLE rclv_roles_iglesia DROP COLUMN mujer;

- Tabla HOY-ESTAMOS
CREATE TABLE rclv_hoy_estamos (id tinyint(3) unsigned auto_increment NOT NULL, CONSTRAINT `PRIMARY` PRIMARY KEY (id))
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='';
ALTER TABLE rclv_hoy_estamos ADD entidad varchar(20) NOT NULL;
ALTER TABLE rclv_hoy_estamos ADD genero_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE rclv_hoy_estamos ADD nombre varchar(35) NOT NULL;
ALTER TABLE rclv_hoy_estamos ADD CONSTRAINT rclv_hoy_estamos_generos FOREIGN KEY (genero_id) REFERENCES aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tablas PERSONAJES
ALTER TABLE rclv_1personajes CHANGE apodo nombreAltern varchar(35) DEFAULT NULL NULL;
ALTER TABLE rclv_1personajes MODIFY COLUMN sexo_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE rclv_1personajes CHANGE sexo_id genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE rclv_1personajes ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER apMar_id;

- Tabla HECHOS
ALTER TABLE rclv_2hechos ADD nombreAltern varchar(35) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE rclv_2hechos ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE rclv_2hechos ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER ama;
ALTER TABLE rclv_2hechos ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER hoyEstamos_id;
ALTER TABLE rclv_2hechos ADD CONSTRAINT rclv_2hechos_genero FOREIGN KEY (genero_id) REFERENCES aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE rclv_2hechos ADD CONSTRAINT rclv_2hechos_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla TEMAS
ALTER TABLE rclv_3temas ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE rclv_3temas ADD CONSTRAINT rclv_3temas_genero_fk FOREIGN KEY (genero_id) REFERENCES aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla EVENTOS
ALTER TABLE rclv_4eventos MODIFY COLUMN nombre varchar(45) NOT NULL;
ALTER TABLE rclv_4eventos ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE rclv_4eventos ADD CONSTRAINT rclv_4eventos_genero_fk FOREIGN KEY (genero_id) REFERENCES aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE rclv_4eventos ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER avatar;
ALTER TABLE rclv_4eventos ADD CONSTRAINT rclv_4eventos_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla ÉPOCAS DEL AÑO
ALTER TABLE rclv_5epocas_del_ano ADD genero_id varchar(3) DEFAULT NULL NULL AFTER nombre;
ALTER TABLE rclv_5epocas_del_ano ADD CONSTRAINT rclv_5epocas_del_ano_genero_fk FOREIGN KEY (genero_id) REFERENCES aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Tabla EDICION RCLV
ALTER TABLE rclv_9edicion MODIFY COLUMN nombre varchar(45) DEFAULT NULL NULL;
ALTER TABLE rclv_9edicion CHANGE apodo nombreAltern varchar(35) DEFAULT NULL NULL;
ALTER TABLE rclv_9edicion MODIFY COLUMN sexo_id varchar(3) DEFAULT NULL NULL;
ALTER TABLE rclv_9edicion CHANGE sexo_id genero_id varchar(3) DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE rclv_9edicion CHANGE avatar avatar varchar(25) DEFAULT NULL NULL AFTER prioridad_id;
ALTER TABLE rclv_9edicion ADD hoyEstamos_id tinyint(3) unsigned DEFAULT NULL NULL AFTER ama;
ALTER TABLE rclv_9edicion ADD leyNombre varchar(70) DEFAULT NULL NULL AFTER hoyEstamos_id;
ALTER TABLE rclv_9edicion ADD CONSTRAINT rclv_9edicion_hoy_estamos FOREIGN KEY (hoyEstamos_id) REFERENCES rclv_hoy_estamos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

- Otras tablas
ALTER TABLE usuarios CHANGE sexo_id genero_id varchar(1) DEFAULT NULL NULL;
ALTER TABLE aux_novedades MODIFY COLUMN comentario varchar(100) NOT NULL;

MODIFICACIONES -----------------------------------

- Tabla Canons
INSERT INTO rclv_canons VALUES('ST', 1, 'Santo/a', 'Santo', 'Santa', 'Santos', 'Santas', 'Santos');
INSERT INTO rclv_canons VALUES('BT', 2, 'Beato/a', 'Beato', 'Beata', 'Beatos', 'Beatas', 'Beatos');
INSERT INTO rclv_canons VALUES('VN', 3, 'Venerable', 'Venerable', 'Venerable', 'Venerables', 'Venerables', 'Venerable');
INSERT INTO rclv_canons VALUES('SD', 4, 'Siervo/a de Dios', 'Siervo de Dios', 'Sierva de Dios', 'Siervos de Dios', 'Siervas de Dios', 'Siervos de Dios');
INSERT INTO rclv_canons VALUES('NN', 5, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');
INSERT INTO rclv_canons VALUES('VC', 9, '', '', '', '', '', '');

- Tabla Roles Iglesia
INSERT INTO rclv_roles_iglesia VALUES('LA', 1, 'Laico/a', 'Laico', 'Laica', 'Laicos', 'Laicas', 'Laicos');
INSERT INTO rclv_roles_iglesia VALUES('LS', 2, 'Laico/a soltero/a', 'Laico soltero', 'Laica soltera', 'Laicos solteros', 'Laicas solteras', 'Laicos solteros');
INSERT INTO rclv_roles_iglesia VALUES('LC', 3, 'Laico/a casado/a', 'Laico casado', 'Laica casada', 'Laicos casados', 'Laicas casadas', 'Laicos casados');
INSERT INTO rclv_roles_iglesia VALUES('RE', 4, 'Religioso/a', 'Religioso', 'Religiosa', 'Religiosos', 'Religiosas', 'Religiosos');
INSERT INTO rclv_roles_iglesia VALUES('SC', 5, 'Sacerdote', 'Sacerdote', NULL, 'Sacerdotes', NULL, NULL);
INSERT INTO rclv_roles_iglesia VALUES('PP', 6, 'Papa', 'Papa', NULL, 'Papas', NULL, NULL);
INSERT INTO rclv_roles_iglesia VALUES('AP', 7, 'Apóstol', 'Apóstol', NULL, 'Apóstoles', NULL, NULL);
INSERT INTO rclv_roles_iglesia VALUES('SF', 8, 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia');
INSERT INTO rclv_roles_iglesia VALUES('NN', 9, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');

- Tabla Generos
UPDATE aux_generos SET orden=1, pers='Varón', rclvs='Masc.', loLa=NULL, letraFinal='o' WHERE id='M';
INSERT INTO aux_generos VALUES('F', 2, 'Mujer', 'Fem.', NULL, 'a');
INSERT INTO aux_generos VALUES('P', 3, 'Grupo', 'Plural', NULL, NULL);
INSERT INTO aux_generos VALUES('MS', 4, NULL, NULL, 'lo', 'o');
INSERT INTO aux_generos VALUES('FS', 5, NULL, NULL, 'la', 'a');
INSERT INTO aux_generos VALUES('MP', 6, NULL, NULL, 'los', 'os');
INSERT INTO aux_generos VALUES('FP', 7, NULL, NULL, 'las', 'as');
INSERT INTO aux_generos VALUES('MFP', 8, NULL, NULL, 'los', 'os');

- Tabla Personajes
UPDATE rclv_1personajes SET genero_id='FS' WHERE genero_id='M';
UPDATE rclv_1personajes SET genero_id='MS' WHERE genero_id='V';
UPDATE rclv_1personajes SET genero_id='MFP' WHERE genero_id='X';
UPDATE rclv_1personajes SET canon_id='ST' WHERE canon_id LIKE 'ST_';
UPDATE rclv_1personajes SET canon_id='BT' WHERE canon_id LIKE 'BT_';
UPDATE rclv_1personajes SET canon_id='VN' WHERE canon_id LIKE 'VN_';
UPDATE rclv_1personajes SET canon_id='SD' WHERE canon_id LIKE 'SD_';
UPDATE rclv_1personajes SET canon_id='NN' WHERE canon_id LIKE 'NN_';
UPDATE rclv_1personajes SET canon_id='VC' WHERE canon_id LIKE 'VAC';
UPDATE rclv_1personajes SET rolIglesia_id='AP' WHERE rolIglesia_id LIKE 'AP_';
UPDATE rclv_1personajes SET rolIglesia_id='LA' WHERE rolIglesia_id LIKE 'LA_';
UPDATE rclv_1personajes SET rolIglesia_id='LC' WHERE rolIglesia_id LIKE 'LC_';
UPDATE rclv_1personajes SET rolIglesia_id='LS' WHERE rolIglesia_id LIKE 'LS_';
UPDATE rclv_1personajes SET rolIglesia_id='NN' WHERE rolIglesia_id LIKE 'NN_';
UPDATE rclv_1personajes SET rolIglesia_id='RE' WHERE rolIglesia_id LIKE 'RE_';
UPDATE rclv_1personajes SET rolIglesia_id='SC' WHERE rolIglesia_id LIKE 'SC_';
UPDATE rclv_1personajes SET rolIglesia_id='SF' WHERE rolIglesia_id LIKE 'SF_';
UPDATE rclv_1personajes SET rolIglesia_id='PP' WHERE rolIglesia_id LIKE 'PP_';

- Tabla Usuarios
UPDATE usuarios SET genero_id='F' WHERE genero_id='M';
UPDATE usuarios SET genero_id='M' WHERE genero_id='V';

- Tabla hoyEstamos
INSERT INTO rclv_hoy_estamos VALUES(1, 'personajes', NULL, 'Hoy recordamos');
INSERT INTO rclv_hoy_estamos VALUES(2, 'hechos', 'MS', 'Hoy recordamos el');
INSERT INTO rclv_hoy_estamos VALUES(3, 'hechos', 'MS', 'Hoy recordamos el comienzo del');
INSERT INTO rclv_hoy_estamos VALUES(4, 'hechos', 'MP', 'Hoy recordamos los');
INSERT INTO rclv_hoy_estamos VALUES(5, 'hechos', 'MP', 'Hoy recordamos el comienzo de los');
INSERT INTO rclv_hoy_estamos VALUES(6, 'hechos', 'FS', 'Hoy recordamos la');
INSERT INTO rclv_hoy_estamos VALUES(7, 'hechos', 'FS', 'Hoy recordamos el comienzo de la');
INSERT INTO rclv_hoy_estamos VALUES(8, 'hechos', 'FP', 'Hoy recordamos las');
INSERT INTO rclv_hoy_estamos VALUES(9, 'hechos', 'FP', 'Hoy recordamos el comienzo de las');
INSERT INTO rclv_hoy_estamos VALUES(10, 'temas', 'MS', 'Hoy es el día del');
INSERT INTO rclv_hoy_estamos VALUES(11, 'temas', 'MP', 'Hoy es el día de los');
INSERT INTO rclv_hoy_estamos VALUES(12, 'temas', 'FS', 'Hoy es el día de la');
INSERT INTO rclv_hoy_estamos VALUES(13, 'temas', 'FP', 'Hoy es el día de las');
INSERT INTO rclv_hoy_estamos VALUES(14, 'eventos', 'MS', 'Hoy es');
INSERT INTO rclv_hoy_estamos VALUES(15, 'eventos', 'MS', 'Hoy recordamos el');
INSERT INTO rclv_hoy_estamos VALUES(16, 'eventos', 'FS', 'Hoy es la');
INSERT INTO rclv_hoy_estamos VALUES(17, 'eventos', 'FS', 'Hoy recordamos la');
INSERT INTO rclv_hoy_estamos VALUES(18, 'epocasDelAno', NULL, 'Estamos en época de');

- ELIMINAR ---------------------------------------
DELETE FROM rclv_canons WHERE CHAR_LENGTH(id) > 2;
DELETE FROM rclv_roles_iglesia WHERE CHAR_LENGTH(id) > 2;
DELETE FROM aux_generos WHERE id='X';
DELETE FROM aux_generos WHERE id='V';
