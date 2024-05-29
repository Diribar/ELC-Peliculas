ALTER TABLE c19353_elc.links_categorias MODIFY COLUMN nombre varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
UPDATE c19353_elc.links_categorias SET nombre='primRev' WHERE id=1;
UPDATE c19353_elc.links_categorias SET nombre='estrRec' WHERE id=2;
