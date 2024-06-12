use c19353_elc;
DROP TABLE IF EXISTS c19353_elc.cam_hist_status;

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
-- Table structure for table `cam_hist_status`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_hist_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `statusOriginal_id` tinyint(3) unsigned NOT NULL,
  `statusFinal_id` tinyint(3) unsigned NOT NULL,
  `statusOriginalPor_id` int(10) unsigned NOT NULL,
  `statusFinalPor_id` int(10) unsigned NOT NULL,
  `statusOriginalEn` datetime NOT NULL,
  `statusFinalEn` datetime NOT NULL DEFAULT utc_date(),
  `penalizac` decimal(4,1) unsigned DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `comentario` varchar(150) NOT NULL,
  `comunicadoEn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sugerido_por_id` (`statusOriginalPor_id`),
  KEY `revisado_por_id` (`statusFinalPor_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `status_original_id` (`statusOriginal_id`),
  KEY `status_final_id` (`statusFinal_id`),
  CONSTRAINT `cam_hist_status_ibfk_1` FOREIGN KEY (`statusOriginalPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_2` FOREIGN KEY (`statusFinalPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_3` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_4` FOREIGN KEY (`statusOriginal_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_5` FOREIGN KEY (`statusFinal_id`) REFERENCES `aux_status_registros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cam_hist_status`
--

LOCK TABLES `cam_hist_status` WRITE;
/*!40000 ALTER TABLE `cam_hist_status` DISABLE KEYS */;
INSERT INTO `cam_hist_status` VALUES (2,'peliculas',318,4,6,1,11,'2023-06-14 16:26:32','2023-06-15 01:22:02',NULL,3,'Cameo innecesario','2023-06-15 03:12:04');
INSERT INTO `cam_hist_status` VALUES (3,'peliculas',231,1,6,1,11,'2023-03-26 02:13:26','2023-06-16 03:08:52',0.0,12,'El protagonismo no pasa por la vida del santo sino por el preso que se escapó del campo de concentración','2023-06-17 03:54:51');
INSERT INTO `cam_hist_status` VALUES (5,'peliculas',123,4,6,1,11,'2023-06-16 23:00:51','2023-06-17 04:27:03',NULL,12,'El protagonismo no pasa por el Papa sino por una historia de amor ficticia en una pareja,  y usa de entorno al Papa y la II Guerra Mundial','2023-06-18 12:01:07');
INSERT INTO `cam_hist_status` VALUES (7,'peliculas',275,4,6,1,11,'2023-08-07 04:03:17','2023-08-07 04:03:59',NULL,3,'Se le da excesiva duración al baile sensual a Herodes','2023-09-19 21:27:28');
INSERT INTO `cam_hist_status` VALUES (9,'peliculas',131,4,6,1,11,'2023-08-21 01:12:23','2023-08-21 01:12:45',NULL,4,'No es una película sino una obra de teatro','2023-09-19 21:27:28');
INSERT INTO `cam_hist_status` VALUES (10,'peliculas',59,1,6,1,11,'2023-02-15 20:55:54','2023-09-14 11:20:04',0.0,12,'Muy antigua','2023-09-19 21:27:28');
INSERT INTO `cam_hist_status` VALUES (12,'peliculas',294,4,6,11,11,'2023-09-18 21:32:38','2023-09-18 21:32:58',NULL,12,'Distorsiona la memoria del personaje','2023-09-19 21:27:29');
INSERT INTO `cam_hist_status` VALUES (14,'peliculas',126,4,6,11,11,'2023-09-23 00:51:21','2023-09-23 00:51:34',NULL,4,'No es afín a nuestro perfil','2023-09-28 03:01:07');
INSERT INTO `cam_hist_status` VALUES (16,'peliculas',332,4,6,11,11,'2023-10-06 01:37:25','2023-10-06 01:38:42',NULL,3,'','2023-10-06 03:01:12');
INSERT INTO `cam_hist_status` VALUES (18,'peliculas',441,4,6,11,11,'2023-10-11 02:23:01','2023-10-11 02:23:27',NULL,4,'','2023-10-22 03:01:20');
INSERT INTO `cam_hist_status` VALUES (19,'colecciones',54,1,6,11,11,'2023-10-24 11:13:56','2023-10-24 11:14:53',0.1,1,'Duplicado: pelicula 163','2023-10-25 03:01:07');
INSERT INTO `cam_hist_status` VALUES (21,'peliculas',448,4,6,11,11,'2023-10-28 11:04:46','2023-10-28 11:53:27',NULL,4,'La conversión a la fe del protagonista no convence,  se ve superficial','2023-10-29 03:01:07');
INSERT INTO `cam_hist_status` VALUES (23,'peliculas',530,1,6,11,11,'2023-11-15 16:36:03','2023-11-15 16:37:49',0.5,4,'','2023-11-29 03:09:46');
INSERT INTO `cam_hist_status` VALUES (33,'peliculas',31,1,6,11,11,'2023-01-06 04:18:25','2023-12-27 20:53:42',0.0,12,'No tenemos links sobre ella y es difícil de encontrar','2023-12-28 03:01:09');
INSERT INTO `cam_hist_status` VALUES (36,'peliculas',395,4,6,11,11,'2023-12-27 21:37:45','2023-12-27 21:37:58',NULL,4,'','2023-12-28 03:01:09');
INSERT INTO `cam_hist_status` VALUES (37,'peliculas',492,4,6,11,11,'2023-12-27 21:19:39','2023-12-27 21:38:04',NULL,4,'','2023-12-28 03:01:09');
INSERT INTO `cam_hist_status` VALUES (41,'peliculas',522,4,6,11,11,'2023-12-21 23:12:01','2024-01-04 02:10:37',NULL,4,'','2024-01-04 03:01:08');
INSERT INTO `cam_hist_status` VALUES (42,'peliculas',497,4,6,11,11,'2024-01-02 04:35:18','2024-01-04 02:10:48',NULL,4,'','2024-01-04 03:01:08');
INSERT INTO `cam_hist_status` VALUES (44,'peliculas',561,4,6,11,11,'2024-01-09 00:31:56','2024-01-09 00:32:16',NULL,1,'Duplicado: capítulo 335','2024-01-09 03:01:09');
INSERT INTO `cam_hist_status` VALUES (47,'colecciones',3,4,6,11,11,'2024-01-14 11:55:55','2024-02-16 11:52:50',NULL,12,'No es una colección','2024-02-17 03:01:18');
INSERT INTO `cam_hist_status` VALUES (49,'colecciones',3,5,3,11,11,'2024-02-16 11:55:19','2024-02-16 11:55:34',NULL,NULL,'La vamos a mantener también como colección','2024-02-17 03:01:18');
INSERT INTO `cam_hist_status` VALUES (50,'capitulos',1157,1,6,11,11,'2023-09-28 11:17:34','2024-02-17 13:05:56',0.1,1,'Duplicado: pelicula 16; no pertenece a esta coleccion',NULL);
INSERT INTO `cam_hist_status` VALUES (51,'capitulos',1385,1,6,11,11,'2024-02-16 23:04:19','2024-02-17 13:22:50',0.1,1,'Duplicado: capitulo 325; no pertenece a esta colección',NULL);
INSERT INTO `cam_hist_status` VALUES (52,'capitulos',1156,1,6,11,11,'2023-09-28 11:17:34','2024-02-17 13:47:01',0.1,1,'Duplicado: capitulo 323; no pertenece a esta colección',NULL);
INSERT INTO `cam_hist_status` VALUES (56,'peliculas',550,4,6,11,11,'2024-02-19 04:41:11','2024-02-19 04:41:20',NULL,4,'','2024-02-20 03:01:11');
INSERT INTO `cam_hist_status` VALUES (66,'peliculas',536,4,6,11,11,'2024-03-10 22:09:57','2024-03-11 14:04:35',NULL,4,'','2024-03-12 03:01:10');
INSERT INTO `cam_hist_status` VALUES (67,'peliculas',588,4,6,11,11,'2024-03-09 09:55:11','2024-03-11 14:36:59',NULL,12,'No disponemos de su link','2024-03-12 03:01:10');
INSERT INTO `cam_hist_status` VALUES (69,'peliculas',429,4,6,11,11,'2024-03-19 00:57:40','2024-03-19 01:29:43',NULL,3,'','2024-03-19 03:01:22');
INSERT INTO `cam_hist_status` VALUES (70,'peliculas',25,1,6,11,11,'2023-01-06 03:33:05','2024-03-19 01:43:32',0.5,4,'','2024-03-19 03:01:22');
INSERT INTO `cam_hist_status` VALUES (71,'peliculas',14,3,4,11,11,'2023-08-14 18:32:11','2024-04-01 20:10:33',NULL,12,'Película antigua y sin link',NULL);
INSERT INTO `cam_hist_status` VALUES (82,'peliculas',130,5,6,11,11,'2024-04-23 17:31:51','2024-04-23 17:57:15',NULL,12,'Distorsiona la memoria del personaje',NULL);
INSERT INTO `cam_hist_status` VALUES (83,'peliculas',609,1,6,11,11,'2024-04-02 00:32:05','2024-04-23 18:31:20',0.0,12,'Distorsiona la memoria del personaje',NULL);
/*!40000 ALTER TABLE `cam_hist_status` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-12  7:46:39
