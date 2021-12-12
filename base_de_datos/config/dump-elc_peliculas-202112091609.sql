-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: localhost    Database: elc_peliculas
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.17-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cal_calidad_tecnica`
--

DROP TABLE IF EXISTS `cal_calidad_tecnica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cal_calidad_tecnica` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_calidad_tecnica`
--

LOCK TABLES `cal_calidad_tecnica` WRITE;
/*!40000 ALTER TABLE `cal_calidad_tecnica` DISABLE KEYS */;
INSERT INTO `cal_calidad_tecnica` VALUES (1,3,0,'Complica el disfrute'),(2,2,50,'Afecta un poco el disfrute'),(3,1,100,'Sin problemas');
/*!40000 ALTER TABLE `cal_calidad_tecnica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_entretiene`
--

DROP TABLE IF EXISTS `cal_entretiene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cal_entretiene` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_entretiene`
--

LOCK TABLES `cal_entretiene` WRITE;
/*!40000 ALTER TABLE `cal_entretiene` DISABLE KEYS */;
INSERT INTO `cal_entretiene` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_entretiene` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_fe_valores`
--

DROP TABLE IF EXISTS `cal_fe_valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cal_fe_valores` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_fe_valores`
--

LOCK TABLES `cal_fe_valores` WRITE;
/*!40000 ALTER TABLE `cal_fe_valores` DISABLE KEYS */;
INSERT INTO `cal_fe_valores` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_fe_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES ('CFC',1,'Centradas en la Fe Católica'),('VPC',2,'Valores Presentes en la Cultura');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_sub`
--

DROP TABLE IF EXISTS `categorias_sub`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_sub` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `categoria_id` varchar(3) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `url` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `categorias_sub_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_sub`
--

LOCK TABLES `categorias_sub` WRITE;
/*!40000 ALTER TABLE `categorias_sub` DISABLE KEYS */;
INSERT INTO `categorias_sub` VALUES (1,1,'CFC','Jesús','cfc/jesus'),(2,2,'CFC','Contemporáneos de Jesús','cfc/contemporaneos'),(3,3,'CFC','Apariciones Marianas','cfc/marianas'),(4,4,'CFC','Hagiografías','cfc/hagiografias'),(5,5,'CFC','Historias de la Iglesia','cfc/historias'),(6,6,'CFC','Novelas centradas en la fe','cfc/novelas'),(7,7,'CFC','Documentales','cfc/documentales'),(8,8,'VPC','Biografías e Historias','vpc/bios_historias'),(9,9,'VPC','Matrimonio y Familia','vpc/matrimonio'),(10,10,'VPC','Novelas','vpc/novelas'),(11,11,'VPC','Musicales','vpc/musicales');
/*!40000 ALTER TABLE `categorias_sub` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dias_del_ano`
--

