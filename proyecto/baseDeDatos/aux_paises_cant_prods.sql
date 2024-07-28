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
-- Table structure for table `aux_paises_cant_prods`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_paises_cant_prods` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `pais_id` varchar(2) NOT NULL,
  `cantidad` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aux_paisesCantProdsPais_id` (`pais_id`)
  CONSTRAINT `aux_paisesCantProdsPais` FOREIGN KEY (`pais_id`) REFERENCES `aux_paises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=252 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `aux_paises_cant_prods` WRITE;
INSERT INTO `aux_paises_cant_prods` VALUES (1,'AD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (2,'AE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (3,'AF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (4,'AG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (5,'AI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (6,'AL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (7,'AM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (8,'AO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (9,'AQ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (10,'AR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (11,'AS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (12,'AT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (13,'AU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (14,'AW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (15,'AX',0);
INSERT INTO `aux_paises_cant_prods` VALUES (16,'AZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (17,'BA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (18,'BB',0);
INSERT INTO `aux_paises_cant_prods` VALUES (19,'BD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (20,'BE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (21,'BF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (22,'BG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (23,'BH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (24,'BI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (25,'BJ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (26,'BL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (27,'BM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (28,'BN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (29,'BO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (30,'BQ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (31,'BR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (32,'BS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (33,'BT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (34,'BV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (35,'BW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (36,'BY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (37,'BZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (38,'CA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (39,'CC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (40,'CD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (41,'CF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (42,'CG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (43,'CH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (44,'CI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (45,'CK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (46,'CL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (47,'CM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (48,'CN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (49,'CO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (50,'CR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (51,'CU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (52,'CV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (53,'CW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (54,'CX',0);
INSERT INTO `aux_paises_cant_prods` VALUES (55,'CY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (56,'CZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (57,'DE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (58,'DJ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (59,'DK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (60,'DM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (61,'DO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (62,'DZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (63,'EC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (64,'EE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (65,'EG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (66,'EH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (67,'ER',0);
INSERT INTO `aux_paises_cant_prods` VALUES (68,'ES',0);
INSERT INTO `aux_paises_cant_prods` VALUES (69,'ET',0);
INSERT INTO `aux_paises_cant_prods` VALUES (70,'FI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (71,'FJ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (72,'FK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (73,'FM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (74,'FO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (75,'FR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (76,'GA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (77,'GB',0);
INSERT INTO `aux_paises_cant_prods` VALUES (78,'GD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (79,'GE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (80,'GF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (81,'GG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (82,'GH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (83,'GI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (84,'GL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (85,'GM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (86,'GN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (87,'GP',0);
INSERT INTO `aux_paises_cant_prods` VALUES (88,'GQ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (89,'GR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (90,'GS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (91,'GT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (92,'GU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (93,'GW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (94,'GY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (95,'HK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (96,'HM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (97,'HN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (98,'HR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (99,'HT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (100,'HU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (101,'ID',0);
INSERT INTO `aux_paises_cant_prods` VALUES (102,'IE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (103,'IL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (104,'IM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (105,'IN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (106,'IO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (107,'IQ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (108,'IR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (109,'IS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (110,'IT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (111,'JE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (112,'JM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (113,'JO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (114,'JP',0);
INSERT INTO `aux_paises_cant_prods` VALUES (115,'KE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (116,'KG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (117,'KH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (118,'KI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (119,'KM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (120,'KN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (121,'KP',0);
INSERT INTO `aux_paises_cant_prods` VALUES (122,'KR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (123,'KW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (124,'KY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (125,'KZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (126,'LA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (127,'LB',0);
INSERT INTO `aux_paises_cant_prods` VALUES (128,'LC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (129,'LI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (130,'LK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (131,'LR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (132,'LS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (133,'LT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (134,'LU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (135,'LV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (136,'LY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (137,'MA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (138,'MC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (139,'MD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (140,'ME',0);
INSERT INTO `aux_paises_cant_prods` VALUES (141,'MF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (142,'MG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (143,'MH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (144,'MK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (145,'ML',0);
INSERT INTO `aux_paises_cant_prods` VALUES (146,'MM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (147,'MN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (148,'MO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (149,'MP',0);
INSERT INTO `aux_paises_cant_prods` VALUES (150,'MQ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (151,'MR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (152,'MS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (153,'MT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (154,'MU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (155,'MV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (156,'MW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (157,'MX',0);
INSERT INTO `aux_paises_cant_prods` VALUES (158,'MY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (159,'MZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (160,'NA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (161,'NC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (162,'NE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (163,'NF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (164,'NG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (165,'NI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (166,'NL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (167,'NN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (168,'NO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (169,'NP',0);
INSERT INTO `aux_paises_cant_prods` VALUES (170,'NR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (171,'NU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (172,'NZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (173,'OM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (174,'PA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (175,'PE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (176,'PF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (177,'PG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (178,'PH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (179,'PK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (180,'PL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (181,'PM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (182,'PN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (183,'PR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (184,'PS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (185,'PT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (186,'PW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (187,'PY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (188,'QA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (189,'RE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (190,'RO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (191,'RS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (192,'RU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (193,'RW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (194,'SA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (195,'SB',0);
INSERT INTO `aux_paises_cant_prods` VALUES (196,'SC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (197,'SD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (198,'SE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (199,'SG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (200,'SH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (201,'SI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (202,'SJ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (203,'SK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (204,'SL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (205,'SM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (206,'SN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (207,'SO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (208,'SR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (209,'SS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (210,'ST',0);
INSERT INTO `aux_paises_cant_prods` VALUES (211,'SV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (212,'SX',0);
INSERT INTO `aux_paises_cant_prods` VALUES (213,'SY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (214,'SZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (215,'TC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (216,'TD',0);
INSERT INTO `aux_paises_cant_prods` VALUES (217,'TF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (218,'TG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (219,'TH',0);
INSERT INTO `aux_paises_cant_prods` VALUES (220,'TJ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (221,'TK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (222,'TL',0);
INSERT INTO `aux_paises_cant_prods` VALUES (223,'TM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (224,'TN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (225,'TO',0);
INSERT INTO `aux_paises_cant_prods` VALUES (226,'TR',0);
INSERT INTO `aux_paises_cant_prods` VALUES (227,'TT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (228,'TV',0);
INSERT INTO `aux_paises_cant_prods` VALUES (229,'TW',0);
INSERT INTO `aux_paises_cant_prods` VALUES (230,'TZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (231,'UA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (232,'UG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (233,'UM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (234,'US',0);
INSERT INTO `aux_paises_cant_prods` VALUES (235,'UY',0);
INSERT INTO `aux_paises_cant_prods` VALUES (236,'UZ',0);
INSERT INTO `aux_paises_cant_prods` VALUES (237,'VA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (238,'VC',0);
INSERT INTO `aux_paises_cant_prods` VALUES (239,'VE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (240,'VG',0);
INSERT INTO `aux_paises_cant_prods` VALUES (241,'VI',0);
INSERT INTO `aux_paises_cant_prods` VALUES (242,'VN',0);
INSERT INTO `aux_paises_cant_prods` VALUES (243,'VU',0);
INSERT INTO `aux_paises_cant_prods` VALUES (244,'WF',0);
INSERT INTO `aux_paises_cant_prods` VALUES (245,'WS',0);
INSERT INTO `aux_paises_cant_prods` VALUES (246,'XK',0);
INSERT INTO `aux_paises_cant_prods` VALUES (247,'YE',0);
INSERT INTO `aux_paises_cant_prods` VALUES (248,'YT',0);
INSERT INTO `aux_paises_cant_prods` VALUES (249,'ZA',0);
INSERT INTO `aux_paises_cant_prods` VALUES (250,'ZM',0);
INSERT INTO `aux_paises_cant_prods` VALUES (251,'ZW',0);
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-27 14:23:37
ALTER TABLE c19353_elc.aux_paises DROP COLUMN cantProds;