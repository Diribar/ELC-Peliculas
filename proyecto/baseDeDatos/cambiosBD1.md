CREATE TABLE `prod_9complem` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `grupoCol_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `azar` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_9complemPeliculas` (`pelicula_id`),
  KEY `prod_9complemColecciones` (`coleccion_id`),
  KEY `prod_9complemCapitulos` (`capitulo_id`),
  CONSTRAINT `prod_9complemCapitulos` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `prod_9complemColecciones` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_9complemPeliculas` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1418 DEFAULT CHARSET=utf8mb4;
