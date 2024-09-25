-- c19353_elc.`aux_navegs_por hora` definition

CREATE TABLE `aux_navegs_por hora` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `diaSem` varchar(3) NOT NULL,
  `hora` smallint(2) unsigned NOT NULL,
  `cantClientes` smallint(5) unsigned DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB D