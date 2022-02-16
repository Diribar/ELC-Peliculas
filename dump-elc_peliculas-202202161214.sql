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
-- Table structure for table `prod_links`
--

DROP TABLE IF EXISTS `prod_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prod_links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `url` varchar(100) NOT NULL,
  `tipo_prod_id` tinyint(3) unsigned NOT NULL,
  `proveedor_id` tinyint(3) unsigned NOT NULL,
  `gratuito` tinyint(1) NOT NULL,
  `fecha_prov` datetime DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `revisado_por_id` int(10) unsigned DEFAULT NULL,
  `revisado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `tipo_prod_id` (`tipo_prod_id`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `revisado_por_id` (`revisado_por_id`),
  CONSTRAINT `prod_links_ibfk_1` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_peliculas` (`id`),
  CONSTRAINT `prod_links_ibfk_2` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_colecciones` (`id`),
  CONSTRAINT `prod_links_ibfk_3` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_capitulos` (`id`),
  CONSTRAINT `prod_links_ibfk_4` FOREIGN KEY (`tipo_prod_id`) REFERENCES `tipos_producto` (`id`),
  CONSTRAINT `prod_links_ibfk_5` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores_links` (`id`),
  CONSTRAINT `prod_links_ibfk_6` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_links_ibfk_7` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_links_ibfk_8` FOREIGN KEY (`revisado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_links`
--

LOCK TABLES `prod_links` WRITE;
/*!40000 ALTER TABLE `prod_links` DISABLE KEYS */;
INSERT INTO `prod_links` VALUES (1,1,NULL,NULL,'youtube.com/watch?v=lpsa5we4lGM',2,1,1,'2020-07-04 00:00:00',10,'2022-02-16 00:00:00',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `prod_links` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-16 12:14:54
