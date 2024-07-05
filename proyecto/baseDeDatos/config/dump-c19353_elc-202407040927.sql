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
-- Table structure for table `st_historial`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `st_historial` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `statusOriginal_id` tinyint(3) unsigned NOT NULL,
  `statusFinal_id` tinyint(3) unsigned NOT NULL,
  `statusOriginalPor_id` int(10) unsigned DEFAULT NULL,
  `statusFinalPor_id` int(10) unsigned DEFAULT NULL,
  `statusOriginalEn` datetime NOT NULL,
  `statusFinalEn` datetime DEFAULT utc_timestamp(),
  `penalizac` decimal(4,1) unsigned DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `comentario` varchar(150) DEFAULT NULL,
  `comunicadoEn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sugerido_por_id` (`statusOriginalPor_id`),
  KEY `revisado_por_id` (`statusFinalPor_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `status_original_id` (`statusOriginal_id`),
  KEY `status_final_id` (`statusFinal_id`),
  CONSTRAINT `st_historial_ibfk_1` FOREIGN KEY (`statusOriginalPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `st_historial_ibfk_2` FOREIGN KEY (`statusFinalPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `st_historial_ibfk_3` FOREIGN KEY (`motivo_id`) REFERENCES `st_motivos` (`id`),
  CONSTRAINT `st_historial_ibfk_4` FOREIGN KEY (`statusOriginal_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `st_historial_ibfk_5` FOREIGN KEY (`statusFinal_id`) REFERENCES `aux_status_registros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `st_historial`
--

LOCK TABLES `st_historial` WRITE;
/*!40000 ALTER TABLE `st_historial` DISABLE KEYS */;
INSERT INTO `st_historial` VALUES (1,'peliculas',318,4,6,1,11,'2023-06-14 16:26:32','2023-06-15 01:22:02',NULL,14,'Cameo innecesario','2023-06-15 03:12:04');
INSERT INTO `st_historial` VALUES (2,'peliculas',231,1,6,1,11,'2023-03-26 02:13:26','2023-06-16 03:08:52',0.0,90,'El protagonismo pasa por el prisionero que se escapó del campo de concentración','2023-06-17 03:54:51');
INSERT INTO `st_historial` VALUES (3,'peliculas',123,4,6,1,11,'2023-06-16 23:00:51','2023-06-17 04:27:03',NULL,90,'El protagonismo pasa por una historia de amor en una pareja, entorno al Papa y la II Guerra Mundial','2023-06-18 12:01:07');
INSERT INTO `st_historial` VALUES (4,'peliculas',275,4,6,1,11,'2023-08-07 04:03:17','2023-08-07 04:03:59',NULL,14,'Se le da excesiva duración al baile sensual a Herodes','2023-09-19 21:27:28');
INSERT INTO `st_historial` VALUES (5,'peliculas',131,4,6,1,11,'2023-08-21 01:12:23','2023-08-21 01:12:45',NULL,90,'No es una película sino una obra de teatro','2023-09-19 21:27:28');
INSERT INTO `st_historial` VALUES (6,'peliculas',59,1,6,1,11,'2023-02-15 20:55:54','2023-09-14 11:20:04',0.0,90,'Muy antigua','2023-09-19 21:27:28');
INSERT INTO `st_historial` VALUES (7,'peliculas',294,4,6,11,11,'2023-09-18 21:32:38','2023-09-18 21:32:58',NULL,90,'Tendenciosa, muestra personajes anónimos de nuestra Iglesia con comportamiento perverso','2023-09-19 21:27:29');
INSERT INTO `st_historial` VALUES (8,'peliculas',332,4,6,11,11,'2023-10-06 01:37:25','2023-10-06 01:38:42',NULL,19,'Muestra un beso entre varones como diversión, interior de vestuarios de varones','2023-10-06 03:01:12');
INSERT INTO `st_historial` VALUES (9,'peliculas',441,4,6,11,11,'2023-10-11 02:23:01','2023-10-11 02:23:27',NULL,19,'Muestra como aceptable una relación sexual fuera del matrimonio','2023-10-22 03:01:20');
INSERT INTO `st_historial` VALUES (10,'colecciones',54,1,6,11,11,'2023-10-24 11:13:56','2023-10-24 11:14:53',0.1,13,'Duplicado: pelicula 163','2023-10-25 03:01:07');
INSERT INTO `st_historial` VALUES (11,'peliculas',448,4,6,11,11,'2023-10-28 11:04:46','2023-10-28 11:53:27',NULL,90,'La conversión a la fe del protagonista no convence,  se ve superficial','2023-10-29 03:01:07');
INSERT INTO `st_historial` VALUES (12,'peliculas',31,1,6,11,11,'2023-01-06 04:18:25','2023-12-27 20:53:42',0.0,17,NULL,'2023-12-28 03:01:09');
INSERT INTO `st_historial` VALUES (13,'peliculas',561,4,6,11,11,'2024-01-09 00:31:56','2024-01-09 00:32:16',NULL,13,'Duplicado: capítulo 335','2024-01-09 03:01:09');
INSERT INTO `st_historial` VALUES (14,'colecciones',3,4,6,11,11,'2024-01-14 11:55:55','2024-02-16 11:52:50',NULL,90,'No es una colección','2024-02-17 03:01:18');
INSERT INTO `st_historial` VALUES (15,'colecciones',3,5,3,11,11,'2024-02-16 11:55:19','2024-02-16 11:55:34',NULL,90,'La vamos a mantener también como colección','2024-02-17 03:01:18');
INSERT INTO `st_historial` VALUES (16,'capitulos',1157,1,6,11,11,'2023-09-28 11:17:34','2024-02-17 13:05:56',0.1,11,'','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (17,'capitulos',1385,1,6,11,11,'2024-02-16 23:04:19','2024-02-17 13:22:50',0.1,11,'','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (18,'capitulos',1156,1,6,11,11,'2023-09-28 11:17:34','2024-02-17 13:47:01',0.1,11,'','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (19,'peliculas',536,4,6,11,11,'2024-03-10 22:09:57','2024-03-11 14:04:35',NULL,16,'Inocua, no deja huella','2024-03-12 03:01:10');
INSERT INTO `st_historial` VALUES (20,'peliculas',588,4,6,11,11,'2024-03-09 09:55:11','2024-03-11 14:36:59',NULL,17,NULL,'2024-03-12 03:01:10');
INSERT INTO `st_historial` VALUES (21,'peliculas',429,4,6,11,11,'2024-03-19 00:57:40','2024-03-19 01:29:43',NULL,14,'Baile provocativo innecesariamente prolongado','2024-03-19 03:01:22');
INSERT INTO `st_historial` VALUES (22,'peliculas',14,3,4,11,11,'2023-08-14 18:32:11','2024-04-01 20:10:33',NULL,17,'',NULL);
INSERT INTO `st_historial` VALUES (23,'peliculas',130,5,6,11,11,'2024-04-23 17:31:51','2024-04-23 17:57:15',NULL,12,'','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (24,'peliculas',609,1,6,11,11,'2024-04-02 00:32:05','2024-04-23 18:31:20',0.0,12,'','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (25,'peliculas',450,1,6,11,11,'2023-09-13 21:17:46','2024-06-03 03:17:30',NULL,14,NULL,'2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (26,'peliculas',447,1,6,11,11,'2023-09-11 19:37:15','2024-06-09 02:14:36',NULL,90,'Se muestra el corte de un dedo, y el degüello de una chica','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (27,'hechos',58,1,6,1,11,'2023-03-27 13:27:56','2023-04-01 12:16:56',NULL,NULL,NULL,'2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (28,'hechos',58,6,5,11,NULL,'2023-04-01 12:16:56','2023-04-01 12:16:56',NULL,NULL,NULL,NULL);
INSERT INTO `st_historial` VALUES (29,'peliculas',59,5,2,11,11,'2024-06-14 18:43:24','2024-06-14 18:55:27',NULL,90,'Muy antigua','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (30,'capitulos',1157,6,5,11,11,'2024-02-17 13:05:56','2024-06-14 21:32:11',NULL,11,'Prueba',NULL);
INSERT INTO `st_historial` VALUES (31,'hechos',58,4,3,11,11,'2024-06-13 15:17:35','2024-06-16 07:53:52',NULL,NULL,'La quiero','2024-06-17 03:01:07');
INSERT INTO `st_historial` VALUES (32,'peliculas',546,2,4,11,11,'2023-12-06 19:21:28','2024-06-18 18:17:23',NULL,14,'Desnudo innecesario',NULL);
INSERT INTO `st_historial` VALUES (33,'peliculas',546,4,6,11,11,'2024-06-18 18:17:23','2024-06-18 18:17:30',NULL,14,'','2024-06-21 03:01:11');
INSERT INTO `st_historial` VALUES (35,'capitulos',131,4,6,NULL,11,'2023-06-24 03:52:24','2024-05-30 19:56:02',NULL,NULL,NULL,NULL);
INSERT INTO `st_historial` VALUES (36,'peliculas',493,2,4,11,11,'2023-10-25 13:48:51','2024-06-29 01:29:12',NULL,13,'',NULL);
INSERT INTO `st_historial` VALUES (37,'peliculas',493,4,6,11,11,'2024-06-29 01:29:12','2024-07-01 03:16:42',0.0,13,'Duplicado con','2024-07-02 03:01:03');
INSERT INTO `st_historial` VALUES (38,'peliculas',632,1,6,11,11,'2024-06-10 02:20:55','2024-07-02 16:13:42',NULL,90,'Esto es una prueba','2024-07-03 03:01:08');
INSERT INTO `st_historial` VALUES (39,'peliculas',629,1,6,11,11,'2024-06-03 02:05:16','2024-07-02 16:14:11',NULL,NULL,NULL,'2024-07-03 03:01:08');
INSERT INTO `st_historial` VALUES (40,'peliculas',634,1,6,11,11,'2024-06-10 11:36:23','2024-07-02 16:15:10',NULL,12,'Se muestra a madre Teresa agresiva','2024-07-03 03:01:08');
INSERT INTO `st_historial` VALUES (41,'peliculas',14,4,6,11,11,'2024-07-01 03:11:13','2024-07-02 19:10:14',0.0,12,'Esto es una prueba','2024-07-03 03:01:08');
/*!40000 ALTER TABLE `st_historial` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-04  9:27:02
