USE c19353_elc;

ALTER TABLE c19353_elc.aux_generos ADD nombre varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL;
ALTER TABLE c19353_elc.aux_generos CHANGE nombre nombre varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL NULL AFTER orden;
