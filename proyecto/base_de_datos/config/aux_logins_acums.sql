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
-- Table structure for table `aux_logins_acums`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_logins_acums` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT utc_date(),
  `diaSem` varchar(3) DEFAULT NULL,
  `anoMes` varchar(7) DEFAULT NULL,
  `cantLogins` smallint(5) unsigned DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_logins_acums`
--

LOCK TABLES `aux_logins_acums` WRITE;
/*!40000 ALTER TABLE `aux_logins_acums` DISABLE KEYS */;
INSERT INTO `aux_logins_acums` VALUES (8,'2023-12-13','Mié','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (9,'2023-12-14','Jue','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (10,'2023-12-15','Vie','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (11,'2023-12-15','Vie','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (12,'2023-12-16','Sáb','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (13,'2023-12-17','Dom','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (14,'2023-12-18','Lun','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (15,'2023-12-19','Mar','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (16,'2023-12-20','Mié','2023-12',3);
INSERT INTO `aux_logins_acums` VALUES (17,'2023-12-21','Jue','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (18,'2023-12-22','Vie','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (19,'2023-12-23','Sáb','2023-12',0);
INSERT INTO `aux_logins_acums` VALUES (20,'2023-12-24','Dom','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (21,'2023-12-25','Lun','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (22,'2023-12-26','Mar','2023-12',3);
INSERT INTO `aux_logins_acums` VALUES (23,'2023-12-26','Mar','2023-12',3);
INSERT INTO `aux_logins_acums` VALUES (24,'2023-12-27','Mié','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (25,'2023-12-28','Jue','2023-12',2);
INSERT INTO `aux_logins_acums` VALUES (26,'2023-12-29','Vie','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (27,'2023-12-30','Sáb','2023-12',1);
INSERT INTO `aux_logins_acums` VALUES (28,'2023-12-31','Dom','2023-12',0);
INSERT INTO `aux_logins_acums` VALUES (29,'2024-01-01','Lun','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (30,'2024-01-02','Mar','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (31,'2024-01-03','Mié','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (32,'2024-01-04','Jue','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (33,'2024-01-05','Vie','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (34,'2024-01-06','Sáb','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (35,'2024-01-07','Dom','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (36,'2024-01-08','Lun','2024-01',3);
INSERT INTO `aux_logins_acums` VALUES (37,'2024-01-09','Mar','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (38,'2024-01-10','Mié','2024-01',4);
INSERT INTO `aux_logins_acums` VALUES (39,'2024-01-11','Jue','2024-01',0);
INSERT INTO `aux_logins_acums` VALUES (40,'2024-01-12','Vie','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (41,'2024-01-13','Sáb','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (42,'2024-01-14','Dom','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (43,'2024-01-15','Lun','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (44,'2024-01-16','Mar','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (45,'2024-01-17','Mié','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (46,'2024-01-17','Mié','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (47,'2024-01-18','Jue','2024-01',3);
INSERT INTO `aux_logins_acums` VALUES (48,'2024-01-19','Vie','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (49,'2024-01-20','Sáb','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (50,'2024-01-21','Dom','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (51,'2024-01-22','Lun','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (52,'2024-01-23','Mar','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (53,'2024-01-24','Mié','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (54,'2024-01-25','Jue','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (55,'2024-01-25','Jue','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (56,'2024-01-26','Vie','2024-01',2);
INSERT INTO `aux_logins_acums` VALUES (57,'2024-01-27','Sáb','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (58,'2024-01-28','Dom','2024-01',0);
INSERT INTO `aux_logins_acums` VALUES (59,'2024-01-29','Lun','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (60,'2024-01-30','Mar','2024-01',1);
INSERT INTO `aux_logins_acums` VALUES (61,'2024-01-31','Mié','2024-01',0);
INSERT INTO `aux_logins_acums` VALUES (62,'2024-02-01','Jue','2024-02',0);
INSERT INTO `aux_logins_acums` VALUES (63,'2024-02-02','Vie','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (64,'2024-02-03','Sáb','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (65,'2024-02-04','Dom','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (66,'2024-02-05','Lun','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (67,'2024-02-06','Mar','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (68,'2024-02-07','Mié','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (69,'2024-02-08','Jue','2024-02',2);
INSERT INTO `aux_logins_acums` VALUES (70,'2024-02-09','Vie','2024-02',0);
INSERT INTO `aux_logins_acums` VALUES (71,'2024-02-10','Sáb','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (72,'2024-02-11','Dom','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (73,'2024-02-12','Lun','2024-02',2);
INSERT INTO `aux_logins_acums` VALUES (74,'2024-02-13','Mar','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (75,'2024-02-14','Mié','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (76,'2024-02-15','Jue','2024-02',2);
INSERT INTO `aux_logins_acums` VALUES (77,'2024-02-15','Jue','2024-02',2);
INSERT INTO `aux_logins_acums` VALUES (78,'2024-02-16','Vie','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (79,'2024-02-17','Sáb','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (80,'2024-02-18','Dom','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (81,'2024-02-19','Lun','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (82,'2024-02-20','Mar','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (83,'2024-02-21','Mié','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (84,'2024-02-22','Jue','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (85,'2024-02-23','Vie','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (86,'2024-02-24','Sáb','2024-02',0);
INSERT INTO `aux_logins_acums` VALUES (87,'2024-02-25','Dom','2024-02',2);
INSERT INTO `aux_logins_acums` VALUES (88,'2024-02-26','Lun','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (89,'2024-02-27','Mar','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (90,'2024-02-28','Mié','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (91,'2024-02-29','Jue','2024-02',1);
INSERT INTO `aux_logins_acums` VALUES (92,'2024-03-01','Vie','2024-03',1);
INSERT INTO `aux_logins_acums` VALUES (93,'2024-03-02','Sáb','2024-03',1);
INSERT INTO `aux_logins_acums` VALUES (94,'2024-03-03','Dom','2024-03',1);
INSERT INTO `aux_logins_acums` VALUES (95,'2024-03-04','Lun','2024-03',2);
INSERT INTO `aux_logins_acums` VALUES (96,'2024-03-05','Mar','2024-03',1);
/*!40000 ALTER TABLE `aux_logins_acums` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-06 15:39:05
