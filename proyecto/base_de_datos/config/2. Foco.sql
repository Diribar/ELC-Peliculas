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
-- Table structure for table `cn_opciones`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_opciones` (
  `id` tinyint(2) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(2) unsigned NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `entDefault_id` tinyint(1) unsigned NOT NULL,
  `cantidad` tinyint(3) unsigned DEFAULT NULL,
  `ascDes` varchar(4) NOT NULL,
  `boton` tinyint(1) unsigned DEFAULT 0,
  `loginNeces` tinyint(1) DEFAULT 0,
  `caps` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `activo` tinyint(1) unsigned DEFAULT 0,
  `ayuda` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigoUnico` (`codigo`),
  KEY `entidad` (`entDefault_id`),
  CONSTRAINT `entidad` FOREIGN KEY (`entDefault_id`) REFERENCES `cn_entidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cn_opciones`
--

LOCK TABLES `cn_opciones` WRITE;
/*!40000 ALTER TABLE `cn_opciones` DISABLE KEYS */;
INSERT INTO `cn_opciones` VALUES (1,2,'Por fecha del año','fechaDelAnoBoton',2,4,'ASC',1,0,1,1,'por fecha en que se recuerda al personaje, hecho, etc.');
INSERT INTO `cn_opciones` VALUES (2,1,'Sugerime al azar','azar',1,4,'DESC',1,0,0,1,'películas elegidas al azar cada hora');
INSERT INTO `cn_opciones` VALUES (3,8,'Por nombre','nombre',3,NULL,'ASC',0,0,1,0,'por nombre del personaje, hecho, etc.');
INSERT INTO `cn_opciones` VALUES (4,5,'Por año de ocurrencia','anoOcurrencia',2,NULL,'DESC',0,0,1,1,'por año de nacim. de una persona, comienzo de un hecho, etc.');
INSERT INTO `cn_opciones` VALUES (5,3,'Por últimas ingresadas','altaRevisadaEn',1,20,'DESC',0,0,0,1,'según la fecha en que aprobamos la película');
INSERT INTO `cn_opciones` VALUES (7,10,'Mis preferencias ','misPrefs',1,NULL,'DESC',0,1,1,1,'películas a las que les marcaste alguna preferencia');
INSERT INTO `cn_opciones` VALUES (8,7,'Por mejor calificadas','calificacion',1,20,'DESC',0,0,1,1,'según las calificaciones de los usuarios');
INSERT INTO `cn_opciones` VALUES (9,11,'Mis calificadas','misCalificadas',1,NULL,'DESC',0,1,1,1,'películas calificadas por vos');
INSERT INTO `cn_opciones` VALUES (10,9,'Mis últimas consultas','misConsultas',1,20,'DESC',0,1,1,1,'últimas películas consultadas por vos');
INSERT INTO `cn_opciones` VALUES (11,4,'Por año de estreno','anoEstreno',1,NULL,'DESC',0,0,0,1,'según el año en que se estrenó la película');
INSERT INTO `cn_opciones` VALUES (12,6,'Por fecha del año','fechaDelAnoListado',2,NULL,'ASC',0,0,1,1,'por fecha en que se recuerda al personaje, hecho, etc.');
/*!40000 ALTER TABLE `cn_opciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cn_entidades`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_entidades` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `orden` tinyint(1) unsigned NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `bhrSeguro` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombres` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cn_entidades`
--

LOCK TABLES `cn_entidades` WRITE;
/*!40000 ALTER TABLE `cn_entidades` DISABLE KEYS */;
INSERT INTO `cn_entidades` VALUES (1,'Películas',1,'productos',0);
INSERT INTO `cn_entidades` VALUES (2,'Todos',1,'rclvs',0);
INSERT INTO `cn_entidades` VALUES (3,'Personajes Históricos',2,'personajes',1);
INSERT INTO `cn_entidades` VALUES (4,'Hechos Históricos',3,'hechos',1);
INSERT INTO `cn_entidades` VALUES (5,'Temas',4,'temas',0);
/*!40000 ALTER TABLE `cn_entidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cn_ents_por_opc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_ents_por_opc` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `opcion_id` tinyint(1) unsigned NOT NULL,
  `entidad_id` tinyint(1) unsigned NOT NULL,
  `nombre` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_entidad` (`entidad_id`),
  KEY `FK_opcion` (`opcion_id`),
  CONSTRAINT `FK_entidad` FOREIGN KEY (`entidad_id`) REFERENCES `cn_entidades` (`id`),
  CONSTRAINT `FK_opcion` FOREIGN KEY (`opcion_id`) REFERENCES `cn_opciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cn_ents_por_opc`
--

LOCK TABLES `cn_ents_por_opc` WRITE;
/*!40000 ALTER TABLE `cn_ents_por_opc` DISABLE KEYS */;
INSERT INTO `cn_ents_por_opc` VALUES (6,3,3,'Por nombre');
INSERT INTO `cn_ents_por_opc` VALUES (7,3,4,'Por nombre');
INSERT INTO `cn_ents_por_opc` VALUES (8,3,5,'Por nombre');
INSERT INTO `cn_ents_por_opc` VALUES (9,4,2,'Por año de ocurrencia');
INSERT INTO `cn_ents_por_opc` VALUES (10,4,4,'Por año de ocurrencia');
INSERT INTO `cn_ents_por_opc` VALUES (17,4,3,'Por año de ocurrencia');
INSERT INTO `cn_ents_por_opc` VALUES (18,12,2,'Por fecha del año');
INSERT INTO `cn_ents_por_opc` VALUES (19,12,3,'Por fecha del año');
INSERT INTO `cn_ents_por_opc` VALUES (20,12,4,'Por fecha del año');
/*!40000 ALTER TABLE `cn_ents_por_opc` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-15 16:38:10
