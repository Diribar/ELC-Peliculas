CREATE TABLE `links_categorias` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

INSERT INTO c19353_elc.links_categorias (nombre) VALUES('recienCreado');
INSERT INTO c19353_elc.links_categorias (nombre) VALUES('estrenoReciente');
INSERT INTO c19353_elc.links_categorias (nombre) VALUES('estandar');

ALTER TABLE c19353_elc.links ADD categoria_id tinyint(1) unsigned DEFAULT 1 NOT NULL AFTER anoEstreno;
ALTER TABLE c19353_elc.links ADD CONSTRAINT links_categorias_fk FOREIGN KEY (categoria_id) REFERENCES c19353_elc.links_categorias(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
