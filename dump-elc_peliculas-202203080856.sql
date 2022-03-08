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
-- Dumping data for table `borrados_registros`
--

LOCK TABLES `borrados_registros` WRITE;
/*!40000 ALTER TABLE `borrados_registros` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrados_registros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `borrar_motivos`
--

LOCK TABLES `borrar_motivos` WRITE;
/*!40000 ALTER TABLE `borrar_motivos` DISABLE KEYS */;
INSERT INTO `borrar_motivos` VALUES (11,1,'Producto duplicado',1,0,0,0,'El audiovisual ya existente en nuestra base  de datos. Puede estar con otro nombre. Si no lo encontrás, podés buscarlos usando los filtros'),(12,2,'Producto ajeno a nuestro perfil',1,0,0,1,'Te sugerimos que leas sobre nuestro perfil de películas, que se encuentra en Inicio -> Nuestro perfil de películas'),(13,3,'Producto ajeno con intención',1,0,0,90,'Te pedimos que tengas cuidado de no agregar este tipo de películas o colecciones'),(14,4,'Producto con pornografía',1,0,0,180,'Te pedimos que no agregues películas o colecciones de estas característias.'),(15,5,'Campos incompletos',1,0,0,5,'Dejaste incompletos algunos datos fáciles de conseguir.'),(16,5,'Información con errores',1,1,0,5,'Dejaste incompletos algunos datos fáciles de conseguir.'),(17,6,'Campos con spam',1,1,0,10,'Completaste algunos datos con spam.'),(18,1,'Registro duplicado',0,1,0,0,''),(19,1,'Link reemplazado por otro más acorde',0,0,1,0,'La mejora puede ser en la calidado o en que sea por toda la película/capítulo completo'),(20,2,'Video sin relación con el producto',0,0,1,10,'El link no está relacionado con el producto al que hace referencia'),(21,3,'Video no disponible',0,0,1,0,'El link no dirije a un video actualmente'),(22,4,'Spam - sitio inexistente',0,0,1,10,'El link no dirije a ningún sitio de videos');
/*!40000 ALTER TABLE `borrar_motivos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `edic_productos`
--

LOCK TABLES `edic_productos` WRITE;
/*!40000 ALTER TABLE `edic_productos` DISABLE KEYS */;
INSERT INTO `edic_productos` VALUES (1,1,'peliculas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ciaran Hope',NULL,NULL,NULL,'1645444885482.jpg',3,1,'CFC',4,4,21,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(2,2,'peliculas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1645458510332.jpg',1,1,'CFC',4,4,22,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(3,3,'peliculas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Coproducción Italia-Alemania','En 1958, tras la muerte de Pío XII, el anciano Cardenal Angelo Roncalli, Patriarca de Venecia, viaja a Roma para participar en el cónclave que debe elegir al nuevo Papa, cónclave dominado por toda clase de maniobras políticas. En efecto, una vez en el Vaticano, Roncalli asiste atónito al enconado enfrentamiento entre las distintas facciones eclesiásticas. Durante el cónclave se van desvelando aspectos extraordinarios del pasado del cardenal: su apoyo espiritual y económico a un grupo de trabajadores en huelga, cuando todavía era un joven sacerdote; su ayuda a los cristianos ortodoxos de Bulgaria, cuando estuvo destinado en ese país; sus negociaciones con el embajador nazi de Estambul para salvar un tren de prisioneros judíos, cuando era diplomático del Vaticano en Turquía. (Fuente: TMDB)','1645458705918.jpg',1,1,'CFC',4,4,22,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(4,4,'peliculas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Carlo Mazzotta, Graziano Diana, Lodovico Gasparini, Saverio D\'Ercole, Lea Tafuri, F. Panzarella','Marco Frisina',NULL,NULL,NULL,'1645459542226.jpg',1,1,'CFC',4,4,23,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(5,5,'peliculas',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1645459996491.jpg',1,1,'CFC',4,4,23,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(6,1,'colecciones',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1645481101308.jpg',1,1,'CFC',4,5,24,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(7,2,'colecciones',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Love Comes Softly','El amor llega suavemente',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon',NULL,NULL,NULL,'1646276771102.jpg',2,1,'VPC',10,4,NULL,NULL,15,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(8,1,'capitulos',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Karol - Un uomo diventato Papa',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,24,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL),(9,2,'capitulos',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'TAO Film',NULL,NULL,NULL,NULL,NULL,NULL,NULL,24,NULL,NULL,10,'2022-03-07 19:02:11',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `edic_productos` ENABLE KEYS */;
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
-- Dumping data for table `links_prods`
--

LOCK TABLES `links_prods` WRITE;
/*!40000 ALTER TABLE `links_prods` DISABLE KEYS */;
INSERT INTO `links_prods` VALUES (1,NULL,NULL,1,'youtube.com/watch?v=g1vC9TXMkXk',360,1,NULL,2,11,1,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,NULL,1,'youtube.com/watch?v=0DcobZTPl0U',480,0,1,2,11,1,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,NULL,1,'youtube.com/watch?v=Ug31Sdb6GU4',480,0,2,2,11,1,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,NULL,NULL,1,'youtube.com/watch?v=vnLERiCT96M',480,0,3,2,11,1,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,NULL,1,'youtube.com/watch?v=dc4bkUqC9no',480,0,4,2,11,1,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,NULL,NULL,1,'www/fefe',144,1,NULL,1,1,0,1,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,NULL,NULL,1,'weww/fefe',144,1,NULL,1,1,0,10,'2022-03-07 19:02:12',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `links_prods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `links_provs`
--

LOCK TABLES `links_provs` WRITE;
/*!40000 ALTER TABLE `links_provs` DISABLE KEYS */;
INSERT INTO `links_provs` VALUES (1,0,'Desconocido','PT-Desconocido.jpg',NULL,NULL,NULL,1,'',0,'',1,'',1,''),(11,1,'YouTube','PT-YouTube.jpg',NULL,0,NULL,0,'youtube.com',1,'/results?search_query=',1,'&sp=EgIYAQ%253D%253D',1,'sp=EgIYAg%253D%253D'),(12,2,'Formed en Español','PT-Formed cast.jpg',NULL,1,1081,0,'ver.formed.lat',1,'/search?q=',0,'',1,''),(13,3,'Formed','PT-Formed.jpg',NULL,1,1081,0,'watch.formed.org',1,'/search?q=',0,'',1,''),(14,4,'Brochero','PT-Brochero.jpg',1,1,1081,0,'brochero.org',0,'',0,'',1,''),(15,5,'FamFlix','PT-FamFlix.jpg',1,1,1081,0,'famflix.mx',0,'',0,'',1,''),(16,6,'FamiPlay','PT-FamiPlay.jpg',1,1,1081,0,'famiplay.com',1,'/catalogo?s=',0,'',1,''),(17,7,'Goya Prod.','PT-Goya.jpg',1,1,1081,0,'goyaproducciones.com',1,'/?s=',1,'',1,''),(18,8,'IMDb','PT-IMDB.jpg',NULL,NULL,NULL,0,'imdb.com',0,'/find?q=',1,'',0,'');
/*!40000 ALTER TABLE `links_provs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `links_tipos`
--

LOCK TABLES `links_tipos` WRITE;
/*!40000 ALTER TABLE `links_tipos` DISABLE KEYS */;
INSERT INTO `links_tipos` VALUES (1,'Trailer',0,1),(2,'Película',1,0);
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
INSERT INTO `pr_us_calificaciones` VALUES (1,10,1,NULL,NULL,5,4,3,100,75,100,92),(2,10,2,NULL,NULL,5,4,3,100,75,100,92),(3,10,3,NULL,NULL,5,5,3,100,100,100,100),(4,10,4,NULL,NULL,5,5,3,100,100,100,100),(5,10,5,NULL,NULL,5,4,3,100,75,100,92),(6,10,NULL,1,NULL,4,4,3,75,75,100,80),(7,10,NULL,2,NULL,4,4,3,75,75,100,80);
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
-- Dumping data for table `prod_capitulos`
--

LOCK TABLES `prod_capitulos` WRITE;
/*!40000 ALTER TABLE `prod_capitulos` DISABLE KEYS */;
INSERT INTO `prod_capitulos` VALUES (1,1,1,1,'38516',NULL,'tt0435100','TMDB','Karol – Un uomo diventato Papa','Karol, el hombre que llegó a ser Papa',2005,195,'PL, IT','it','Giacomo Battiato','Giacomo Battiato','Ennio Morricone','Piotr Adamczyk (Karol Wojtyla), Malgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszynski), Patrycja Soliman (Wislawa), Olgierd Lukaszewicz (Karol Wojtyla padre), Szymon Bobrowski (capitano Macke), Kenneth Welsh (professor Wójcik), Mateusz Damiecki (Wiktor), Adrian Ochalik (Jerzy Kluger)','TAO Film','Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xVqMG4KcTXhkhL65yohBpjbkY65.jpg',1,1,'CFC',4,5,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(2,1,1,2,'75470',NULL,'tt0495039','TMDB','Karol, un Papa rimasto uomo','Karol, el Papa que siguió siendo hombre',2006,184,'IT, PL, CA','it','Giacomo Battiato','Gianmario Pagano, Giacomo Battiato, Monica Zapelli','Ennio Morricone','Piotr Adamczyk (John Paul II), Dariusz Kwasnik (Dr. Renato Buzzonetti), Michele Placido (Dr. Renato Buzzonetti), Dariusz Kwasnik (Stanislaw Dziwisz), Alberto Cracco (Agostino Casaroli), Adriana Asti (Madre Teresa di Calcutta), Raoul Bova (Padre Thomas), Leslie Hope (Julia Ritter), Alkis Zanis (Ali Agca), Carlos Kaniowsky (Oscar Arnulfo Romero Goldamez), Fabrice Scott (Jerzy Popieluszko), Paolo Maria Scalondro (Wojciech Jaruzelski), Daniela Giordano (Tobiana Sobótka)',NULL,'Es la continuación de la miniserie Karol, el hombre que se convirtió en Papa. Narra la historia, desde 1978 en adelante, del primer hombre de un país del este elegido Papa y el papel que tomó en el final del Comunismo, a pesar de sufrir un intento de asesinato que trató de hacerlo callar. La historia narra cómo continuó su pontificado con valor a pesar de la enfermedad que poco a poco iba minando su vida. Él nunca ocultó su sufrimiento físico, pero luchó hasta el final contra la guerra y la violencia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/pTZZSSjJvKohXJmBdAT5CO5lXnK.jpg',1,1,'CFC',4,5,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(3,2,1,1,'16250',NULL,'tt0345591','TMDB','Love Comes Softly','El amor llega suavemente',2003,84,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','Ken Thorne, Michael Wetherwax, William Ashford','Katherine Heigl (Marty Claridge), Dale Midkiff (Clark Davis), Skye McCole Bartusiak (Missie Davis), Corbin Bernsen (Ben Graham), Theresa Russell (Sarah Graham), Oliver Macready (Aaron Claridge), Tiffany Amber Knight (Laura Graham), Nick Scoggin (Reverend Johnson), Rutanya Alda (Wanda Marshall), Jaimz Woolvett (Wagon Train Scout), Janet Rotblatt (Woman in Wagon), Adam Loeffler (Clint Graham), David Fine (Jed Larsen (uncredited)), Dani Goldman (Young Marty (uncredited))','Larry Levinson Productions, Hallmark Entertainment, Alpine Medien Productions','Estando de ruta hacia su nuevo hogar en las grandes llanuras del oeste, una joven se queda repentinamente viuda en medio del largo viaje en carreta. Con una dura temporada invernal acechando y sin recursos para regresar, la joven acepta el trato que le ofrece un granjero: casarse con él para ocuparse de su hija, a cambio de cobijo y de un pasaje de vuelta en primavera. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eDxmL7CCHWCcFpbdS6yVnspOjV1.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(4,2,1,2,'20641',NULL,'tt0402348','TMDB','Love\'s Enduring Promise','El amor lo puede todo',2004,95,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','','January Jones (Missie Davis), Logan Bartholomew (Willie / Nate), Dale Midkiff (Clark Davis), Katherine Heigl (Marty Claridge), Kesun Loder (Aaron Davis), Logan Arens (Arnie Davis), Mackenzie Astin (Grant Thomas), Cliff DeYoung (Zeke), Matthew Peters (Brian Murphy), Michael Bartel (Willie at 15), Dominic Scott Kay (Mattie), Blaine Pate (Sam), Cara DeLizia (Annie Walker), Robert F. Lyons (Doc Watkins), Douglas Fisher (Edward Trumball), E.J. Callahan (Asa), Katia Coe (Clara), Gary Sievers (Ranxher)',NULL,'Una familia de granjeros del Oeste, cuya subsistencia depende de sus cosechas, ve cómo un accidente del cabeza de familia, que se verá obligado a guardar cama, pone en grave peligro su situación económica. Su hija, una maestra de escuela, se ve obligada a realizar las duras labores de la granja, hasta que un forastero se ofrece a ayudarles y a curar al herido... (Fuente: TMDB)','https://image.tmdb.org/t/p/original/lwbeyOtRpn1izaRnVVhDSJGwHRu.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(5,2,1,3,'22488',NULL,'tt0785025','TMDB','Love\'s Abiding Joy','El largo camino del amor',2006,88,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Douglas Lloyd McIntosh, Bridget Terry','','Erin Cottrell (Missie), Logan Bartholomew (Willie), William Morgan Sheppard (Scottie), James Tupper (Henry), Irene Bedard (Miriam Red Hawk McClain), Dale Midkiff (Clark Davis), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), Brett Coker (Mattie LaHaye), Mae Whitman (Colette Doros), John Laughlin (Smuel Doros), Kevin Gage (John Abel), Brianna Brown (Melinda Klein), Stephen Bridgewater (Frank Taylorson), Blake Gibbons (Joe Paxson), Madison Leisle (Annie), Thomas Stanley (Mark)',NULL,'Tras un peligroso viaje al Oeste, Missie (Erin Cottrell) y su marido (Logan Bartholomew) se establecen en unas tierras con la intención de formar una familia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/rNQCuECnv6ubGJzHqqdFB2O1bV7.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(6,2,1,4,'20583',NULL,'tt0486420','TMDB','Love\'s Long Journey','El amor dura eternamente',2005,87,'US','en','Michael Landon Jr.','','','Erin Cottrell (Missie LaHaye), Dale Midkiff (Clark Davis), Logan Bartholomew (Willie LaHaye), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), William Morgan Sheppard (Scottie), Richard Lee Jackson (Sonny Huff)',NULL,'Adaptación televisiva de la novela de Janette Oke sobre una joven pareja, Missie (Erin Cottrell) y Willie (Logan Bartholomew), que abandonan sus hogares para comenzar una nueva vida en el Oeste. Durante el camino, su amor y su Fe en Dios serán puestos a prueba por la adversidades del trayecto. Willie y Missie La Haye emprenden una nueva vida como colonos en el Oeste americano. Adquieren un rancho y un buen número de cabezas de ganado y, una vez instalados, Missie confiesa a su marido que espera un hijo. Su padre, desde la distancia, le recuerda que sus corazones están unidos por el amor, y que pronto se reencontrarán. Mientras tanto, Missie trabaja como maestra ganándose el afecto de la comunidad india. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eIrxGoq68iH16NWFF1XKCKXRmaE.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(7,2,1,5,'30975',NULL,'tt0929864','TMDB','Love\'s Unending Legacy','El legado de un amor infinito',2007,84,'US','en','Mark Griffiths','Janette Oke, Pamela Wallace','Kevin Kiner','Erin Cottrell (Missie LaHaye), Holliston Coleman (Belinda Marshall-LaHaye), Victor Browne (Sherrif Zack Tyler), Hank Stratton (Pastor Joe), Braeden Lemasters (Jacob Marshall-LaHaye), Dave Florek (Hank Pettis), Stephanie Nash (Mrs. Pettis), Bret Loehr (Calvin), Dale Midkiff (Clark Davis)',NULL,'Tres años después de la muerte de su marido, Missie decide regresar junto a su hijo a casa de sus padres. Allí recupera su trabajo como maestra y adopta a Belinda, una huérfana algo rebelde que oculta un secreto: tiene un hermano menor que está siendo maltratado por sus nuevos padres adoptivos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xi57bQTg33RpduDphkvtdWkEI7b.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(8,2,1,6,'49857',NULL,'tt0960143','TMDB','Love\'s Unfolding Dream','La doble cara del amor',2007,87,'US','en','Harvey Frost','','','Erin Cottrell (Missy Tyler), Scout Taylor-Compton (Belinda Tyler), Dale Midkiff (Clark Davis), Robert Pine (Dr. Micah Jackson), Victor Browne (Sheriff Zach Taylor), Samantha Smith (Mart Davis), Patrick Levis (Drew Simpson), Nancy Linehan Charles (Virginia Stafford-Smith)','Larry Levinson Productions, RHI Entertainment, Alpine Medien Productions','Belinda quiere ser doctora, pero vive en una época en la que su condición de mujer pone muchas trabas a su camino. Se debate entre su vocación y el amor por un abogado de costumbres tradicionales. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/7OCcCfioaoUS1q5nemO8uSciKRj.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(9,2,1,7,'21636',NULL,'tt1269560','TMDB','Love Takes Wing','Y el amor volvió a nosotros',2009,88,'US','en','Lou Diamond Phillips','Rachel Stuhler','','Sarah Jones (Belinda Simpson), Haylie Duff (Annie Nelson), Jordan Bridges (Lee Owens), Patrick Duffy (Mayor Evans), Cloris Leachman (Hattie Clarence), John Bishop (John Pine), Lou Diamond Phillips (Ray Russell), Erin Cottrell (Missy), Annalise Basso (Lillian), Time Winters (Gus), Bonnie Root (Mrs. Pine), Craig K. Bodkin (Sheriff), Dave Rodgers (Stage Coach Driver)',NULL,'Tras la muerte de su marido, la doctora Belinda Simpson llega a la ciudad de Sikeston. Pronto descubre que su población está enfermando y muriendo de cólera, brote que proviene de un orfanato cercano. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/b6bM8dmSbEHDv9hHIJCZjbgIkbV.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(10,2,1,8,'25182',NULL,'tt1307064','TMDB','Love Finds A Home','Y el amor llegó al hogar',2009,88,'US','en','David S. Cass Sr.','Janette Oke, Donald Davenport','Stephen Graziano','Sarah Jones (Belinda Simpson), Haylie Duff (Annie), Jordan Bridges (Lee Owens), Patty Duke (Mary), Courtney Halverson (Lillian), Michael Trevino (Joshua), Jeffrey Muller (Peter), Dahlia Salem (Mabel McQueen), Thomas Kopache (Reverend Davis), Chad W. Smathers (Danny Travis), Daniel Beer (Lloyd McQueen), Jeff Clarke (Mr. Travis), Jennifer M. Gentile (Mrs. Travis), Matthew Florida (Young Cowboy), Michelle Josette (Young Mother), Time Winters (Gus), Grace Levinson (Grace), Shannon Levinson (Shannon)','RHI Entertainment, Larry Levinson Productions, LG Films, Faith & Family Entertainment','La doctora Annie Watson va a casa de su mejor amiga, la también facultativa Belinda Owens. Allí, la chica tendrá que convivir con Mary, una mujer a la que le gustan los remedios naturales, y con un matrimonio en crisis, por la imposibilidad de Belinda por quedarse embarazada. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/zgFi7OtOeMmvH3stWJSpazJGaSJ.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(11,2,1,9,'81450',NULL,'tt1684907','TMDB','Love Begins','Cuando nace el amor',2011,0,'US, IE','en','David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Moran','Stephen McKeon','Wes Brown (Clark Davis), Julie Mond (Ellen Louise Barlow), Abigail Mavity (Cassandra Mae \'Cassie\' Barlow), Jere Burns (Sheriff Holden), Nancy McKeon (Millie), David Tom (Daniel Whittaker), Steffani Brass (Rose), Daniel Buran (Samuel)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Tras una pelea en una cafetería, Clark Davis es condenado a ir a la cárcel. Gracias a un acuerdo entre el sheriff y la propietaria del local, se le conmuta la pena. Entonces tendrá que trabajar como peón para las hermanas Ellen y Cassie Barlow. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/b0JiPlWEZ8cnhhgVOWo0rnbGuvh.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(12,2,1,10,'87311',NULL,'tt1672621','TMDB','Love\'s Everlasting Courage','Love\'s Everlasting Courage',2011,89,'US','en','Bradford May, Dora Hopkins','Kevin Bocarde','Brian Byrne','Wes Brown (Clark), Julie Mond (Ellen), Bruce Boxleitner (Lloyd), Cheryl Ladd (Irene), Morgan Lily (Missy), Willow Geer (Sarah), Tyler Jacob Moore (Ben), Kirk B.R. Woller (Bruce), James Eckhouse (Mr. Harris), Courtney Marmo (Laura)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Una familia joven lucha por una frontera en el oeste que permita a la mujer trabajar en un taller de costura. Cuando la situación económica mejora, la esposa enferma y muere. Con la ayuda de sus padres, el joven viudo tendrá que aprender a lidiar con la trágica pérdida. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/aIZoXDvpmwF70KsY8lByku5SwgF.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(13,2,1,11,'87313',NULL,'tt2078672','TMDB','Love\'s Christmas Journey','Y el amor llegó en Navidad',2011,172,'US','en','David S. Cass Sr., Dora Hopkins','Janette Oke, George Tierne','','Natalie Hall (Ellie Davis), JoBeth Williams (Beatrice), Greg Vaughan (Aaron Davis), Dylan Bruce (Michael), Ernest Borgnine (Nicholas), Teddy Vincent (Mrs. Price), Annika Noelle (Suzanna), Bobby Campo (Erik Johnson), Charles Shaughnessy (Alex Weaver), Sean Astin (Mayor Wayne), Ryan Wynott (Christopher), Jada Facer (Annabelle), Amanda Foreman (Adrienne), Dannika Liddell (Jessica), Brian Thompson (Cass), Richard Tyson (Charley)',NULL,'Tras la muerte de su marido y su hija, Eli decide pasar la temporada de Navidad con su hermano, el sheriff de una pequeña ciudad respetado por todos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/jYqWZG3f5FRy8oUwZYOn77h9I59.jpg',NULL,1,'VPC',10,4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,2);
/*!40000 ALTER TABLE `prod_capitulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_colecciones`
--

LOCK TABLES `prod_colecciones` WRITE;
/*!40000 ALTER TABLE `prod_colecciones` DISABLE KEYS */;
INSERT INTO `prod_colecciones` VALUES (1,'855456',NULL,'collection','TMDB','Karol','Karol',2005,2006,'PL, IT, CA','es',1,2,'Giacomo Battiato','Giacomo Battiato, Gianmario Pagano, Monica Zapelli','Ennio Morricone','Piotr Adamczyk, Malgorzata Bela, Raoul Bova, Lech Mackiewicz, Dariusz Kwasnik','TAO Film','Es una colección de 2 películas, que narra la vida de Karol Wojtyla (Juan Pablo II). La primera película transcurre durante su vida anterior al papado: la II Guerra Mundial, el comunismo, su seminario en forma clandestino porque estaba prohibido por los nazis, su nombramiento como obispo y cardenal, su formación de la juventud de su pueblo, su intención de preservar la cultura polaca durante el sometimiento alemán y luego ruso. La segunda película muestra su vida durante el papado. El atentado contra su vida, sus viajes apostólicos, el reencuentro con sus seres queridos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/os06a6E5MvC4qyqmB7fkaKUJ7Jx.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2),(2,'97919',NULL,'collection','TMDB','Love Comes Softly Collection','El amor llega suavemente - Colección',2003,2011,'US','en',1,11,'Michael Landon Jr., David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Landon Jr.','Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon, Brian','Dale Midkiff, Erin Cottrell','Larry Levinson Productions, RHI Entertainment','Secuela de la vida de las sucesivas descendientes femeninas de una familia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/agSYE5U98pz8OLNI6C6d2NQvn6h.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2);
/*!40000 ALTER TABLE `prod_colecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prod_peliculas`
--

LOCK TABLES `prod_peliculas` WRITE;
/*!40000 ALTER TABLE `prod_peliculas` DISABLE KEYS */;
INSERT INTO `prod_peliculas` VALUES (1,'218275',NULL,'tt1445208','TMDB','The Letters','Cartas de la Madre Teresa',2015,125,'US','en','William Riead','William Riead','','Rutger Hauer (Benjamin Praagh), Juliet Stevenson (Mother Teresa), Max von Sydow (Celeste van Exem), Priya Darshani (Shubashini Das), Kranti Redkar (Deepa Ambereesh), Mahabanoo Mody-Kotwal (Mother General), Tillotama Shome (Kavitha Singh), Vijay Maurya (Maharaj Singh), Vivek Gomber (Ashwani Sharma)','Cinema West Films, Big Screen Productions, Freestyle Releasing','\"The Letters\" narra de manera muy personal la historia de esta religiosa, quien encontró el valor para entrar en los paupérrimos barrios de Calcuta, India, con sólo cinco rupias en el bolsillo y enseñarle al mundo entero una de las lecciones de bondad más importantes de la historia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/8qnZycQWka7I8TbZ7UcvJ6I3weB.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,75,100,92,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2),(2,'109429',NULL,'tt0327086','TMDB','Il Papa buono','El Santo Padre Juan XXIII',2003,180,'IT','en','Ricky Tognazzi','Fabrizio Bettelli, Simona Izzo, Marco Roncalli','Ennio Morricone','Bob Hoskins (Angelo Roncalli / Pope John XXIII), Carlo Cecchi (Cardinal Mattia Carcano), Roberto Citran (Monsignor Loris Capovilla), Fabrizio Vidale (Angelo Roncalli (young)), Sergio Bini Bustric (Guido Gusso), Francesco Venditti (Nicola Catania (young)), Rolando Ravello (Cannava), John Light (Mattia Carcano (young)), Francesco Carnelutti (Nicola Catania), Lena Lessing (Marta Von Papen), Joan Giammarco, Gianluca Ramazzotti, Monica Piseddu, Pietro Delle Piane','MediaTrade','Juan XXIII fue Papa sólo 4 años (1959-1963), pero promovió profundos cambios y lanzó al mundo un contundente mensaje de paz. Era la época de la Guerra Fría, y las relaciones internacionales eran muy tensas. Convocó el Concilio Vaticano II, que supuso una auténtica revolución en el seno de la Iglesia Católica, que tuvo que reconocer que se había ido alejando cada vez más del mensaje de Cristo y que era necesario reflexionar sobre las necesidades del hombre moderno. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/sRtTl8tVhBcE7KUGGWHOqx5LAeC.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,75,100,92,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2),(3,'108672',NULL,'tt0317009','TMDB','Papa Giovanni - Ioannes XXIII','Juan XXIII: El Papa de la paz',2002,208,'IT','it','Giorgio Capitani','Francesco Scardamaglia, Massimo Cerofolini','Marco Frisina','Ed Asner (Angelo Roncalli), Massimo Ghini (Angelo Roncalli giovane), Claude Rich (Cardinal Ottaviani), Michael Mendl (Tardini), Franco Interlenghi (Radini Tedeschi), Sydne Rome (Rada Krusciova), Jacques Sernas (Cardinale Feltin), Leonardo Ruta (Remo Roncalli), Paolo Gasparini (Monsignor Loris Capovilla), Sergio Fiorentini (Don Rebuzzini), Roberto Accornero, Heinz Trixner (Von Papen), Ivan Bacchi, Bianca Guaccero, Emilio De Marchi, Guido Roncalli, Giorgia Bongianni, Enzo Marino Bellanich',NULL,'En 1958, tras la muerte de Pío XII, el anciano Cardenal Angelo Roncalli, Patriarca de Venecia, viaja a Roma para participar en el cónclave que debe elegir al nuevo Papa, cónclave dominado por toda clase de maniobras políticas. En efecto, una vez en el Vaticano, Roncalli asiste atónito al enconado enfrentamiento entre las distintas facciones eclesiásticas. Durante el cónclave se van desvelando aspectos extraordinarios del pasado del viejo cardenal: su apoyo espiritual y económico a un grupo de trabajadores en huelga, cuando todavía era un joven sacerdote; su ayuda a los cristianos ortodoxos de Bulgaria, cuando estuvo destinado en ese país; sus hábiles negociaciones con el embajador nazi de Estambul para salvar un tren de prisioneros judíos, cuando era diplomático del Vaticano en Turquía; su','https://image.tmdb.org/t/p/original/llb1oSGE9F18QlIMx0teXXMosCY.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,100,100,100,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2),(4,'122977',NULL,'tt0416694','TMDB','Don Bosco','Don Bosco',2004,146,'IT','it','Lodovico Gasparini','Carlo Mazzotta, Graziano Diana, Lodovico Gasparini, Saverio D\'Ercole, Lea Tafuri, Francesca Panzarel','','Flavio Insinna (Don Bosco), Lina Sastri (Margherita Bosco), Charles Dance (Marchese Clementi), Daniel Tschirley (Michele Rua), Fabrizio Bucci (Bruno), Lewis Crutch (Domenico Savio), Brock Everitt-Elwick (Don Bosco as a child), Alessandra Martines (Marchesa Barolo)','RAI','El Piamonte (Italia), siglo XIX. En Turín, el sacerdote Don Bosco, un hombre procedente de una humilde familia campesina, se entregó total y apasionadamente a la tarea de recoger de las calles a los chicos marginados y cuidar de ellos. No sólo los sacó de la pobreza, de la ignorancia y del desamparo social, sino que consiguió que, por primera vez, se sintieran amados. Luchó con una fe y un tesón extraordinarios para vencer los obstáculos e insidias que, tanto las autoridades civiles como las eclesiásticas, pusieron en su camino para impedirle culminar su objetivo: la fundación de la Congregación de los salesianos, que garantizaría el futuro de sus chicos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/fVFlTWdjvu3t98l9WlXB1984ATl.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,100,100,100,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2),(5,'254489',NULL,'tt0095051','TMDB','Don Bosco','Don Bosco',1988,150,'IT','it','Leandro Castellani','Ennio De Concini','Stelvio Cipriani','Ben Gazzara (Don Giovanni Bosco), Patsy Kensit (Lina), Karl Zinny (Giuseppe), Piera Degli Esposti (La madre di Lina), Philippe Leroy (Papa Leone XIII), Leopoldo Trieste (Don Borel), Raymond Pellegrin (Papa Pio IX), Laurent Therzieff (Monsignor Gastaldi), Edmund Purdom (Urbano Rattazzi), Rik Battaglia (Marchese Michele Cavour)','RAI, ELLE DI.CI., TIBER CINEMATOGRAFICA','Piamonte (Italia), siglo XIX. Don Bosco, un sacerdote piamontés de humilde origen campesino, se entregó apasionadamente a la tarea de recoger de las calles de Turín a los muchachos abandonados y carentes de toda protección social. Tuvo que vencer mil obstáculos e insidias para crear albergues, escuelas y talleres, donde pudieran recibir una educación cristiana y cívica. La culminación de su obra fue la fundación de la Congregación Salesiana. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xlPz5FaH3D0ogxlF07f03CTQA07.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,75,100,92,10,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,10,NULL,3,2);
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
-- Dumping data for table `rclv_hechos`
--

LOCK TABLES `rclv_hechos` WRITE;
/*!40000 ALTER TABLE `rclv_hechos` DISABLE KEYS */;
INSERT INTO `rclv_hechos` VALUES (1,NULL,NULL,'Ninguno',1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,NULL,'Varios (colección)',1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,359,0,'Navidad',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,100,33,'Sem. Santa - 1. General',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,105,33,'Sem. Santa - 2. Viernes Santo',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,107,33,'Sem. Santa - 3. Resurrección',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,150,33,'Pentecostés',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,210,1914,'Guerra Mundial - 1a',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,245,1942,'Guerra Mundial - 2a',1,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_hechos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rclv_personajes`
--

LOCK TABLES `rclv_personajes` WRITE;
/*!40000 ALTER TABLE `rclv_personajes` DISABLE KEYS */;
INSERT INTO `rclv_personajes` VALUES (1,NULL,NULL,'Ninguno',NULL,NULL,1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,NULL,NULL,'Varios (colección)',NULL,NULL,1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,NULL,0,'Jesús','STV','RCV',1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,1,-15,'María, madre de Jesús','STM','LCM',1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,79,-20,'José, padre de Jesús','STV','LCV',1,'2022-03-07 19:02:10',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,249,1910,'Teresa de Calcuta','STM','RCM',10,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,285,1958,'Juan XXIII','STV','PPV',10,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,31,1815,'Juan Bosco','STV','RCV',10,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,296,1920,'Juan Pablo II','STV','PPV',10,'2022-03-07 19:02:10',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_personajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rclv_valores`
--

LOCK TABLES `rclv_valores` WRITE;
/*!40000 ALTER TABLE `rclv_valores` DISABLE KEYS */;
INSERT INTO `rclv_valores` VALUES (1,'Ninguno',1,'2022-03-07 19:02:11',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'Varios (colección)',1,'2022-03-07 19:02:11',NULL,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Valores en el deporte',1,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Pacificar un país dividido',1,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Pasión por ayudar',1,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Superación personal',1,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Perseverancia',1,'2022-03-07 19:02:11',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles_iglesia`
--

LOCK TABLES `roles_iglesia` WRITE;
/*!40000 ALTER TABLE `roles_iglesia` DISABLE KEYS */;
INSERT INTO `roles_iglesia` VALUES ('LC',2,'Laico casado',0,1,'-'),('LCM',2,'Laica casada',1,1,'M'),('LCV',2,'Laico casado',1,1,'V'),('LS',1,'Laico soltero',1,1,'O'),('LSM',1,'Laica soltera',1,1,'M'),('LSV',1,'Laico soltero',1,1,'V'),('PC',0,'Computadora',0,0,'O'),('PP',5,'Papa',0,1,'-'),('PPV',5,'Papa',0,1,'V'),('RC',3,'Religioso consagrado',0,1,'-'),('RCM',3,'Religiosa consagrada',1,1,'M'),('RCV',3,'Religioso consagrado',1,1,'V'),('SC',4,'Sacerdote',0,1,'-'),('SCV',4,'Sacerdote',1,1,'V');
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
INSERT INTO `sexos` VALUES ('M',1,'Mujer','a'),('O',3,'Otro','o'),('V',2,'Varón','o');
/*!40000 ALTER TABLE `sexos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `si_no_parcial`
--

LOCK TABLES `si_no_parcial` WRITE;
/*!40000 ALTER TABLE `si_no_parcial` DISABLE KEYS */;
INSERT INTO `si_no_parcial` VALUES (1,'SI','SI',1,0),(2,'Parcial','Tal vez',0,0),(3,'NO','NO',0,1);
/*!40000 ALTER TABLE `si_no_parcial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `status_registro_prod`
--

LOCK TABLES `status_registro_prod` WRITE;
/*!40000 ALTER TABLE `status_registro_prod` DISABLE KEYS */;
INSERT INTO `status_registro_prod` VALUES (1,1,'Creado','Creado',1,0,0,0,0),(2,2,'Editado','Editado',0,1,0,0,0),(3,3,'Aprobado','Aprobado',0,0,1,0,0),(4,4,'Sugerido p/borrar','Sugerido p/inactivar',0,0,0,1,0),(5,5,'Borrado','Inactivado',0,0,0,0,1);
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
INSERT INTO `usuarios` VALUES (1,'sinMail1','sinContraseña','Startup',NULL,NULL,'Startup','-',NULL,'O','AR',2,'PC',1,0,'2022-03-07 19:02:10','2000-01-01 00:00:00',NULL,4,NULL,NULL),(2,'sinMail2','sinContraseña','Automatizado',NULL,NULL,'Automatizado','-',NULL,'O','AR',2,'PC',1,0,'2022-03-07 19:02:10','2000-01-01 00:00:00',NULL,4,NULL,NULL),(10,'diegoiribarren2015@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Data Entry','Startup',0,'Data Entry','1617370359746.jpg','1969-08-16','V','AR',2,'LCV',1,0,'2022-03-07 19:02:10','2021-03-26 00:00:00',NULL,4,NULL,NULL),(11,'diegoiribarren2021@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Diego','Iribarren',21072001,'Diego','1632959816163.jpg','1969-08-16','V','AR',5,'LCV',1,0,'2022-03-07 19:02:10','2021-03-26 00:00:00',NULL,4,NULL,NULL);
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

-- Dump completed on 2022-03-08  8:56:42
