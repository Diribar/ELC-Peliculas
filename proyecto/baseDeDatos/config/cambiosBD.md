RENAME TABLE c19353_elc.prod_categ1 TO c19353_elc.prod_categorias;
ALTER TABLE c19353_elc.prod_2colecciones DROP COLUMN capSinLink_id;

CREATE TABLE `prod_caps_sin_link` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `coleccion_id` int(10) unsigned NOT NULL,
  `linksTrailer` int(10) unsigned DEFAULT NULL,
  `linksGral` int(10) unsigned DEFAULT NULL,
  `linksGratis` int(10) unsigned DEFAULT NULL,
  `linksCast` int(10) unsigned DEFAULT NULL,
  `linksSubt` int(10) unsigned DEFAULT NULL,
  `HD_Gral` int(10) unsigned DEFAULT NULL,
  `HD_Gratis` int(10) unsigned DEFAULT NULL,
  `HD_Cast` int(10) unsigned DEFAULT NULL,
  `HD_Subt` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prod_caps_sin_link_unique` (`coleccion_id`),
  CONSTRAINT `prod_caps_sin_link1` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4;

FN creaCapSinLink