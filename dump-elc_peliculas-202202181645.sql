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
-- Dumping data for table `cal_calidad_tecnica`
--

LOCK TABLES `cal_calidad_tecnica` WRITE;
/*!40000 ALTER TABLE `cal_calidad_tecnica` DISABLE KEYS */;
INSERT INTO `cal_calidad_tecnica` VALUES (1,3,0,'Complica el disfrute'),(2,2,50,'Afecta un poco el disfrute'),(3,1,100,'Sin problemas');
/*!40000 ALTER TABLE `cal_calidad_tecnica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cal_entretiene`
--

LOCK TABLES `cal_entretiene` WRITE;
/*!40000 ALTER TABLE `cal_entretiene` DISABLE KEYS */;
INSERT INTO `cal_entretiene` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_entretiene` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cal_fe_valores`
--

LOCK TABLES `cal_fe_valores` WRITE;
/*!40000 ALTER TABLE `cal_fe_valores` DISABLE KEYS */;
INSERT INTO `cal_fe_valores` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_fe_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES ('CFC',1,'Centradas en la Fe Católica'),('VPC',2,'Valores Presentes en la Cultura');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `categorias_sub`
--

LOCK TABLES `categorias_sub` WRITE;
/*!40000 ALTER TABLE `categorias_sub` DISABLE KEYS */;
INSERT INTO `categorias_sub` VALUES (1,1,'CFC','Jesús',1,0,0,'cfc/jesus'),(2,2,'CFC','Contemporáneos de Jesús',1,0,0,'cfc/contemporaneos'),(3,3,'CFC','Apariciones Marianas',0,1,0,'cfc/marianas'),(4,4,'CFC','Hagiografías',1,0,0,'cfc/hagiografias'),(5,5,'CFC','Historias de la Iglesia',0,1,0,'cfc/historias'),(6,6,'CFC','Novelas centradas en la fe',0,0,1,'cfc/novelas'),(7,7,'CFC','Documentales',0,0,0,'cfc/documentales'),(8,8,'VPC','Biografías',1,0,1,'vpc/bios_historias'),(9,10,'VPC','Matrimonio y Familia',0,0,1,'vpc/matrimonio'),(10,11,'VPC','Novelas',0,0,1,'vpc/novelas'),(11,12,'VPC','Musicales',0,0,1,'vpc/musicales'),(12,9,'VPC','Historias',0,1,1,'vpc/bios_historias');
/*!40000 ALTER TABLE `categorias_sub` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `dias_del_ano`
--

LOCK TABLES `dias_del_ano` WRITE;
/*!40000 ALTER TABLE `dias_del_ano` DISABLE KEYS */;
INSERT INTO `dias_del_ano` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,7,1),(8,8,1),(9,9,1),(10,10,1),(11,11,1),(12,12,1),(13,13,1),(14,14,1),(15,15,1),(16,16,1),(17,17,1),(18,18,1),(19,19,1),(20,20,1),(21,21,1),(22,22,1),(23,23,1),(24,24,1),(25,25,1),(26,26,1),(27,27,1),(28,28,1),(29,29,1),(30,30,1),(31,31,1),(32,1,2),(33,2,2),(34,3,2),(35,4,2),(36,5,2),(37,6,2),(38,7,2),(39,8,2),(40,9,2),(41,10,2),(42,11,2),(43,12,2),(44,13,2),(45,14,2),(46,15,2),(47,16,2),(48,17,2),(49,18,2),(50,19,2),(51,20,2),(52,21,2),(53,22,2),(54,23,2),(55,24,2),(56,25,2),(57,26,2),(58,27,2),(59,28,2),(60,29,2),(61,1,3),(62,2,3),(63,3,3),(64,4,3),(65,5,3),(66,6,3),(67,7,3),(68,8,3),(69,9,3),(70,10,3),(71,11,3),(72,12,3),(73,13,3),(74,14,3),(75,15,3),(76,16,3),(77,17,3),(78,18,3),(79,19,3),(80,20,3),(81,21,3),(82,22,3),(83,23,3),(84,24,3),(85,25,3),(86,26,3),(87,27,3),(88,28,3),(89,29,3),(90,30,3),(91,31,3),(92,1,4),(93,2,4),(94,3,4),(95,4,4),(96,5,4),(97,6,4),(98,7,4),(99,8,4),(100,9,4),(101,10,4),(102,11,4),(103,12,4),(104,13,4),(105,14,4),(106,15,4),(107,16,4),(108,17,4),(109,18,4),(110,19,4),(111,20,4),(112,21,4),(113,22,4),(114,23,4),(115,24,4),(116,25,4),(117,26,4),(118,27,4),(119,28,4),(120,29,4),(121,30,4),(122,1,5),(123,2,5),(124,3,5),(125,4,5),(126,5,5),(127,6,5),(128,7,5),(129,8,5),(130,9,5),(131,10,5),(132,11,5),(133,12,5),(134,13,5),(135,14,5),(136,15,5),(137,16,5),(138,17,5),(139,18,5),(140,19,5),(141,20,5),(142,21,5),(143,22,5),(144,23,5),(145,24,5),(146,25,5),(147,26,5),(148,27,5),(149,28,5),(150,29,5),(151,30,5),(152,31,5),(153,1,6),(154,2,6),(155,3,6),(156,4,6),(157,5,6),(158,6,6),(159,7,6),(160,8,6),(161,9,6),(162,10,6),(163,11,6),(164,12,6),(165,13,6),(166,14,6),(167,15,6),(168,16,6),(169,17,6),(170,18,6),(171,19,6),(172,20,6),(173,21,6),(174,22,6),(175,23,6),(176,24,6),(177,25,6),(178,26,6),(179,27,6),(180,28,6),(181,29,6),(182,30,6),(183,1,7),(184,2,7),(185,3,7),(186,4,7),(187,5,7),(188,6,7),(189,7,7),(190,8,7),(191,9,7),(192,10,7),(193,11,7),(194,12,7),(195,13,7),(196,14,7),(197,15,7),(198,16,7),(199,17,7),(200,18,7),(201,19,7),(202,20,7),(203,21,7),(204,22,7),(205,23,7),(206,24,7),(207,25,7),(208,26,7),(209,27,7),(210,28,7),(211,29,7),(212,30,7),(213,31,7),(214,1,8),(215,2,8),(216,3,8),(217,4,8),(218,5,8),(219,6,8),(220,7,8),(221,8,8),(222,9,8),(223,10,8),(224,11,8),(225,12,8),(226,13,8),(227,14,8),(228,15,8),(229,16,8),(230,17,8),(231,18,8),(232,19,8),(233,20,8),(234,21,8),(235,22,8),(236,23,8),(237,24,8),(238,25,8),(239,26,8),(240,27,8),(241,28,8),(242,29,8),(243,30,8),(244,31,8),(245,1,9),(246,2,9),(247,3,9),(248,4,9),(249,5,9),(250,6,9),(251,7,9),(252,8,9),(253,9,9),(254,10,9),(255,11,9),(256,12,9),(257,13,9),(258,14,9),(259,15,9),(260,16,9),(261,17,9),(262,18,9),(263,19,9),(264,20,9),(265,21,9),(266,22,9),(267,23,9),(268,24,9),(269,25,9),(270,26,9),(271,27,9),(272,28,9),(273,29,9),(274,30,9),(275,1,10),(276,2,10),(277,3,10),(278,4,10),(279,5,10),(280,6,10),(281,7,10),(282,8,10),(283,9,10),(284,10,10),(285,11,10),(286,12,10),(287,13,10),(288,14,10),(289,15,10),(290,16,10),(291,17,10),(292,18,10),(293,19,10),(294,20,10),(295,21,10),(296,22,10),(297,23,10),(298,24,10),(299,25,10),(300,26,10),(301,27,10),(302,28,10),(303,29,10),(304,30,10),(305,31,10),(306,1,11),(307,2,11),(308,3,11),(309,4,11),(310,5,11),(311,6,11),(312,7,11),(313,8,11),(314,9,11),(315,10,11),(316,11,11),(317,12,11),(318,13,11),(319,14,11),(320,15,11),(321,16,11),(322,17,11),(323,18,11),(324,19,11),(325,20,11),(326,21,11),(327,22,11),(328,23,11),(329,24,11),(330,25,11),(331,26,11),(332,27,11),(333,28,11),(334,29,11),(335,30,11),(336,1,12),(337,2,12),(338,3,12),(339,4,12),(340,5,12),(341,6,12),(342,7,12),(343,8,12),(344,9,12),(345,10,12),(346,11,12),(347,12,12),(348,13,12),(349,14,12),(350,15,12),(351,16,12),(352,17,12),(353,18,12),(354,19,12),(355,20,12),(356,21,12),(357,22,12),(358,23,12),(359,24,12),(360,25,12),(361,26,12),(362,27,12),(363,28,12),(364,29,12),(365,30,12),(366,31,12);
/*!40000 ALTER TABLE `dias_del_ano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `edic_capitulos`
--

LOCK TABLES `edic_capitulos` WRITE;
/*!40000 ALTER TABLE `edic_capitulos` DISABLE KEYS */;
/*!40000 ALTER TABLE `edic_capitulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `edic_colecciones`
--

LOCK TABLES `edic_colecciones` WRITE;
/*!40000 ALTER TABLE `edic_colecciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `edic_colecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `edic_peliculas`
--

LOCK TABLES `edic_peliculas` WRITE;
/*!40000 ALTER TABLE `edic_peliculas` DISABLE KEYS */;
INSERT INTO `edic_peliculas` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Efmefme',NULL,NULL,NULL,'1644940198058.jpg',1,1,'CFC',4,4,10,NULL,NULL,10,'2022-02-15 15:50:20',1,10,'2022-02-15 15:50:20');
/*!40000 ALTER TABLE `edic_peliculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `epocas_estreno`
--

LOCK TABLES `epocas_estreno` WRITE;
/*!40000 ALTER TABLE `epocas_estreno` DISABLE KEYS */;
INSERT INTO `epocas_estreno` VALUES (1,4,'Antes de 1970',1900,1969),(2,3,'1970 - 1999',1970,1999),(3,2,'2000 - 2014',2000,2014),(4,1,'2015 - Presente',2015,2025);
/*!40000 ALTER TABLE `epocas_estreno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `idiomas`
--

LOCK TABLES `idiomas` WRITE;
/*!40000 ALTER TABLE `idiomas` DISABLE KEYS */;
INSERT INTO `idiomas` VALUES ('aa','Afar',0),('ab','Abjasio',0),('ae','Avéstico',0),('af','Afrikáans',0),('ak','Akano',0),('am','Amhárico',0),('an','Aragonés',0),('ar','Árabe',0),('as','Asamés',0),('av','Ávaro',0),('ay','Aimara',0),('az','Azerí',0),('ba','Baskir',0),('be','Bielorruso',0),('bg','Búlgaro',0),('bh','Bhoyapurí',0),('bi','Bislama',0),('bm','Bambara',0),('bn','Bengalí',0),('bo','Tibetano',0),('br','Bretón',0),('bs','Bosnio',0),('ca','Catalán',0),('ce','Checheno',0),('ch','Chamorro',0),('co','Corso',0),('cr','Cree',0),('cs','Checo',0),('cu','Eslavo eclesiástico',0),('cv','Chuvasio',0),('cy','Galés',0),('da','Danés',0),('de','Alemán',0),('dv','Maldivo',0),('dz','Dzongkha',0),('ee','Ewé',0),('el','Griego',0),('en','Inglés',1),('eo','Esperanto',0),('es','Castellano',1),('et','Estonio',0),('eu','Euskera',0),('fa','Persa',0),('ff','Fula',0),('fi','Finés',0),('fj','Fiyiano',0),('fo','Feroés',0),('fr','Francés',0),('fy','Frisón',0),('ga','Gaélico',0),('gd','Gaélico escocés',0),('gl','Gallego',0),('gn','Guaraní',0),('gu','Guyaratí',0),('gv','Gaélico manés',0),('ha','Hausa',0),('he','Hebreo',0),('hi','Hindi',0),('ho','Hiri motu',0),('hr','Croata',0),('ht','Haitiano',0),('hu','Húngaro',0),('hy','Armenio',0),('hz','Herero',0),('ia','Interlingua',0),('id','Indonesio',0),('ie','Occidental',0),('ig','Igbo',0),('ii','Yi de Sichuán',0),('ik','Iñupiaq',0),('io','Ido',0),('is','Islandés',0),('it','Italiano',0),('iu','Inuktitut',0),('ja','Japonés',0),('jv','Javanés',0),('ka','Georgiano',0),('kg','Kongo',0),('ki','Kikuyu',0),('kj','Kuanyama',0),('kk','Kazajo',0),('kl','Kalaallisut',0),('km','Camboyano',0),('kn','Canarés',0),('ko','Coreano',0),('kr','Kanuri',0),('ks','Cachemiro',0),('ku','Kurdo',0),('kv','Komi',0),('kw','Córnico',0),('ky','Kirguís',0),('la','Latín',0),('lb','Luxemburgués',0),('lg','Luganda',0),('li','Limburgués',0),('ln','Lingala',0),('lo','Lao',0),('lt','Lituano',0),('lu','Luba-katanga',0),('lv','Letón',0),('mg','Malgache',0),('mh','Marshalés',0),('mi','Maorí',0),('mk','Macedonio',0),('ml','Malayalam',0),('mn','Mongol',0),('mr','Maratí',0),('ms','Malayo',0),('mt','Maltés',0),('my','Birmano',0),('na','Nauruano',0),('nb','Noruego bokmål',0),('nd','Ndebele del norte',0),('ne','Nepalí',0),('ng','Ndonga',0),('nl','Neerlandés',0),('nn','Nynorsk',0),('no','Noruego',0),('nr','Ndebele del sur',0),('nv','Navajo',0),('ny','Chichewa',0),('oc','Occitano',0),('oj','Ojibwa',0),('om','Oromo',0),('or','Oriya',0),('os','Osético',0),('ot','Otro idioma',1),('pa','Panyabí',0),('pi','Pali',0),('pl','Polaco',0),('ps','Pastú',0),('pt','Portugués',0),('qu','Quechua',0),('rm','Romanche',0),('rn','Kirundi',0),('ro','Rumano',0),('ru','Ruso',0),('rw','Ruandés',0),('sa','Sánscrito',0),('sc','Sardo',0),('sd','Sindhi',0),('se','Sami septentrional',0),('sg','Sango',0),('si','Cingalés',0),('sk','Eslovaco',0),('sl','Esloveno',0),('sm','Samoano',0),('sn','Shona',0),('so','Somalí',0),('sq','Albanés',0),('sr','Serbio',0),('ss','Suazi',0),('st','Sesotho',0),('su','Sundanés',0),('sv','Sueco',0),('sw','Suajili',0),('ta','Tamil',0),('te','Télugu',0),('tg','Tayiko',0),('th','Tailandés',0),('ti','Tigriña',0),('tk','Turcomano',0),('tl','Tagalo',0),('tn','Setsuana',0),('to','Tongano',0),('tr','Turco',0),('ts','Tsonga',0),('tt','Tártaro',0),('tw','Twi',0),('ty','Tahitiano',0),('ug','Uigur',0),('uk','Ucraniano',0),('ur','Urdu',0),('uz','Uzbeko',0),('ve','Venda',0),('vi','Vietnamita',0),('vo','Volapük',0),('wa','Valón',0),('wo','Wolof',0),('xh','Xhosa',0),('yi','Yídish',0),('yo','Yoruba',0),('za','Zhuang',0),('zh','Chino',0),('zu','Zulú',0);
/*!40000 ALTER TABLE `idiomas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `interes_en_prod`
--

LOCK TABLES `interes_en_prod` WRITE;
/*!40000 ALTER TABLE `interes_en_prod` DISABLE KEYS */;
INSERT INTO `interes_en_prod` VALUES (1,3,'Prefiero que no me la recomienden'),(2,2,'Ya la vi'),(3,1,'Recordame que quiero verla');
/*!40000 ALTER TABLE `interes_en_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `links_prod`
--

LOCK TABLES `links_prod` WRITE;
/*!40000 ALTER TABLE `links_prod` DISABLE KEYS */;
INSERT INTO `links_prod` VALUES (1,1,NULL,NULL,'youtube.com/watch?v=lpsa5we4lGM',2,2,1,'2020-07-04',10,'2022-02-16 00:00:00',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `links_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `links_provs`
--

LOCK TABLES `links_provs` WRITE;
/*!40000 ALTER TABLE `links_provs` DISABLE KEYS */;
INSERT INTO `links_provs` VALUES (1,0,'Desconocido','PT-Desconocido.jpg',0,1,'',0,'',1,'',1,''),(2,1,'YouTube','PT-YouTube.jpg',0,0,'youtube.com',1,'/results?search_query=',1,'&sp=EgIYAQ%253D%253D',1,'sp=EgIYAg%253D%253D'),(3,2,'Formed en Español','PT-Formed cast.jpg',0,0,'ver.formed.lat',1,'/search?q=',0,'',1,''),(4,3,'Formed','PT-Formed.jpg',0,0,'watch.formed.org',1,'/search?q=',0,'',1,''),(5,4,'Brochero','PT-Brochero.jpg',1,0,'brochero.org',0,'',0,'',1,''),(6,5,'FamFlix','PT-FamFlix.jpg',1,0,'famflix.mx',0,'',0,'',1,''),(7,6,'FamiPlay','PT-FamiPlay.jpg',1,0,'famiplay.com',1,'/catalogo?s=',0,'',1,''),(8,7,'Goya Prod.','PT-Goya.jpg',1,0,'goyaproducciones.com',1,'/?s=',1,'',1,''),(9,8,'IMDb','PT-IMDB.jpg',0,0,'imdb.com',0,'/find?q=',1,'',0,'');
/*!40000 ALTER TABLE `links_provs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `links_tipos`
--

LOCK TABLES `links_tipos` WRITE;
/*!40000 ALTER TABLE `links_tipos` DISABLE KEYS */;
INSERT INTO `links_tipos` VALUES (1,'Trailer'),(2,'Película'),(3,'Colección'),(4,'Capítulo');
/*!40000 ALTER TABLE `links_tipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `meses`
--

LOCK TABLES `meses` WRITE;
/*!40000 ALTER TABLE `meses` DISABLE KEYS */;
INSERT INTO `meses` VALUES (1,'Enero'),(2,'Febrero'),(3,'Marzo'),(4,'Abril'),(5,'Mayo'),(6,'Junio'),(7,'Julio'),(8,'Agosto'),(9,'Septiembre'),(10,'Octubre'),(11,'Noviembre'),(12,'Diciembre');
/*!40000 ALTER TABLE `meses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `paises`
--

LOCK TABLES `paises` WRITE;
/*!40000 ALTER TABLE `paises` DISABLE KEYS */;
INSERT INTO `paises` VALUES ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'),('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'),('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'),('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'),('AI','AIA','Anguila','América','English','-04:00','aia.svg'),('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'),('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'),('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'),('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'),('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'),('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'),('AT','AUT','Austria','Europa','German','+01:00','aut.svg'),('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'),('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'),('AX','ALA','Aland','Europa','Swedish','+02:00','ala.svg'),('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'),('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'),('BB','BRB','Barbados','América','English','-04:00','brb.svg'),('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'),('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'),('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'),('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'),('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'),('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'),('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'),('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'),('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'),('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'),('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'),('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'),('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'),('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'),('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'),('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'),('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'),('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'),('BZ','BLZ','Belice','América','English','-06:00','blz.svg'),('CA','CAN','Canadá','América','English','-08:00','can.svg'),('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'),('CD','COD','Congo','Africa','French','+01:00','cod.svg'),('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'),('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'),('CH','CHE','Suiza','Europa','German','+01:00','che.svg'),('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'),('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'),('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'),('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'),('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'),('CO','COL','Colombia','América','Spanish','-05:00','col.svg'),('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'),('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'),('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'),('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'),('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'),('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'),('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'),('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'),('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'),('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'),('DM','DMA','Dominica','América','English','-04:00','dma.svg'),('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'),('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'),('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'),('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'),('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'),('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'),('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'),('ES','ESP','España','Europa','Spanish','','esp.svg'),('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'),('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'),('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'),('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'),('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'),('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'),('FR','FRA','Francia','Europa','French','-10:00','fra.svg'),('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'),('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'),('GD','GRD','Granada','América','English','-04:00','grd.svg'),('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'),('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'),('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'),('GH','GHA','Ghana','Africa','English','','gha.svg'),('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'),('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'),('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'),('GN','GIN','Guinea','Africa','French','','gin.svg'),('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'),('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'),('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'),('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'),('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'),('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'),('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'),('GY','GUY','Guyana','América','English','-04:00','guy.svg'),('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg'),('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'),('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'),('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'),('HT','HTI','Haití','América','French','-05:00','hti.svg'),('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'),('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'),('IE','IRL','Irlanda','Europa','Irish','','irl.svg'),('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'),('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'),('IN','IND','India','Asia','Hindi','+05:30','ind.svg'),('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'),('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'),('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'),('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'),('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'),('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'),('JM','JAM','Jamaica','América','English','-05:00','jam.svg'),('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'),('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'),('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'),('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'),('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'),('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'),('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'),('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'),('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'),('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'),('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'),('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'),('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'),('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'),('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'),('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'),('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'),('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'),('LR','LBR','Liberia','Africa','English','','lbr.svg'),('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'),('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'),('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'),('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'),('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'),('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'),('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'),('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'),('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'),('MF','MAF','San Martín','América','English','-04:00','maf.svg'),('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'),('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'),('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'),('ML','MLI','Malí','Africa','French','','mli.svg'),('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'),('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'),('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'),('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'),('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'),('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'),('MS','MSR','Montserrat','América','English','-04:00','msr.svg'),('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'),('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'),('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'),('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'),('MX','MEX','México','América','Spanish','-08:00','mex.svg'),('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'),('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'),('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'),('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'),('NE','NER','Níger','Africa','French','+01:00','ner.svg'),('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'),('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'),('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'),('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'),('NN','NNN','- Sin un país de referencia -','-','-','00:00','-'),('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'),('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'),('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'),('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'),('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'),('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'),('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'),('PE','PER','Perú','América','Spanish','-05:00','per.svg'),('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'),('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'),('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'),('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'),('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'),('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'),('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'),('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'),('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'),('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'),('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'),('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'),('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'),('RE','REU','Reunión','Africa','French','+04:00','reu.svg'),('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'),('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'),('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'),('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'),('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'),('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'),('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'),('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'),('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'),('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'),('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'),('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'),('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'),('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'),('SL','SLE','Sierra Leona','Africa','English','','sle.svg'),('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'),('SN','SEN','Senegal','Africa','French','','sen.svg'),('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'),('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'),('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'),('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'),('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'),('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'),('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'),('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'),('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'),('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'),('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'),('TG','TGO','Togo','Africa','French','','tgo.svg'),('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'),('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'),('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'),('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'),('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'),('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'),('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'),('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'),('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'),('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'),('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'),('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'),('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'),('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'),('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'),('US','USA','Estados Unidos','América','English','-12:00','usa.svg'),('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'),('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'),('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'),('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'),('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'),('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'),('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'),('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'),('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'),('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'),('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'),('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'),('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'),('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'),('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'),('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'),('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg');
/*!40000 ALTER TABLE `paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `penaliz_us_motivos`
--

LOCK TABLES `penaliz_us_motivos` WRITE;
/*!40000 ALTER TABLE `penaliz_us_motivos` DISABLE KEYS */;
INSERT INTO `penaliz_us_motivos` VALUES (1,2,'PROD-Ajeno a nuestro perfil',1,0,1,'Audiovisual ajeno a nuestro perfil. Te sugerimos que leas sobre nuestro perfil de películas. Lo encontrás en el menú de Inicio -> Nuestro perfil de películas'),(2,3,'PROD-Ajeno con mofa',1,0,90,'Audiovisual ajeno a nuestro perfil, con mofa. Te pedimos que no sigas intentando agregar películas o colecciones de estas característias.'),(3,4,'PROD-Ajeno con pornografía',1,0,180,'Audiovisual ajeno a nuestro perfil, con pornografía. Te pedimos que no sigas intentando agregar películas o colecciones de estas característias.'),(4,1,'PROD-Audiovisual duplicado',1,0,0,'Audiovisual ya existente en nuestra base  de datos. Puede estar con otro nombre. Si no lo encontrás, nos podés consultar mediante Inicio -> Contactanos'),(5,10,'CONT-Incompleto',0,1,5,'Datos incompletos. Dejaste incompletos algunos datos fáciles de conseguir.'),(6,11,'CONT-Spam',0,1,5,'Datos con spam. Completaste algunos datos con spam.'),(7,12,'CONT-Spam e incompleto',0,1,10,'Datos con spam e incompletos. Completaste algunos datos con spam y dejaste otros incompletos.');
/*!40000 ALTER TABLE `penaliz_us_motivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `penaliz_us_usuarios`
--

LOCK TABLES `penaliz_us_usuarios` WRITE;
/*!40000 ALTER TABLE `penaliz_us_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `penaliz_us_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `pr_us_calificaciones`
--

LOCK TABLES `pr_us_calificaciones` WRITE;
/*!40000 ALTER TABLE `pr_us_calificaciones` DISABLE KEYS */;
INSERT INTO `pr_us_calificaciones` VALUES (1,10,1,NULL,NULL,4,4,3,75,75,100,80);
/*!40000 ALTER TABLE `pr_us_calificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `pr_us_interes_en_prod`
--

LOCK TABLES `pr_us_interes_en_prod` WRITE;
/*!40000 ALTER TABLE `pr_us_interes_en_prod` DISABLE KEYS */;
/*!40000 ALTER TABLE `pr_us_interes_en_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `procesos_canonizacion`
--

LOCK TABLES `procesos_canonizacion` WRITE;
/*!40000 ALTER TABLE `procesos_canonizacion` DISABLE KEYS */;
INSERT INTO `procesos_canonizacion` VALUES ('BT',2,'Beato'),('BTM',2,'Beata'),('BTV',2,'Beato'),('SD',4,'Siervo de Dios'),('SDM',4,'Sierva de Dios'),('SDV',4,'Siervo de Dios'),('ST',1,'Santo'),('STM',1,'Santa'),('STV',1,'Santo'),('VN',3,'Venerable'),('VNM',3,'Venerable'),('VNV',3,'Venerable');
/*!40000 ALTER TABLE `procesos_canonizacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_borrados`
--

LOCK TABLES `prod_borrados` WRITE;
/*!40000 ALTER TABLE `prod_borrados` DISABLE KEYS */;
/*!40000 ALTER TABLE `prod_borrados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_borrar_motivos`
--

LOCK TABLES `prod_borrar_motivos` WRITE;
/*!40000 ALTER TABLE `prod_borrar_motivos` DISABLE KEYS */;
INSERT INTO `prod_borrar_motivos` VALUES (1,1,'Producto duplicado',1),(2,2,'Ajeno a nuestro perfil',2),(3,3,'Ajeno con mofa',3),(4,4,'Ajeno con pornografía',4);
/*!40000 ALTER TABLE `prod_borrar_motivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_capitulos`
--

LOCK TABLES `prod_capitulos` WRITE;
/*!40000 ALTER TABLE `prod_capitulos` DISABLE KEYS */;
/*!40000 ALTER TABLE `prod_capitulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_colecciones`
--

LOCK TABLES `prod_colecciones` WRITE;
/*!40000 ALTER TABLE `prod_colecciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `prod_colecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_peliculas`
--

LOCK TABLES `prod_peliculas` WRITE;
/*!40000 ALTER TABLE `prod_peliculas` DISABLE KEYS */;
INSERT INTO `prod_peliculas` VALUES (1,'220731',NULL,'tt2806908','TMDB','Le métis de Dieu','Lustiger, el cardenal judío',96,'FR',2013,'fr','Ilan Duran Cohen','Ilan Duran Cohen, Chantal Derudder','','Laurent Lucas (Jean-Marie Lustiger), Aurélien Recoing (Jean-Paul II), Audrey Dana (Fanny), Grégoire Leprince-Ringuet (Le pere Julien), Alex Skarbek (Pere Kristof), Nathalie Richard (La Mere Superiéure), Bruno Todeschini (Théo Klein), Jean-Noel Martin (Monseigneur Courcoux), Henri Guybet (Charles Lustiger)','ARTE, A Plus Image 4, ARTE France Cinéma','Biopic sobre Jean-Marie Lustiger, hijo de inmigrantes judíos polacos que mantuvo su identidad cultural como judío, incluso después de la conversión al catolicismo a una edad temprana y más tarde unirse al sacerdocio. Tras un rápido ascenso en la jerarquía eclesial, fue nombrado arzobispo de París por el Papa Juan Pablo II y encontró una nueva plataforma para reivindicar su doble identidad como judío católico, lo que le supuso tanto amigos como enemigos de ambas partes. Cuando en los años 80 las monjas carmelitas establecieron un convento dentro de las murallas de Auschwitz, se provocó un conflicto entre las dos comunidades. Lustiger se encuentra como mediador entre judíos y católicos y es forzado a posicionarse en favor de unos u otros. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/npiru6LqqfZGzkfmlFUIwS3lzUz.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,75,75,100,80,10,'2022-02-15 15:50:20',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,'2022-02-15 15:50:20');
/*!40000 ALTER TABLE `prod_peliculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `publicos_sugeridos`
--

LOCK TABLES `publicos_sugeridos` WRITE;
/*!40000 ALTER TABLE `publicos_sugeridos` DISABLE KEYS */;
INSERT INTO `publicos_sugeridos` VALUES (1,5,'Menores solamente'),(2,4,'Menores (apto familia)'),(3,3,'Familia'),(4,2,'Mayores (apto familia)'),(5,1,'Mayores solamente');
/*!40000 ALTER TABLE `publicos_sugeridos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rclv_hechos_historicos`
--

LOCK TABLES `rclv_hechos_historicos` WRITE;
/*!40000 ALTER TABLE `rclv_hechos_historicos` DISABLE KEYS */;
INSERT INTO `rclv_hechos_historicos` VALUES (2,100,33,'Sem. Santa - 1. General',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(3,105,33,'Sem. Santa - 2. Viernes Santo',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(4,107,33,'Sem. Santa - 3. Resurrección',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(5,150,33,'Pentecostés',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(6,210,1914,'Guerra Mundial - 1a',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(7,245,1942,'Guerra Mundial - 2a',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_hechos_historicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rclv_personajes_historicos`
--

LOCK TABLES `rclv_personajes_historicos` WRITE;
/*!40000 ALTER TABLE `rclv_personajes_historicos` DISABLE KEYS */;
INSERT INTO `rclv_personajes_historicos` VALUES (1,NULL,NULL,'Varios (colección)',NULL,NULL,1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(6,NULL,0,'Jesús',NULL,NULL,1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(7,NULL,-15,'María, madre de Jesús',NULL,NULL,1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(10,79,-20,'José, padre de Jesús','STV','LCV',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(11,296,1920,'Juan Pablo II','STV','PPV',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_personajes_historicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rclv_valores`
--

LOCK TABLES `rclv_valores` WRITE;
/*!40000 ALTER TABLE `rclv_valores` DISABLE KEYS */;
INSERT INTO `rclv_valores` VALUES (10,'Valores en el deporte',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(11,'Perseverancia',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(12,'Pacificar un país dividido',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(13,'Pasión por ayudar',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL),(14,'Superación personal',1,'2022-02-15 12:49:07',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles_iglesia`
--

LOCK TABLES `roles_iglesia` WRITE;
/*!40000 ALTER TABLE `roles_iglesia` DISABLE KEYS */;
INSERT INTO `roles_iglesia` VALUES ('LC',2,'Laico casado',1,1),('LCM',2,'Laica casada',1,1),('LCV',2,'Laico casado',1,1),('LS',1,'Laico soltero',1,1),('LSM',1,'Laica soltera',1,1),('LSV',1,'Laico soltero',1,1),('PC',0,'Computadora',0,0),('PP',4,'Papa',0,1),('PPV',4,'Papa',0,1),('RC',3,'Religioso consagrado',1,1),('RCM',3,'Religiosa consagrada',1,1),('RCV',3,'Religioso consagrado',1,1);
/*!40000 ALTER TABLE `roles_iglesia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles_usuario`
--

LOCK TABLES `roles_usuario` WRITE;
/*!40000 ALTER TABLE `roles_usuario` DISABLE KEYS */;
INSERT INTO `roles_usuario` VALUES (1,1,'Usuario',0,0,0),(2,2,'Autorizado p/Inputs',1,0,0),(3,3,'Gestión de Productos',1,1,0),(4,4,'Gestión de Usuarios',1,0,1),(5,5,'Gestión de Prod. y Usuarios',1,1,1);
/*!40000 ALTER TABLE `roles_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sexos`
--

LOCK TABLES `sexos` WRITE;
/*!40000 ALTER TABLE `sexos` DISABLE KEYS */;
INSERT INTO `sexos` VALUES ('M','Mujer','a'),('O','Otro','o'),('V','Varón','o');
/*!40000 ALTER TABLE `sexos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `si_no_parcial`
--

LOCK TABLES `si_no_parcial` WRITE;
/*!40000 ALTER TABLE `si_no_parcial` DISABLE KEYS */;
INSERT INTO `si_no_parcial` VALUES (1,'SI'),(2,'Parcial'),(3,'NO');
/*!40000 ALTER TABLE `si_no_parcial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `status_registro_prod`
--

LOCK TABLES `status_registro_prod` WRITE;
/*!40000 ALTER TABLE `status_registro_prod` DISABLE KEYS */;
INSERT INTO `status_registro_prod` VALUES (1,1,'Creada pend./aprobar',1,0,0,0,0),(2,2,'Editada pend./aprobar',0,1,0,0,0),(3,3,'Aprobada',0,0,1,0,0),(4,4,'Sugerida p/borrar',0,0,0,1,0),(5,5,'Borrada',0,0,0,0,1);
/*!40000 ALTER TABLE `status_registro_prod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `status_registro_us`
--

LOCK TABLES `status_registro_us` WRITE;
/*!40000 ALTER TABLE `status_registro_us` DISABLE KEYS */;
INSERT INTO `status_registro_us` VALUES (1,1,'Mail a validar'),(2,2,'Mail validado'),(3,3,'Datos perennes OK'),(4,4,'Datos editables OK');
/*!40000 ALTER TABLE `status_registro_us` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `us_filtros_personales_cabecera`
--

LOCK TABLES `us_filtros_personales_cabecera` WRITE;
/*!40000 ALTER TABLE `us_filtros_personales_cabecera` DISABLE KEYS */;
/*!40000 ALTER TABLE `us_filtros_personales_cabecera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `us_filtros_personales_campos`
--

LOCK TABLES `us_filtros_personales_campos` WRITE;
/*!40000 ALTER TABLE `us_filtros_personales_campos` DISABLE KEYS */;
/*!40000 ALTER TABLE `us_filtros_personales_campos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'sinMail1','sinContraseña','Startup','',NULL,'Startup','','2000-01-01','O','AR',2,'PC',1,0,'2000-01-01 00:00:00','2000-01-01 00:00:00',NULL,4,NULL,NULL),(2,'sinMail2','sinContraseña','Automatizado','',NULL,'Automatizado','','2000-01-01','O','AR',2,'PC',1,0,'2000-01-01 00:00:00','2000-01-01 00:00:00',NULL,4,NULL,NULL),(10,'diegoiribarren2015@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Diego','Iribarren',NULL,'Diego','1617370359746.jpg','1969-08-16','V','AR',2,'LC',1,0,'2021-03-26 00:00:00','2021-03-26 00:00:00',NULL,4,NULL,NULL),(11,'diegoiribarren2021@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Diego','Iribarren',NULL,'Diego','1632959816163.jpg','1969-08-16','V','AR',5,'LC',1,0,'2021-03-26 00:00:00','2021-03-26 00:00:00',NULL,4,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-18 16:45:47
