RENAME TABLE c19353_elc.aux_sexos TO c19353_elc.aux_generos;

Tabla CANONS
ALTER TABLE c19353_elc.rclv_canons ADD MS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MFP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;

Tablas ROLES_IGLESIA
ALTER TABLE c19353_elc.aux_roles_iglesia ADD MS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_roles_iglesia ADD FS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_roles_iglesia ADD MP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_roles_iglesia ADD FP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_roles_iglesia ADD MFP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN plural;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN grupo;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN usuario;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN personaje;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN varon;
ALTER TABLE c19353_elc.aux_roles_iglesia DROP COLUMN mujer;

Tabla GENEROS
ALTER TABLE c19353_elc.aux_generos MODIFY COLUMN id varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE c19353_elc.aux_generos CHANGE letra_final letraFinal varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN varon;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN mujer;

Tabla USUARIOS
ALTER TABLE c19353_elc.usuarios CHANGE sexo_id genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;

Tablas RCLV
ALTER TABLE c19353_elc.rclv_1personajes CHANGE apodo nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_1personajes CHANGE sexo_id genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_1personajes ADD hoy varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER apMar_id;

ALTER TABLE c19353_elc.rclv_2hechos ADD nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_2hechos ADD genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_2hechos ADD CONSTRAINT rclv_2hechos_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_2hechos ADD hoy varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER ama;

ALTER TABLE c19353_elc.rclv_3temas ADD genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_3temas ADD CONSTRAINT rclv_3temas_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE c19353_elc.rclv_4eventos MODIFY COLUMN nombre varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE c19353_elc.rclv_4eventos ADD genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_4eventos ADD CONSTRAINT rclv_4eventos_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_4eventos ADD hoy varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER avatar;

ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD CONSTRAINT rclv_5epocas_del_ano_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE c19353_elc.rclv_9edicion CHANGE apodo nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE sexo_id genero_id varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombreAltern;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE avatar avatar varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER prioridad_id;
ALTER TABLE c19353_elc.rclv_9edicion ADD hoy varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER avatar;


Tabla Canons
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('ST', 1, 'Santo/a', 'Santo', 'Santa', 'Santos', 'Santas');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('BT', 2, 'Beato/a', 'Beato', 'Beata', 'Beatos', 'Beatas');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('VN', 3, 'Venerable', 'Venerable', 'Venerable', 'Venerables', 'Venerables');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('SD', 4, 'Siervo/a de Dios', 'Siervo de Dios', 'Sierva de Dios', 'Siervos de Dios', 'Siervas de Dios');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('NN', 5, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('VC', 99, '', '', '', '', '');

Tabla Roles Iglesia
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LA', 1, 'Laico/a', 'Laico', 'Laica', 'Laicos', 'Laicas', 'Laicos', 1, 1, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LS', 2, 'Laico/a soltero/a', 'Laico soltero', 'Laica soltera', 'Laicos solteros', 'Laicas solteras', 'Laicos solteros', 6, 0, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LC', 3, 'Laico/a casado/a', 'Laico casado', 'Laica casada', 'Laicos casados', 'Laicas casadas', 'Laicos casados', 11, 0, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('RE', 4, 'Religioso/a', 'Religioso', 'Religiosa', 'Religiosos', 'Religiosas', 'Religiosos', 16, 1, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('SC', 5, 'Sacerdote', 'Sacerdote', NULL, 'Sacerdotes', NULL, NULL, 21, 1, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('PP', 6, 'Papa', 'Papa', NULL, 'Papas', NULL, NULL, 26, 0, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('AP', 7, 'Apóstol', 'Apóstol', NULL, 'Apóstoles', NULL, NULL, 31, 0, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('SF', 8, 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 36, 0, 1, 0, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('NN', 9, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 41, 1, 1, 1, 1);

Tabla Generos
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, letraFinal) VALUES('MS', 3, 'Varón', 'o');
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, letraFinal) VALUES('FS', 4, 'Mujer', 'a');
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, letraFinal) VALUES('MP', 5, 'Varón', 'os');
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, letraFinal) VALUES('FP', 6, 'Mujer', 'as');
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, letraFinal) VALUES('MFP', 7, 'Varón y Mujer', 'os');

Cambio de valor genero_id
UPDATE c19353_elc.rclv_1personajes SET genero_id='FS' WHERE genero_id='M';
UPDATE c19353_elc.rclv_1personajes SET genero_id='MS' WHERE genero_id='V';
UPDATE c19353_elc.usuarios SET genero_id='F' WHERE genero_id='M';
UPDATE c19353_elc.usuarios SET genero_id='M' WHERE genero_id='V';

Cambio de valor en canon_id y rolIglesia_id
UPDATE c19353_elc.rclv_1personajes SET canon_id='ST' WHERE canon_id LIKE 'ST_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='BT' WHERE canon_id LIKE 'BT_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='VN' WHERE canon_id LIKE 'VN_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='SD' WHERE canon_id LIKE 'SD_';
UPDATE c19353_elc.rclv_1personajes SET canon_id='NN' WHERE canon_id LIKE 'NN_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='AP' WHERE rolIglesia_id LIKE 'AP_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LA' WHERE rolIglesia_id LIKE 'LA_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LC' WHERE rolIglesia_id LIKE 'LC_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='LS' WHERE rolIglesia_id LIKE 'LS_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='NN' WHERE rolIglesia_id LIKE 'NN_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='RE' WHERE rolIglesia_id LIKE 'RE_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='SC' WHERE rolIglesia_id LIKE 'SC_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='SF' WHERE rolIglesia_id LIKE 'SF_';
UPDATE c19353_elc.rclv_1personajes SET rolIglesia_id='PP' WHERE rolIglesia_id LIKE 'PP_';

Eliminar
DELETE FROM c19353_elc.rclv_canons WHERE CHAR_LENGTH(id) > 2;
DELETE FROM c19353_elc.aux_roles_iglesia WHERE CHAR_LENGTH(id) > 2;