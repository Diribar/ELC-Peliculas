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
-- Table structure for table `links_provs_cant_links`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links_provs_cant_links` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `link_id` tinyint(3) unsigned NOT NULL,
  `cantidad` smallint(6) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `linksProvsCantLinks` (`link_id`),
  CONSTRAINT `linksProvsCantLinks` FOREIGN KEY (`link_id`) REFERENCES `links_provs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links_provs_cant_links`
--

LOCK TABLES `links_provs_cant_links` WRITE;
/*!40000 ALTER TABLE `links_provs_cant_links` DISABLE KEYS */;
INSERT INTO `links_provs_cant_links` VALUES (1,1,0);
INSERT INTO `links_provs_cant_links` VALUES (2,11,0);
INSERT INTO `links_provs_cant_links` VALUES (3,12,0);
INSERT INTO `links_provs_cant_links` VALUES (4,13,0);
INSERT INTO `links_provs_cant_links` VALUES (5,14,0);
INSERT INTO `links_provs_cant_links` VALUES (6,15,0);
INSERT INTO `links_provs_cant_links` VALUES (7,16,0);
INSERT INTO `links_provs_cant_links` VALUES (8,17,0);
INSERT INTO `links_provs_cant_links` VALUES (9,19,0);
INSERT INTO `links_provs_cant_links` VALUES (10,20,0);
INSERT INTO `links_provs_cant_links` VALUES (11,21,0);
INSERT INTO `links_provs_cant_links` VALUES (12,22,0);
INSERT INTO `links_provs_cant_links` VALUES (13,23,0);
INSERT INTO `links_provs_cant_links` VALUES (14,25,0);
INSERT INTO `links_provs_cant_links` VALUES (15,26,0);
INSERT INTO `links_provs_cant_links` VALUES (16,27,0);
/*!40000 ALTER TABLE `links_provs_cant_links` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
ALTER TABLE c19353_elc.links_provs DROP COLUMN cantLinks;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-27 16:40:53
