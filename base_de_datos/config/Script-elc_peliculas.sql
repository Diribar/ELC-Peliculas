-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: elc_peliculas
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
-- Table structure for table `altas_motivos_rech`
--

DROP TABLE IF EXISTS `altas_motivos_rech`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `altas_motivos_rech` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `comentario` varchar(41) NOT NULL,
  `bloqueo_perm_inputs` tinyint(1) DEFAULT 0,
  `prod` tinyint(1) DEFAULT 0,
  `rclv` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `altas_motivos_rech`
--

LOCK TABLES `altas_motivos_rech` WRITE;
/*!40000 ALTER TABLE `altas_motivos_rech` DISABLE KEYS */;
INSERT INTO `altas_motivos_rech` VALUES (11,1,'Producto duplicado',0,1,0,0,0.2),(12,2,'Producto ajeno a nuestro perfil',0,1,0,0,1.0),(13,3,'Producto ofensivo a nuestro perfil',1,1,0,0,90.0),(14,4,'Producto ofensivo con pornografía',1,1,0,0,180.0),(21,1,'Link reemplazado por otro más acorde',0,0,0,1,0.0),(22,2,'Link a video no disponible',0,0,0,1,0.2),(23,3,'Link a video sin relación con el producto',0,0,0,1,10.0),(24,4,'Link a video sin relación y ofensivo',1,0,0,1,90.0),(31,1,'Nombre mal escrito',0,0,1,0,0.2),(32,2,'Nombre spam',0,0,1,0,1.0),(33,3,'Nombre spam c/saña',0,0,1,0,5.0),(34,4,'En desuso',0,0,1,0,0.0),(100,100,'Otro motivo',0,1,1,1,0.0);
/*!40000 ALTER TABLE `altas_motivos_rech` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_banco_fotos`
--

DROP TABLE IF EXISTS `aux_banco_fotos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_banco_fotos` (
  `id` smallint(5) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `nombre_archivo` varchar(20) NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  CONSTRAINT `aux_banco_fotos_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_banco_fotos`
--

LOCK TABLES `aux_banco_fotos` WRITE;
/*!40000 ALTER TABLE `aux_banco_fotos` DISABLE KEYS */;
/*!40000 ALTER TABLE `aux_banco_fotos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_historial_de_cambios_de_status`
--

DROP TABLE IF EXISTS `aux_historial_de_cambios_de_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_historial_de_cambios_de_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad_id` int(10) unsigned NOT NULL,
  `entidad` varchar(11) NOT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL,
  `analizado_por_id` int(10) unsigned NOT NULL,
  `analizado_en` datetime NOT NULL,
  `status_original_id` tinyint(3) unsigned NOT NULL,
  `status_final_id` tinyint(3) unsigned NOT NULL,
  `aprobado` tinyint(1) NOT NULL,
  `duracion` decimal(4,1) unsigned DEFAULT NULL,
  `comunicado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `analizado_por_id` (`analizado_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `status_original_id` (`status_original_id`),
  KEY `status_final_id` (`status_final_id`),
  CONSTRAINT `aux_historial_de_cambios_de_status_ibfk_1` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `aux_historial_de_cambios_de_status_ibfk_2` FOREIGN KEY (`analizado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `aux_historial_de_cambios_de_status_ibfk_3` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `aux_historial_de_cambios_de_status_ibfk_4` FOREIGN KEY (`status_original_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `aux_historial_de_cambios_de_status_ibfk_5` FOREIGN KEY (`status_final_id`) REFERENCES `aux_status_registro` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_historial_de_cambios_de_status`
--

LOCK TABLES `aux_historial_de_cambios_de_status` WRITE;
/*!40000 ALTER TABLE `aux_historial_de_cambios_de_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `aux_historial_de_cambios_de_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_idiomas`
--

DROP TABLE IF EXISTS `aux_idiomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_idiomas` (
  `id` varchar(2) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `mas_frecuente` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_idiomas`
--

LOCK TABLES `aux_idiomas` WRITE;
/*!40000 ALTER TABLE `aux_idiomas` DISABLE KEYS */;
INSERT INTO `aux_idiomas` VALUES ('aa','Afar',0),('ab','Abjasio',0),('ae','Avéstico',0),('af','Afrikáans',0),('ak','Akano',0),('am','Amhárico',0),('an','Aragonés',0),('ar','Árabe',0),('as','Asamés',0),('av','Ávaro',0),('ay','Aimara',0),('az','Azerí',0),('ba','Baskir',0),('be','Bielorruso',0),('bg','Búlgaro',0),('bh','Bhoyapurí',0),('bi','Bislama',0),('bm','Bambara',0),('bn','Bengalí',0),('bo','Tibetano',0),('br','Bretón',0),('bs','Bosnio',0),('ca','Catalán',0),('ce','Checheno',0),('ch','Chamorro',0),('co','Corso',0),('cr','Cree',0),('cs','Checo',0),('cu','Eslavo eclesiástico',0),('cv','Chuvasio',0),('cy','Galés',0),('da','Danés',0),('de','Alemán',0),('dv','Maldivo',0),('dz','Dzongkha',0),('ee','Ewé',0),('el','Griego',0),('en','Inglés',1),('eo','Esperanto',0),('es','Castellano',1),('et','Estonio',0),('eu','Euskera',0),('fa','Persa',0),('ff','Fula',0),('fi','Finés',0),('fj','Fiyiano',0),('fo','Feroés',0),('fr','Francés',1),('fy','Frisón',0),('ga','Gaélico',0),('gd','Gaélico escocés',0),('gl','Gallego',0),('gn','Guaraní',0),('gu','Guyaratí',0),('gv','Gaélico manés',0),('ha','Hausa',0),('he','Hebreo',0),('hi','Hindi',0),('ho','Hiri motu',0),('hr','Croata',0),('ht','Haitiano',0),('hu','Húngaro',0),('hy','Armenio',0),('hz','Herero',0),('ia','Interlingua',0),('id','Indonesio',0),('ie','Occidental',0),('ig','Igbo',0),('ii','Yi de Sichuán',0),('ik','Iñupiaq',0),('io','Ido',0),('is','Islandés',0),('it','Italiano',1),('iu','Inuktitut',0),('ja','Japonés',0),('jv','Javanés',0),('ka','Georgiano',0),('kg','Kongo',0),('ki','Kikuyu',0),('kj','Kuanyama',0),('kk','Kazajo',0),('kl','Kalaallisut',0),('km','Camboyano',0),('kn','Canarés',0),('ko','Coreano',0),('kr','Kanuri',0),('ks','Cachemiro',0),('ku','Kurdo',0),('kv','Komi',0),('kw','Córnico',0),('ky','Kirguís',0),('la','Latín',0),('lb','Luxemburgués',0),('lg','Luganda',0),('li','Limburgués',0),('ln','Lingala',0),('lo','Lao',0),('lt','Lituano',0),('lu','Luba-katanga',0),('lv','Letón',0),('mg','Malgache',0),('mh','Marshalés',0),('mi','Maorí',0),('mk','Macedonio',0),('ml','Malayalam',0),('mn','Mongol',0),('mr','Maratí',0),('ms','Malayo',0),('mt','Maltés',0),('my','Birmano',0),('na','Nauruano',0),('nb','Noruego bokmål',0),('nd','Ndebele del norte',0),('ne','Nepalí',0),('ng','Ndonga',0),('nl','Neerlandés',0),('nn','Nynorsk',0),('no','Noruego',0),('nr','Ndebele del sur',0),('nv','Navajo',0),('ny','Chichewa',0),('oc','Occitano',0),('oj','Ojibwa',0),('om','Oromo',0),('or','Oriya',0),('os','Osético',0),('ot','Otro idioma',0),('pa','Panyabí',0),('pi','Pali',0),('pl','Polaco',0),('ps','Pastú',0),('pt','Portugués',0),('qu','Quechua',0),('rm','Romanche',0),('rn','Kirundi',0),('ro','Rumano',0),('ru','Ruso',0),('rw','Ruandés',0),('sa','Sánscrito',0),('sc','Sardo',0),('sd','Sindhi',0),('se','Sami septentrional',0),('sg','Sango',0),('si','Cingalés',0),('sk','Eslovaco',0),('sl','Esloveno',0),('sm','Samoano',0),('sn','Shona',0),('so','Somalí',0),('sq','Albanés',0),('sr','Serbio',0),('ss','Suazi',0),('st','Sesotho',0),('su','Sundanés',0),('sv','Sueco',0),('sw','Suajili',0),('ta','Tamil',0),('te','Télugu',0),('tg','Tayiko',0),('th','Tailandés',0),('ti','Tigriña',0),('tk','Turcomano',0),('tl','Tagalo',0),('tn','Setsuana',0),('to','Tongano',0),('tr','Turco',0),('ts','Tsonga',0),('tt','Tártaro',0),('tw','Twi',0),('ty','Tahitiano',0),('ug','Uigur',0),('uk','Ucraniano',0),('ur','Urdu',0),('uz','Uzbeko',0),('ve','Venda',0),('vi','Vietnamita',0),('vo','Volapük',0),('wa','Valón',0),('wo','Wolof',0),('xh','Xhosa',0),('yi','Yídish',0),('yo','Yoruba',0),('za','Zhuang',0),('zh','Chino',0),('zu','Zulú',0);
/*!40000 ALTER TABLE `aux_idiomas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_paises`
--

DROP TABLE IF EXISTS `aux_paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_paises` (
  `id` varchar(2) NOT NULL,
  `alpha3code` varchar(3) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `continente` varchar(20) NOT NULL,
  `idioma` varchar(50) NOT NULL,
  `zona_horaria` varchar(10) NOT NULL,
  `bandera` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_paises`
--

LOCK TABLES `aux_paises` WRITE;
/*!40000 ALTER TABLE `aux_paises` DISABLE KEYS */;
INSERT INTO `aux_paises` VALUES ('AD','AND','Andorra','Europa','Catalan','+01:00','and.svg'),('AE','ARE','Emiratos Árabes Unidos','Asia','Arabic','+04','are.svg'),('AF','AFG','Afganistán','Asia','Pashto','+04:30','afg.svg'),('AG','ATG','Antigua y Barbuda','América','English','-04:00','atg.svg'),('AI','AIA','Anguila','América','English','-04:00','aia.svg'),('AL','ALB','Albania','Europa','Albanian','+01:00','alb.svg'),('AM','ARM','Armenia','Asia','Armenian','+04:00','arm.svg'),('AO','AGO','Angola','Africa','Portuguese','+01:00','ago.svg'),('AQ','ATA','Antártida','Polar','English','-03:00','ata.svg'),('AR','ARG','Argentina','América','Spanish','-03:00','arg.svg'),('AS','ASM','Samoa Americana','Oceanía','English','-11:00','asm.svg'),('AT','AUT','Austria','Europa','German','+01:00','aut.svg'),('AU','AUS','Australia','Oceanía','English','+05:00','aus.svg'),('AW','ABW','Aruba','América','Dh','-04:00','abw.svg'),('AX','ALA','Aland','Europa','Swedish','+02:00','ala.svg'),('AZ','AZE','Azerbaiyán','Asia','Azerbaijani','+04:00','aze.svg'),('BA','BIH','Bosnia y Herzegovina','Europa','Bosnian','+01:00','bih.svg'),('BB','BRB','Barbados','América','English','-04:00','brb.svg'),('BD','BGD','Bangladés','Asia','Bengali','+06:00','bgd.svg'),('BE','BEL','Bélgica','Europa','Dh','+01:00','bel.svg'),('BF','BFA','Burkina Faso','Africa','French','','bfa.svg'),('BG','BGR','Bulgaria','Europa','Bulgarian','+02:00','bgr.svg'),('BH','BHR','Baréin','Asia','Arabic','+03:00','bhr.svg'),('BI','BDI','Burundi','Africa','French','+02:00','bdi.svg'),('BJ','BEN','Benín','Africa','French','+01:00','ben.svg'),('BL','BLM','San Bartolomé','América','French','-04:00','blm.svg'),('BM','BMU','Bermudas','América','English','-04:00','bmu.svg'),('BN','BRN','Brunéi','Asia','Malay','+08:00','brn.svg'),('BO','BOL','Bolivia','América','Spanish','-04:00','bol.svg'),('BQ','BES','Bonaire, San Eustaquio y Saba','América','Dh','-04:00','bes.svg'),('BR','BRA','Brasil','América','Portuguese','-05:00','bra.svg'),('BS','BHS','Bahamas','América','English','-05:00','bhs.svg'),('BT','BTN','Bután','Asia','Dzongkha','+06:00','btn.svg'),('BV','BVT','Isla Bouvet','Polar','Norwegian','+01:00','bvt.svg'),('BW','BWA','Botswana','Africa','English','+02:00','bwa.svg'),('BY','BLR','Bielorrusia','Europa','Belarusian','+03:00','blr.svg'),('BZ','BLZ','Belice','América','English','-06:00','blz.svg'),('CA','CAN','Canadá','América','English','-08:00','can.svg'),('CC','CCK','Islas Cocos','Oceanía','English','+06:30','cck.svg'),('CD','COD','Congo','Africa','French','+01:00','cod.svg'),('CF','CAF','República Centroafricana','Africa','French','+01:00','caf.svg'),('CG','COG','República del Congo','Africa','French','+01:00','cog.svg'),('CH','CHE','Suiza','Europa','German','+01:00','che.svg'),('CI','CIV','Costa de Marfil','Africa','French','','civ.svg'),('CK','COK','Islas Cook','Oceanía','English','-10:00','cok.svg'),('CL','CHL','Chile','América','Spanish','-06:00','chl.svg'),('CM','CMR','Camerún','Africa','English','+01:00','cmr.svg'),('CN','CHN','China','Asia','Chinese','+08:00','chn.svg'),('CO','COL','Colombia','América','Spanish','-05:00','col.svg'),('CR','CRI','Costa Rica','América','Spanish','-06:00','cri.svg'),('CU','CUB','Cuba','América','Spanish','-05:00','cub.svg'),('CV','CPV','Cabo Verde','Africa','Portuguese','-01:00','cpv.svg'),('CW','CUW','Curazao','América','Dh','-04:00','cuw.svg'),('CX','CXR','Isla de Navidad','Oceanía','English','+07:00','cxr.svg'),('CY','CYP','Chipre','Europa','Greek modern','+02:00','cyp.svg'),('CZ','CZE','República Checa','Europa','Czech','+01:00','cze.svg'),('DE','DEU','Alemania','Europa','German','+01:00','deu.svg'),('DJ','DJI','Yibuti','Africa','French','+03:00','dji.svg'),('DK','DNK','Dinamarca','Europa','Danish','-04:00','dnk.svg'),('DM','DMA','Dominica','América','English','-04:00','dma.svg'),('DO','DOM','República Dominicana','América','Spanish','-04:00','dom.svg'),('DZ','DZA','Argelia','Africa','Arabic','+01:00','dza.svg'),('EC','ECU','Ecuador','América','Spanish','-06:00','ecu.svg'),('EE','EST','Estonia','Europa','Estonian','+02:00','est.svg'),('EG','EGY','Egipto','Africa','Arabic','+02:00','egy.svg'),('EH','ESH','República Árabe Saharaui','Africa','Arabic','+00:00','esh.svg'),('ER','ERI','Eritrea','Africa','Tigrinya','+03:00','eri.svg'),('ES','ESP','España','Europa','Spanish','','esp.svg'),('ET','ETH','Etiopía','Africa','Amharic','+03:00','eth.svg'),('FI','FIN','Finlandia','Europa','Finnish','+02:00','fin.svg'),('FJ','FJI','Fiyi','Oceanía','English','+12:00','fji.svg'),('FK','FLK','Islas Malvinas','América','English','-04:00','flk.svg'),('FM','FSM','Micronesia','Oceanía','English','+10:00','fsm.svg'),('FO','FRO','Islas Feroe','Europa','Faroese','+00:00','fro.svg'),('FR','FRA','Francia','Europa','French','-10:00','fra.svg'),('GA','GAB','Gabón','Africa','French','+01:00','gab.svg'),('GB','GBR','Reino Unido','Europa','English','-08:00','gbr.svg'),('GD','GRD','Granada','América','English','-04:00','grd.svg'),('GE','GEO','Georgia','Asia','Georgian','-05:00','geo.svg'),('GF','GUF','Guayana Francesa','América','French','-03:00','guf.svg'),('GG','GGY','Guernsey','Europa','English','+00:00','ggy.svg'),('GH','GHA','Ghana','Africa','English','','gha.svg'),('GI','GIB','Gibraltar','Europa','English','+01:00','gib.svg'),('GL','GRL','Groenlandia','América','Kalaallisut','-04:00','grl.svg'),('GM','GMB','Gambia','Africa','English','+00:00','gmb.svg'),('GN','GIN','Guinea','Africa','French','','gin.svg'),('GP','GLP','Guadalupe','América','French','-04:00','glp.svg'),('GQ','GNQ','Guinea Ecuatorial','Africa','Spanish','+01:00','gnq.svg'),('GR','GRC','Grecia','Europa','Greek modern','+02:00','grc.svg'),('GS','SGS','Islas Georgias del Sur','América','English','-02:00','sgs.svg'),('GT','GTM','Guatemala','América','Spanish','-06:00','gtm.svg'),('GU','GUM','Guam','Oceanía','English','+10:00','gum.svg'),('GW','GNB','Guinea-Bisáu','Africa','Portuguese','','gnb.svg'),('GY','GUY','Guyana','América','English','-04:00','guy.svg'),('HK','HKG','Hong Kong','Asia','English','+08:00','hkg.svg'),('HM','HMD','Islas Heard y McDonald','Oceanía','English','+05:00','hmd.svg'),('HN','HND','Honduras','América','Spanish','-06:00','hnd.svg'),('HR','HRV','Croacia','Europa','Croatian','+01:00','hrv.svg'),('HT','HTI','Haití','América','French','-05:00','hti.svg'),('HU','HUN','Hungría','Europa','Hungarian','+01:00','hun.svg'),('ID','IDN','Indonesia','Asia','Indonesian','+07:00','idn.svg'),('IE','IRL','Irlanda','Europa','Irish','','irl.svg'),('IL','ISR','Israel','Asia','Hebrew modern','+02:00','isr.svg'),('IM','IMN','Isla de Man','Europa','English','+00:00','imn.svg'),('IN','IND','India','Asia','Hindi','+05:30','ind.svg'),('IO','IOT','Territorio Británico Índico','Africa','English','+06:00','iot.svg'),('IQ','IRQ','Irak','Asia','Arabic','+03:00','irq.svg'),('IR','IRN','Irán','Asia','Persian Farsi','+03:30','irn.svg'),('IS','ISL','Islandia','Europa','Icelandic','','isl.svg'),('IT','ITA','Italia','Europa','Italian','+01:00','ita.svg'),('JE','JEY','Jersey','Europa','English','+01:00','jey.svg'),('JM','JAM','Jamaica','América','English','-05:00','jam.svg'),('JO','JOR','Jordania','Asia','Arabic','+03:00','jor.svg'),('JP','JPN','Japón','Asia','Japanese','+09:00','jpn.svg'),('KE','KEN','Kenia','Africa','English','+03:00','ken.svg'),('KG','KGZ','Kirguistán','Asia','Kyrgyz','+06:00','kgz.svg'),('KH','KHM','Camboya','Asia','Khmer','+07:00','khm.svg'),('KI','KIR','Kiribati','Oceanía','English','+12:00','kir.svg'),('KM','COM','Comoras','Africa','Arabic','+03:00','com.svg'),('KN','KNA','San Cristóbal y Nieves','América','English','-04:00','kna.svg'),('KP','PRK','Corea del Norte','Asia','Korean','+09:00','prk.svg'),('KR','KOR','Corea del Sur','Asia','Korean','+09:00','kor.svg'),('KW','KWT','Kuwait','Asia','Arabic','+03:00','kwt.svg'),('KY','CYM','Islas Caimán','América','English','-05:00','cym.svg'),('KZ','KAZ','Kazajistán','Asia','Kazakh','+05:00','kaz.svg'),('LA','LAO','Laos','Asia','Lao','+07:00','lao.svg'),('LB','LBN','Líbano','Asia','Arabic','+02:00','lbn.svg'),('LC','LCA','Santa Lucía','América','English','-04:00','lca.svg'),('LI','LIE','Liechtenstein','Europa','German','+01:00','lie.svg'),('LK','LKA','Sri Lanka','Asia','Sinhalese','+05:30','lka.svg'),('LR','LBR','Liberia','Africa','English','','lbr.svg'),('LS','LSO','Lesoto','Africa','English','+02:00','lso.svg'),('LT','LTU','Lituania','Europa','Lithuanian','+02:00','ltu.svg'),('LU','LUX','Luxemburgo','Europa','French','+01:00','lux.svg'),('LV','LVA','Letonia','Europa','Latvian','+02:00','lva.svg'),('LY','LBY','Libia','Africa','Arabic','+01:00','lby.svg'),('MA','MAR','Marruecos','Africa','Arabic','','mar.svg'),('MC','MCO','Mónaco','Europa','French','+01:00','mco.svg'),('MD','MDA','Moldavia','Europa','Romanian','+02:00','mda.svg'),('ME','MNE','Montenegro','Europa','Serbian','+01:00','mne.svg'),('MF','MAF','San Martín','América','English','-04:00','maf.svg'),('MG','MDG','Madagascar','Africa','French','+03:00','mdg.svg'),('MH','MHL','Islas Marshall','Oceanía','English','+12:00','mhl.svg'),('MK','MKD','Macedonia del Norte','Europa','Macedonian','+01:00','mkd.svg'),('ML','MLI','Malí','Africa','French','','mli.svg'),('MM','MMR','Myanmar','Asia','Burmese','+06:30','mmr.svg'),('MN','MNG','Mongolia','Asia','Mongolian','+07:00','mng.svg'),('MO','MAC','Macao','Asia','Chinese','+08:00','mac.svg'),('MP','MNP','Islas Marianas del Norte','Oceanía','English','+10:00','mnp.svg'),('MQ','MTQ','Martinica','América','French','-04:00','mtq.svg'),('MR','MRT','Mauritania','Africa','Arabic','','mrt.svg'),('MS','MSR','Montserrat','América','English','-04:00','msr.svg'),('MT','MLT','Malta','Europa','Maltese','+01:00','mlt.svg'),('MU','MUS','Mauricio','Africa','English','+04:00','mus.svg'),('MV','MDV','Maldivas','Asia','Divehi','+05:00','mdv.svg'),('MW','MWI','Malaui','Africa','English','+02:00','mwi.svg'),('MX','MEX','México','América','Spanish','-08:00','mex.svg'),('MY','MYS','Malasia','Asia','Malaysian','+08:00','mys.svg'),('MZ','MOZ','Mozambique','Africa','Portuguese','+02:00','moz.svg'),('NA','NAM','Namibia','Africa','English','+01:00','nam.svg'),('NC','NCL','Nueva Caledonia','Oceanía','French','+11:00','ncl.svg'),('NE','NER','Níger','Africa','French','+01:00','ner.svg'),('NF','NFK','Isla Norfolk','Oceanía','English','+11:30','nfk.svg'),('NG','NGA','Nigeria','Africa','English','+01:00','nga.svg'),('NI','NIC','Nicaragua','América','Spanish','-06:00','nic.svg'),('NL','NLD','Países Bajos','Europa','Dh','-04:00','nld.svg'),('NO','NOR','Noruega','Europa','Norwegian','+01:00','nor.svg'),('NP','NPL','Nepal','Asia','Nepali','+05:45','npl.svg'),('NR','NRU','Nauru','Oceanía','English','+12:00','nru.svg'),('NU','NIU','Niue','Oceanía','English','-11:00','niu.svg'),('NZ','NZL','Nueva Zelanda','Oceanía','English','-11:00','nzl.svg'),('OM','OMN','Omán','Asia','Arabic','+04:00','omn.svg'),('PA','PAN','Panamá','América','Spanish','-05:00','pan.svg'),('PE','PER','Perú','América','Spanish','-05:00','per.svg'),('PF','PYF','Polinesia Francesa','Oceanía','French','-10:00','pyf.svg'),('PG','PNG','Papúa Nueva Guinea','Oceanía','English','+10:00','png.svg'),('PH','PHL','Filipinas','Asia','English','+08:00','phl.svg'),('PK','PAK','Pakistán','Asia','English','+05:00','pak.svg'),('PL','POL','Polonia','Europa','Polish','+01:00','pol.svg'),('PM','SPM','San Pedro y Miquelón','América','French','-03:00','spm.svg'),('PN','PCN','Islas Pitcairn','Oceanía','English','-08:00','pcn.svg'),('PR','PRI','Puerto Rico','América','Spanish','-04:00','pri.svg'),('PS','PSE','Palestina','Asia','Arabic','+02:00','pse.svg'),('PT','PRT','Portugal','Europa','Portuguese','-01:00','prt.svg'),('PW','PLW','Palaos','Oceanía','English','+09:00','plw.svg'),('PY','PRY','Paraguay','América','Spanish','-04:00','pry.svg'),('QA','QAT','Catar','Asia','Arabic','+03:00','qat.svg'),('RE','REU','Reunión','Africa','French','+04:00','reu.svg'),('RO','ROU','Rumania','Europa','Romanian','+02:00','rou.svg'),('RS','SRB','Serbia','Europa','Serbian','+01:00','srb.svg'),('RU','RUS','Rusia','Europa','Russian','+03:00','rus.svg'),('RW','RWA','Ruanda','Africa','Kinyarwanda','+02:00','rwa.svg'),('SA','SAU','Arabia Saudita','Asia','Arabic','+03:00','sau.svg'),('SB','SLB','Islas Salomón','Oceanía','English','+11:00','slb.svg'),('SC','SYC','Seychelles','Africa','French','+04:00','syc.svg'),('SD','SDN','Sudán','Africa','Arabic','+03:00','sdn.svg'),('SE','SWE','Suecia','Europa','Swedish','+01:00','swe.svg'),('SG','SGP','Singapur','Asia','English','+08:00','sgp.svg'),('SH','SHN','Santa Elena','Africa','English','+00:00','shn.svg'),('SI','SVN','Eslovenia','Europa','Slovene','+01:00','svn.svg'),('SJ','SJM','Svalbard y Jan Mayen','Europa','Norwegian','+01:00','sjm.svg'),('SK','SVK','Eslovaquia','Europa','Slovak','+01:00','svk.svg'),('SL','SLE','Sierra Leona','Africa','English','','sle.svg'),('SM','SMR','San Marino','Europa','Italian','+01:00','smr.svg'),('SN','SEN','Senegal','Africa','French','','sen.svg'),('SO','SOM','Somalia','Africa','Somali','+03:00','som.svg'),('SR','SUR','Surinam','América','Dh','-03:00','sur.svg'),('SS','SSD','Sudán del Sur','Africa','English','+03:00','ssd.svg'),('ST','STP','Santo Tomé y Príncipe','Africa','Portuguese','','stp.svg'),('SV','SLV','El Salvador','América','Spanish','-06:00','slv.svg'),('SX','SXM','San Martín','América','Dh','-04:00','sxm.svg'),('SY','SYR','Siria','Asia','Arabic','+02:00','syr.svg'),('SZ','SWZ','Suazilandia','Africa','English','+02:00','swz.svg'),('TC','TCA','Islas Turcas y Caicos','América','English','-04:00','tca.svg'),('TD','TCD','Chad','Africa','French','+01:00','tcd.svg'),('TF','ATF','Tierras Antárticas Francesas','Africa','French','+05:00','atf.svg'),('TG','TGO','Togo','Africa','French','','tgo.svg'),('TH','THA','Tailandia','Asia','Thai','+07:00','tha.svg'),('TJ','TJK','Tayikistán','Asia','Tajik','+05:00','tjk.svg'),('TK','TKL','Tokelau','Oceanía','English','+13:00','tkl.svg'),('TL','TLS','Timor Oriental','Asia','Portuguese','+09:00','tls.svg'),('TM','TKM','Turkmenistán','Asia','Turkmen','+05:00','tkm.svg'),('TN','TUN','Túnez','Africa','Arabic','+01:00','tun.svg'),('TO','TON','Tonga','Oceanía','English','+13:00','ton.svg'),('TR','TUR','Turquía','Asia','Turkish','+03:00','tur.svg'),('TT','TTO','Trinidad y Tobago','América','English','-04:00','tto.svg'),('TV','TUV','Tuvalu','Oceanía','English','+12:00','tuv.svg'),('TW','TWN','Taiwán','Asia','Chinese','+08:00','twn.svg'),('TZ','TZA','Tanzania','Africa','Swahili','+03:00','tza.svg'),('UA','UKR','Ucrania','Europa','Ukrainian','+02:00','ukr.svg'),('UG','UGA','Uganda','Africa','English','+03:00','uga.svg'),('UM','UMI','Islas Menores de EE.UU.','América','English','-11:00','umi.svg'),('US','USA','Estados Unidos','América','English','-12:00','usa.svg'),('UY','URY','Uruguay','América','Spanish','-03:00','ury.svg'),('UZ','UZB','Uzbekistán','Asia','Uzbek','+05:00','uzb.svg'),('VA','VAT','Ciudad del Vaticano','Europa','Latin','+01:00','vat.svg'),('VC','VCT','San Vicente y las Granadinas','América','English','-04:00','vct.svg'),('VE','VEN','Venezuela','América','Spanish','-04:00','ven.svg'),('VG','VGB','Islas Vírgenes Británicas','América','English','-04:00','vgb.svg'),('VI','VIR','Islas Vírgenes de EE.UU.','América','English','-04:00','vir.svg'),('VN','VNM','Vietnam','Asia','Vietnamese','+07:00','vnm.svg'),('VU','VUT','Vanuatu','Oceanía','Bislama','+11:00','vut.svg'),('WF','WLF','Wallis y Futuna','Oceanía','French','+12:00','wlf.svg'),('WS','WSM','Samoa','Oceanía','Samoan','+13:00','wsm.svg'),('XK','KOS','República de Kosovo','Europe','Albanian','+01:00','kos.svg'),('YE','YEM','Yemen','Asia','Arabic','+03:00','yem.svg'),('YT','MYT','Mayotte','Africa','French','+03:00','myt.svg'),('ZA','ZAF','Sudáfrica','Africa','Afrikaans','+02:00','zaf.svg'),('ZM','ZMB','Zambia','Africa','English','+02:00','zmb.svg'),('ZW','ZWE','Zimbabue','Africa','English','+02:00','zwe.svg');
/*!40000 ALTER TABLE `aux_paises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_roles_iglesia`
--

DROP TABLE IF EXISTS `aux_roles_iglesia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_roles_iglesia` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario` tinyint(1) NOT NULL,
  `personaje` tinyint(1) NOT NULL,
  `varon` tinyint(1) NOT NULL,
  `mujer` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_roles_iglesia`
--

LOCK TABLES `aux_roles_iglesia` WRITE;
/*!40000 ALTER TABLE `aux_roles_iglesia` DISABLE KEYS */;
INSERT INTO `aux_roles_iglesia` VALUES ('AL',13,'Apóstol',0,1,1,0),('ALV',14,'Apóstol',0,1,1,0),('AP',25,'Apóstata',0,1,1,1),('APM',27,'Apóstata',0,1,0,1),('APV',26,'Apóstata',0,1,1,0),('LC',1,'Laico/a',1,1,1,1),('LCM',3,'Laica',1,1,0,1),('LCV',2,'Laico',1,1,1,0),('NN',22,'Ninguno',1,0,1,1),('NNM',24,'Ninguno',1,0,0,1),('NNV',23,'Ninguno',1,0,1,0),('PC',0,'Computadora',0,0,0,0),('PP',10,'Papa',0,1,1,0),('PPV',11,'Papa',0,1,1,0),('RE',4,'Religioso/a',1,1,1,1),('REM',6,'Religiosa',1,1,0,1),('REV',5,'Religioso',1,1,1,0),('SC',7,'Sacerdote',1,1,1,0),('SCV',8,'Sacerdote',1,1,1,0);
/*!40000 ALTER TABLE `aux_roles_iglesia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_sexos`
--

DROP TABLE IF EXISTS `aux_sexos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_sexos` (
  `id` varchar(1) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `varon` tinyint(1) DEFAULT NULL,
  `mujer` tinyint(1) DEFAULT NULL,
  `letra_final` varchar(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_sexos`
--

LOCK TABLES `aux_sexos` WRITE;
/*!40000 ALTER TABLE `aux_sexos` DISABLE KEYS */;
INSERT INTO `aux_sexos` VALUES ('A',3,'Ambos',1,1,''),('M',1,'Mujer',0,1,'a'),('V',2,'Varón',1,0,'o');
/*!40000 ALTER TABLE `aux_sexos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aux_status_registro`
--

DROP TABLE IF EXISTS `aux_status_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_status_registro` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `gr_creado` tinyint(1) DEFAULT 0,
  `gr_aprobado` tinyint(1) DEFAULT 0,
  `gr_estables` tinyint(1) DEFAULT 0,
  `gr_provisorios` tinyint(1) DEFAULT 0,
  `gr_pasivos` tinyint(1) DEFAULT 0,
  `gr_inactivos` tinyint(1) DEFAULT 0,
  `creado` tinyint(1) DEFAULT 0,
  `creado_aprob` tinyint(1) DEFAULT 0,
  `aprobado` tinyint(1) DEFAULT 0,
  `inactivar` tinyint(1) DEFAULT 0,
  `inactivo` tinyint(1) DEFAULT 0,
  `recuperar` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aux_status_registro`
--

LOCK TABLES `aux_status_registro` WRITE;
/*!40000 ALTER TABLE `aux_status_registro` DISABLE KEYS */;
INSERT INTO `aux_status_registro` VALUES (1,1,'Creado',1,0,0,0,0,0,1,0,0,0,0,0),(2,2,'Alta-aprobada',1,1,0,0,0,0,0,1,0,0,0,0),(3,3,'Aprobado',0,1,1,0,0,0,0,0,1,0,0,0),(4,4,'Inactivar',0,0,0,1,1,1,0,0,0,1,0,0),(5,5,'Inactivo',0,0,1,0,1,1,0,0,0,0,1,0),(6,6,'Recuperar',0,0,0,1,1,0,0,0,0,0,0,1);
/*!40000 ALTER TABLE `aux_status_registro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_1registros`
--

DROP TABLE IF EXISTS `cal_1registros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_1registros` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `fe_valores` tinyint(3) unsigned NOT NULL,
  `entretiene` tinyint(3) unsigned NOT NULL,
  `calidad_tecnica` tinyint(3) unsigned NOT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  CONSTRAINT `cal_1registros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cal_1registros_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `cal_1registros_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `cal_1registros_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_1registros`
--

LOCK TABLES `cal_1registros` WRITE;
/*!40000 ALTER TABLE `cal_1registros` DISABLE KEYS */;
INSERT INTO `cal_1registros` VALUES (1,2,1,NULL,NULL,100,75,100,92,'2022-12-20 22:50:33'),(2,2,2,NULL,NULL,100,75,100,92,'2022-12-20 22:50:33'),(3,2,3,NULL,NULL,100,100,100,100,'2022-12-20 22:50:33'),(4,2,4,NULL,NULL,100,100,100,100,'2022-12-20 22:50:33'),(5,2,5,NULL,NULL,100,75,100,92,'2022-12-20 22:50:33'),(6,2,NULL,1,NULL,75,75,100,80,'2022-12-20 22:50:33'),(7,2,NULL,2,NULL,75,75,100,80,'2022-12-20 22:50:33'),(8,10,6,NULL,NULL,100,75,100,0,'2022-12-21 11:13:50'),(9,10,7,NULL,NULL,75,75,50,0,'2022-12-21 16:16:13'),(10,10,NULL,3,NULL,100,75,100,0,'2022-12-21 17:46:45'),(11,10,9,NULL,NULL,75,75,100,0,'2022-12-22 01:47:30'),(12,10,10,NULL,NULL,50,50,50,0,'2022-12-22 02:29:27'),(13,10,NULL,4,NULL,75,75,100,0,'2022-12-22 03:38:09'),(14,10,NULL,5,NULL,75,75,100,0,'2022-12-22 03:42:16');
/*!40000 ALTER TABLE `cal_1registros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_21fe_valores`
--

DROP TABLE IF EXISTS `cal_21fe_valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_21fe_valores` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_21fe_valores`
--

LOCK TABLES `cal_21fe_valores` WRITE;
/*!40000 ALTER TABLE `cal_21fe_valores` DISABLE KEYS */;
INSERT INTO `cal_21fe_valores` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_21fe_valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_22entretiene`
--

DROP TABLE IF EXISTS `cal_22entretiene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_22entretiene` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_22entretiene`
--