DROP TABLE IF EXISTS `dias_del_ano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dias_del_ano` (
  `id` smallint(5) unsigned NOT NULL,
  `dia` tinyint(3) unsigned NOT NULL,
  `mes_id` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mes_id` (`mes_id`),
  CONSTRAINT `dias_del_ano_ibfk_1` FOREIGN KEY (`mes_id`) REFERENCES `meses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dias_del_ano`
--

LOCK TABLES `dias_del_ano` WRITE;
/*!40000 ALTER TABLE `dias_del_ano` DISABLE KEYS */;
INSERT INTO `dias_del_ano` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,7,1),(8,8,1),(9,9,1),(10,10,1),(11,11,1),(12,12,1),(13,13,1),(14,14,1),(15,15,1),(16,16,1),(17,17,1),(18,18,1),(19,19,1),(20,20,1),(21,21,1),(22,22,1),(23,23,1),(24,24,1),(25,25,1),(26,26,1),(27,27,1),(28,28,1),(29,29,1),(30,30,1),(31,31,1),(32,1,2),(33,2,2),(34,3,2),(35,4,2),(36,5,2),(37,6,2),(38,7,2),(39,8,2),(40,9,2),(41,10,2),(42,11,2),(43,12,2),(44,13,2),(45,14,2),(46,15,2),(47,16,2),(48,17,2),(49,18,2),(50,19,2),(51,20,2),(52,21,2),(53,22,2),(54,23,2),(55,24,2),(56,25,2),(57,26,2),(58,27,2),(59,28,2),(60,29,2),(61,1,3),(62,2,3),(63,3,3),(64,4,3),(65,5,3),(66,6,3),(67,7,3),(68,8,3),(69,9,3),(70,10,3),(71,11,3),(72,12,3),(73,13,3),(74,14,3),(75,15,3),(76,16,3),(77,17,3),(78,18,3),(79,19,3),(80,20,3),(81,21,3),(82,22,3),(83,23,3),(84,24,3),(85,25,3),(86,26,3),(87,27,3),(88,28,3),(89,29,3),(90,30,3),(91,31,3),(92,1,4),(93,2,4),(94,3,4),(95,4,4),(96,5,4),(97,6,4),(98,7,4),(99,8,4),(100,9,4),(101,10,4),(102,11,4),(103,12,4),(104,13,4),(105,14,4),(106,15,4),(107,16,4),(108,17,4),(109,18,4),(110,19,4),(111,20,4),(112,21,4),(113,22,4),(114,23,4),(115,24,4),(116,25,4),(117,26,4),(118,27,4),(119,28,4),(120,29,4),(121,30,4),(122,1,5),(123,2,5),(124,3,5),(125,4,5),(126,5,5),(127,6,5),(128,7,5),(129,8,5),(130,9,5),(131,10,5),(132,11,5),(133,12,5),(134,13,5),(135,14,5),(136,15,5),(137,16,5),(138,17,5),(139,18,5),(140,19,5),(141,20,5),(142,21,5),(143,22,5),(144,23,5),(145,24,5),(146,25,5),(147,26,5),(148,27,5),(149,28,5),(150,29,5),(151,30,5),(152,31,5),(153,1,6),(154,2,6),(155,3,6),(156,4,6),(157,5,6),(158,6,6),(159,7,6),(160,8,6),(161,9,6),(162,10,6),(163,11,6),(164,12,6),(165,13,6),(166,14,6),(167,15,6),(168,16,6),(169,17,6),(170,18,6),(171,19,6),(172,20,6),(173,21,6),(174,22,6),(175,23,6),(176,24,6),(177,25,6),(178,26,6),(179,27,6),(180,28,6),(181,29,6),(182,30,6),(183,1,7),(184,2,7),(185,3,7),(186,4,7),(187,5,7),(188,6,7),(189,7,7),(190,8,7),(191,9,7),(192,10,7),(193,11,7),(194,12,7),(195,13,7),(196,14,7),(197,15,7),(198,16,7),(199,17,7),(200,18,7),(201,19,7),(202,20,7),(203,21,7),(204,22,7),(205,23,7),(206,24,7),(207,25,7),(208,26,7),(209,27,7),(210,28,7),(211,29,7),(212,30,7),(213,31,7),(214,1,8),(215,2,8),(216,3,8),(217,4,8),(218,5,8),(219,6,8),(220,7,8),(221,8,8),(222,9,8),(223,10,8),(224,11,8),(225,12,8),(226,13,8),(227,14,8),(228,15,8),(229,16,8),(230,17,8),(231,18,8),(232,19,8),(233,20,8),(234,21,8),(235,22,8),(236,23,8),(237,24,8),(238,25,8),(239,26,8),(240,27,8),(241,28,8),(242,29,8),(243,30,8),(244,31,8),(245,1,9),(246,2,9),(247,3,9),(248,4,9),(249,5,9),(250,6,9),(251,7,9),(252,8,9),(253,9,9),(254,10,9),(255,11,9),(256,12,9),(257,13,9),(258,14,9),(259,15,9),(260,16,9),(261,17,9),(262,18,9),(263,19,9),(264,20,9),(265,21,9),(266,22,9),(267,23,9),(268,24,9),(269,25,9),(270,26,9),(271,27,9),(272,28,9),(273,29,9),(274,30,9),(275,1,10),(276,2,10),(277,3,10),(278,4,10),(279,5,10),(280,6,10),(281,7,10),(282,8,10),(283,9,10),(284,10,10),(285,11,10),(286,12,10),(287,13,10),(288,14,10),(289,15,10),(290,16,10),(291,17,10),(292,18,10),(293,19,10),(294,20,10),(295,21,10),(296,22,10),(297,23,10),(298,24,10),(299,25,10),(300,26,10),(301,27,10),(302,28,10),(303,29,10),(304,30,10),(305,31,10),(306,1,11),(307,2,11),(308,3,11),(309,4,11),(310,5,11),(311,6,11),(312,7,11),(313,8,11),(314,9,11),(315,10,11),(316,11,11),(317,12,11),(318,13,11),(319,14,11),(320,15,11),(321,16,11),(322,17,11),(323,18,11),(324,19,11),(325,20,11),(326,21,11),(327,22,11),(328,23,11),(329,24,11),(330,25,11),(331,26,11),(332,27,11),(333,28,11),(334,29,11),(335,30,11),(336,1,12),(337,2,12),(338,3,12),(339,4,12),(340,5,12),(341,6,12),(342,7,12),(343,8,12),(344,9,12),(345,10,12),(346,11,12),(347,12,12),(348,13,12),(349,14,12),(350,15,12),(351,16,12),(352,17,12),(353,18,12),(354,19,12),(355,20,12),(356,21,12),(357,22,12),(358,23,12),(359,24,12),(360,25,12),(361,26,12),(362,27,12),(363,28,12),(364,29,12),(365,30,12),(366,31,12);
/*!40000 ALTER TABLE `dias_del_ano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `epocas_estreno`
--

DROP TABLE IF EXISTS `epocas_estreno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `epocas_estreno` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `ano_comienzo` smallint(5) unsigned NOT NULL,
  `ano_fin` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `epocas_estreno`
--

LOCK TABLES `epocas_estreno` WRITE;
/*!40000 ALTER TABLE `epocas_estreno` DISABLE KEYS */;
INSERT INTO `epocas_estreno` VALUES (1,4,'Antes de 1970',1900,1969),(2,3,'1970 - 1999',1970,1999),(3,2,'2000 - 2014',2000,2014),(4,1,'2015 - Presente',2015,2025);
/*!40000 ALTER TABLE `epocas_estreno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historicos_hechos`
--

DROP TABLE IF EXISTS `historicos_hechos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historicos_hechos` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `nombre` varchar(30) NOT NULL,
  `creada_por_id` int(10) unsigned DEFAULT 1,
  `creada_en` datetime DEFAULT current_timestamp(),
  `analizada_por_id` int(10) unsigned DEFAULT NULL,
  `analizada_en` datetime DEFAULT NULL,
  `borrada_motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `borrada_motivo_comentario` varchar(500) DEFAULT NULL,
  `lead_time_creacion` smallint(5) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `editada_por_id` int(10) unsigned DEFAULT NULL,
  `editada_en` datetime DEFAULT NULL,
  `revisada_por_id` int(10) unsigned DEFAULT NULL,
  `revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` smallint(5) unsigned DEFAULT NULL,
  `capturada_por_id` int(10) unsigned DEFAULT NULL,
  `capturada_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creada_por_id` (`creada_por_id`),
  KEY `analizada_por_id` (`analizada_por_id`),
  KEY `borrada_motivo_id` (`borrada_motivo_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `editada_por_id` (`editada_por_id`),
  KEY `revisada_por_id` (`revisada_por_id`),
  KEY `capturada_por_id` (`capturada_por_id`),
  CONSTRAINT `historicos_hechos_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `dias_del_ano` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_2` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_3` FOREIGN KEY (`analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_4` FOREIGN KEY (`borrada_motivo_id`) REFERENCES `motivos_para_borrar` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_5` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_6` FOREIGN KEY (`editada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_7` FOREIGN KEY (`revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_hechos_ibfk_8` FOREIGN KEY (`capturada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicos_hechos`
--

LOCK TABLES `historicos_hechos` WRITE;
/*!40000 ALTER TABLE `historicos_hechos` DISABLE KEYS */;
INSERT INTO `historicos_hechos` VALUES (1,249,'Guerra Mundial - 2a (segunda)',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,100,'Semana Santa',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,105,'Semana Santa - Viernes Santo',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,107,'Semana Santa - Resurrección',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,150,'Pentecostés',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `historicos_hechos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historicos_personajes`
--

DROP TABLE IF EXISTS `historicos_personajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historicos_personajes` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `nombre` varchar(30) NOT NULL,
  `creada_por_id` int(10) unsigned DEFAULT 1,
  `creada_en` datetime DEFAULT current_timestamp(),
  `analizada_por_id` int(10) unsigned DEFAULT NULL,
  `analizada_en` datetime DEFAULT NULL,
  `borrada_motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `borrada_motivo_comentario` varchar(500) DEFAULT NULL,
  `lead_time_creacion` smallint(5) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `editada_por_id` int(10) unsigned DEFAULT NULL,
  `editada_en` datetime DEFAULT NULL,
  `revisada_por_id` int(10) unsigned DEFAULT NULL,
  `revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` smallint(5) unsigned DEFAULT NULL,
  `capturada_por_id` int(10) unsigned DEFAULT NULL,
  `capturada_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creada_por_id` (`creada_por_id`),
  KEY `analizada_por_id` (`analizada_por_id`),
  KEY `borrada_motivo_id` (`borrada_motivo_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `editada_por_id` (`editada_por_id`),
  KEY `revisada_por_id` (`revisada_por_id`),
  KEY `capturada_por_id` (`capturada_por_id`),
  CONSTRAINT `historicos_personajes_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `dias_del_ano` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_2` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_3` FOREIGN KEY (`analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_4` FOREIGN KEY (`borrada_motivo_id`) REFERENCES `motivos_para_borrar` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_5` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_6` FOREIGN KEY (`editada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_7` FOREIGN KEY (`revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historicos_personajes_ibfk_8` FOREIGN KEY (`capturada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicos_personajes`
--

LOCK TABLES `historicos_personajes` WRITE;
/*!40000 ALTER TABLE `historicos_personajes` DISABLE KEYS */;
INSERT INTO `historicos_personajes` VALUES (1,NULL,'Jesús',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,296,'Juan Pablo II',1,'2021-12-09 16:08:23',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `historicos_personajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `idiomas`
--

DROP TABLE IF EXISTS `idiomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `idiomas` (
  `id` varchar(2) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `idiomas`
--

LOCK TABLES `idiomas` WRITE;
/*!40000 ALTER TABLE `idiomas` DISABLE KEYS */;
INSERT INTO `idiomas` VALUES ('aa','Afar'),('ab','Abjasio'),('ae','Avéstico'),('af','Afrikáans'),('ak','Akano'),('am','Amhárico'),('an','Aragonés'),('ar','Árabe'),('as','Asamés'),('av','Ávaro'),('ay','Aimara'),('az','Azerí'),('ba','Baskir'),('be','Bielorruso'),('bg','Búlgaro'),('bh','Bhoyapurí'),('bi','Bislama'),('bm','Bambara'),('bn','Bengalí'),('bo','Tibetano'),('br','Bretón'),('bs','Bosnio'),('ca','Catalán'),('ce','Checheno'),('ch','Chamorro'),('co','Corso'),('cr','Cree'),('cs','Checo'),('cu','Eslavo eclesiástico'),('cv','Chuvasio'),('cy','Galés'),('da','Danés'),('de','Alemán'),('dv','Maldivo'),('dz','Dzongkha'),('ee','Ewé'),('el','Griego'),('en','Inglés'),('eo','Esperanto'),('es','Castellano'),('et','Estonio'),('eu','Euskera'),('fa','Persa'),('ff','Fula'),('fi','Finés'),('fj','Fiyiano'),('fo','Feroés'),('fr','Francés'),('fy','Frisón'),('ga','Gaélico'),('gd','Gaélico escocés'),('gl','Gallego'),('gn','Guaraní'),('gu','Guyaratí'),('gv','Gaélico manés'),('ha','Hausa'),('he','Hebreo'),('hi','Hindi'),('ho','Hiri motu'),('hr','Croata'),('ht','Haitiano'),('hu','Húngaro'),('hy','Armenio'),('hz','Herero'),('ia','Interlingua'),('id','Indonesio'),('ie','Occidental'),('ig','Igbo'),('ii','Yi de Sichuán'),('ik','Iñupiaq'),('io','Ido'),('is','Islandés'),('it','Italiano'),('iu','Inuktitut'),('ja','Japonés'),('jv','Javanés'),('ka','Georgiano'),('kg','Kongo'),('ki','Kikuyu'),('kj','Kuanyama'),('kk','Kazajo'),('kl','Kalaallisut'),('km','Camboyano'),('kn','Canarés'),('ko','Coreano'),('kr','Kanuri'),('ks','Cachemiro'),('ku','Kurdo'),('kv','Komi'),('kw','Córnico'),('ky','Kirguís'),('la','Latín'),('lb','Luxemburgués'),('lg','Luganda'),('li','Limburgués'),('ln','Lingala'),('lo','Lao'),('lt','Lituano'),('lu','Luba-katanga'),('lv','Letón'),('mg','Malgache'),('mh','Marshalés'),('mi','Maorí'),('mk','Macedonio'),('ml','Malayalam'),('mn','Mongol'),('mr','Maratí'),('ms','Malayo'),('mt','Maltés'),('my','Birmano'),('na','Nauruano'),('nb','Noruego bokmål'),('nd','Ndebele del norte'),('ne','Nepalí'),('ng','Ndonga'),('nl','Neerlandés'),('nn','Nynorsk'),('no','Noruego'),('nr','Ndebele del sur'),('nv','Navajo'),('ny','Chichewa'),('oc','Occitano'),('oj','Ojibwa'),('om','Oromo'),('or','Oriya'),('os','Osético'),('pa','Panyabí'),('pi','Pali'),('pl','Polaco'),('ps','Pastú'),('pt','Portugués'),('qu','Quechua'),('rm','Romanche'),('rn','Kirundi'),('ro','Rumano'),('ru','Ruso'),('rw','Ruandés'),('sa','Sánscrito'),('sc','Sardo'),('sd','Sindhi'),('se','Sami septentrional'),('sg','Sango'),('si','Cingalés'),('sk','Eslovaco'),('sl','Esloveno'),('sm','Samoano'),('sn','Shona'),('so','Somalí'),('sq','Albanés'),('sr','Serbio'),('ss','Suazi'),('st','Sesotho'),('su','Sundanés'),('sv','Sueco'),('sw','Suajili'),('ta','Tamil'),('te','Télugu'),('tg','Tayiko'),('th','Tailandés'),('ti','Tigriña'),('tk','Turcomano'),('tl','Tagalo'),('tn','Setsuana'),('to','Tongano'),('tr','Turco'),('ts','Tsonga'),('tt','Tártaro'),('tw','Twi'),('ty','Tahitiano'),('ug','Uigur'),('uk','Ucraniano'),('ur','Urdu'),('uz','Uzbeko'),('ve','Venda'),('vi','Vietnamita'),('vo','Volapük'),('wa','Valón'),('wo','Wolof'),('xh','Xhosa'),('yi','Yídish'),('yo','Yoruba'),('za','Zhuang'),('zh','Chino'),('zu','Zulú');
/*!40000 ALTER TABLE `idiomas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interes_en_prod`
--

DROP TABLE IF EXISTS `interes_en_prod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interes_en_prod` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interes_en_prod`
--

LOCK TABLES `interes_en_prod` WRITE;
/*!40000 ALTER TABLE `interes_en_prod` DISABLE KEYS */;
INSERT INTO `interes_en_prod` VALUES (1,3,'Prefiero que no me la recomienden'),(2,2,'Ya la vi'),(3,1,'Recordame que quiero verla');
/*!40000 ALTER TABLE `interes_en_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meses`
--

DROP TABLE IF EXISTS `meses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meses` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meses`
--

LOCK TABLES `meses` WRITE;
/*!40000 ALTER TABLE `meses` DISABLE KEYS */;
INSERT INTO `meses` VALUES (1,'Enero'),(2,'Febrero'),(3,'Marzo'),(4,'Abril'),(5,'Mayo'),(6,'Junio'),(7,'Julio'),(8,'Agosto'),(9,'Septiembre'),(10,'Octubre'),(11,'Noviembre'),(12,'Diciembre');
/*!40000 ALTER TABLE `meses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `motivos_para_borrar`
--

DROP TABLE IF EXISTS `motivos_para_borrar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `motivos_para_borrar` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `productos` tinyint(1) DEFAULT 0,
  `historicos_personajes` tinyint(1) DEFAULT 0,
  `historicos_hechos` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `motivos_para_borrar`
--

LOCK TABLES `motivos_para_borrar` WRITE;
/*!40000 ALTER TABLE `motivos_para_borrar` DISABLE KEYS */;
INSERT INTO `motivos_para_borrar` VALUES (1,'Registro duplicado',1,1,1),(2,'Sin relación con ninguna Película o Colección',0,1,1),(3,'Spam dañino, no alineado con nuestro perfil',1,1,1),(4,'Spam inocuo, no alineado con nuestro perfil',1,1,1);
/*!40000 ALTER TABLE `motivos_para_borrar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paises`
--

DROP TABLE IF EXISTS `paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paises` (
  `id` varchar(2) NOT NULL,
  `alpha3code` varchar(3) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `continente` varchar(20) NOT NULL,
  `idioma` varchar(50) NOT NULL,
  `zona_horaria` varchar(10) NOT NULL,
  `bandera` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paises`
--

LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
INSERT INTO `paises` VALUES ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'),('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'),('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'),('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'),('AI','AIA','Anguila','América','English','-04:00','aia.svg'),('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'),('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'),('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'),('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'),('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'),('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'),('AT','AUT','Austria','Europa','German','+01:00','aut.svg'),('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'),('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'),('AX','ALA','Aland','Europa','Swedish','+02:00','ala.svg'),('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'),('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'),('BB','BRB','Barbados','América','English','-04:00','brb.svg'),('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'),('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'),('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'),('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'),('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'),('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'),('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'),('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'),('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'),('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'),('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'),('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'),('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'),('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'),('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'),('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'),('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'),('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'),('BZ','BLZ','Belice','América','English','-06:00','blz.svg'),('CA','CAN','Canadá','América','English','-08:00','can.svg'),('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'),('CD','COD','Congo','Africa','French','+01:00','cod.svg'),('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'),('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'),('CH','CHE','Suiza','Europa','German','+01:00','che.svg'),('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'),('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'),('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'),('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'),('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'),('CO','COL','Colombia','América','Spanish','-05:00','col.svg'),('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'),('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'),('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'),('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'),('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'),('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'),('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'),('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'),('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'),('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'),('DM','DMA','Dominica','América','English','-04:00','dma.svg'),('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'),('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'),('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'),('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'),('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'),('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'),('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'),('ES','ESP','España','Europa','Spanish','','esp.svg'),('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'),('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'),('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'),('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'),('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'),('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'),('FR','FRA','Francia','Europa','French','-10:00','fra.svg'),('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'),('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'),('GD','GRD','Granada','América','English','-04:00','grd.svg'),('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'),('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'),('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'),('GH','GHA','Ghana','Africa','English','','gha.svg'),('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'),('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'),('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'),('GN','GIN','Guinea','Africa','French','','gin.svg'),('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'),('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'),('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'),('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'),('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'),('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'),('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'),('GY','GUY','Guyana','América','English','-04:00','guy.svg'),('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg'),('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'),('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'),('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'),('HT','HTI','Haití','América','French','-05:00','hti.svg'),('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'),('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'),('IE','IRL','Irlanda','Europa','Irish','','irl.svg'),('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'),('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'),('IN','IND','India','Asia','Hindi','+05:30','ind.svg'),('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'),('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'),('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'),('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'),('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'),('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'),('JM','JAM','Jamaica','América','English','-05:00','jam.svg'),('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'),('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'),('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'),('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'),('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'),('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'),('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'),('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'),('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'),('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'),('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'),('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'),('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'),('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'),('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'),('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'),('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'),('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'),('LR','LBR','Liberia','Africa','English','','lbr.svg'),('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'),('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'),('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'),('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'),('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'),('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'),('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'),('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'),('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'),('MF','MAF','San Martín','América','English','-04:00','maf.svg'),('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'),('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'),('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'),('ML','MLI','Malí','Africa','French','','mli.svg'),('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'),('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'),('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'),('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'),('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'),('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'),('MS','MSR','Montserrat','América','English','-04:00','msr.svg'),('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'),('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'),('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'),('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'),('MX','MEX','México','América','Spanish','-08:00','mex.svg'),('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'),('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'),('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'),('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'),('NE','NER','Níger','Africa','French','+01:00','ner.svg'),('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'),('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'),('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'),('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'),('NN','NNN','- Sin un país de referencia -','-','-','00:00','-'),('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'),('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'),('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'),('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'),('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'),('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'),('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'),('PE','PER','Perú','América','Spanish','-05:00','per.svg'),('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'),('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'),('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'),('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'),('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'),('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'),('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'),('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'),('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'),('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'),('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'),('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'),('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'),('RE','REU','Reunión','Africa','French','+04:00','reu.svg'),('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'),('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'),('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'),('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'),('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'),('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'),('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'),('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'),('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'),('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'),('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'),('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'),('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'),('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'),('SL','SLE','Sierra Leona','Africa','English','','sle.svg'),('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'),('SN','SEN','Senegal','Africa','French','','sen.svg'),('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'),('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'),('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'),('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'),('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'),('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'),('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'),('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'),('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'),('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'),('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'),('TG','TGO','Togo','Africa','French','','tgo.svg'),('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'),('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'),('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'),('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'),('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'),('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'),('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'),('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'),('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'),('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'),('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'),('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'),('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'),('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'),('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'),('US','USA','Estados Unidos','América','English','-12:00','usa.svg'),('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'),('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'),('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'),('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'),('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'),('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'),('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'),('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'),('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'),('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'),('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'),('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'),('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'),('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'),('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'),('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'),('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg');
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penalizaciones_motivos`
--

DROP TABLE IF EXISTS `penalizaciones_motivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `penalizaciones_motivos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `duracion` smallint(5) unsigned NOT NULL,
  `comentario` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penalizaciones_motivos`
--

LOCK TABLES `penalizaciones_motivos` WRITE;
/*!40000 ALTER TABLE `penalizaciones_motivos` DISABLE KEYS */;
INSERT INTO `penalizaciones_motivos` VALUES (1,1,'Spam primera vez',30,'Material no agresivo, pero ajeno a nuestro perfil, primera vez'),(2,2,'Spam reincidente',200,'Material no agresivo, pero ajeno a nuestro perfil, reincidente'),(3,3,'Anti-católico primera vez',200,'Mofarse de la religión católica, primera vez'),(4,4,'Anti-católico reincidente',400,'Mofarse de la religión católica, reincidente'),(5,5,'Pornografía primera vez',400,'Pornografía, primera vez'),(6,6,'Pornografía reincidente',1000,'Pornografía, reincidente');
/*!40000 ALTER TABLE `penalizaciones_motivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_relacion_pais_prod`
--

DROP TABLE IF EXISTS `pr_relacion_pais_prod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pr_relacion_pais_prod` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pais_id` varchar(2) NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  CONSTRAINT `pr_relacion_pais_prod_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`),
  CONSTRAINT `pr_relacion_pais_prod_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_peliculas` (`id`),
  CONSTRAINT `pr_relacion_pais_prod_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_colecciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_relacion_pais_prod`
--

LOCK TABLES `pr_relacion_pais_prod` WRITE;
/*!40000 ALTER TABLE `pr_relacion_pais_prod` DISABLE KEYS */;
/*!40000 ALTER TABLE `pr_relacion_pais_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_us_calificaciones`
--

DROP TABLE IF EXISTS `pr_us_calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pr_us_calificaciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `fe_valores_id` tinyint(3) unsigned NOT NULL,
  `entretiene_id` tinyint(3) unsigned NOT NULL,
  `calidad_tecnica_id` tinyint(3) unsigned NOT NULL,
  `fe_valores_valor` tinyint(3) unsigned NOT NULL,
  `entretiene_valor` tinyint(3) unsigned NOT NULL,
  `calidad_tecnica_valor` tinyint(3) unsigned NOT NULL,
  `resultado` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `fe_valores_id` (`fe_valores_id`),
  KEY `entretiene_id` (`entretiene_id`),
  KEY `calidad_tecnica_id` (`calidad_tecnica_id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_peliculas` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_colecciones` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_capitulos` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_5` FOREIGN KEY (`fe_valores_id`) REFERENCES `cal_fe_valores` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_6` FOREIGN KEY (`entretiene_id`) REFERENCES `cal_entretiene` (`id`),
  CONSTRAINT `pr_us_calificaciones_ibfk_7` FOREIGN KEY (`calidad_tecnica_id`) REFERENCES `cal_calidad_tecnica` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_us_calificaciones`
--

LOCK TABLES `pr_us_calificaciones` WRITE;
/*!40000 ALTER TABLE `pr_us_calificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `pr_us_calificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_us_interes_en_prod`
--

DROP TABLE IF EXISTS `pr_us_interes_en_prod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pr_us_interes_en_prod` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `interes_en_prod_id` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `interes_en_prod_id` (`interes_en_prod_id`),
  CONSTRAINT `pr_us_interes_en_prod_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pr_us_interes_en_prod_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_peliculas` (`id`),
  CONSTRAINT `pr_us_interes_en_prod_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_colecciones` (`id`),
  CONSTRAINT `pr_us_interes_en_prod_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_capitulos` (`id`),
  CONSTRAINT `pr_us_interes_en_prod_ibfk_5` FOREIGN KEY (`interes_en_prod_id`) REFERENCES `interes_en_prod` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_us_interes_en_prod`
--

LOCK TABLES `pr_us_interes_en_prod` WRITE;
/*!40000 ALTER TABLE `pr_us_interes_en_prod` DISABLE KEYS */;
/*!40000 ALTER TABLE `pr_us_interes_en_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_capitulos`
--

DROP TABLE IF EXISTS `prod_capitulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prod_capitulos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `coleccion_id` int(10) unsigned NOT NULL,
  `temporada` tinyint(3) unsigned DEFAULT NULL,
  `capitulo` tinyint(3) unsigned NOT NULL,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `fuente` varchar(10) NOT NULL,
  `nombre_original` varchar(50) DEFAULT NULL,
  `nombre_castellano` varchar(50) DEFAULT NULL,
  `duracion` tinyint(3) unsigned DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `idioma_original_id` varchar(2) NOT NULL,
  `director` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `productor` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(800) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned DEFAULT NULL,
  `en_color_id` tinyint(3) unsigned DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_sugerido_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_historico_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_historico_id` smallint(5) unsigned DEFAULT NULL,
  `link_trailer` varchar(200) DEFAULT NULL,
  `link_pelicula` varchar(200) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `creada_por_id` int(10) unsigned NOT NULL,
  `creada_en` datetime DEFAULT current_timestamp(),
  `analizada_por_id` int(10) unsigned DEFAULT NULL,
  `analizada_en` datetime DEFAULT NULL,
  `borrada_motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `borrada_motivo_comentario` varchar(500) DEFAULT NULL,
  `lead_time_creacion` smallint(5) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `editada_por_id` int(10) unsigned DEFAULT NULL,
  `editada_en` datetime DEFAULT NULL,
  `revisada_por_id` int(10) unsigned DEFAULT NULL,
  `revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` smallint(5) unsigned DEFAULT NULL,
  `capturada_por_id` int(10) unsigned DEFAULT NULL,
  `capturada_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `personaje_historico_id` (`personaje_historico_id`),
  KEY `hecho_historico_id` (`hecho_historico_id`),
  KEY `creada_por_id` (`creada_por_id`),
  KEY `analizada_por_id` (`analizada_por_id`),
  KEY `borrada_motivo_id` (`borrada_motivo_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `editada_por_id` (`editada_por_id`),
  KEY `revisada_por_id` (`revisada_por_id`),
  KEY `capturada_por_id` (`capturada_por_id`),
  CONSTRAINT `prod_capitulos_ibfk_1` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_colecciones` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_10` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_11` FOREIGN KEY (`analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_12` FOREIGN KEY (`borrada_motivo_id`) REFERENCES `motivos_para_borrar` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_13` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_14` FOREIGN KEY (`editada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_15` FOREIGN KEY (`revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_16` FOREIGN KEY (`capturada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `idiomas` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_5` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_6` FOREIGN KEY (`subcategoria_id`) REFERENCES `categorias_sub` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_7` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `publicos_sugeridos` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_8` FOREIGN KEY (`personaje_historico_id`) REFERENCES `historicos_personajes` (`id`),
  CONSTRAINT `prod_capitulos_ibfk_9` FOREIGN KEY (`hecho_historico_id`) REFERENCES `historicos_hechos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_capitulos`
--

LOCK TABLES `prod_capitulos` WRITE;
/*!40000 ALTER TABLE `prod_capitulos` DISABLE KEYS */;
/*!40000 ALTER TABLE `prod_capitulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_colecciones`
--

DROP TABLE IF EXISTS `prod_colecciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prod_colecciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `entidad_TMDB` varchar(10) DEFAULT NULL,
  `fuente` varchar(5) NOT NULL,
  `nombre_original` varchar(100) NOT NULL,
  `nombre_castellano` varchar(100) NOT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `ano_fin` smallint(5) unsigned DEFAULT NULL,
  `idioma_original_id` varchar(2) NOT NULL,
  `cant_temporadas` tinyint(3) unsigned DEFAULT NULL,
  `cant_capitulos` smallint(5) unsigned DEFAULT NULL,
  `director` varchar(100) NOT NULL,
  `guion` varchar(100) NOT NULL,
  `musica` varchar(100) NOT NULL,
  `actores` varchar(500) NOT NULL,
  `productor` varchar(50) DEFAULT NULL,
  `sinopsis` varchar(800) NOT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned NOT NULL,
  `en_color_id` tinyint(3) unsigned NOT NULL,
  `categoria_id` varchar(3) NOT NULL,
  `subcategoria_id` tinyint(3) unsigned NOT NULL,
  `publico_sugerido_id` tinyint(3) unsigned NOT NULL,
  `personaje_historico_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_historico_id` smallint(5) unsigned DEFAULT NULL,
  `link_trailer` varchar(200) DEFAULT NULL,
  `link_pelicula` varchar(200) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `creada_por_id` int(10) unsigned NOT NULL,
  `creada_en` datetime DEFAULT current_timestamp(),
  `analizada_por_id` int(10) unsigned DEFAULT NULL,
  `analizada_en` datetime DEFAULT NULL,
  `borrada_motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `borrada_motivo_comentario` varchar(500) DEFAULT NULL,
  `lead_time_creacion` smallint(5) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `editada_por_id` int(10) unsigned DEFAULT NULL,
  `editada_en` datetime DEFAULT NULL,
  `revisada_por_id` int(10) unsigned DEFAULT NULL,
  `revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` smallint(5) unsigned DEFAULT NULL,
  `capturada_por_id` int(10) unsigned DEFAULT NULL,
  `capturada_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `personaje_historico_id` (`personaje_historico_id`),
  KEY `hecho_historico_id` (`hecho_historico_id`),
  KEY `creada_por_id` (`creada_por_id`),
  KEY `analizada_por_id` (`analizada_por_id`),
  KEY `borrada_motivo_id` (`borrada_motivo_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `editada_por_id` (`editada_por_id`),
  KEY `revisada_por_id` (`revisada_por_id`),
  KEY `capturada_por_id` (`capturada_por_id`),
  CONSTRAINT `prod_colecciones_ibfk_1` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `publicos_sugeridos` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_10` FOREIGN KEY (`borrada_motivo_id`) REFERENCES `motivos_para_borrar` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_11` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_12` FOREIGN KEY (`editada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_13` FOREIGN KEY (`revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_14` FOREIGN KEY (`capturada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_4` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_5` FOREIGN KEY (`subcategoria_id`) REFERENCES `categorias_sub` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_6` FOREIGN KEY (`personaje_historico_id`) REFERENCES `historicos_personajes` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_7` FOREIGN KEY (`hecho_historico_id`) REFERENCES `historicos_hechos` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_8` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_colecciones_ibfk_9` FOREIGN KEY (`analizada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_colecciones`
--

LOCK TABLES `prod_colecciones` WRITE;
/*!40000 ALTER TABLE `prod_colecciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `prod_colecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_peliculas`
--

DROP TABLE IF EXISTS `prod_peliculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prod_peliculas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `fuente` varchar(5) NOT NULL,
  `nombre_original` varchar(50) NOT NULL,
  `nombre_castellano` varchar(50) NOT NULL,
  `duracion` smallint(5) unsigned NOT NULL,
  `ano_estreno` smallint(5) unsigned NOT NULL,
  `idioma_original_id` varchar(2) NOT NULL,
  `director` varchar(100) NOT NULL,
  `guion` varchar(100) NOT NULL,
  `musica` varchar(100) NOT NULL,
  `actores` varchar(500) NOT NULL,
  `productor` varchar(100) NOT NULL,
  `sinopsis` varchar(800) NOT NULL,
  `avatar` varchar(100) NOT NULL,
  `en_castellano_id` tinyint(3) unsigned NOT NULL,
  `en_color_id` tinyint(3) unsigned NOT NULL,
  `categoria_id` varchar(3) NOT NULL,
  `subcategoria_id` tinyint(3) unsigned NOT NULL,
  `publico_sugerido_id` tinyint(3) unsigned NOT NULL,
  `personaje_historico_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_historico_id` smallint(5) unsigned DEFAULT NULL,
  `link_trailer` varchar(200) DEFAULT NULL,
  `link_pelicula` varchar(200) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL,
  `creada_por_id` int(10) unsigned NOT NULL,
  `creada_en` datetime DEFAULT current_timestamp(),
  `analizada_por_id` int(10) unsigned DEFAULT NULL,
  `analizada_en` datetime DEFAULT NULL,
  `borrada_motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `borrada_motivo_comentario` varchar(500) DEFAULT NULL,
  `lead_time_creacion` smallint(5) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `editada_por_id` int(10) unsigned DEFAULT NULL,
  `editada_en` datetime DEFAULT NULL,
  `revisada_por_id` int(10) unsigned DEFAULT NULL,
  `revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` smallint(5) unsigned DEFAULT NULL,
  `capturada_por_id` int(10) unsigned DEFAULT NULL,
  `capturada_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `personaje_historico_id` (`personaje_historico_id`),
  KEY `hecho_historico_id` (`hecho_historico_id`),
  KEY `creada_por_id` (`creada_por_id`),
  KEY `analizada_por_id` (`analizada_por_id`),
  KEY `borrada_motivo_id` (`borrada_motivo_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `editada_por_id` (`editada_por_id`),
  KEY `revisada_por_id` (`revisada_por_id`),
  KEY `capturada_por_id` (`capturada_por_id`),
  CONSTRAINT `prod_peliculas_ibfk_1` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `publicos_sugeridos` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_10` FOREIGN KEY (`analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_11` FOREIGN KEY (`borrada_motivo_id`) REFERENCES `motivos_para_borrar` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_12` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_13` FOREIGN KEY (`editada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_14` FOREIGN KEY (`revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_15` FOREIGN KEY (`capturada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `si_no_parcial` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `idiomas` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_5` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_6` FOREIGN KEY (`subcategoria_id`) REFERENCES `categorias_sub` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_7` FOREIGN KEY (`personaje_historico_id`) REFERENCES `historicos_personajes` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_8` FOREIGN KEY (`hecho_historico_id`) REFERENCES `historicos_hechos` (`id`),
  CONSTRAINT `prod_peliculas_ibfk_9` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_peliculas`
--

LOCK TABLES `prod_peliculas` WRITE;
/*!40000 ALTER TABLE `prod_peliculas` DISABLE KEYS */;
INSERT INTO `prod_peliculas` VALUES (1,'199449',NULL,NULL,'TMDB','El mártir del Calvario','El mártir del Calvario',113,1952,'es','Miguel Morayta','Miguel Morayta, Gonzalo Elvira Sánchez de Aparicio','Gustavo César Carrión','Enrique Rambal (Jesús), Manolo Fábregas (Judas), Consuelo Frank (Virgen María), Miguel Ángel Ferriz Sr. (Pedro), Armando Sáenz (Juan), Felipe de Alba (Andrés), Alicia Palacios (María Magdalena), Carmen Molina (Martha), José Baviera (Poncio Pilatos), Tito Novaro (Malco), José María Linares Rivas (Caifás), Luis Beristáin (Jefe Sinagoga), Miguel Arenas (José de Arimatea), Lupe Llaca (Verónica), Alberto Mariscal (Anás el Joven), Alfonso Mejía (Marcos), Fernando Casanova (Centurión)','Oro Films, Estudios Cinematográficos del Tepeyac','Drama mexicano que retrata con todo lujo de detalles la vida de Jesús. Es considerada por muchos como el mayor ejemplo de cine religioso de México (TMDB)','1639067748972.jpg',1,3,'CFC',1,4,1,NULL,'https://www.youtube.com/watch?v=tEFXzqTX69o','https://www.youtube.com/watch?v=EmftlvRyQZA',82,10,'2021-12-09 18:52:16',NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `prod_peliculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicos_sugeridos`
--

DROP TABLE IF EXISTS `publicos_sugeridos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publicos_sugeridos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicos_sugeridos`
--

LOCK TABLES `publicos_sugeridos` WRITE;
/*!40000 ALTER TABLE `publicos_sugeridos` DISABLE KEYS */;
INSERT INTO `publicos_sugeridos` VALUES (1,5,'Menores solamente'),(2,4,'Menores (apto familia)'),(3,3,'Familia'),(4,2,'Mayores (apto familia)'),(5,1,'Mayores solamente');
/*!40000 ALTER TABLE `publicos_sugeridos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_usuario`
--

DROP TABLE IF EXISTS `roles_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles_usuario` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `aut_altas_productos` tinyint(1) NOT NULL,
  `aut_aprobar_altas_prod` tinyint(1) NOT NULL,
  `aut_cambiar_perfil_usuarios` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_usuario`
--

LOCK TABLES `roles_usuario` WRITE;
/*!40000 ALTER TABLE `roles_usuario` DISABLE KEYS */;
INSERT INTO `roles_usuario` VALUES (1,1,'Usuario',1,0,0),(2,2,'Revisor de Altas de Productos',1,1,0),(3,3,'Gestor de Usuarios',1,0,1),(4,4,'Todos los permisos',1,1,1);
/*!40000 ALTER TABLE `roles_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sexos`
--

DROP TABLE IF EXISTS `sexos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sexos` (
  `id` varchar(1) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `letra_final` varchar(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sexos`
--

LOCK TABLES `sexos` WRITE;
/*!40000 ALTER TABLE `sexos` DISABLE KEYS */;
INSERT INTO `sexos` VALUES ('F','Femenino','a'),('M','Masculino','o');
/*!40000 ALTER TABLE `sexos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `si_no_parcial`
--

DROP TABLE IF EXISTS `si_no_parcial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `si_no_parcial` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `si_no_parcial`
--

LOCK TABLES `si_no_parcial` WRITE;
/*!40000 ALTER TABLE `si_no_parcial` DISABLE KEYS */;
INSERT INTO `si_no_parcial` VALUES (1,'SI'),(2,'Parcial'),(3,'NO');
/*!40000 ALTER TABLE `si_no_parcial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_registro`
--

DROP TABLE IF EXISTS `status_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `status_registro` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_registro`
--

LOCK TABLES `status_registro` WRITE;
/*!40000 ALTER TABLE `status_registro` DISABLE KEYS */;
INSERT INTO `status_registro` VALUES (2,'Aprobada'),(3,'Borrada'),(1,'Pendiente');
/*!40000 ALTER TABLE `status_registro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_registro_usuario`
--

DROP TABLE IF EXISTS `status_registro_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `status_registro_usuario` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_registro_usuario`
--

LOCK TABLES `status_registro_usuario` WRITE;
/*!40000 ALTER TABLE `status_registro_usuario` DISABLE KEYS */;
INSERT INTO `status_registro_usuario` VALUES (1,1,'Mail a validar'),(2,2,'Mail validado'),(3,3,'Datos perennes OK'),(4,4,'Datos editables OK');
/*!40000 ALTER TABLE `status_registro_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `us_filtros_personales_cabecera`
--

DROP TABLE IF EXISTS `us_filtros_personales_cabecera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `us_filtros_personales_cabecera` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` int(10) unsigned NOT NULL,
  `palabras_clave` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `us_filtros_personales_cabecera_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `us_filtros_personales_cabecera`
--

LOCK TABLES `us_filtros_personales_cabecera` WRITE;
/*!40000 ALTER TABLE `us_filtros_personales_cabecera` DISABLE KEYS */;
/*!40000 ALTER TABLE `us_filtros_personales_cabecera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `us_filtros_personales_campos`
--

DROP TABLE IF EXISTS `us_filtros_personales_campos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `us_filtros_personales_campos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `filtro_cabecera_id` int(10) unsigned DEFAULT NULL,
  `campo_id` varchar(100) DEFAULT NULL,
  `valor_id` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `filtro_cabecera_id` (`filtro_cabecera_id`),
  CONSTRAINT `us_filtros_personales_campos_ibfk_1` FOREIGN KEY (`filtro_cabecera_id`) REFERENCES `us_filtros_personales_cabecera` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `us_filtros_personales_campos`
--

LOCK TABLES `us_filtros_personales_campos` WRITE;
/*!40000 ALTER TABLE `us_filtros_personales_campos` DISABLE KEYS */;
/*!40000 ALTER TABLE `us_filtros_personales_campos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `us_penalizaciones`
--

DROP TABLE IF EXISTS `us_penalizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `us_penalizaciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `creada_en` datetime DEFAULT current_timestamp(),
  `usuario_id` int(10) unsigned NOT NULL,
  `rol_usuario_id` tinyint(3) unsigned NOT NULL,
  `penalizado_por_id` int(10) unsigned DEFAULT NULL,
  `penalizacion_id` tinyint(3) unsigned NOT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `rol_usuario_id` (`rol_usuario_id`),
  KEY `penalizado_por_id` (`penalizado_por_id`),
  KEY `penalizacion_id` (`penalizacion_id`),
  CONSTRAINT `us_penalizaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `us_penalizaciones_ibfk_2` FOREIGN KEY (`rol_usuario_id`) REFERENCES `roles_usuario` (`id`),
  CONSTRAINT `us_penalizaciones_ibfk_3` FOREIGN KEY (`penalizado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `us_penalizaciones_ibfk_4` FOREIGN KEY (`penalizacion_id`) REFERENCES `penalizaciones_motivos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `us_penalizaciones`
--

LOCK TABLES `us_penalizaciones` WRITE;
/*!40000 ALTER TABLE `us_penalizaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `us_penalizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `rol_usuario_id` tinyint(3) unsigned DEFAULT 1,
  `autorizado_fa` tinyint(1) DEFAULT 0,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `apodo` varchar(50) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT '-',
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `pais_id` varchar(2) DEFAULT NULL,
  `vocacion_id` varchar(2) DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `completado_en` datetime DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `aut_data_entry` tinyint(1) DEFAULT 0,
  `borrado` tinyint(1) DEFAULT 0,
  `borrado_en` datetime DEFAULT NULL,
  `borrado_motivo` varchar(500) DEFAULT NULL,
  `borrado_por_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `rol_usuario_id` (`rol_usuario_id`),
  KEY `sexo_id` (`sexo_id`),
  KEY `pais_id` (`pais_id`),
  KEY `vocacion_id` (`vocacion_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`status_registro_id`) REFERENCES `status_registro_usuario` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`rol_usuario_id`) REFERENCES `roles_usuario` (`id`),
  CONSTRAINT `usuarios_ibfk_3` FOREIGN KEY (`sexo_id`) REFERENCES `sexos` (`id`),
  CONSTRAINT `usuarios_ibfk_4` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`),
  CONSTRAINT `usuarios_ibfk_5` FOREIGN KEY (`vocacion_id`) REFERENCES `vocacion_iglesia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'sinMail1','sinContraseña',4,4,1,'startup','','startup','','2000-01-01','M','AR','PC','2000-01-01 00:00:00','2000-01-01 00:00:00',NULL,0,0,NULL,NULL,NULL),(2,'sinMail2','sinContraseña',4,4,1,'automatizado','','automatizado','','2000-01-01','M','AR','PC','2000-01-01 00:00:00','2000-01-01 00:00:00',NULL,0,0,NULL,NULL,NULL),(10,'diegoiribarren2015@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm',4,2,1,'Diego','Iribarren','Diego','1617370359746.jpg','1969-08-16','M','AR','LC','2021-03-26 00:00:00','2021-03-26 00:00:00',NULL,0,0,NULL,NULL,NULL),(11,'diegoiribarren2021@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm',4,4,1,'Diego','Iribarren','Diego','1617370359746.jpg','1969-08-16','M','AR','LC','2021-03-26 00:00:00','2021-03-26 00:00:00',NULL,0,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vocacion_iglesia`
--

DROP TABLE IF EXISTS `vocacion_iglesia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vocacion_iglesia` (
  `id` varchar(2) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocacion_iglesia`
--

LOCK TABLES `vocacion_iglesia` WRITE;
/*!40000 ALTER TABLE `vocacion_iglesia` DISABLE KEYS */;
INSERT INTO `vocacion_iglesia` VALUES ('LC',3,'Laico/a casado/a'),('LS',2,'Laico/a soltero/a'),('OT',9,'Otro'),('PC',0,'Computadora'),('PP',7,'Papa'),('RC',4,'Religioso/a consagrado/a');
/*!40000 ALTER TABLE `vocacion_iglesia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'elc_peliculas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-09 16:09:57
