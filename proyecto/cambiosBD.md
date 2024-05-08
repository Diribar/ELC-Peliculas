Tabla CANONS
ALTER TABLE c19353_elc.rclv_canons ADD MS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FS varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE c19353_elc.rclv_canons ADD MP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE c19353_elc.rclv_canons ADD FP varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('ST', 1, 'Santo/a', 'Santo', 'Santa', 'Santos', 'Santas');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('BT', 2, 'Beato/a', 'Beato', 'Beata', 'Beatos', 'Beatas');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('VN', 3, 'Venerable', 'Venerable', 'Venerable', 'Venerables', 'Venerables');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('SD', 4, 'Siervo/a de Dios', 'Siervo de Dios', 'Sierva de Dios', 'Siervos de Dios', 'Siervas de Dios');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('NN', 5, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno');
INSERT INTO c19353_elc.rclv_canons (id, orden, nombre, MS, FS, MP, FP) VALUES('VC', 99, '', '', '', '', '');

Tabla GENEROS
RENAME TABLE c19353_elc.aux_sexos TO c19353_elc.aux_generos;
ALTER TABLE c19353_elc.aux_generos CHANGE letra_final letraFinal varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN varon;
ALTER TABLE c19353_elc.aux_generos DROP COLUMN mujer;
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, varon, mujer, letraFinal) VALUES('F', 2, 'Mujer', 0, 1, 'a');
UPDATE c19353_elc.aux_generos SET orden=3, nombre='Grupo', varon=1, mujer=1, letraFinal=NULL WHERE id='X';

Tablas ROLES_IGLESIA
ALTER TABLE c19353_elc.aux_roles_iglesia ADD M varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.aux_roles_iglesia ADD F varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER M;
ALTER TABLE c19353_elc.aux_roles_iglesia CHANGE plural X varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LA', 1, 'Laico/a', 'Laico', 'Laica', 'Laicos', 1, 1, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LS', 2, 'Laico/a soltero/a', 'Laico soltero', 'Laica soltera', 'Laicos solteros', 6, 0, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('LC', 3, 'Laico/a casado/a', 'Laico casado', 'Laica casada', 'Laicos casados', 11, 0, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('RE', 4, 'Religioso/a', 'Religioso', 'Religiosa', 'Religiosos', 16, 1, 1, 1, 1);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('SC', 5, 'Sacerdote', 'Sacerdote', NULL, 'Sacerdotes', 21, 1, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('PP', 6, 'Papa', 'Papa', '', 'Papas', 26, 0, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('AP', 7, 'Apóstol', 'Apóstol', NULL, 'Apóstoles', 31, 0, 1, 1, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('SF', 8, 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 'Sagrada Familia', 36, 0, 1, 0, 0);
INSERT INTO c19353_elc.aux_roles_iglesia VALUES('NN', 9, 'Ninguno', 'Ninguno', 'Ninguno', 'Ninguno', 41, 1, 1, 1, 1);

Cambio de nombre
ALTER TABLE c19353_elc.rclv_1personajes CHANGE sexo_id genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER apodo;
ALTER TABLE c19353_elc.usuarios CHANGE sexo_id genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;

Cambio de valor genero_id
UPDATE c19353_elc.rclv_1personajes SET genero_id='F' WHERE genero_id='M';
UPDATE c19353_elc.usuarios SET genero_id='F' WHERE genero_id='M';
DELETE FROM c19353_elc.aux_generos WHERE id='M';
INSERT INTO c19353_elc.aux_generos (id, orden, nombre, varon, mujer, letraFinal) VALUES('M', 1, 'Varón', 1, 0, 'o');
UPDATE c19353_elc.rclv_1personajes SET genero_id='M' WHERE genero_id='V';
UPDATE c19353_elc.usuarios SET genero_id='M' WHERE genero_id='V';
DELETE FROM c19353_elc.aux_generos WHERE id='V';

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

Tablas RCLV
ALTER TABLE c19353_elc.rclv_2hechos ADD genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_2hechos ADD CONSTRAINT rclv_2hechos_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_3temas ADD genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_3temas ADD CONSTRAINT rclv_3temas_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_4eventos ADD genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_4eventos ADD CONSTRAINT rclv_4eventos_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_5epocas_del_ano ADD CONSTRAINT rclv_5epocas_del_ano_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE sexo_id genero_id varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER apodo;
ALTER TABLE c19353_elc.rclv_9edicion ADD CONSTRAINT rclv_9edicion_genero_fk FOREIGN KEY (genero_id) REFERENCES c19353_elc.aux_generos(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE c19353_elc.rclv_1personajes CHANGE apodo nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.rclv_2hechos ADD nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER nombre;
ALTER TABLE c19353_elc.rclv_9edicion CHANGE apodo nombreAltern varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;

ALTER TABLE c19353_elc.rclv_4eventos MODIFY COLUMN nombre varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
