CREATE TABLE `aux_capturas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `familia` varchar(20) NOT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prod_8complem_capturadoPor_id` (`capturadoPor_id`) USING BTREE,
  CONSTRAINT `prod_8complem_capturadoPor_id_copy` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
