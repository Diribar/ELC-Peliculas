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
-- Table structure for table `aux_logins_del_dia`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_logins_del_dia` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT utc_date(),
  `usuario_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_logins_del_dia`
--

LOCK TABLES `aux_logins_del_dia` WRITE;
/*!40000 ALTER TABLE `aux_logins_del_dia` DISABLE KEYS */;
INSERT INTO `aux_logins_del_dia` VALUES (1,'2023-12-13',11);
INSERT INTO `aux_logins_del_dia` VALUES (6,'2023-12-14',11);
INSERT INTO `aux_logins_del_dia` VALUES (7,'2023-12-15',11);
INSERT INTO `aux_logins_del_dia` VALUES (8,'2023-12-15',11);
INSERT INTO `aux_logins_del_dia` VALUES (9,'2023-12-16',11);
INSERT INTO `aux_logins_del_dia` VALUES (10,'2023-12-17',35);
INSERT INTO `aux_logins_del_dia` VALUES (11,'2023-12-18',11);
INSERT INTO `aux_logins_del_dia` VALUES (12,'2023-12-19',11);
INSERT INTO `aux_logins_del_dia` VALUES (13,'2023-12-19',11);
INSERT INTO `aux_logins_del_dia` VALUES (14,'2023-12-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (15,'2023-12-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (16,'2023-12-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (17,'2023-12-21',11);
INSERT INTO `aux_logins_del_dia` VALUES (18,'2023-12-22',11);
INSERT INTO `aux_logins_del_dia` VALUES (19,'2023-12-22',11);
INSERT INTO `aux_logins_del_dia` VALUES (20,'2023-12-24',11);
INSERT INTO `aux_logins_del_dia` VALUES (21,'2023-12-25',11);
INSERT INTO `aux_logins_del_dia` VALUES (22,'2023-12-26',11);
INSERT INTO `aux_logins_del_dia` VALUES (23,'2023-12-26',11);
INSERT INTO `aux_logins_del_dia` VALUES (24,'2023-12-26',1);
INSERT INTO `aux_logins_del_dia` VALUES (25,'2023-12-27',11);
INSERT INTO `aux_logins_del_dia` VALUES (26,'2023-12-27',11);
INSERT INTO `aux_logins_del_dia` VALUES (27,'2023-12-28',11);
INSERT INTO `aux_logins_del_dia` VALUES (28,'2023-12-28',11);
INSERT INTO `aux_logins_del_dia` VALUES (29,'2023-12-29',11);
INSERT INTO `aux_logins_del_dia` VALUES (30,'2023-12-30',11);
INSERT INTO `aux_logins_del_dia` VALUES (31,'2024-01-01',11);
INSERT INTO `aux_logins_del_dia` VALUES (32,'2024-01-01',11);
INSERT INTO `aux_logins_del_dia` VALUES (33,'2024-01-02',11);
INSERT INTO `aux_logins_del_dia` VALUES (34,'2024-01-02',11);
INSERT INTO `aux_logins_del_dia` VALUES (35,'2024-01-03',11);
INSERT INTO `aux_logins_del_dia` VALUES (36,'2024-01-04',11);
INSERT INTO `aux_logins_del_dia` VALUES (37,'2024-01-05',11);
INSERT INTO `aux_logins_del_dia` VALUES (38,'2024-01-05',11);
INSERT INTO `aux_logins_del_dia` VALUES (39,'2024-01-06',11);
INSERT INTO `aux_logins_del_dia` VALUES (40,'2024-01-07',11);
INSERT INTO `aux_logins_del_dia` VALUES (41,'2024-01-07',11);
INSERT INTO `aux_logins_del_dia` VALUES (42,'2024-01-08',11);
INSERT INTO `aux_logins_del_dia` VALUES (43,'2024-01-08',11);
INSERT INTO `aux_logins_del_dia` VALUES (44,'2024-01-08',11);
INSERT INTO `aux_logins_del_dia` VALUES (45,'2024-01-09',11);
INSERT INTO `aux_logins_del_dia` VALUES (46,'2024-01-10',11);
INSERT INTO `aux_logins_del_dia` VALUES (47,'2024-01-10',11);
INSERT INTO `aux_logins_del_dia` VALUES (48,'2024-01-10',11);
INSERT INTO `aux_logins_del_dia` VALUES (49,'2024-01-10',11);
INSERT INTO `aux_logins_del_dia` VALUES (50,'2024-01-12',11);
INSERT INTO `aux_logins_del_dia` VALUES (51,'2024-01-13',11);
INSERT INTO `aux_logins_del_dia` VALUES (52,'2024-01-14',11);
INSERT INTO `aux_logins_del_dia` VALUES (53,'2024-01-15',11);
INSERT INTO `aux_logins_del_dia` VALUES (54,'2024-01-16',11);
INSERT INTO `aux_logins_del_dia` VALUES (55,'2024-01-16',11);
INSERT INTO `aux_logins_del_dia` VALUES (56,'2024-01-17',11);
INSERT INTO `aux_logins_del_dia` VALUES (57,'2024-01-17',11);
INSERT INTO `aux_logins_del_dia` VALUES (58,'2024-01-18',11);
INSERT INTO `aux_logins_del_dia` VALUES (59,'2024-01-18',1);
INSERT INTO `aux_logins_del_dia` VALUES (60,'2024-01-18',11);
INSERT INTO `aux_logins_del_dia` VALUES (61,'2024-01-19',1);
INSERT INTO `aux_logins_del_dia` VALUES (62,'2024-01-19',11);
INSERT INTO `aux_logins_del_dia` VALUES (63,'2024-01-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (64,'2024-01-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (65,'2024-01-21',11);
INSERT INTO `aux_logins_del_dia` VALUES (66,'2024-01-21',11);
INSERT INTO `aux_logins_del_dia` VALUES (67,'2024-01-22',37);
INSERT INTO `aux_logins_del_dia` VALUES (68,'2024-01-22',11);
INSERT INTO `aux_logins_del_dia` VALUES (69,'2024-01-23',11);
INSERT INTO `aux_logins_del_dia` VALUES (70,'2024-01-24',11);
INSERT INTO `aux_logins_del_dia` VALUES (71,'2024-01-24',11);
INSERT INTO `aux_logins_del_dia` VALUES (72,'2024-01-25',11);
INSERT INTO `aux_logins_del_dia` VALUES (73,'2024-01-26',11);
INSERT INTO `aux_logins_del_dia` VALUES (74,'2024-01-26',11);
INSERT INTO `aux_logins_del_dia` VALUES (75,'2024-01-27',11);
INSERT INTO `aux_logins_del_dia` VALUES (76,'2024-01-29',11);
INSERT INTO `aux_logins_del_dia` VALUES (77,'2024-01-30',11);
INSERT INTO `aux_logins_del_dia` VALUES (78,'2024-02-02',11);
INSERT INTO `aux_logins_del_dia` VALUES (79,'2024-02-03',11);
INSERT INTO `aux_logins_del_dia` VALUES (80,'2024-02-04',11);
INSERT INTO `aux_logins_del_dia` VALUES (81,'2024-02-05',11);
INSERT INTO `aux_logins_del_dia` VALUES (82,'2024-02-06',11);
INSERT INTO `aux_logins_del_dia` VALUES (83,'2024-02-07',11);
INSERT INTO `aux_logins_del_dia` VALUES (84,'2024-02-08',11);
INSERT INTO `aux_logins_del_dia` VALUES (85,'2024-02-08',11);
INSERT INTO `aux_logins_del_dia` VALUES (86,'2024-02-10',11);
INSERT INTO `aux_logins_del_dia` VALUES (87,'2024-02-11',11);
INSERT INTO `aux_logins_del_dia` VALUES (88,'2024-02-12',11);
INSERT INTO `aux_logins_del_dia` VALUES (89,'2024-02-12',11);
INSERT INTO `aux_logins_del_dia` VALUES (90,'2024-02-13',11);
INSERT INTO `aux_logins_del_dia` VALUES (91,'2024-02-14',11);
INSERT INTO `aux_logins_del_dia` VALUES (92,'2024-02-15',11);
INSERT INTO `aux_logins_del_dia` VALUES (93,'2024-02-15',11);
INSERT INTO `aux_logins_del_dia` VALUES (94,'2024-02-16',11);
INSERT INTO `aux_logins_del_dia` VALUES (95,'2024-02-17',11);
INSERT INTO `aux_logins_del_dia` VALUES (96,'2024-02-18',11);
INSERT INTO `aux_logins_del_dia` VALUES (97,'2024-02-19',11);
INSERT INTO `aux_logins_del_dia` VALUES (98,'2024-02-20',11);
INSERT INTO `aux_logins_del_dia` VALUES (99,'2024-02-21',11);
INSERT INTO `aux_logins_del_dia` VALUES (100,'2024-02-22',11);
INSERT INTO `aux_logins_del_dia` VALUES (101,'2024-02-23',11);
INSERT INTO `aux_logins_del_dia` VALUES (102,'2024-02-25',11);
INSERT INTO `aux_logins_del_dia` VALUES (103,'2024-02-25',38);
INSERT INTO `aux_logins_del_dia` VALUES (104,'2024-02-26',11);
INSERT INTO `aux_logins_del_dia` VALUES (105,'2024-02-27',11);
INSERT INTO `aux_logins_del_dia` VALUES (106,'2024-02-28',11);
INSERT INTO `aux_logins_del_dia` VALUES (107,'2024-02-29',11);
INSERT INTO `aux_logins_del_dia` VALUES (108,'2024-03-01',11);
INSERT INTO `aux_logins_del_dia` VALUES (109,'2024-03-02',11);
INSERT INTO `aux_logins_del_dia` VALUES (110,'2024-03-03',11);
INSERT INTO `aux_logins_del_dia` VALUES (111,'2024-03-04',11);
INSERT INTO `aux_logins_del_dia` VALUES (112,'2024-03-04',11);
INSERT INTO `aux_logins_del_dia` VALUES (113,'2024-03-05',11);
INSERT INTO `aux_logins_del_dia` VALUES (114,'2024-03-06',11);
/*!40000 ALTER TABLE `aux_logins_del_dia` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-06 15:39:48
