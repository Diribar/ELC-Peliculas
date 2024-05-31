RENAME TABLE c19353_elc.prod_categ1 TO c19353_elc.prod_categorias;

CREATE TABLE `prod_caps_sin_link` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `coleccion_id` int(10) unsigned NOT NULL,
  `linksTrailer` tinyint(1) unsigned DEFAULT NULL,
  `linksGral` tinyint(1) unsigned DEFAULT NULL,
  `linksGratis` tinyint(1) unsigned DEFAULT NULL,
  `linksCast` tinyint(1) unsigned DEFAULT NULL,
  `linksSubt` tinyint(1) unsigned DEFAULT NULL,
  `HD_Gral` tinyint(1) unsigned DEFAULT NULL,
  `HD_Gratis` tinyint(1) unsigned DEFAULT NULL,
  `HD_Cast` tinyint(1) unsigned DEFAULT NULL,
  `HD_Subt` tinyint(1) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_caps_sin_link1` (`coleccion_id`),
  CONSTRAINT `prod_caps_sin_link1` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;