LOCK TABLES `cal_22entretiene` WRITE;
/*!40000 ALTER TABLE `cal_22entretiene` DISABLE KEYS */;
INSERT INTO `cal_22entretiene` VALUES (1,5,0,'No'),(2,4,25,'Poco'),(3,3,50,'Moderado'),(4,2,75,'Sí'),(5,1,100,'Mucho');
/*!40000 ALTER TABLE `cal_22entretiene` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cal_23calidad_tecnica`
--

DROP TABLE IF EXISTS `cal_23calidad_tecnica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_23calidad_tecnica` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cal_23calidad_tecnica`
--

LOCK TABLES `cal_23calidad_tecnica` WRITE;
/*!40000 ALTER TABLE `cal_23calidad_tecnica` DISABLE KEYS */;
INSERT INTO `cal_23calidad_tecnica` VALUES (1,3,0,'Complica el disfrute'),(2,2,50,'Afecta un poco el disfrute'),(3,1,100,'Sin problemas');
/*!40000 ALTER TABLE `cal_23calidad_tecnica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edic_motivos_rech`
--

DROP TABLE IF EXISTS `edic_motivos_rech`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edic_motivos_rech` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `comentario` varchar(40) NOT NULL,
  `avatar_prod` tinyint(1) DEFAULT 0,
  `avatar_rclv` tinyint(1) DEFAULT 0,
  `avatar_us` tinyint(1) DEFAULT 0,
  `prod` tinyint(1) DEFAULT 0,
  `rclv` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `info_erronea` tinyint(1) DEFAULT 0,
  `version_actual` tinyint(1) DEFAULT 0,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  `bloqueo_perm_inputs` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edic_motivos_rech`
--

LOCK TABLES `edic_motivos_rech` WRITE;
/*!40000 ALTER TABLE `edic_motivos_rech` DISABLE KEYS */;
INSERT INTO `edic_motivos_rech` VALUES (1,1,'Es mejor la versión actual',1,0,0,1,1,1,0,1,0.2,0),(11,11,'Ortografía, gramática, sintaxis',0,0,0,1,1,0,0,0,0.2,0),(12,12,'Información errónea',0,0,0,1,1,1,1,0,0.2,0),(13,13,'Spam',0,0,0,1,0,0,0,0,10.0,0),(21,21,'Imagen de poca nitidez',1,1,1,0,0,0,0,0,0.1,0),(22,22,'Imagen ajena a lo esperado (amigable)',1,1,1,0,0,0,0,0,10.0,0),(23,23,'Imagen ajena a lo esperado (intencional)',1,1,1,0,0,0,0,0,90.0,1),(31,31,'Datos fáciles sin completar',0,0,0,0,1,0,0,0,5.0,0);
/*!40000 ALTER TABLE `edic_motivos_rech` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edics_aprob`
--

DROP TABLE IF EXISTS `edics_aprob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edics_aprob` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `campo` varchar(25) NOT NULL,
  `titulo` varchar(35) NOT NULL,
  `valor_aprob` varchar(100) DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned NOT NULL,
  `edic_analizada_en` datetime DEFAULT utc_timestamp(),
  `comunicado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  CONSTRAINT `edics_aprob_ibfk_1` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `edics_aprob_ibfk_2` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edics_aprob`
--

LOCK TABLES `edics_aprob` WRITE;
/*!40000 ALTER TABLE `edics_aprob` DISABLE KEYS */;
INSERT INTO `edics_aprob` VALUES (1,'colecciones',2,'nombre_castellano','Título en castellano','El amor llega suavemente',10,'2022-03-16 23:25:22',11,'2022-12-21 01:13:36',NULL),(2,'personajes',53,'nombre','Nombre Formal','Damián de Veuster',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(3,'personajes',53,'apodo','Nombre Alternativo','Padre Damián',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(4,'personajes',53,'sexo_id','Sexo','V',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(5,'personajes',53,'dia_del_ano_id','Día del Año','10/may',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(6,'personajes',53,'ano','Año','1840',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(7,'personajes',53,'categoria_id','Categoría','CFC',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(8,'personajes',53,'subcategoria_id','Subcategoría','HAG',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(9,'personajes',53,'proceso_id','Proceso de Canonizac.','Santo',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL),(10,'personajes',53,'rol_iglesia_id','Rol en la Iglesia','Sacerdote',10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',NULL);
/*!40000 ALTER TABLE `edics_aprob` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edics_rech`
--

DROP TABLE IF EXISTS `edics_rech`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edics_rech` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `campo` varchar(20) NOT NULL,
  `titulo` varchar(21) NOT NULL,
  `valor_rech` varchar(100) DEFAULT NULL,
  `valor_aprob` varchar(100) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned NOT NULL,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime NOT NULL,
  `edic_analizada_por_id` int(10) unsigned NOT NULL,
  `edic_analizada_en` datetime NOT NULL,
  `comunicado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  CONSTRAINT `edics_rech_ibfk_1` FOREIGN KEY (`motivo_id`) REFERENCES `edic_motivos_rech` (`id`),
  CONSTRAINT `edics_rech_ibfk_2` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `edics_rech_ibfk_3` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edics_rech`
--

LOCK TABLES `edics_rech` WRITE;
/*!40000 ALTER TABLE `edics_rech` DISABLE KEYS */;
/*!40000 ALTER TABLE `edics_rech` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filtros_personales_cabecera`
--

DROP TABLE IF EXISTS `filtros_personales_cabecera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filtros_personales_cabecera` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(15) NOT NULL,
  `usuario_id` int(10) unsigned NOT NULL,
  `palabras_clave` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `filtros_personales_cabecera_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filtros_personales_cabecera`
--

LOCK TABLES `filtros_personales_cabecera` WRITE;
/*!40000 ALTER TABLE `filtros_personales_cabecera` DISABLE KEYS */;
/*!40000 ALTER TABLE `filtros_personales_cabecera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filtros_personales_campos`
--

DROP TABLE IF EXISTS `filtros_personales_campos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filtros_personales_campos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `filtro_cabecera_id` int(10) unsigned DEFAULT NULL,
  `campo_id` varchar(100) DEFAULT NULL,
  `valor_id` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `filtro_cabecera_id` (`filtro_cabecera_id`),
  CONSTRAINT `filtros_personales_campos_ibfk_1` FOREIGN KEY (`filtro_cabecera_id`) REFERENCES `filtros_personales_cabecera` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filtros_personales_campos`
--

LOCK TABLES `filtros_personales_campos` WRITE;
/*!40000 ALTER TABLE `filtros_personales_campos` DISABLE KEYS */;
/*!40000 ALTER TABLE `filtros_personales_campos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `int_1registros`
--

DROP TABLE IF EXISTS `int_1registros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `int_1registros` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `int_opciones_id` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `int_opciones_id` (`int_opciones_id`),
  CONSTRAINT `int_1registros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `int_1registros_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `int_1registros_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `int_1registros_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `int_1registros_ibfk_5` FOREIGN KEY (`int_opciones_id`) REFERENCES `int_opciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `int_1registros`
--

LOCK TABLES `int_1registros` WRITE;
/*!40000 ALTER TABLE `int_1registros` DISABLE KEYS */;
/*!40000 ALTER TABLE `int_1registros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `int_opciones`
--

DROP TABLE IF EXISTS `int_opciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `int_opciones` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `int_opciones`
--

LOCK TABLES `int_opciones` WRITE;
/*!40000 ALTER TABLE `int_opciones` DISABLE KEYS */;
INSERT INTO `int_opciones` VALUES (1,4,'No me interesa'),(2,2,'Es de mis favoritas'),(3,1,'La quiero ver'),(4,3,'Ya la vi');
/*!40000 ALTER TABLE `int_opciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `links`
--

DROP TABLE IF EXISTS `links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `url` varchar(100) NOT NULL,
  `prov_id` tinyint(3) unsigned NOT NULL,
  `calidad` smallint(6) NOT NULL,
  `castellano` tinyint(1) NOT NULL,
  `subtit_castellano` tinyint(1) DEFAULT NULL,
  `gratuito` tinyint(1) NOT NULL,
  `tipo_id` tinyint(3) unsigned NOT NULL,
  `completo` tinyint(1) DEFAULT 1,
  `parte` varchar(3) NOT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `vigencia_revisada_en` datetime DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `prov_id` (`prov_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `links_ibfk_10` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `links_ibfk_11` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_12` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `links_ibfk_2` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `links_ibfk_3` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `links_ibfk_4` FOREIGN KEY (`tipo_id`) REFERENCES `links_tipos` (`id`),
  CONSTRAINT `links_ibfk_5` FOREIGN KEY (`prov_id`) REFERENCES `links_provs` (`id`),
  CONSTRAINT `links_ibfk_6` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_7` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_8` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_9` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links`
--

LOCK TABLES `links` WRITE;
/*!40000 ALTER TABLE `links` DISABLE KEYS */;
INSERT INTO `links` VALUES (1,NULL,NULL,1,'youtube.com/watch?v=g1vC9TXMkXk',11,360,1,0,1,2,1,'-',2,'2022-03-16 23:25:21',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(2,NULL,NULL,1,'youtube.com/watch?v=0DcobZTPl0U',11,480,1,0,1,2,0,'1',2,'2022-03-16 23:25:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,NULL),(3,NULL,NULL,1,'youtube.com/watch?v=Ug31Sdb6GU4',11,480,1,0,1,2,0,'2',2,'2022-03-16 23:25:23',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,22,10,'2022-06-16 23:25:26'),(4,NULL,NULL,1,'youtube.com/watch?v=vnLERiCT96M',11,480,1,0,1,2,0,'3',2,'2022-03-16 23:25:24',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,5,22,10,'2022-06-16 23:25:26'),(5,NULL,NULL,1,'youtube.com/watch?v=dc4bkUqC9no',11,480,1,0,1,2,0,'4',2,'2022-03-16 23:25:25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,22,10,'2022-06-16 23:25:26'),(6,NULL,NULL,1,'youtube.com/watch?v=4o-V9Cfk4to',11,360,1,0,1,2,1,'-',2,'2022-03-16 23:25:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(7,5,NULL,NULL,'youtube.com/watch?v=fkDBa-DSMn4',11,360,1,0,1,2,1,'-',2,'2022-05-13 21:17:20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(8,5,NULL,NULL,'ver.formed.lat/don-bosco',11,144,1,0,1,1,1,'-',2,'2022-05-13 22:21:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(9,6,NULL,NULL,'youtube.com/watch?v=AweoZYsiCu4',11,480,0,0,1,2,1,'-',10,'2022-12-21 12:58:47',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(11,7,NULL,NULL,'youtube.com/watch?v=rKPTgq0eip0',11,480,1,NULL,1,2,1,'-',10,'2022-12-21 16:20:05',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL),(12,7,NULL,NULL,'youtube.com/watch?v=cW_0odiVdIQ',11,480,1,NULL,1,2,1,'-',10,'2022-12-21 16:23:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `links_edicion`
--

DROP TABLE IF EXISTS `links_edicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links_edicion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `link_id` int(10) unsigned NOT NULL,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `calidad` smallint(6) DEFAULT NULL,
  `castellano` tinyint(1) DEFAULT NULL,
  `subtit_castellano` tinyint(1) DEFAULT NULL,
  `gratuito` tinyint(1) DEFAULT NULL,
  `tipo_id` tinyint(3) unsigned DEFAULT NULL,
  `completo` tinyint(1) DEFAULT NULL,
  `parte` varchar(3) DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `link_id` (`link_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `editado_por_id` (`editado_por_id`),
  CONSTRAINT `links_edicion_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `links` (`id`),
  CONSTRAINT `links_edicion_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `links_edicion_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `links_edicion_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `links_edicion_ibfk_5` FOREIGN KEY (`tipo_id`) REFERENCES `links_tipos` (`id`),
  CONSTRAINT `links_edicion_ibfk_6` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links_edicion`
--

LOCK TABLES `links_edicion` WRITE;
/*!40000 ALTER TABLE `links_edicion` DISABLE KEYS */;
/*!40000 ALTER TABLE `links_edicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `links_provs`
--

DROP TABLE IF EXISTS `links_provs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links_provs` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `avatar` varchar(20) DEFAULT NULL,
  `siempre_pago` tinyint(1) DEFAULT NULL,
  `siempre_gratuito` tinyint(1) DEFAULT NULL,
  `siempre_completa` tinyint(1) DEFAULT NULL,
  `calidad` smallint(6) DEFAULT NULL,
  `generico` tinyint(1) DEFAULT 0,
  `url_distintivo` varchar(20) NOT NULL,
  `buscador_automatico` tinyint(1) NOT NULL,
  `url_buscar_pre` varchar(25) DEFAULT '',
  `trailer` tinyint(1) NOT NULL,
  `url_buscar_post_tra` varchar(20) NOT NULL,
  `pelicula` tinyint(1) NOT NULL,
  `url_buscar_post_pel` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `url_distintivo` (`url_distintivo`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links_provs`
--

LOCK TABLES `links_provs` WRITE;
/*!40000 ALTER TABLE `links_provs` DISABLE KEYS */;
INSERT INTO `links_provs` VALUES (1,0,'Desconocido','PT-Desconocido.jpg',NULL,NULL,NULL,NULL,1,'',0,'',1,'',1,''),(11,1,'YouTube','PT-YouTube.jpg',NULL,NULL,NULL,NULL,0,'youtube.com',1,'/results?search_query=',1,'&sp=EgIYAQ%253D%253D',1,'sp=EgIYAg%253D%253D'),(12,2,'Formed en Español','PT-Formed cast.jpg',NULL,1,1,1081,0,'ver.formed.lat',1,'/search?q=',0,'',1,''),(13,3,'Formed','PT-Formed.jpg',NULL,NULL,1,1081,0,'watch.formed.org',1,'/search?q=',0,'',1,''),(14,4,'Brochero','PT-Brochero.jpg',1,NULL,1,1081,0,'brochero.org',0,'',0,'',1,''),(15,5,'FamFlix','PT-FamFlix.jpg',1,NULL,1,1081,0,'famflix.mx',0,'',0,'',1,''),(16,6,'FamiPlay','PT-FamiPlay.jpg',1,NULL,1,1081,0,'famiplay.com',1,'/catalogo?s=',0,'',1,''),(17,7,'Goya Prod.','PT-Goya.jpg',1,NULL,1,1081,0,'goyaproducciones.com',1,'/?s=',1,'',1,''),(18,8,'IMDb','PT-IMDB.jpg',0,1,NULL,NULL,0,'imdb.com',0,'/find?q=',1,'',0,'');
/*!40000 ALTER TABLE `links_provs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `links_tipos`
--

DROP TABLE IF EXISTS `links_tipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links_tipos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  `pelicula` tinyint(1) DEFAULT 0,
  `trailer` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `links_tipos`
--

LOCK TABLES `links_tipos` WRITE;
/*!40000 ALTER TABLE `links_tipos` DISABLE KEYS */;
INSERT INTO `links_tipos` VALUES (1,'Trailer',0,1),(2,'Película',1,0);
/*!40000 ALTER TABLE `links_tipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_1peliculas`
--

DROP TABLE IF EXISTS `prod_1peliculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_1peliculas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `fuente` varchar(5) NOT NULL,
  `nombre_original` varchar(50) DEFAULT NULL,
  `nombre_castellano` varchar(50) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actuacion` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned DEFAULT NULL,
  `en_color_id` tinyint(3) unsigned DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `publico_sugerido_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `valor_id` smallint(5) unsigned DEFAULT 1,
  `fe_valores` tinyint(3) unsigned NOT NULL,
  `entretiene` tinyint(3) unsigned NOT NULL,
  `calidad_tecnica` tinyint(3) unsigned NOT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `alta_terminada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  `links_gratuitos_cargados_id` tinyint(3) unsigned DEFAULT 3,
  `links_gratuitos_en_la_web_id` tinyint(3) unsigned DEFAULT 2,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `valor_id` (`valor_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `links_gratuitos_cargados_id` (`links_gratuitos_cargados_id`),
  KEY `links_gratuitos_en_la_web_id` (`links_gratuitos_en_la_web_id`),
  CONSTRAINT `prod_1peliculas_ibfk_1` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `prod_publicos_sugeridos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_10` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_11` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_12` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_13` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_14` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_15` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_16` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_17` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_18` FOREIGN KEY (`links_gratuitos_cargados_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_19` FOREIGN KEY (`links_gratuitos_en_la_web_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_5` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_6` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_7` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_8` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_9` FOREIGN KEY (`valor_id`) REFERENCES `rclv_3valores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_1peliculas`
--

LOCK TABLES `prod_1peliculas` WRITE;
/*!40000 ALTER TABLE `prod_1peliculas` DISABLE KEYS */;
INSERT INTO `prod_1peliculas` VALUES (1,'218275',NULL,'tt1445208','TMDB','The Letters','Cartas de la Madre Teresa',2015,125,'US','en','William Riead','William Riead','Ciaran Hope','Rutger Hauer (Benjamin Praagh), Juliet Stevenson (Mother Teresa), Max von Sydow (Celeste van Exem), Priya Darshani (Shubashini Das), Kranti Redkar (Deepa Ambereesh), Mahabanoo Mody-Kotwal (Mother General), Tillotama Shome (Kavitha Singh), Vijay Maurya (Maharaj Singh), Vivek Gomber (Ashwani Sharma)','Cinema West Films, Big Screen Productions, Freestyle Releasing','\"The Letters\" narra de manera muy personal la historia de esta religiosa, quien encontró el valor para entrar en los paupérrimos barrios de Calcuta, India, con sólo cinco rupias en el bolsillo y enseñarle al mundo entero una de las lecciones de bondad más importantes de la historia. (Fuente: TMDB)','1645444885482.jpg',3,1,'CFC','HAG',4,21,1,1,100,75,100,92,2,'2022-03-16 23:25:20',11,'2022-04-13 21:31:31',NULL,NULL,NULL,'2022-03-16 23:25:20',NULL,'2022-04-13 21:31:40',NULL,3,NULL,NULL,NULL,2,'2022-04-13 21:31:29',0,3,2),(2,'109429',NULL,'tt0327086','TMDB','Il Papa buono','El Santo Padre Juan XXIII',2003,180,'IT','en','Ricky Tognazzi','Fabrizio Bettelli, Simona Izzo, Marco Roncalli','Ennio Morricone','Bob Hoskins (Angelo Roncalli / Pope John XXIII), Carlo Cecchi (Cardinal Mattia Carcano), Roberto Citran (Monsignor Loris Capovilla), Fabrizio Vidale (Angelo Roncalli (young)), Sergio Bini Bustric (Guido Gusso), Francesco Venditti (Nicola Catania (young)), Rolando Ravello (Cannava), John Light (Mattia Carcano (young)), Francesco Carnelutti (Nicola Catania), Lena Lessing (Marta Von Papen), Joan Giammarco, Gianluca Ramazzotti, Monica Piseddu, Pietro Delle Piane','MediaTrade','Juan XXIII fue Papa sólo 4 años (1959-1963), pero promovió profundos cambios y lanzó al mundo un contundente mensaje de paz. Era la época de la Guerra Fría, y las relaciones internacionales eran muy tensas. Convocó el Concilio Vaticano II, que supuso una auténtica revolución en el seno de la Iglesia Católica, que tuvo que reconocer que se había ido alejando cada vez más del mensaje de Cristo y que era necesario reflexionar sobre las necesidades del hombre moderno. (Fuente: TMDB)','1645458510332.jpg',1,1,'CFC','HAG',4,22,1,1,100,75,100,92,2,'2022-03-16 23:25:21',11,'2022-03-28 20:04:55',NULL,NULL,NULL,'2022-03-16 23:25:21',NULL,'2022-04-13 21:28:46',NULL,3,NULL,NULL,NULL,11,'2022-04-13 21:28:38',0,3,2),(3,'108672',NULL,'tt0317009','TMDB','Papa Giovanni - Ioannes XXIII','Juan XXIII: El Papa de la paz',2002,208,'IT','it','Giorgio Capitani','Francesco Scardamaglia, Massimo Cerofolini','Marco Frisina','Ed Asner (Angelo Roncalli), Massimo Ghini (Angelo Roncalli giovane), Claude Rich (Cardinal Ottaviani), Michael Mendl (Tardini), Franco Interlenghi (Radini Tedeschi), Sydne Rome (Rada Krusciova), Jacques Sernas (Cardinale Feltin), Leonardo Ruta (Remo Roncalli), Paolo Gasparini (Monsignor Loris Capovilla), Sergio Fiorentini (Don Rebuzzini), Roberto Accornero, Heinz Trixner (Von Papen), Ivan Bacchi, Bianca Guaccero, Emilio De Marchi, Guido Roncalli, Giorgia Bongianni, Enzo Marino Bellanich','Coproducción Italia-Alemania','En 1958, tras la muerte de Pío XII, el anciano Cardenal Angelo Roncalli, Patriarca de Venecia, viaja a Roma para participar en el cónclave que debe elegir al nuevo Papa, cónclave dominado por toda clase de maniobras políticas. En efecto, una vez en el Vaticano, Roncalli asiste atónito al enconado enfrentamiento entre las distintas facciones eclesiásticas. Durante el cónclave se van desvelando aspectos extraordinarios del pasado del cardenal: su apoyo espiritual y económico a un grupo de trabajadores en huelga, cuando todavía era un joven sacerdote; su ayuda a los cristianos ortodoxos de Bulgaria, cuando estuvo destinado en ese país; sus negociaciones con el embajador nazi de Estambul para salvar un tren de prisioneros judíos, cuando era diplomático del Vaticano en Turquía. (Fuente: TMDB)','1645458705918.jpg',1,1,'CFC','HAG',4,22,1,1,100,100,100,100,2,'2022-03-16 23:25:22',11,'2022-04-13 19:21:09',NULL,NULL,NULL,'2022-03-16 23:25:23',NULL,'2022-04-13 21:28:57',NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(4,'122977',NULL,'tt0416694','TMDB','Don Bosco','Don Bosco',2004,146,'IT','it','Lodovico Gasparini','Carlo Mazzotta, Graziano Diana, Lodovico Gasparini, Saverio D\'Ercole, Lea Tafuri, F. Panzarella','Marco Frisina','Flavio Insinna (Don Bosco), Lina Sastri (Margherita Bosco), Charles Dance (Marchese Clementi), Daniel Tschirley (Michele Rua), Fabrizio Bucci (Bruno), Lewis Crutch (Domenico Savio), Brock Everitt-Elwick (Don Bosco as a child), Alessandra Martines (Marchesa Barolo)','RAI','El Piamonte (Italia), siglo XIX. En Turín, el sacerdote Don Bosco, un hombre procedente de una humilde familia campesina, se entregó total y apasionadamente a la tarea de recoger de las calles a los chicos marginados y cuidar de ellos. No sólo los sacó de la pobreza, de la ignorancia y del desamparo social, sino que consiguió que, por primera vez, se sintieran amados. Luchó con una fe y un tesón extraordinarios para vencer los obstáculos e insidias que, tanto las autoridades civiles como las eclesiásticas, pusieron en su camino para impedirle culminar su objetivo: la fundación de la Congregación de los salesianos, que garantizaría el futuro de sus chicos. (Fuente: TMDB)','1645459542226.jpg',1,1,'CFC','HAG',4,23,1,1,100,100,100,100,2,'2022-03-16 23:25:23',11,'2022-04-13 19:21:15',NULL,NULL,NULL,'2022-03-16 23:25:24',NULL,'2022-04-13 21:29:05',NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(5,'254489',NULL,'tt0095051','TMDB','Don Bosco','Don Bosco',1988,150,'IT','it','Leandro Castellani','Ennio De Concini','Stelvio Cipriani','Ben Gazzara (Don Giovanni Bosco), Patsy Kensit (Lina), Karl Zinny (Giuseppe), Piera Degli Esposti (La madre di Lina), Philippe Leroy (Papa Leone XIII), Leopoldo Trieste (Don Borel), Raymond Pellegrin (Papa Pio IX), Laurent Therzieff (Monsignor Gastaldi), Edmund Purdom (Urbano Rattazzi), Rik Battaglia (Marchese Michele Cavour)','RAI, ELLE DI.CI., TIBER CINEMATOGRAFICA','Piamonte (Italia), siglo XIX. Don Bosco, un sacerdote piamontés de humilde origen campesino, se entregó apasionadamente a la tarea de recoger de las calles de Turín a los muchachos abandonados y carentes de toda protección social. Tuvo que vencer mil obstáculos e insidias para crear albergues, escuelas y talleres, donde pudieran recibir una educación cristiana y cívica. La culminación de su obra fue la fundación de la Congregación Salesiana. (Fuente: TMDB)','1645459996491.jpg',1,1,'CFC','HAG',4,23,1,1,100,75,100,92,2,'2022-03-16 23:25:24',11,'2022-04-13 19:21:22',NULL,NULL,NULL,'2022-03-16 23:25:25',NULL,'2022-04-13 21:29:11',NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(6,'21644',NULL,'tt0165196','TMDB','Molokai: The Story of Father Damien','Molokai. La historia del padre Damián',1999,113,'AU BE NL','en','Paul Cox','John Briley, Hilde Eynikel','Paul Grabowsky','David Wenham (Damien), Jan Decleir (Bishop Kockerman), Kate Ceberano (Princess Liliuokalani), Sam Neill (Prime Minister Gibson), Derek Jacobi (Father Leonor Fousnel), Alice Krige (Mother Marianne), Kris Kristofferson (Rudolph Meyer), Leo McKern (Bishop Maigret), Peter O\'Toole (William Williamson), Tom Wilkinson (Brother Dutton), Aden Young (Dr. Kalewis), Chris Haywood (Clayton Strawn), George O\'Hanlon Jr. (Evans), Thom Hoffman (Dr. William Saxe), Michael Pas (Dr. Stottard)','Jos Stelling Filmprodukties BV, Era Films, Kinepolis Film Productions','Narra la historia del padre Damián, un sacerdote católico belga que, en 1873, llegó como voluntario a la isla de Molokai, en Hawái, donde consagró su vida al cuidado y consuelo de los leprosos allí confinados (Fuente: TMDB)','https://image.tmdb.org/t/p/original/fIjamNr5wMYZRjGmhAJ4ftOGJ1W.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,100,75,100,92,10,'2022-12-21 12:13:50',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(7,'199449',NULL,'tt0268477','TMDB','El mártir del Calvario','El mártir del Calvario',1952,113,'MX','es','Miguel Morayta','Miguel Morayta, Gonzalo Elvira Sánchez de Aparicio','Gustavo César Carrión','Enrique Rambal (Jesús), Manolo Fábregas (Judas), Consuelo Frank (Virgen María), Miguel Ángel Ferriz Sr. (Pedro), Armando Sáenz (Juan), Felipe de Alba (Andrés), Alicia Palacios (María Magdalena), Carmen Molina (Martha), José Baviera (Poncio Pilatos), Tito Novaro (Malco), José María Linares Rivas (Caifás), Luis Beristáin (Jefe Sinagoga), Miguel Arenas (José de Arimatea), Lupe Llaca (Verónica), Alberto Mariscal (Anás el Joven), Alfonso Mejía (Marcos), Fernando Casanova (Centurión)','Oro Films, Estudios Cinematográficos del Tepeyac','Drama mexicano que retrata con todo lujo de detalles la vida de Jesús. Es considerada por muchos como el mayor ejemplo de cine religioso de México (Fuente: TMDB)','https://image.tmdb.org/t/p/original/oHX1x3mbCES6IdGjWiiCY7zxJsu.jpg',1,NULL,NULL,NULL,NULL,1,1,1,75,75,50,70,10,'2022-12-21 16:16:12',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,2,2),(8,'2428',NULL,'tt0059245','TMDB','The Greatest Story Ever Told','La historia más grande jamás contada',1965,199,'US','en','David Lean, George Stevens, Jean Negulesco','George Stevens, James Lee Barrett, Fulton Oursler','Alfred Newman, Charles E. Wallace','Max von Sydow (Jesus), Michael Anderson Jr. (James the Younger), Carroll Baker (Veronica), Ina Balin (Martha of Bethany), Victor Buono (Sorak), Richard Conte (Barabbas), Joanna Dunham (Mary Magdalene), José Ferrer (Herod Antipas), Van Heflin (Bar Amand), Charlton Heston (John the Baptist), Martin Landau (Caiaphas), Angela Lansbury (Claudia), Pat Boone (Angel at the Tomb), Janet Margolin (Mary of Bethany), David McCallum (Judas Iskarioth), Roddy McDowall (Matthew)','George Stevens Productions','Superproducción sobre la vida de Jesús de Nazaret que contó con un extenso y conocido reparto en el que destaca Max von Sydow como Jesucristo. A partir de los Evangelios narra la vida de Jesús en la Palestina ocupada por Roma: su nacimiento en Belén, su infancia en Nazaret, los tres años de vida pública, la Última Cena, la traición de su discípulo Judas, su juicio, crucifixión y posterior resurrección. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/zMZ3iFiWS60FlyrsHGVrtWsGeph.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-12-22 01:33:49',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(9,'36362',NULL,'tt0055047','TMDB','King of Kings','Rey de reyes',1961,168,'US','en','Nicholas Ray, José López Rodero, Sumner Williams, José María Ochoa, Noel Howard, Carlo Lastricati','Philip Yordan','Basil Fenton-Smith, Miklós Rózsa, Franklin Milton','Jeffrey Hunter (Jesus), Siobhán McKenna (Mary), Hurd Hatfield (Pontius Pilate), Ron Randell (Lucius), Viveca Lindfors (Claudia), Rita Gam (Herodias), Carmen Sevilla (Mary Magdalene), Brigid Bazlen (Salome), Harry Guardino (Barabbas), Rip Torn (Judas), Frank Thring (Herod Antipas), Guy Rolfe (Caiaphas), Royal Dano (Peter), Robert Ryan (John the Baptist), Edric Connor (Balthazar), Maurice Marsac (Nicodemus), Grégoire Aslan (Herod), George Coulouris (Camel Driver)','Metro-Goldwyn-Mayer, Samuel Bronston Productions','Cuando las legiones de Roma conquistan Palestina, en un establo de un pueblo llamado Belén nace un niño que es adorado por pastores y por tres magos de Oriente que acuden a él guiados por una estrella. Ante el rumor de que ha nacido el Mesías, el rey Herodes ordena asesinar a todos los recién nacidos... (Fuente: TMDB)','https://image.tmdb.org/t/p/original/A9NtJy2DyKg2pH7Z46pPVz8WkkU.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-12-22 01:47:30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(10,'117900',NULL,'tt0046769','TMDB','El beso de Judas','El beso de Judas',1954,90,'ES','es','Rafael Gil, Pedro L. Ramírez','Rafael Gil, Vicente Escrivá, Ramón D. Faraldo','Cristóbal Halfter, Antonio Alonso','Rafael Rivelles (Judas), Gérard Tichy (Poncio Pilato), Fernando Sancho (Padre del condenado), Francisco Rabal (Quinto Licinio), José Nieto (Eliazim), Manuel Monroy (Pedro), Félix Dafauce (Misael), Francisco Arenzana (Dimas), Gabriel Alcover (Jesús), Pedro Anzola (Juan), Luis Hurtado (Caifás), Mercedes Albert (Verónica), Jacinto San Emeterio (Hombre frente a la cruz), Santiago Rivero (Hombre frente a la cruz), Tony Hernández (Saúl), Ricardo Turia (Juan Bautista), Manuel Kayser (Rabino de Caná)','Aspa','El gran misterio de la religión cristiana sigue siendo aún hoy la traición de Judas Iscariote, a su maestro, Jesucristo. A esta incógnita se enfrentó Rafael Gil, y todo un equipo de producción entre los que se encontraba, Rafael Rivelles, quien encarna la figura de Judas. El actor se mueve como pez en el agua, ante personaje de tan magna envergadura, y reinterpretando un episodio de la historia del Nuevo Testamento que convulsionó de tal forma la Humanidad entera. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/5DuG1uTZts038XIrcxpIbnDbcBW.jpg',1,NULL,NULL,NULL,NULL,1,1,1,50,50,50,50,10,'2022-12-22 02:29:26',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2);
/*!40000 ALTER TABLE `prod_1peliculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_2colecciones`
--

DROP TABLE IF EXISTS `prod_2colecciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_2colecciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `TMDB_entidad` varchar(10) DEFAULT NULL,
  `fuente` varchar(5) NOT NULL,
  `nombre_original` varchar(100) DEFAULT NULL,
  `nombre_castellano` varchar(100) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `ano_fin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `cant_temporadas` tinyint(3) unsigned DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actuacion` varchar(500) DEFAULT NULL,
  `produccion` varchar(50) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned DEFAULT NULL,
  `en_color_id` tinyint(3) unsigned DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `publico_sugerido_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `valor_id` smallint(5) unsigned DEFAULT 1,
  `fe_valores` tinyint(3) unsigned NOT NULL,
  `entretiene` tinyint(3) unsigned NOT NULL,
  `calidad_tecnica` tinyint(3) unsigned NOT NULL,
  `calificacion` tinyint(3) unsigned NOT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `alta_terminada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  `links_gratuitos_cargados_id` tinyint(3) unsigned DEFAULT 3,
  `links_gratuitos_en_la_web_id` tinyint(3) unsigned DEFAULT 2,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `valor_id` (`valor_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `links_gratuitos_cargados_id` (`links_gratuitos_cargados_id`),
  KEY `links_gratuitos_en_la_web_id` (`links_gratuitos_en_la_web_id`),
  CONSTRAINT `prod_2colecciones_ibfk_1` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `prod_publicos_sugeridos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_10` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_11` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_12` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_13` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_14` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_15` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_16` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_17` FOREIGN KEY (`links_gratuitos_cargados_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_18` FOREIGN KEY (`links_gratuitos_en_la_web_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_4` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_5` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_6` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_7` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_8` FOREIGN KEY (`valor_id`) REFERENCES `rclv_3valores` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_9` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_2colecciones`
--

LOCK TABLES `prod_2colecciones` WRITE;
/*!40000 ALTER TABLE `prod_2colecciones` DISABLE KEYS */;
INSERT INTO `prod_2colecciones` VALUES (1,'855456',NULL,'collection','TMDB','Karol','Karol',2005,2006,'PL IT CA','es',1,'Giacomo Battiato','Giacomo Battiato, Gianmario Pagano, Monica Zapelli','Ennio Morricone','Piotr Adamczyk, Malgorzata Bela, Raoul Bova, Lech Mackiewicz, Dariusz Kwasnik','TAO Film','Es una colección de 2 películas, que narra la vida de Karol Wojtyla (Juan Pablo II). La primera película transcurre durante su vida anterior al papado: la II Guerra Mundial, el comunismo, su seminario en forma clandestino porque estaba prohibido por los nazis, su nombramiento como obispo y cardenal, su formación de la juventud de su pueblo, su intención de preservar la cultura polaca durante el sometimiento alemán y luego ruso. La segunda película muestra su vida durante el papado. El atentado contra su vida, sus viajes apostólicos, el reencuentro con sus seres queridos. (Fuente: TMDB)','1645481101308.jpg',1,1,'CFC','HAG',5,24,1,1,75,75,100,80,2,'2022-03-16 23:25:19',11,'2022-05-09 17:10:31','2022-05-26 18:18:01',96.00,2,'2022-03-16 23:25:19',11,'2022-05-26 18:18:23',96.00,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(2,'97919',NULL,'collection','TMDB','Love Comes Softly Collection','El amor llega suavemente',2003,2011,'US','en',1,'Michael Landon Jr., David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Landon Jr.','Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon, Brian','Dale Midkiff, Erin Cottrell','Larry Levinson Productions, RHI Entertainment','Secuela de la vida de las sucesivas descendientes femeninas de una familia. (Fuente: TMDB)','1646276771102.jpg',2,1,'VPC','NOV',5,1,1,11,75,75,100,80,2,'2022-03-16 23:25:22',11,'2022-05-09 17:10:31','2022-05-26 18:18:01',96.00,10,'2022-03-16 23:25:22',11,'2022-12-21 01:13:36',0.00,2,NULL,NULL,NULL,11,'2022-12-21 01:13:00',0,3,2),(3,'19649',NULL,'tv','TMDB','Jesus of Nazareth','Jesús de Nazaret',1977,1977,'GB IT','en',1,'Piero Amati, Pippo Pisciotto, Mohamed Abbazi','','Peter Maxwell, Lionel Strutt, Gerry Humphreys, Maurice Jarre','Robert Powell (Jesus), Olivia Hussey (Virgin Mary), Yorgo Voyagis (Joseph), Anne Bancroft (Mary Magdalene), Christopher Plummer (Herod Antipas), Anthony Quinn (Caiaphas), Ian McShane (Judas Iscariot), Ernest Borgnine (The Centurion), James Farentino (Simon Peter), Michael York (John the Baptist), James Earl Jones (Balthazar), Peter Ustinov (Herod the Great), Ian Holm (Zerah), Valentina Cortese (Herodias), Rod Steiger (Pontius Pilate), Claudia Cardinale (The Adulteress)','ITC Entertainment, RAI, ITC Films','Jesús de Nazaret es una miniserie de televisión italo-británica producida en el año 1977. Co-escrita y dirigida por Franco Zeffirelli, narra la vida de Jesús de Nazaret desde su nacimiento hasta su crucifixión y resurrección, pasando por la peregrinación durante su juventud, su bautismo y sus milagros. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/jyR9lZNJtKzjhBasj1lnfC1lwut.jpg',1,NULL,NULL,NULL,NULL,1,1,1,100,75,100,92,10,'2022-12-22 02:46:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(4,'96464',NULL,'tv','TMDB','Paolo VI - Il Papa nella tempesta','Pablo VI - El papa en la tempestad',2008,2008,'IT','it',1,'Fabrizio Costa','Gianmario Pagano, Francesco Arlanch, Maura Nuccetelli','Marco Frisina','Fabrizio Gifuni (Paolo VI), Mauro Marino (don Pasquale Macchi), Antonio Catania (Padre Giulio Bevilacqua), Luca Lionello (Don Leone), Sergio Tardioli (Don Primo Mazzolari), Claudio Botosso (Roberto Poloni), Licia Maglietta (Maria Colpani), Fabrizio Bucci (Matteo Poloni), Mariano Rigillo (Card. Eugene Tisserant), Giovanni Visentin (Card. Francesco Marchetti Selvaggiani), Sergio Fiorentini (Card. Pietro Gasparri), Luciano Virgilio (Card. Ugo Poletti), Pietro Biondi (Card. Jean-Marie Villot)','RAI','Se centra en la figura de Pablo VI desde que era sacerdote con 27 años, hasta los meses más cercanos a su muerte en marzo de 1978. Desde la perspectiva de Pablo VI, la película recoge momentos históricos como el fascismo en Italia, los Nazis, la II Guerra Mundial y el Concilio Vaticano II en el que Pablo VI tuvo un papel relevante o incluso la guerra de Vietnam. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/6JVLSBRQkogCj6nt5SQJ59vGR4f.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-12-22 03:38:09',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(5,'23453',NULL,'tv','TMDB','Peter and Paul','Pedro y Pablo',1981,1981,'US','en',1,'Robert Day','','','Eddie Albert (Festus), Jon Finch (Luke), Raymond Burr (Herod Agrippa I), José Ferrer (Gamaliel), John Rhys-Davies (Silas), David Gwillim (Mark), Julian Fellowes (Nero), Anthony Hopkins (Paul of Tarsus), Robert Foxworth (Peter the Fisherman)','Universal Television',NULL,'https://image.tmdb.org/t/p/original/n04g9t2wSdBuISh6NBQSwyHa23d.jpg',NULL,NULL,NULL,NULL,NULL,1,1,1,75,75,100,80,10,'2022-12-22 03:42:16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2);
/*!40000 ALTER TABLE `prod_2colecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_3capitulos`
--

DROP TABLE IF EXISTS `prod_3capitulos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_3capitulos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `coleccion_id` int(10) unsigned NOT NULL,
  `temporada` tinyint(3) unsigned DEFAULT NULL,
  `capitulo` tinyint(3) unsigned NOT NULL,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `fuente` varchar(10) NOT NULL,
  `nombre_original` varchar(50) DEFAULT NULL,
  `nombre_castellano` varchar(50) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` tinyint(3) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) NOT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actuacion` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned DEFAULT NULL,
  `en_color_id` tinyint(3) unsigned DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `publico_sugerido_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `valor_id` smallint(5) unsigned DEFAULT 1,
  `fe_valores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidad_tecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `alta_terminada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  `links_gratuitos_cargados_id` tinyint(3) unsigned DEFAULT 3,
  `links_gratuitos_en_la_web_id` tinyint(3) unsigned DEFAULT 2,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `valor_id` (`valor_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `links_gratuitos_cargados_id` (`links_gratuitos_cargados_id`),
  KEY `links_gratuitos_en_la_web_id` (`links_gratuitos_en_la_web_id`),
  CONSTRAINT `prod_3capitulos_ibfk_1` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_10` FOREIGN KEY (`valor_id`) REFERENCES `rclv_3valores` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_11` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_12` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_13` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_14` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_15` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_16` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_17` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_18` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_19` FOREIGN KEY (`links_gratuitos_cargados_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_2` FOREIGN KEY (`en_castellano_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_20` FOREIGN KEY (`links_gratuitos_en_la_web_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_3` FOREIGN KEY (`en_color_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_5` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_6` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_7` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `prod_publicos_sugeridos` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_8` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_9` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_3capitulos`
--

LOCK TABLES `prod_3capitulos` WRITE;
/*!40000 ALTER TABLE `prod_3capitulos` DISABLE KEYS */;
INSERT INTO `prod_3capitulos` VALUES (1,1,1,1,'38516',NULL,'tt0435100','TMDB','Karol - Un uomo diventato Papa','Karol, el hombre que llegó a ser Papa',2005,195,'PL IT','it','Giacomo Battiato','Giacomo Battiato','Ennio Morricone','Piotr Adamczyk (Karol Wojtyla), Malgorzata Bela (Hanna Tuszynska), Ken Duken (Adam Zielinski), Hristo Shopov (Julian Kordek), Ennio Fantastichini (Maciej Nowak), Violante Placido (Maria Pomorska), Matt Craven (Hans Frank), Raoul Bova (padre Tomasz Zaleski), Lech Mackiewicz (card. Stefan Wyszynski), Patrycja Soliman (Wislawa), Olgierd Lukaszewicz (Karol Wojtyla padre), Szymon Bobrowski (capitano Macke), Kenneth Welsh (professor Wójcik), Mateusz Damiecki (Wiktor), Adrian Ochalik (Jerzy Kluger)','TAO Film','Miniserie biográfica sobre Juan Pablo II. En su juventud, en Polonia bajo la ocupación nazi, Karol Wojtyla trabajó en una cantera de caliza para poder sobrevivir. La represión nazi causó numerosas víctimas no sólo entre los judíos, sino también entre los católicos. Es entonces cuando Karol decide responder a la llamada divina. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xVqMG4KcTXhkhL65yohBpjbkY65.jpg',1,1,'CFC','HAG',5,24,1,1,NULL,NULL,NULL,NULL,2,'2022-03-16 23:25:20',2,'2022-05-26 18:18:01','2022-05-26 18:18:01',96.00,2,'2022-03-16 23:25:19',11,'2022-05-26 18:18:23',96.00,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(2,1,1,2,'75470',NULL,'tt0495039','TMDB','Karol, un Papa rimasto uomo','Karol, el Papa que siguió siendo hombre',2006,184,'IT PL CA','it','Giacomo Battiato','Gianmario Pagano, Giacomo Battiato, Monica Zapelli','Ennio Morricone','Piotr Adamczyk (John Paul II), Dariusz Kwasnik (Dr. Renato Buzzonetti), Michele Placido (Dr. Renato Buzzonetti), Dariusz Kwasnik (Stanislaw Dziwisz), Alberto Cracco (Agostino Casaroli), Adriana Asti (Madre Teresa di Calcutta), Raoul Bova (Padre Thomas), Leslie Hope (Julia Ritter), Alkis Zanis (Ali Agca), Carlos Kaniowsky (Oscar Arnulfo Romero Goldamez), Fabrice Scott (Jerzy Popieluszko), Paolo Maria Scalondro (Wojciech Jaruzelski), Daniela Giordano (Tobiana Sobótka)','TAO Film','Es la continuación de la miniserie Karol, el hombre que se convirtió en Papa. Narra la historia, desde 1978 en adelante, del primer hombre de un país del este elegido Papa y el papel que tomó en el final del Comunismo, a pesar de sufrir un intento de asesinato que trató de hacerlo callar. La historia narra cómo continuó su pontificado con valor a pesar de la enfermedad que poco a poco iba minando su vida. Él nunca ocultó su sufrimiento físico, pero luchó hasta el final contra la guerra y la violencia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/pTZZSSjJvKohXJmBdAT5CO5lXnK.jpg',1,1,'CFC','HAG',5,24,1,1,NULL,NULL,NULL,NULL,2,'2022-03-16 23:25:20',2,'2022-05-26 18:18:01','2022-05-26 18:18:01',96.00,2,'2022-03-16 23:25:19',11,'2022-05-26 18:18:23',96.00,3,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(3,2,1,1,'16250',NULL,'tt0345591','TMDB','Love Comes Softly','El amor llega suavemente',2003,84,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','Ken Thorne, Michael Wetherwax, William Ashford','Katherine Heigl (Marty Claridge), Dale Midkiff (Clark Davis), Skye McCole Bartusiak (Missie Davis), Corbin Bernsen (Ben Graham), Theresa Russell (Sarah Graham), Oliver Macready (Aaron Claridge), Tiffany Amber Knight (Laura Graham), Nick Scoggin (Reverend Johnson), Rutanya Alda (Wanda Marshall), Jaimz Woolvett (Wagon Train Scout), Janet Rotblatt (Woman in Wagon), Adam Loeffler (Clint Graham), David Fine (Jed Larsen (uncredited)), Dani Goldman (Young Marty (uncredited))','Larry Levinson Productions, Hallmark Entertainment, Alpine Medien Productions','Estando de ruta hacia su nuevo hogar en las grandes llanuras del oeste, una joven se queda repentinamente viuda en medio del largo viaje en carreta. Con una dura temporada invernal acechando y sin recursos para regresar, la joven acepta el trato que le ofrece un granjero: casarse con él para ocuparse de su hija, a cambio de cobijo y de un pasaje de vuelta en primavera. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eDxmL7CCHWCcFpbdS6yVnspOjV1.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(4,2,1,2,'20641',NULL,'tt0402348','TMDB','Love\'s Enduring Promise','El amor lo puede todo',2004,95,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Cindy Kelley','','January Jones (Missie Davis), Logan Bartholomew (Willie / Nate), Dale Midkiff (Clark Davis), Katherine Heigl (Marty Claridge), Kesun Loder (Aaron Davis), Logan Arens (Arnie Davis), Mackenzie Astin (Grant Thomas), Cliff DeYoung (Zeke), Matthew Peters (Brian Murphy), Michael Bartel (Willie at 15), Dominic Scott Kay (Mattie), Blaine Pate (Sam), Cara DeLizia (Annie Walker), Robert F. Lyons (Doc Watkins), Douglas Fisher (Edward Trumball), E.J. Callahan (Asa), Katia Coe (Clara), Gary Sievers (Ranxher)',NULL,'Una familia de granjeros del Oeste, cuya subsistencia depende de sus cosechas, ve cómo un accidente del cabeza de familia, que se verá obligado a guardar cama, pone en grave peligro su situación económica. Su hija, una maestra de escuela, se ve obligada a realizar las duras labores de la granja, hasta que un forastero se ofrece a ayudarles y a curar al herido... (Fuente: TMDB)','https://image.tmdb.org/t/p/original/lwbeyOtRpn1izaRnVVhDSJGwHRu.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(5,2,1,3,'22488',NULL,'tt0785025','TMDB','Love\'s Abiding Joy','El largo camino del amor',2006,88,'US','en','Michael Landon Jr.','Michael Landon Jr., Janette Oke, Douglas Lloyd McIntosh, Bridget Terry','','Erin Cottrell (Missie), Logan Bartholomew (Willie), William Morgan Sheppard (Scottie), James Tupper (Henry), Irene Bedard (Miriam Red Hawk McClain), Dale Midkiff (Clark Davis), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), Brett Coker (Mattie LaHaye), Mae Whitman (Colette Doros), John Laughlin (Smuel Doros), Kevin Gage (John Abel), Brianna Brown (Melinda Klein), Stephen Bridgewater (Frank Taylorson), Blake Gibbons (Joe Paxson), Madison Leisle (Annie), Thomas Stanley (Mark)',NULL,'Tras un peligroso viaje al Oeste, Missie (Erin Cottrell) y su marido (Logan Bartholomew) se establecen en unas tierras con la intención de formar una familia. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/rNQCuECnv6ubGJzHqqdFB2O1bV7.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(6,2,1,4,'20583',NULL,'tt0486420','TMDB','Love\'s Long Journey','El amor dura eternamente',2005,87,'US','en','Michael Landon Jr.','','','Erin Cottrell (Missie LaHaye), Dale Midkiff (Clark Davis), Logan Bartholomew (Willie LaHaye), Frank McRae (Cookie), Drew Tyler Bell (Jeff LaHaye), William Morgan Sheppard (Scottie), Richard Lee Jackson (Sonny Huff)',NULL,'Adaptación televisiva de la novela de Janette Oke sobre una joven pareja, Missie (Erin Cottrell) y Willie (Logan Bartholomew), que abandonan sus hogares para comenzar una nueva vida en el Oeste. Durante el camino, su amor y su Fe en Dios serán puestos a prueba por la adversidades del trayecto. Willie y Missie La Haye emprenden una nueva vida como colonos en el Oeste americano. Adquieren un rancho y un buen número de cabezas de ganado y, una vez instalados, Missie confiesa a su marido que espera un hijo. Su padre, desde la distancia, le recuerda que sus corazones están unidos por el amor, y que pronto se reencontrarán. Mientras tanto, Missie trabaja como maestra ganándose el afecto de la comunidad india. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/eIrxGoq68iH16NWFF1XKCKXRmaE.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(7,2,1,5,'30975',NULL,'tt0929864','TMDB','Love\'s Unending Legacy','El legado de un amor infinito',2007,84,'US','en','Mark Griffiths','Janette Oke, Pamela Wallace','Kevin Kiner','Erin Cottrell (Missie LaHaye), Holliston Coleman (Belinda Marshall-LaHaye), Victor Browne (Sherrif Zack Tyler), Hank Stratton (Pastor Joe), Braeden Lemasters (Jacob Marshall-LaHaye), Dave Florek (Hank Pettis), Stephanie Nash (Mrs. Pettis), Bret Loehr (Calvin), Dale Midkiff (Clark Davis)',NULL,'Tres años después de la muerte de su marido, Missie decide regresar junto a su hijo a casa de sus padres. Allí recupera su trabajo como maestra y adopta a Belinda, una huérfana algo rebelde que oculta un secreto: tiene un hermano menor que está siendo maltratado por sus nuevos padres adoptivos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/xi57bQTg33RpduDphkvtdWkEI7b.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(8,2,1,6,'49857',NULL,'tt0960143','TMDB','Love\'s Unfolding Dream','La doble cara del amor',2007,87,'US','en','Harvey Frost','','','Erin Cottrell (Missy Tyler), Scout Taylor-Compton (Belinda Tyler), Dale Midkiff (Clark Davis), Robert Pine (Dr. Micah Jackson), Victor Browne (Sheriff Zach Taylor), Samantha Smith (Mart Davis), Patrick Levis (Drew Simpson), Nancy Linehan Charles (Virginia Stafford-Smith)','Larry Levinson Productions, RHI Entertainment, Alpine Medien Productions','Belinda quiere ser doctora, pero vive en una época en la que su condición de mujer pone muchas trabas a su camino. Se debate entre su vocación y el amor por un abogado de costumbres tradicionales. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/7OCcCfioaoUS1q5nemO8uSciKRj.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(9,2,1,7,'21636',NULL,'tt1269560','TMDB','Love Takes Wing','Y el amor volvió a nosotros',2009,88,'US','en','Lou Diamond Phillips','Rachel Stuhler','','Sarah Jones (Belinda Simpson), Haylie Duff (Annie Nelson), Jordan Bridges (Lee Owens), Patrick Duffy (Mayor Evans), Cloris Leachman (Hattie Clarence), John Bishop (John Pine), Lou Diamond Phillips (Ray Russell), Erin Cottrell (Missy), Annalise Basso (Lillian), Time Winters (Gus), Bonnie Root (Mrs. Pine), Craig K. Bodkin (Sheriff), Dave Rodgers (Stage Coach Driver)',NULL,'Tras la muerte de su marido, la doctora Belinda Simpson llega a la ciudad de Sikeston. Pronto descubre que su población está enfermando y muriendo de cólera, brote que proviene de un orfanato cercano. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/b6bM8dmSbEHDv9hHIJCZjbgIkbV.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(10,2,1,8,'25182',NULL,'tt1307064','TMDB','Love Finds A Home','Y el amor llegó al hogar',2009,88,'US','en','David S. Cass Sr.','Janette Oke, Donald Davenport','Stephen Graziano','Sarah Jones (Belinda Simpson), Haylie Duff (Annie), Jordan Bridges (Lee Owens), Patty Duke (Mary), Courtney Halverson (Lillian), Michael Trevino (Joshua), Jeffrey Muller (Peter), Dahlia Salem (Mabel McQueen), Thomas Kopache (Reverend Davis), Chad W. Smathers (Danny Travis), Daniel Beer (Lloyd McQueen), Jeff Clarke (Mr. Travis), Jennifer M. Gentile (Mrs. Travis), Matthew Florida (Young Cowboy), Michelle Josette (Young Mother), Time Winters (Gus), Grace Levinson (Grace), Shannon Levinson (Shannon)','RHI Entertainment, Larry Levinson Productions, LG Films, Faith & Family Entertainment','La doctora Annie Watson va a casa de su mejor amiga, la también facultativa Belinda Owens. Allí, la chica tendrá que convivir con Mary, una mujer a la que le gustan los remedios naturales, y con un matrimonio en crisis, por la imposibilidad de Belinda por quedarse embarazada. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/zgFi7OtOeMmvH3stWJSpazJGaSJ.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(11,2,1,9,'81450',NULL,'tt1684907','TMDB','Love Begins','Cuando nace el amor',2011,0,'US, IE','en','David S. Cass Sr., Dora Hopkins','Janette Oke, Michael Moran','Stephen McKeon','Wes Brown (Clark Davis), Julie Mond (Ellen Louise Barlow), Abigail Mavity (Cassandra Mae \'Cassie\' Barlow), Jere Burns (Sheriff Holden), Nancy McKeon (Millie), David Tom (Daniel Whittaker), Steffani Brass (Rose), Daniel Buran (Samuel)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Tras una pelea en una cafetería, Clark Davis es condenado a ir a la cárcel. Gracias a un acuerdo entre el sheriff y la propietaria del local, se le conmuta la pena. Entonces tendrá que trabajar como peón para las hermanas Ellen y Cassie Barlow. (FILMAFFINITY)','https://image.tmdb.org/t/p/original/b0JiPlWEZ8cnhhgVOWo0rnbGuvh.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(12,2,1,10,'87311',NULL,'tt1672621','TMDB','Love\'s Everlasting Courage','Love\'s Everlasting Courage',2011,89,'US','en','Bradford May, Dora Hopkins','Kevin Bocarde','Brian Byrne','Wes Brown (Clark), Julie Mond (Ellen), Bruce Boxleitner (Lloyd), Cheryl Ladd (Irene), Morgan Lily (Missy), Willow Geer (Sarah), Tyler Jacob Moore (Ben), Kirk B.R. Woller (Bruce), James Eckhouse (Mr. Harris), Courtney Marmo (Laura)','RHI Entertainment, Faith & Family Entertainment, MNG Films, Larry Levinson Productions','Una familia joven lucha por una frontera en el oeste que permita a la mujer trabajar en un taller de costura. Cuando la situación económica mejora, la esposa enferma y muere. Con la ayuda de sus padres, el joven viudo tendrá que aprender a lidiar con la trágica pérdida. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/aIZoXDvpmwF70KsY8lByku5SwgF.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(13,2,1,11,'87313',NULL,'tt2078672','TMDB','Love\'s Christmas Journey','Y el amor llegó en Navidad',2011,172,'US','en','David S. Cass Sr., Dora Hopkins','Janette Oke, George Tierne','','Natalie Hall (Ellie Davis), JoBeth Williams (Beatrice), Greg Vaughan (Aaron Davis), Dylan Bruce (Michael), Ernest Borgnine (Nicholas), Teddy Vincent (Mrs. Price), Annika Noelle (Suzanna), Bobby Campo (Erik Johnson), Charles Shaughnessy (Alex Weaver), Sean Astin (Mayor Wayne), Ryan Wynott (Christopher), Jada Facer (Annabelle), Amanda Foreman (Adrienne), Dannika Liddell (Jessica), Brian Thompson (Cass), Richard Tyson (Charley)',NULL,'Tras la muerte de su marido y su hija, Eli decide pasar la temporada de Navidad con su hermano, el sheriff de una pequeña ciudad respetado por todos. (Fuente: TMDB)','https://image.tmdb.org/t/p/original/jYqWZG3f5FRy8oUwZYOn77h9I59.jpg',1,1,'VPC','NOV',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-20 22:50:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(14,3,1,1,'576368',NULL,NULL,'TMDB',NULL,'Episodio 1',1977,97,NULL,'en','Franco Zeffirelli','Franco Zeffirelli, Suso Cecchi d\'Amico, Anthony Burgess, David Butler','','Robert Powell (Jesus), Olivia Hussey (Virgin Mary), Yorgo Voyagis (Joseph), Anne Bancroft (Mary Magdalene), Christopher Plummer (Herod Antipas), Anthony Quinn (Caiaphas), Ian McShane (Judas Iscariot), Ernest Borgnine (The Centurion), James Farentino (Simon Peter), Michael York (John the Baptist), James Earl Jones (Balthazar), Peter Ustinov (Herod the Great), Ian Holm (Zerah), Valentina Cortese (Herodias), Rod Steiger (Pontius Pilate), Claudia Cardinale (The Adulteress)','ITC Entertainment, RAI, ITC Films','Crónica de la vida de Cristo se desarrolla en esta producción de TV, biografía dirigida por Franco Zeffirelli, impregnada de drama, pero a la vez,con sensibilidad y respeto. .','https://image.tmdb.org/t/p/original/4ujCVZ1f7YKGHVoXlFHaNbjHueV.jpg',1,1,'CFC','JSS',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-21 17:46:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(15,3,1,2,'576369',NULL,NULL,'TMDB',NULL,'Episodio 2',1977,97,NULL,'en','Franco Zeffirelli','Franco Zeffirelli, Suso Cecchi d\'Amico, Anthony Burgess, David Butler','','Robert Powell (Jesus), Olivia Hussey (Virgin Mary), Yorgo Voyagis (Joseph), Anne Bancroft (Mary Magdalene), Christopher Plummer (Herod Antipas), Anthony Quinn (Caiaphas), Ian McShane (Judas Iscariot), Ernest Borgnine (The Centurion), James Farentino (Simon Peter), Michael York (John the Baptist), James Earl Jones (Balthazar), Peter Ustinov (Herod the Great), Ian Holm (Zerah), Valentina Cortese (Herodias), Rod Steiger (Pontius Pilate), Claudia Cardinale (The Adulteress)','ITC Entertainment, RAI, ITC Films','Las enseñanzas y milagros de Jesús le traerán nuevos seguidores. Juan Bautista es encarcelado por Herodes Antipas.','https://image.tmdb.org/t/p/original/cMJ8ZupIh7AlT3ZadqiIpDBkwal.jpg',1,1,'CFC','JSS',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-21 17:46:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(16,3,1,3,'576371',NULL,NULL,'TMDB',NULL,'Episodio 3',1977,97,NULL,'en','Franco Zeffirelli','Franco Zeffirelli, Suso Cecchi d\'Amico, Anthony Burgess, David Butler','','Robert Powell (Jesus), Olivia Hussey (Virgin Mary), Yorgo Voyagis (Joseph), Anne Bancroft (Mary Magdalene), Christopher Plummer (Herod Antipas), Anthony Quinn (Caiaphas), Ian McShane (Judas Iscariot), Ernest Borgnine (The Centurion), James Farentino (Simon Peter), Michael York (John the Baptist), James Earl Jones (Balthazar), Peter Ustinov (Herod the Great), Ian Holm (Zerah), Valentina Cortese (Herodias), Rod Steiger (Pontius Pilate), Claudia Cardinale (The Adulteress)','ITC Entertainment, RAI, ITC Films','Zerah  le pide a Judas que le informe del paradero de Jesús para presentarlo ante el Sanedrín de Jerusalén, donde será entreagado.','https://image.tmdb.org/t/p/original/gTiHcDV2F2NwN6j7cCA50zVCAC9.jpg',1,1,'CFC','JSS',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-21 17:46:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(17,3,1,4,'576370',NULL,NULL,'TMDB',NULL,'Episodio 4',1977,97,NULL,'en','Franco Zeffirelli','Franco Zeffirelli, Suso Cecchi d\'Amico, Anthony Burgess, David Butler','','Robert Powell (Jesus), Olivia Hussey (Virgin Mary), Yorgo Voyagis (Joseph), Anne Bancroft (Mary Magdalene), Christopher Plummer (Herod Antipas), Anthony Quinn (Caiaphas), Ian McShane (Judas Iscariot), Ernest Borgnine (The Centurion), James Farentino (Simon Peter), Michael York (John the Baptist), James Earl Jones (Balthazar), Peter Ustinov (Herod the Great), Ian Holm (Zerah), Valentina Cortese (Herodias), Rod Steiger (Pontius Pilate), Claudia Cardinale (The Adulteress)','ITC Entertainment, RAI, ITC Films','El drama concluye con poderosas escenas de la condena de Cristo, su agonía en la cruz y la resurrección.','https://image.tmdb.org/t/p/original/o2i9qUhUYqfqaYMpmgL3fb0l4Qz.jpg',1,1,'CFC','JSS',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-21 17:46:45',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(18,4,1,1,'2015795',NULL,NULL,'TMDB',NULL,'Episodio 1',2008,200,NULL,'it','Fabrizio Costa','Gianmario Pagano, Francesco Arlanch, Maura Nuccetelli','Marco Frisina','Fabrizio Gifuni (Paolo VI), Mauro Marino (don Pasquale Macchi), Antonio Catania (Padre Giulio Bevilacqua), Luca Lionello (Don Leone), Sergio Tardioli (Don Primo Mazzolari), Claudio Botosso (Roberto Poloni), Licia Maglietta (Maria Colpani), Fabrizio Bucci (Matteo Poloni), Mariano Rigillo (Card. Eugène Tisserant), Giovanni Visentin (Card. Francesco Marchetti Selvaggiani), Sergio Fiorentini (Card. Pietro Gasparri), Luciano Virgilio (Card. Ugo Poletti), Pietro Biondi (Card. Jean-Marie Villot)','RAI',NULL,NULL,1,1,'CFC','HAG',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-22 03:38:10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(19,4,1,2,'2015808',NULL,NULL,'TMDB',NULL,'Episodio 2',2008,200,NULL,'it','Fabrizio Costa','Gianmario Pagano, Francesco Arlanch, Maura Nuccetelli','Marco Frisina','Fabrizio Gifuni (Paolo VI), Mauro Marino (don Pasquale Macchi), Antonio Catania (Padre Giulio Bevilacqua), Luca Lionello (Don Leone), Sergio Tardioli (Don Primo Mazzolari), Claudio Botosso (Roberto Poloni), Licia Maglietta (Maria Colpani), Fabrizio Bucci (Matteo Poloni), Mariano Rigillo (Card. Eugène Tisserant), Giovanni Visentin (Card. Francesco Marchetti Selvaggiani), Sergio Fiorentini (Card. Pietro Gasparri), Luciano Virgilio (Card. Ugo Poletti), Pietro Biondi (Card. Jean-Marie Villot)','RAI',NULL,NULL,1,1,'CFC','HAG',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-22 03:38:10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(20,5,1,1,'1378285',NULL,NULL,'TMDB',NULL,'Episodio 1',1981,120,NULL,'en','Robert Day','','','Eddie Albert (Festus), Jon Finch (Luke), Raymond Burr (Herod Agrippa I), José Ferrer (Gamaliel), John Rhys-Davies (Silas), David Gwillim (Mark), Julian Fellowes (Nero), Anthony Hopkins (Paul of Tarsus), Robert Foxworth (Peter the Fisherman)','Universal Television',NULL,NULL,1,1,'CFC','HAG',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-22 03:42:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2),(21,5,1,2,'1378286',NULL,NULL,'TMDB',NULL,'Episodio 2',1981,120,NULL,'en','Robert Day','','','Eddie Albert (Festus), Jon Finch (Luke), Raymond Burr (Herod Agrippa I), José Ferrer (Gamaliel), John Rhys-Davies (Silas), David Gwillim (Mark), Julian Fellowes (Nero), Anthony Hopkins (Paul of Tarsus), Robert Foxworth (Peter the Fisherman)','Universal Television',NULL,NULL,1,1,'CFC','HAG',4,1,1,1,NULL,NULL,NULL,NULL,2,'2022-12-22 03:42:17',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,3,2);
/*!40000 ALTER TABLE `prod_3capitulos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_4edicion`
--

DROP TABLE IF EXISTS `prod_4edicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_4edicion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `nombre_original` varchar(50) DEFAULT NULL,
  `nombre_castellano` varchar(50) DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `ano_fin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actuacion` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(900) DEFAULT NULL,
  `avatar` varchar(18) DEFAULT NULL,
  `avatar_url` varchar(100) DEFAULT NULL,
  `en_castellano_id` tinyint(3) unsigned DEFAULT NULL,
  `en_color_id` tinyint(3) unsigned DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `publico_sugerido_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_id` smallint(5) unsigned DEFAULT NULL,
  `valor_id` smallint(5) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `en_castellano_id` (`en_castellano_id`),
  KEY `en_color_id` (`en_color_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `publico_sugerido_id` (`publico_sugerido_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `valor_id` (`valor_id`),
  KEY `editado_por_id` (`editado_por_id`),
  CONSTRAINT `prod_4edicion_ibfk_1` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_10` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_11` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_12` FOREIGN KEY (`valor_id`) REFERENCES `rclv_3valores` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_13` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_2` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_3` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_4` FOREIGN KEY (`en_castellano_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_5` FOREIGN KEY (`en_color_id`) REFERENCES `prod_si_no_parcial` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_6` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_7` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_8` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `prod_4edicion_ibfk_9` FOREIGN KEY (`publico_sugerido_id`) REFERENCES `prod_publicos_sugeridos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_4edicion`
--

LOCK TABLES `prod_4edicion` WRITE;
/*!40000 ALTER TABLE `prod_4edicion` DISABLE KEYS */;
INSERT INTO `prod_4edicion` VALUES (7,NULL,2,NULL,'Love Comes Softly',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ken Thorne, Michael Wetherwax, William Ashford, Kevin Kiner, Stephen Graziano, Stephen McKeon',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,'2022-03-16 23:25:22'),(8,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1671621230750.jpg',NULL,1,1,'CFC','HAG',4,53,1,1,10,'2022-12-21 11:13:50'),(9,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1671639372462.jpg',NULL,NULL,3,'CFC','JSS',4,11,1,1,10,'2022-12-21 16:16:13'),(11,8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'CFC','JSS',4,11,NULL,NULL,10,'2022-12-22 01:40:25'),(12,9,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1671673650869.jpg',NULL,1,1,'CFC','JSS',4,11,1,1,10,'2022-12-22 01:47:30'),(13,NULL,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Franco Zeffirelli, Piero Amati, Pippo Pisciotto, Mohamed Abbazi','Suso Cecchi d\'Amico, Franco Zeffirelli, Anthony Burgess',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'CFC','JSS',4,11,NULL,NULL,10,'2022-12-22 02:05:53'),(14,10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1671676166835.jpg',NULL,NULL,3,'CFC','CNT',4,54,1,1,10,'2022-12-22 02:29:26'),(15,NULL,4,NULL,NULL,NULL,200,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1671680289755.jpg',NULL,1,1,'CFC','HAG',4,55,1,1,10,'2022-12-22 03:38:09'),(16,NULL,5,NULL,NULL,NULL,120,NULL,NULL,NULL,NULL,NULL,'Stan Hough, Christopher Knopf, Christopher Knopf','Allyn Ferguson',NULL,NULL,'Pedro y Pablo asumen el liderazgo de la Iglesia mientras luchan contra la oposición violenta a las enseñanzas de Jesucristo y sus propias disputas personales. (FILMAFFINITY)','1671680536884.jpg',NULL,1,1,'CFC','HAG',4,56,1,1,10,'2022-12-22 03:42:16');
/*!40000 ALTER TABLE `prod_4edicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_categ1`
--

DROP TABLE IF EXISTS `prod_categ1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_categ1` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_categ1`
--

LOCK TABLES `prod_categ1` WRITE;
/*!40000 ALTER TABLE `prod_categ1` DISABLE KEYS */;
INSERT INTO `prod_categ1` VALUES ('CFC',1,'Centradas en la Fe Católica'),('VPC',2,'Valores Presentes en la Cultura');
/*!40000 ALTER TABLE `prod_categ1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_categ2_sub`
--

DROP TABLE IF EXISTS `prod_categ2_sub`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_categ2_sub` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `cfc` tinyint(1) DEFAULT NULL,
  `vpc` tinyint(1) DEFAULT NULL,
  `rclv_necesario` varchar(10) DEFAULT NULL,
  `pers_codigo` varchar(3) DEFAULT NULL,
  `hechos_codigo` varchar(3) DEFAULT NULL,
  `url` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_categ2_sub`
--

LOCK TABLES `prod_categ2_sub` WRITE;
/*!40000 ALTER TABLE `prod_categ2_sub` DISABLE KEYS */;
INSERT INTO `prod_categ2_sub` VALUES ('AMA',6,'Apariciones Marianas',1,0,'hecho','AMA','ama','ap_marianas'),('BIO',7,'Biografías',0,1,'personaje',NULL,NULL,'bios'),('CNT',5,'Contemporáneos de Jesús',1,0,'personaje','CNT','cnt','contemporaneos'),('DOC',3,'Documentales',1,1,NULL,NULL,NULL,'documentales'),('HAG',7,'Hagiografías',1,0,'personaje','HAG','ncn','hagiografias'),('HIG',8,'Historias de la Iglesia',1,0,NULL,NULL,NULL,'historias'),('HIS',8,'Historias',0,1,'hecho',NULL,NULL,'historias'),('JSS',4,'Jesús',1,0,'personaje','JSS','jss','jesus'),('MUS',1,'Musicales',1,1,NULL,NULL,NULL,'musicales'),('NOV',2,'Novelas',1,1,NULL,NULL,NULL,'novelas');
/*!40000 ALTER TABLE `prod_categ2_sub` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_publicos_sugeridos`
--

DROP TABLE IF EXISTS `prod_publicos_sugeridos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_publicos_sugeridos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_publicos_sugeridos`
--

LOCK TABLES `prod_publicos_sugeridos` WRITE;
/*!40000 ALTER TABLE `prod_publicos_sugeridos` DISABLE KEYS */;
INSERT INTO `prod_publicos_sugeridos` VALUES (1,5,'Menores solamente'),(2,4,'Menores (apto familia)'),(3,3,'Familia'),(4,2,'Mayores (apto familia)'),(5,1,'Mayores solamente');
/*!40000 ALTER TABLE `prod_publicos_sugeridos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prod_si_no_parcial`
--

DROP TABLE IF EXISTS `prod_si_no_parcial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_si_no_parcial` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `productos` varchar(10) NOT NULL,
  `links` varchar(10) NOT NULL,
  `si` tinyint(1) NOT NULL,
  `no` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prod_si_no_parcial`
--

LOCK TABLES `prod_si_no_parcial` WRITE;
/*!40000 ALTER TABLE `prod_si_no_parcial` DISABLE KEYS */;
INSERT INTO `prod_si_no_parcial` VALUES (1,'SI','SI',1,0),(2,'Parcial','Tal vez',0,0),(3,'NO','NO',0,1);
/*!40000 ALTER TABLE `prod_si_no_parcial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_1personajes`
--

DROP TABLE IF EXISTS `rclv_1personajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_1personajes` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `ap_mar_id` smallint(5) unsigned DEFAULT NULL,
  `proceso_id` varchar(3) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `prods_aprob` tinyint(1) DEFAULT 0,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `sexo_id` (`sexo_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `proceso_id` (`proceso_id`),
  KEY `rol_iglesia_id` (`rol_iglesia_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `ap_mar_id` (`ap_mar_id`),
  CONSTRAINT `rclv_1personajes_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_10` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_11` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_12` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_13` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_14` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_15` FOREIGN KEY (`ap_mar_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_2` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_3` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_4` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_5` FOREIGN KEY (`proceso_id`) REFERENCES `rclv_procs_canon` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_6` FOREIGN KEY (`rol_iglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_7` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_8` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_9` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_1personajes`
--

LOCK TABLES `rclv_1personajes` WRITE;
/*!40000 ALTER TABLE `rclv_1personajes` DISABLE KEYS */;
INSERT INTO `rclv_1personajes` VALUES (1,'Ninguno',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Jesús de Nazaret',NULL,'V',NULL,0,'CFC','JSS',NULL,NULL,NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(12,'María, madre de Jesús','Santa María','M',NULL,-15,'CFC','CNT',NULL,'STM','LCM',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(13,'José, padre de Jesús','San José','V',79,-20,'CFC','CNT',NULL,'STV','LCV',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(21,'Teresa de Calcuta','Madre Teresa','M',249,1910,'CFC','HAG',NULL,'STM','REM',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(22,'Juan XXIII',NULL,'V',285,1958,'CFC','HAG',NULL,'STV','PPV',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(23,'Juan Bosco','Don Bosco','V',31,1815,'CFC','HAG',NULL,'STV','SCV',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(24,'Juan Pablo II',NULL,'V',296,1920,'CFC','HAG',NULL,'STV','PPV',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(25,'Bernadette Soubirous','Bernadette','M',107,1844,'CFC','HAG',16,'STM','REM',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(26,'Martín Lutero','Lutero','V',305,1483,'CFC','HIG',NULL,NULL,'APV',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(27,'Pastorcitos de Fátima',NULL,'M',51,1844,'CFC','HAG',17,'ST','LCM',0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(51,'Mohandas Gandhi','Mahatma Gandhi','V',30,1869,'VPC',NULL,NULL,NULL,NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(52,'Nelson Mandela','Madiba','V',340,1918,'VPC',NULL,NULL,NULL,NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(53,'Damián de Veuster','Padre Damián','V',131,1840,'CFC','HAG',NULL,'STV','SCV',0,10,'2022-12-19 22:40:29',11,'2022-12-21 11:07:55',36.46,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,NULL,11,'2022-12-21 11:07:00',0),(54,'Judas',NULL,'V',NULL,NULL,'CFC','CNT',NULL,NULL,'ALV',0,10,'2022-12-22 01:29:13',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL),(55,'Pablo VI','Bautista Montini','V',150,1897,'CFC','HAG',NULL,'STV','PPV',0,10,'2022-12-22 03:36:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL),(56,'Pedro y Pablo',NULL,'V',181,NULL,'CFC','CNT',NULL,NULL,'ALV',0,10,'2022-12-22 03:42:11',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_1personajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_2hechos`
--

DROP TABLE IF EXISTS `rclv_2hechos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_2hechos` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `solo_cfc` tinyint(1) DEFAULT 0,
  `jss` tinyint(1) DEFAULT 0,
  `cnt` tinyint(1) DEFAULT 0,
  `ncn` tinyint(1) DEFAULT 0,
  `ama` tinyint(1) DEFAULT 0,
  `prods_aprob` tinyint(1) DEFAULT 0,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  CONSTRAINT `rclv_2hechos_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_2` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_3` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_4` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_5` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_6` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_7` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_8` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_9` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_2hechos`
--

LOCK TABLES `rclv_2hechos` WRITE;
/*!40000 ALTER TABLE `rclv_2hechos` DISABLE KEYS */;
INSERT INTO `rclv_2hechos` VALUES (1,'Ninguno',NULL,NULL,0,0,0,0,0,0,1,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Navidad',359,0,1,1,1,0,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Semana Santa',100,33,1,1,1,0,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Sem. Santa - Pasión del Señor',105,33,1,1,1,0,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Sem. Santa - Resurrección',107,33,1,1,1,0,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Pentecostés',150,33,1,0,1,0,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(16,'Ap. Mariana - Lourdes',42,1858,1,0,0,1,1,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(17,'Ap. Mariana - Fátima',134,1917,1,0,0,1,1,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(21,'Guerra Mundial - 1a',210,1914,0,0,0,1,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(22,'Guerra Mundial - 2a',245,1939,0,0,0,1,0,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_2hechos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_3valores`
--

DROP TABLE IF EXISTS `rclv_3valores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_3valores` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `prods_aprob` tinyint(1) DEFAULT 0,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_analizada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_analizada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_analizada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned DEFAULT NULL,
  `sugerido_en` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_analizada_por_id` (`alta_analizada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_analizada_por_id` (`edic_analizada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  CONSTRAINT `rclv_3valores_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_2` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_3` FOREIGN KEY (`alta_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_4` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_5` FOREIGN KEY (`edic_analizada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_6` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registro` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_7` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_8` FOREIGN KEY (`motivo_id`) REFERENCES `altas_motivos_rech` (`id`),
  CONSTRAINT `rclv_3valores_ibfk_9` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_3valores`
--

LOCK TABLES `rclv_3valores` WRITE;
/*!40000 ALTER TABLE `rclv_3valores` DISABLE KEYS */;
INSERT INTO `rclv_3valores` VALUES (1,'Ninguno',NULL,0,1,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Matrimonio y familia',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Servicio al prójimo',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Pacificar un país dividido',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Amistad',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Superación personal',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL),(16,'Valores en el deporte',NULL,0,2,'2022-03-16 23:25:20',2,'2022-03-17 23:25:20',NULL,NULL,NULL,NULL,NULL,24.00,3,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rclv_3valores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_4edicion`
--

DROP TABLE IF EXISTS `rclv_4edicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_4edicion` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `personaje_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_id` smallint(5) unsigned DEFAULT NULL,
  `valor_id` smallint(5) unsigned DEFAULT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `subcategoria_id` varchar(3) DEFAULT NULL,
  `ap_mar_id` smallint(5) unsigned DEFAULT NULL,
  `proceso_id` varchar(3) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `solo_cfc` tinyint(1) DEFAULT NULL,
  `jss` tinyint(1) DEFAULT NULL,
  `cnt` tinyint(1) DEFAULT NULL,
  `ncn` tinyint(1) DEFAULT NULL,
  `ama` tinyint(1) DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `valor_id` (`valor_id`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `sexo_id` (`sexo_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `subcategoria_id` (`subcategoria_id`),
  KEY `proceso_id` (`proceso_id`),
  KEY `rol_iglesia_id` (`rol_iglesia_id`),
  KEY `editado_por_id` (`editado_por_id`),
  CONSTRAINT `rclv_4edicion_ibfk_1` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_10` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_2` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_3` FOREIGN KEY (`valor_id`) REFERENCES `rclv_3valores` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_4` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_5` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_6` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_7` FOREIGN KEY (`subcategoria_id`) REFERENCES `prod_categ2_sub` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_8` FOREIGN KEY (`proceso_id`) REFERENCES `rclv_procs_canon` (`id`),
  CONSTRAINT `rclv_4edicion_ibfk_9` FOREIGN KEY (`rol_iglesia_id`) REFERENCES `aux_roles_iglesia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_4edicion`
--

LOCK TABLES `rclv_4edicion` WRITE;
/*!40000 ALTER TABLE `rclv_4edicion` DISABLE KEYS */;
/*!40000 ALTER TABLE `rclv_4edicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_dias`
--

DROP TABLE IF EXISTS `rclv_dias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_dias` (
  `id` smallint(5) unsigned NOT NULL,
  `dia` tinyint(3) unsigned NOT NULL,
  `mes_id` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mes_id` (`mes_id`),
  CONSTRAINT `rclv_dias_ibfk_1` FOREIGN KEY (`mes_id`) REFERENCES `rclv_meses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_dias`
--

LOCK TABLES `rclv_dias` WRITE;
/*!40000 ALTER TABLE `rclv_dias` DISABLE KEYS */;
INSERT INTO `rclv_dias` VALUES (1,1,1,'1/ene'),(2,2,1,'2/ene'),(3,3,1,'3/ene'),(4,4,1,'4/ene'),(5,5,1,'5/ene'),(6,6,1,'6/ene'),(7,7,1,'7/ene'),(8,8,1,'8/ene'),(9,9,1,'9/ene'),(10,10,1,'10/ene'),(11,11,1,'11/ene'),(12,12,1,'12/ene'),(13,13,1,'13/ene'),(14,14,1,'14/ene'),(15,15,1,'15/ene'),(16,16,1,'16/ene'),(17,17,1,'17/ene'),(18,18,1,'18/ene'),(19,19,1,'19/ene'),(20,20,1,'20/ene'),(21,21,1,'21/ene'),(22,22,1,'22/ene'),(23,23,1,'23/ene'),(24,24,1,'24/ene'),(25,25,1,'25/ene'),(26,26,1,'26/ene'),(27,27,1,'27/ene'),(28,28,1,'28/ene'),(29,29,1,'29/ene'),(30,30,1,'30/ene'),(31,31,1,'31/ene'),(32,1,2,'1/feb'),(33,2,2,'2/feb'),(34,3,2,'3/feb'),(35,4,2,'4/feb'),(36,5,2,'5/feb'),(37,6,2,'6/feb'),(38,7,2,'7/feb'),(39,8,2,'8/feb'),(40,9,2,'9/feb'),(41,10,2,'10/feb'),(42,11,2,'11/feb'),(43,12,2,'12/feb'),(44,13,2,'13/feb'),(45,14,2,'14/feb'),(46,15,2,'15/feb'),(47,16,2,'16/feb'),(48,17,2,'17/feb'),(49,18,2,'18/feb'),(50,19,2,'19/feb'),(51,20,2,'20/feb'),(52,21,2,'21/feb'),(53,22,2,'22/feb'),(54,23,2,'23/feb'),(55,24,2,'24/feb'),(56,25,2,'25/feb'),(57,26,2,'26/feb'),(58,27,2,'27/feb'),(59,28,2,'28/feb'),(60,29,2,'29/feb'),(61,1,3,'1/mar'),(62,2,3,'2/mar'),(63,3,3,'3/mar'),(64,4,3,'4/mar'),(65,5,3,'5/mar'),(66,6,3,'6/mar'),(67,7,3,'7/mar'),(68,8,3,'8/mar'),(69,9,3,'9/mar'),(70,10,3,'10/mar'),(71,11,3,'11/mar'),(72,12,3,'12/mar'),(73,13,3,'13/mar'),(74,14,3,'14/mar'),(75,15,3,'15/mar'),(76,16,3,'16/mar'),(77,17,3,'17/mar'),(78,18,3,'18/mar'),(79,19,3,'19/mar'),(80,20,3,'20/mar'),(81,21,3,'21/mar'),(82,22,3,'22/mar'),(83,23,3,'23/mar'),(84,24,3,'24/mar'),(85,25,3,'25/mar'),(86,26,3,'26/mar'),(87,27,3,'27/mar'),(88,28,3,'28/mar'),(89,29,3,'29/mar'),(90,30,3,'30/mar'),(91,31,3,'31/mar'),(92,1,4,'1/abr'),(93,2,4,'2/abr'),(94,3,4,'3/abr'),(95,4,4,'4/abr'),(96,5,4,'5/abr'),(97,6,4,'6/abr'),(98,7,4,'7/abr'),(99,8,4,'8/abr'),(100,9,4,'9/abr'),(101,10,4,'10/abr'),(102,11,4,'11/abr'),(103,12,4,'12/abr'),(104,13,4,'13/abr'),(105,14,4,'14/abr'),(106,15,4,'15/abr'),(107,16,4,'16/abr'),(108,17,4,'17/abr'),(109,18,4,'18/abr'),(110,19,4,'19/abr'),(111,20,4,'20/abr'),(112,21,4,'21/abr'),(113,22,4,'22/abr'),(114,23,4,'23/abr'),(115,24,4,'24/abr'),(116,25,4,'25/abr'),(117,26,4,'26/abr'),(118,27,4,'27/abr'),(119,28,4,'28/abr'),(120,29,4,'29/abr'),(121,30,4,'30/abr'),(122,1,5,'1/may'),(123,2,5,'2/may'),(124,3,5,'3/may'),(125,4,5,'4/may'),(126,5,5,'5/may'),(127,6,5,'6/may'),(128,7,5,'7/may'),(129,8,5,'8/may'),(130,9,5,'9/may'),(131,10,5,'10/may'),(132,11,5,'11/may'),(133,12,5,'12/may'),(134,13,5,'13/may'),(135,14,5,'14/may'),(136,15,5,'15/may'),(137,16,5,'16/may'),(138,17,5,'17/may'),(139,18,5,'18/may'),(140,19,5,'19/may'),(141,20,5,'20/may'),(142,21,5,'21/may'),(143,22,5,'22/may'),(144,23,5,'23/may'),(145,24,5,'24/may'),(146,25,5,'25/may'),(147,26,5,'26/may'),(148,27,5,'27/may'),(149,28,5,'28/may'),(150,29,5,'29/may'),(151,30,5,'30/may'),(152,31,5,'31/may'),(153,1,6,'1/jun'),(154,2,6,'2/jun'),(155,3,6,'3/jun'),(156,4,6,'4/jun'),(157,5,6,'5/jun'),(158,6,6,'6/jun'),(159,7,6,'7/jun'),(160,8,6,'8/jun'),(161,9,6,'9/jun'),(162,10,6,'10/jun'),(163,11,6,'11/jun'),(164,12,6,'12/jun'),(165,13,6,'13/jun'),(166,14,6,'14/jun'),(167,15,6,'15/jun'),(168,16,6,'16/jun'),(169,17,6,'17/jun'),(170,18,6,'18/jun'),(171,19,6,'19/jun'),(172,20,6,'20/jun'),(173,21,6,'21/jun'),(174,22,6,'22/jun'),(175,23,6,'23/jun'),(176,24,6,'24/jun'),(177,25,6,'25/jun'),(178,26,6,'26/jun'),(179,27,6,'27/jun'),(180,28,6,'28/jun'),(181,29,6,'29/jun'),(182,30,6,'30/jun'),(183,1,7,'1/jul'),(184,2,7,'2/jul'),(185,3,7,'3/jul'),(186,4,7,'4/jul'),(187,5,7,'5/jul'),(188,6,7,'6/jul'),(189,7,7,'7/jul'),(190,8,7,'8/jul'),(191,9,7,'9/jul'),(192,10,7,'10/jul'),(193,11,7,'11/jul'),(194,12,7,'12/jul'),(195,13,7,'13/jul'),(196,14,7,'14/jul'),(197,15,7,'15/jul'),(198,16,7,'16/jul'),(199,17,7,'17/jul'),(200,18,7,'18/jul'),(201,19,7,'19/jul'),(202,20,7,'20/jul'),(203,21,7,'21/jul'),(204,22,7,'22/jul'),(205,23,7,'23/jul'),(206,24,7,'24/jul'),(207,25,7,'25/jul'),(208,26,7,'26/jul'),(209,27,7,'27/jul'),(210,28,7,'28/jul'),(211,29,7,'29/jul'),(212,30,7,'30/jul'),(213,31,7,'31/jul'),(214,1,8,'1/ago'),(215,2,8,'2/ago'),(216,3,8,'3/ago'),(217,4,8,'4/ago'),(218,5,8,'5/ago'),(219,6,8,'6/ago'),(220,7,8,'7/ago'),(221,8,8,'8/ago'),(222,9,8,'9/ago'),(223,10,8,'10/ago'),(224,11,8,'11/ago'),(225,12,8,'12/ago'),(226,13,8,'13/ago'),(227,14,8,'14/ago'),(228,15,8,'15/ago'),(229,16,8,'16/ago'),(230,17,8,'17/ago'),(231,18,8,'18/ago'),(232,19,8,'19/ago'),(233,20,8,'20/ago'),(234,21,8,'21/ago'),(235,22,8,'22/ago'),(236,23,8,'23/ago'),(237,24,8,'24/ago'),(238,25,8,'25/ago'),(239,26,8,'26/ago'),(240,27,8,'27/ago'),(241,28,8,'28/ago'),(242,29,8,'29/ago'),(243,30,8,'30/ago'),(244,31,8,'31/ago'),(245,1,9,'1/sep'),(246,2,9,'2/sep'),(247,3,9,'3/sep'),(248,4,9,'4/sep'),(249,5,9,'5/sep'),(250,6,9,'6/sep'),(251,7,9,'7/sep'),(252,8,9,'8/sep'),(253,9,9,'9/sep'),(254,10,9,'10/sep'),(255,11,9,'11/sep'),(256,12,9,'12/sep'),(257,13,9,'13/sep'),(258,14,9,'14/sep'),(259,15,9,'15/sep'),(260,16,9,'16/sep'),(261,17,9,'17/sep'),(262,18,9,'18/sep'),(263,19,9,'19/sep'),(264,20,9,'20/sep'),(265,21,9,'21/sep'),(266,22,9,'22/sep'),(267,23,9,'23/sep'),(268,24,9,'24/sep'),(269,25,9,'25/sep'),(270,26,9,'26/sep'),(271,27,9,'27/sep'),(272,28,9,'28/sep'),(273,29,9,'29/sep'),(274,30,9,'30/sep'),(275,1,10,'1/oct'),(276,2,10,'2/oct'),(277,3,10,'3/oct'),(278,4,10,'4/oct'),(279,5,10,'5/oct'),(280,6,10,'6/oct'),(281,7,10,'7/oct'),(282,8,10,'8/oct'),(283,9,10,'9/oct'),(284,10,10,'10/oct'),(285,11,10,'11/oct'),(286,12,10,'12/oct'),(287,13,10,'13/oct'),(288,14,10,'14/oct'),(289,15,10,'15/oct'),(290,16,10,'16/oct'),(291,17,10,'17/oct'),(292,18,10,'18/oct'),(293,19,10,'19/oct'),(294,20,10,'20/oct'),(295,21,10,'21/oct'),(296,22,10,'22/oct'),(297,23,10,'23/oct'),(298,24,10,'24/oct'),(299,25,10,'25/oct'),(300,26,10,'26/oct'),(301,27,10,'27/oct'),(302,28,10,'28/oct'),(303,29,10,'29/oct'),(304,30,10,'30/oct'),(305,31,10,'31/oct'),(306,1,11,'1/nov'),(307,2,11,'2/nov'),(308,3,11,'3/nov'),(309,4,11,'4/nov'),(310,5,11,'5/nov'),(311,6,11,'6/nov'),(312,7,11,'7/nov'),(313,8,11,'8/nov'),(314,9,11,'9/nov'),(315,10,11,'10/nov'),(316,11,11,'11/nov'),(317,12,11,'12/nov'),(318,13,11,'13/nov'),(319,14,11,'14/nov'),(320,15,11,'15/nov'),(321,16,11,'16/nov'),(322,17,11,'17/nov'),(323,18,11,'18/nov'),(324,19,11,'19/nov'),(325,20,11,'20/nov'),(326,21,11,'21/nov'),(327,22,11,'22/nov'),(328,23,11,'23/nov'),(329,24,11,'24/nov'),(330,25,11,'25/nov'),(331,26,11,'26/nov'),(332,27,11,'27/nov'),(333,28,11,'28/nov'),(334,29,11,'29/nov'),(335,30,11,'30/nov'),(336,1,12,'1/dic'),(337,2,12,'2/dic'),(338,3,12,'3/dic'),(339,4,12,'4/dic'),(340,5,12,'5/dic'),(341,6,12,'6/dic'),(342,7,12,'7/dic'),(343,8,12,'8/dic'),(344,9,12,'9/dic'),(345,10,12,'10/dic'),(346,11,12,'11/dic'),(347,12,12,'12/dic'),(348,13,12,'13/dic'),(349,14,12,'14/dic'),(350,15,12,'15/dic'),(351,16,12,'16/dic'),(352,17,12,'17/dic'),(353,18,12,'18/dic'),(354,19,12,'19/dic'),(355,20,12,'20/dic'),(356,21,12,'21/dic'),(357,22,12,'22/dic'),(358,23,12,'23/dic'),(359,24,12,'24/dic'),(360,25,12,'25/dic'),(361,26,12,'26/dic'),(362,27,12,'27/dic'),(363,28,12,'28/dic'),(364,29,12,'29/dic'),(365,30,12,'30/dic'),(366,31,12,'31/dic');
/*!40000 ALTER TABLE `rclv_dias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_meses`
--

DROP TABLE IF EXISTS `rclv_meses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_meses` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  `abrev` varchar(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_meses`
--

LOCK TABLES `rclv_meses` WRITE;
/*!40000 ALTER TABLE `rclv_meses` DISABLE KEYS */;
INSERT INTO `rclv_meses` VALUES (1,'Enero','ene'),(2,'Febrero','feb'),(3,'Marzo','mar'),(4,'Abril','abr'),(5,'Mayo','may'),(6,'Junio','jun'),(7,'Julio','jul'),(8,'Agosto','ago'),(9,'Septiembre','sep'),(10,'Octubre','oct'),(11,'Noviembre','nov'),(12,'Diciembre','dic');
/*!40000 ALTER TABLE `rclv_meses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rclv_procs_canon`
--

DROP TABLE IF EXISTS `rclv_procs_canon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_procs_canon` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rclv_procs_canon`
--

LOCK TABLES `rclv_procs_canon` WRITE;
/*!40000 ALTER TABLE `rclv_procs_canon` DISABLE KEYS */;
INSERT INTO `rclv_procs_canon` VALUES ('BT',2,'Beato/a'),('BTM',2,'Beata'),('BTV',2,'Beato'),('SD',4,'Siervo/a de Dios'),('SDM',4,'Sierva de Dios'),('SDV',4,'Siervo de Dios'),('ST',1,'Santo/a'),('STM',1,'Santa'),('STV',1,'Santo'),('VN',3,'Venerable'),('VNM',3,'Venerable'),('VNV',3,'Venerable');
/*!40000 ALTER TABLE `rclv_procs_canon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `us_roles`
--

DROP TABLE IF EXISTS `us_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `us_roles` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `perm_inputs` tinyint(1) NOT NULL,
  `revisor_ents` tinyint(1) NOT NULL,
  `revisor_us` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `us_roles`
--

LOCK TABLES `us_roles` WRITE;
/*!40000 ALTER TABLE `us_roles` DISABLE KEYS */;
INSERT INTO `us_roles` VALUES (1,1,'Consultas',0,0,0),(2,2,'Permiso Inputs',1,0,0),(3,3,'Gestor de Productos',1,1,0),(4,4,'Gestor de Usuarios',1,0,1),(5,5,'Omnipotente',1,1,1);
/*!40000 ALTER TABLE `us_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `us_status_registro`
--

DROP TABLE IF EXISTS `us_status_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `us_status_registro` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `mail_a_validar` tinyint(1) DEFAULT NULL,
  `mail_validado` tinyint(1) DEFAULT NULL,
  `editables` tinyint(1) DEFAULT NULL,
  `ident_a_validar` tinyint(1) DEFAULT NULL,
  `ident_validada` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `us_status_registro`
--

LOCK TABLES `us_status_registro` WRITE;
/*!40000 ALTER TABLE `us_status_registro` DISABLE KEYS */;
INSERT INTO `us_status_registro` VALUES (1,1,'Mail a validar',1,NULL,NULL,NULL,NULL),(2,2,'Mail validado',NULL,1,NULL,NULL,NULL),(3,3,'Editables',NULL,NULL,1,NULL,NULL),(4,4,'Identidad a validar',NULL,NULL,NULL,1,NULL),(5,5,'Identidad validada',NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `us_status_registro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `apellido` varchar(30) DEFAULT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `pais_id` varchar(2) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `rol_usuario_id` tinyint(3) unsigned DEFAULT 1,
  `bloqueo_perm_inputs` tinyint(1) DEFAULT 0,
  `mostrar_cartel_respons` tinyint(1) DEFAULT 1,
  `autorizado_fa` tinyint(1) DEFAULT 0,
  `docum_numero` varchar(15) DEFAULT NULL,
  `docum_pais_id` varchar(2) DEFAULT NULL,
  `docum_avatar` varchar(18) DEFAULT NULL,
  `dias_login` smallint(5) unsigned DEFAULT 1,
  `version_elc_ultimo_login` varchar(4) DEFAULT '1.0',
  `fecha_ultimo_login` date DEFAULT utc_date(),
  `fecha_contrasena` datetime DEFAULT utc_timestamp(),
  `fecha_revisores` datetime DEFAULT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `completado_en` datetime DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `prods_aprob` smallint(6) DEFAULT 0,
  `prods_rech` smallint(6) DEFAULT 0,
  `links_aprob` smallint(6) DEFAULT 0,
  `links_rech` smallint(6) DEFAULT 0,
  `edics_aprob` smallint(6) DEFAULT 0,
  `edics_rech` smallint(6) DEFAULT 0,
  `penalizac_acum` decimal(4,1) unsigned DEFAULT 0.0,
  `penalizado_en` datetime DEFAULT NULL,
  `penalizado_hasta` datetime DEFAULT NULL,
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `sexo_id` (`sexo_id`),
  KEY `pais_id` (`pais_id`),
  KEY `docum_pais_id` (`docum_pais_id`),
  KEY `rol_usuario_id` (`rol_usuario_id`),
  KEY `rol_iglesia_id` (`rol_iglesia_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `aux_paises` (`id`),
  CONSTRAINT `usuarios_ibfk_3` FOREIGN KEY (`docum_pais_id`) REFERENCES `aux_paises` (`id`),
  CONSTRAINT `usuarios_ibfk_4` FOREIGN KEY (`rol_usuario_id`) REFERENCES `us_roles` (`id`),
  CONSTRAINT `usuarios_ibfk_5` FOREIGN KEY (`rol_iglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `usuarios_ibfk_6` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `usuarios_ibfk_7` FOREIGN KEY (`status_registro_id`) REFERENCES `us_status_registro` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'sinMail1','sinContraseña','Configuración','inicial','Configuración inicial',NULL,NULL,NULL,NULL,NULL,2,0,1,0,NULL,NULL,NULL,1,'1.0','2022-12-20','2022-12-20 22:50:31',NULL,'2021-01-01 00:00:00','2021-01-02 00:00:00',NULL,0,0,0,0,0,0,0.0,NULL,NULL,NULL,NULL,NULL,5),(2,'sinMail2','sinContraseña','Datos','de start-up','Start-up',NULL,NULL,NULL,NULL,NULL,2,0,1,0,NULL,NULL,NULL,1,'1.0','2022-12-20','2022-12-20 22:50:31',NULL,'2021-01-01 00:00:00','2021-01-02 00:00:00',NULL,0,0,0,0,0,0,0.0,NULL,NULL,NULL,NULL,NULL,5),(10,'sp2015w@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Inés','Crespín','Ine','1617370359746.jpg','1969-08-16','M','AR','LC',2,0,0,1,'23198601','AR',NULL,7,'1.0','2022-12-22','2022-12-20 22:50:31',NULL,'2021-01-01 00:00:00','2021-01-02 00:00:00',NULL,0,0,0,0,1,0,0.0,NULL,NULL,NULL,NULL,NULL,5),(11,'diegoiribarren2015@gmail.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Diego','Iribarren','Diego','1632959816163.jpg','1969-08-16','V','AR','LC',5,0,0,1,'21072001',NULL,'1617370359747.jpg',3,'1.0','2022-12-22','2022-12-20 22:50:31',NULL,'2021-01-01 00:00:00','2021-01-02 00:00:00',NULL,0,0,0,0,0,0,0.0,NULL,NULL,NULL,NULL,NULL,5),(12,'consultas@qqq.com','$2a$10$HgYM70RzhLepP5ypwI4LYOyuQRd.Cb3NON2.K0r7hmNkbQgUodTRm','Consultas','Varias','Consultas','1662056805460.jpg','1969-08-16','V','AR','LC',1,0,1,1,NULL,NULL,NULL,1,'1.0','2022-12-20','2022-12-20 22:50:31',NULL,'2021-01-01 00:00:00','2021-01-02 00:00:00',NULL,0,0,0,0,0,0,0.0,NULL,NULL,NULL,NULL,NULL,3);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'elc_peliculas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-12-22 12:02:36
