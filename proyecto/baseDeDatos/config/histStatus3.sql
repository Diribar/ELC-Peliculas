-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: c19353_elc
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.22-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `st_motivos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `st_motivos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `descripcion` varchar(40) NOT NULL,
  `grupo` varchar(15) DEFAULT NULL,
  `codigo` varchar(15) DEFAULT NULL,
  `prods` tinyint(1) DEFAULT 0,
  `rclvs` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `penalizac` decimal(4,1) unsigned DEFAULT 0.0,
  `comentNeces` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `st_motivos`
--

LOCK TABLES `st_motivos` WRITE;
/*!40000 ALTER TABLE `st_motivos` DISABLE KEYS */;
INSERT INTO `st_motivos` VALUES (10,12,'Distorsiona la memoria de lo ocurrido','generales',NULL,1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (11,18,'No pertenece a esta colección','técnicos','capitulos',1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (12,11,'Distorsiona la memoria del personaje','generales',NULL,1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (13,17,'Duplicado','técnicos','duplicado',1,1,0,0.0,0);
INSERT INTO `st_motivos` VALUES (14,13,'Sensualidad vulgar','generales',NULL,1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (15,18,'Es un capítulo de una colección','técnicos','peliculas',1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (16,14,'Inocuo/a, no deja una huella positiva','generales',NULL,1,1,0,0.0,0);
INSERT INTO `st_motivos` VALUES (17,16,'Sin link y no la conocemos','generales',NULL,1,0,0,0.0,0);
INSERT INTO `st_motivos` VALUES (18,18,'No es una colección','técnicos','colecciones',1,0,0,0.0,1);
INSERT INTO `st_motivos` VALUES (19,15,'Valores contrarios a los del evangelio','generales',NULL,1,1,0,0.0,1);
INSERT INTO `st_motivos` VALUES (20,19,'Otro motivo técnico','técnicos','otro',1,1,0,0.0,1);
INSERT INTO `st_motivos` VALUES (31,31,'Video no disponible','-',NULL,0,0,1,0.0,0);
INSERT INTO `st_motivos` VALUES (32,32,'Tenemos otro link mejor','-',NULL,0,0,1,0.0,0);
INSERT INTO `st_motivos` VALUES (33,33,'Pertenece a otra película','-',NULL,0,0,1,0.2,0);
INSERT INTO `st_motivos` VALUES (34,34,'No respeta los derechos de autor','-',NULL,0,0,1,0.0,0);
INSERT INTO `st_motivos` VALUES (35,35,'Mala calidad','-',NULL,0,0,1,0.0,0);
INSERT INTO `st_motivos` VALUES (90,90,'Otro motivo general','generales','otro',1,1,0,0.0,1);
/*!40000 ALTER TABLE `st_motivos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-12 19:07:43
