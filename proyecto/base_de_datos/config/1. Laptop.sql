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
-- Table structure for table `aux_fechas_del_ano`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_fechas_del_ano` (
  `id` smallint(5) unsigned NOT NULL,
  `dia` tinyint(3) unsigned NOT NULL,
  `mes_id` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(9) NOT NULL,
  `epocaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `mes_id` (`mes_id`),
  KEY `epoca_del_ano_id` (`epocaDelAno_id`),
  CONSTRAINT `aux_fechas_del_ano_ibfk_1` FOREIGN KEY (`mes_id`) REFERENCES `aux_meses` (`id`),
  CONSTRAINT `aux_fechas_del_ano_ibfk_2` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_idiomas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_idiomas` (
  `id` varchar(2) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `masFrecuente` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_meses`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_meses` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  `abrev` varchar(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_mis_consultas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_mis_consultas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `entidad` varchar(14) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `visitadaEn` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3992 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_novedades_elc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_novedades_elc` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `comentario` varchar(60) CHARACTER SET utf8mb4 NOT NULL,
  `fecha` date NOT NULL DEFAULT utc_date(),
  `versionELC` varchar(4) CHARACTER SET utf8mb4 NOT NULL,
  `permInputs` tinyint(1) DEFAULT 0,
  `autTablEnts` tinyint(1) DEFAULT 0,
  `revisorPERL` tinyint(1) DEFAULT 0,
  `revisorLinks` tinyint(1) DEFAULT 0,
  `revisorEnts` tinyint(1) DEFAULT 0,
  `revisorUs` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_paises`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_paises` (
  `id` varchar(2) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `continente` varchar(20) NOT NULL,
  `idioma_id` varchar(2) NOT NULL,
  `zonaHoraria` tinyint(4) NOT NULL,
  `bandera` varchar(10) NOT NULL,
  `cantProds` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `aux_paises_FK` (`idioma_id`),
  CONSTRAINT `aux_paises_FK` FOREIGN KEY (`idioma_id`) REFERENCES `aux_idiomas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_roles_iglesia`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_roles_iglesia` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `plural` varchar(20) DEFAULT NULL,
  `grupo` tinyint(1) NOT NULL DEFAULT 0,
  `usuario` tinyint(1) NOT NULL,
  `personaje` tinyint(1) NOT NULL,
  `varon` tinyint(1) NOT NULL,
  `mujer` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_sexos`
--

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
-- Table structure for table `aux_status_registros`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_status_registros` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `codigo` varchar(15) NOT NULL,
  `creados` tinyint(1) DEFAULT 0,
  `aprobados` tinyint(1) DEFAULT 0,
  `estables` tinyint(1) DEFAULT 0,
  `provisorios` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_1fe_valores`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_1fe_valores` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(1) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_2entretiene`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_2entretiene` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(1) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_3calidad_tecnica`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_3calidad_tecnica` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(1) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_criterio`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_criterio` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `atributo` varchar(20) NOT NULL,
  `atributo_id` varchar(20) NOT NULL,
  `ponderacion` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_registros`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_registros` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `feValores_id` tinyint(1) unsigned NOT NULL,
  `entretiene_id` tinyint(1) unsigned NOT NULL,
  `calidadTecnica_id` tinyint(1) unsigned NOT NULL,
  `resultado` tinyint(3) unsigned NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `cal_1registros_FK` (`feValores_id`),
  KEY `entretiene` (`entretiene_id`),
  KEY `cal_1registros_FK_1` (`calidadTecnica_id`),
  CONSTRAINT `cal_1registros_FK` FOREIGN KEY (`feValores_id`) REFERENCES `cal_1fe_valores` (`id`),
  CONSTRAINT `cal_1registros_FK_1` FOREIGN KEY (`calidadTecnica_id`) REFERENCES `cal_3calidad_tecnica` (`id`),
  CONSTRAINT `cal_registros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `entretiene` FOREIGN KEY (`entretiene_id`) REFERENCES `cal_2entretiene` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cam_hist_edics`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_hist_edics` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `campo` varchar(20) NOT NULL,
  `titulo` varchar(51) NOT NULL,
  `valorDesc` varchar(100) DEFAULT NULL,
  `valorAprob` varchar(100) DEFAULT NULL,
  `penalizac` decimal(4,1) unsigned DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugeridoPor_id` int(10) unsigned NOT NULL,
  `sugeridoEn` datetime NOT NULL,
  `revisadoPor_id` int(10) unsigned NOT NULL,
  `revisadoEn` datetime NOT NULL,
  `comunicadoEn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `editado_por_id` (`sugeridoPor_id`),
  KEY `edic_revisada_por_id` (`revisadoPor_id`),
  CONSTRAINT `cam_hist_edics_ibfk_1` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_edics` (`id`),
  CONSTRAINT `cam_hist_edics_ibfk_2` FOREIGN KEY (`sugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cam_hist_edics_ibfk_3` FOREIGN KEY (`revisadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3988 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `sugeridoPor_id` int(10) unsigned NOT NULL,
  `revisadoPor_id` int(10) unsigned NOT NULL,
  `comentario` varchar(150) NOT NULL,
  `aprobado` tinyint(1) DEFAULT NULL,
  `penalizac` decimal(4,1) unsigned DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugeridoEn` datetime NOT NULL,
  `revisadoEn` datetime NOT NULL,
  `comunicadoEn` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sugerido_por_id` (`sugeridoPor_id`),
  KEY `revisado_por_id` (`revisadoPor_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `status_original_id` (`statusOriginal_id`),
  KEY `status_final_id` (`statusFinal_id`),
  CONSTRAINT `cam_hist_status_ibfk_1` FOREIGN KEY (`sugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_2` FOREIGN KEY (`revisadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_3` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_4` FOREIGN KEY (`statusOriginal_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `cam_hist_status_ibfk_5` FOREIGN KEY (`statusFinal_id`) REFERENCES `aux_status_registros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2713 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cam_motivos_edics`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_motivos_edics` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `descripcion` varchar(40) NOT NULL,
  `codigo` varchar(15) NOT NULL,
  `avatar_prods` tinyint(1) DEFAULT 0,
  `avatar_rclvs` tinyint(1) DEFAULT 0,
  `avatar_us` tinyint(1) DEFAULT 0,
  `prods` tinyint(1) DEFAULT 0,
  `rclvs` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `rev_edicion` tinyint(1) DEFAULT 0,
  `penalizac` decimal(4,1) unsigned DEFAULT 0.0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cam_motivos_status`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_motivos_status` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `descripcion` varchar(37) NOT NULL,
  `codigo` varchar(15) DEFAULT NULL,
  `prods` tinyint(1) DEFAULT 0,
  `rclvs` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `penalizac` decimal(4,1) unsigned DEFAULT 0.0,
  `agregarComent` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_config_cabecera`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_config_cabecera` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(30) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creadoEn` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cn_config_cabecera_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_config_campos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_config_campos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `configCons_id` int(10) unsigned NOT NULL,
  `campo` varchar(20) NOT NULL,
  `valor` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cabecera_id` (`configCons_id`),
  CONSTRAINT `cn_config_campos_ibfk_1` FOREIGN KEY (`configCons_id`) REFERENCES `cn_config_cabecera` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=840 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  UNIQUE KEY `Nombre_único` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_ents_por_opc`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_ents_por_opc` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `opcion_id` tinyint(1) unsigned NOT NULL,
  `entidad_id` tinyint(1) unsigned DEFAULT NULL,
  `nombre` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cn_ordenes_por_ent_FK` (`entidad_id`),
  KEY `cn_ordenes_por_ent_FK_1` (`opcion_id`),
  CONSTRAINT `cn_ordenes_por_ent_FK` FOREIGN KEY (`entidad_id`) REFERENCES `cn_entidades` (`id`),
  CONSTRAINT `cn_ordenes_por_ent_FK_1` FOREIGN KEY (`opcion_id`) REFERENCES `cn_opciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `links`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `prodAprob` tinyint(1) NOT NULL DEFAULT 0,
  `url` varchar(120) NOT NULL,
  `prov_id` tinyint(3) unsigned NOT NULL,
  `calidad` smallint(6) NOT NULL,
  `castellano` tinyint(1) NOT NULL,
  `subtitulos` tinyint(1) DEFAULT NULL,
  `gratuito` tinyint(1) NOT NULL,
  `tipo_id` tinyint(3) unsigned NOT NULL,
  `completo` tinyint(1) DEFAULT 1,
  `parte` varchar(3) NOT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `yaTuvoPrimRev` tinyint(1) NOT NULL DEFAULT 0,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime NOT NULL DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  KEY `links_ibfk_01` (`pelicula_id`),
  KEY `links_ibfk_02` (`coleccion_id`),
  KEY `links_ibfk_03` (`capitulo_id`),
  KEY `links_ibfk_04` (`tipo_id`),
  KEY `links_ibfk_05` (`prov_id`),
  KEY `links_ibfk_06` (`creadoPor_id`),
  KEY `links_ibfk_07` (`altaRevisadaPor_id`),
  KEY `links_ibfk_08` (`editadoPor_id`),
  KEY `links_ibfk_09` (`edicRevisadaPor_id`),
  KEY `links_ibfk_10` (`statusRegistro_id`),
  KEY `links_ibfk_11` (`statusSugeridoPor_id`),
  KEY `links_ibfk_12` (`motivo_id`),
  CONSTRAINT `links_ibfk_01` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `links_ibfk_02` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `links_ibfk_03` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `links_ibfk_04` FOREIGN KEY (`tipo_id`) REFERENCES `links_tipos` (`id`),
  CONSTRAINT `links_ibfk_05` FOREIGN KEY (`prov_id`) REFERENCES `links_provs` (`id`),
  CONSTRAINT `links_ibfk_06` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_07` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_08` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_09` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_10` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `links_ibfk_11` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_12` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1300 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `links_edicion`
--

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
  `subtitulos` tinyint(1) DEFAULT NULL,
  `gratuito` tinyint(1) DEFAULT NULL,
  `tipo_id` tinyint(3) unsigned DEFAULT NULL,
  `completo` tinyint(1) DEFAULT NULL,
  `parte` varchar(3) DEFAULT NULL,
  `editadoPor_id` int(10) unsigned NOT NULL,
  `editadoEn` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `link_id` (`link_id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `editado_por_id` (`editadoPor_id`),
  CONSTRAINT `links_edicion_ibfk_1` FOREIGN KEY (`link_id`) REFERENCES `links` (`id`),
  CONSTRAINT `links_edicion_ibfk_2` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `links_edicion_ibfk_3` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `links_edicion_ibfk_4` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `links_edicion_ibfk_5` FOREIGN KEY (`tipo_id`) REFERENCES `links_tipos` (`id`),
  CONSTRAINT `links_edicion_ibfk_6` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `links_provs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `links_provs` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned DEFAULT 90,
  `nombre` varchar(20) NOT NULL,
  `abierto` tinyint(1) DEFAULT 0,
  `permUso` tinyint(1) DEFAULT 0,
  `cantLinks` smallint(6) DEFAULT 0,
  `avatar` varchar(20) NOT NULL,
  `siemprePago` tinyint(1) DEFAULT 0,
  `siempreGratuito` tinyint(1) DEFAULT 0,
  `siempreCompleta` tinyint(1) DEFAULT 0,
  `calidad` smallint(6) DEFAULT NULL,
  `generico` tinyint(1) DEFAULT 0,
  `mostrarSiempre` tinyint(1) DEFAULT 0,
  `urlBuscarPre` varchar(25) DEFAULT NULL,
  `trailer` tinyint(1) DEFAULT 0,
  `pelicula` tinyint(1) DEFAULT 0,
  `urlBuscarPost` varchar(20) DEFAULT NULL,
  `urlDistintivo` varchar(20) NOT NULL,
  `embededQuitar` varchar(20) DEFAULT NULL,
  `embededPoner` varchar(20) DEFAULT NULL,
  `urlCopyright` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `url_distintivo` (`urlDistintivo`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `links_tipos`
--

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
-- Table structure for table `menu_capacitacion`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_capacitacion` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `titulo` varchar(30) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `icono` varchar(25) NOT NULL,
  `hr` tinyint(1) NOT NULL DEFAULT 0,
  `permInputs` tinyint(1) NOT NULL DEFAULT 0,
  `revisorPERL` tinyint(1) NOT NULL DEFAULT 0,
  `revisorLinks` tinyint(1) NOT NULL DEFAULT 0,
  `revisorEnts` tinyint(1) NOT NULL DEFAULT 0,
  `revisorUs` tinyint(1) NOT NULL DEFAULT 0,
  `actualizado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `titulo` (`titulo`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_usuario`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_usuario` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `titulo` varchar(30) NOT NULL,
  `icono` varchar(30) NOT NULL,
  `href` varchar(30) NOT NULL,
  `hr` tinyint(1) NOT NULL DEFAULT 0,
  `permInputs` tinyint(1) NOT NULL DEFAULT 0,
  `actualizado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `titulo` (`titulo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ppp_opciones`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ppp_opciones` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(25) NOT NULL,
  `codigo` varchar(15) NOT NULL,
  `icono` varchar(30) NOT NULL,
  `combo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ppp_registros`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ppp_registros` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `entidad` varchar(20) DEFAULT NULL,
  `entidad_id` int(10) unsigned DEFAULT NULL,
  `opcion_id` tinyint(3) unsigned DEFAULT NULL,
  `creadoEn` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `coleccion_id` (`entidad_id`) USING BTREE,
  KEY `int_opciones_id` (`opcion_id`) USING BTREE,
  KEY `pelicula_id` (`entidad`) USING BTREE,
  KEY `usuario_id` (`usuario_id`) USING BTREE,
  CONSTRAINT `regs_favoritos_ibfk_1_copy` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regs_favoritos_ibfk_5_copy` FOREIGN KEY (`opcion_id`) REFERENCES `ppp_opciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=415 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_1peliculas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_1peliculas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fuente` varchar(5) NOT NULL,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `nombreCastellano` varchar(70) DEFAULT NULL,
  `nombreOriginal` varchar(70) DEFAULT NULL,
  `anoEstreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idiomaOriginal_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `bhr` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipoActuacion_id` tinyint(1) unsigned DEFAULT NULL,
  `publico_id` tinyint(1) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `tema_id` smallint(5) unsigned DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epocaDelAno_id` smallint(5) unsigned DEFAULT 1,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `epocaEstreno_id` tinyint(1) unsigned DEFAULT NULL,
  `linksTrailer` tinyint(1) unsigned DEFAULT 0,
  `linksGral` tinyint(1) unsigned DEFAULT 0,
  `linksGratis` tinyint(1) unsigned DEFAULT 0,
  `linksCast` tinyint(1) unsigned DEFAULT 0,
  `linksSubt` tinyint(1) unsigned DEFAULT 0,
  `HD_Gral` tinyint(1) unsigned DEFAULT 0,
  `HD_Gratis` tinyint(1) unsigned DEFAULT 0,
  `HD_Cast` tinyint(1) unsigned DEFAULT 0,
  `HD_Subt` tinyint(1) unsigned DEFAULT 0,
  `feValores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidadTecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `azar` mediumint(8) unsigned DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `altaTermEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `prod_1peliculas_ibfk_01` (`tipoActuacion_id`),
  KEY `prod_1peliculas_ibfk_02` (`publico_id`),
  KEY `prod_1peliculas_ibfk_03` (`idiomaOriginal_id`),
  KEY `prod_1peliculas_ibfk_04` (`personaje_id`),
  KEY `prod_1peliculas_ibfk_05` (`hecho_id`),
  KEY `prod_1peliculas_ibfk_06` (`tema_id`),
  KEY `prod_1peliculas_ibfk_07` (`evento_id`),
  KEY `prod_1peliculas_ibfk_08` (`epocaDelAno_id`),
  KEY `prod_1peliculas_ibfk_09` (`creadoPor_id`),
  KEY `prod_1peliculas_ibfk_10` (`altaRevisadaPor_id`),
  KEY `prod_1peliculas_ibfk_11` (`editadoPor_id`),
  KEY `prod_1peliculas_ibfk_12` (`edicRevisadaPor_id`),
  KEY `prod_1peliculas_ibfk_13` (`statusSugeridoPor_id`),
  KEY `prod_1peliculas_ibfk_14` (`capturadoPor_id`),
  KEY `prod_1peliculas_ibfk_15` (`statusRegistro_id`),
  KEY `prod_1peliculas_ibfk_16` (`motivo_id`),
  KEY `prod_1peliculas_FK` (`epocaOcurrencia_id`),
  KEY `prod_1peliculas_FK_1` (`epocaEstreno_id`),
  CONSTRAINT `prod_1peliculas_FK` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `prod_1peliculas_FK_1` FOREIGN KEY (`epocaEstreno_id`) REFERENCES `prod_epocas_estreno` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_01` FOREIGN KEY (`tipoActuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_02` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_03` FOREIGN KEY (`idiomaOriginal_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_04` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_05` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_06` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_07` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_08` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_09` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_10` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_11` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_12` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_13` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_14` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_15` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_16` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=548 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_2colecciones`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_2colecciones` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fuente` varchar(5) NOT NULL,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `TMDB_entidad` varchar(10) DEFAULT NULL,
  `nombreCastellano` varchar(70) DEFAULT NULL,
  `nombreOriginal` varchar(70) DEFAULT NULL,
  `anoEstreno` smallint(5) unsigned DEFAULT NULL,
  `anoFin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idiomaOriginal_id` varchar(2) DEFAULT NULL,
  `cantTemps` tinyint(3) unsigned DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(50) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `bhr` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipoActuacion_id` tinyint(1) unsigned DEFAULT NULL,
  `publico_id` tinyint(1) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `tema_id` smallint(5) unsigned DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epocaDelAno_id` smallint(5) unsigned DEFAULT 1,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `epocaEstreno_id` tinyint(1) unsigned DEFAULT NULL,
  `linksTrailer` tinyint(1) unsigned DEFAULT 0,
  `linksGral` tinyint(1) unsigned DEFAULT 0,
  `linksGratis` tinyint(1) unsigned DEFAULT 0,
  `linksCast` tinyint(1) unsigned DEFAULT 0,
  `linksSubt` tinyint(1) unsigned DEFAULT 0,
  `HD_Gral` tinyint(1) unsigned DEFAULT 0,
  `HD_Gratis` tinyint(1) unsigned DEFAULT 0,
  `HD_Cast` tinyint(1) unsigned DEFAULT 0,
  `HD_Subt` tinyint(1) unsigned DEFAULT 0,
  `feValores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidadTecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `azar` mediumint(8) unsigned DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `altaTermEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  KEY `prod_2colecciones_ibfk_01` (`publico_id`),
  KEY `prod_2colecciones_ibfk_02` (`tipoActuacion_id`),
  KEY `prod_2colecciones_ibfk_03` (`personaje_id`),
  KEY `prod_2colecciones_ibfk_04` (`hecho_id`),
  KEY `prod_2colecciones_ibfk_05` (`tema_id`),
  KEY `prod_2colecciones_ibfk_06` (`evento_id`),
  KEY `prod_2colecciones_ibfk_07` (`epocaDelAno_id`),
  KEY `prod_2colecciones_ibfk_08` (`creadoPor_id`),
  KEY `prod_2colecciones_ibfk_09` (`altaRevisadaPor_id`),
  KEY `prod_2colecciones_ibfk_10` (`editadoPor_id`),
  KEY `prod_2colecciones_ibfk_11` (`edicRevisadaPor_id`),
  KEY `prod_2colecciones_ibfk_12` (`statusSugeridoPor_id`),
  KEY `prod_2colecciones_ibfk_13` (`capturadoPor_id`),
  KEY `prod_2colecciones_ibfk_14` (`statusRegistro_id`),
  KEY `prod_2colecciones_ibfk_15` (`motivo_id`),
  KEY `prod_2colecciones_FK` (`epocaOcurrencia_id`),
  KEY `prod_2colecciones_FK_1` (`epocaEstreno_id`),
  CONSTRAINT `prod_2colecciones_FK` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `prod_2colecciones_FK_1` FOREIGN KEY (`epocaEstreno_id`) REFERENCES `prod_epocas_estreno` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_01` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_02` FOREIGN KEY (`tipoActuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_03` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_04` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_05` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_06` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_07` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_08` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_09` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_10` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_11` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_12` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_13` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_14` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_15` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_3capitulos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_3capitulos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `coleccion_id` int(10) unsigned NOT NULL,
  `temporada` tinyint(3) unsigned NOT NULL,
  `capitulo` tinyint(3) unsigned NOT NULL,
  `fuente` varchar(10) NOT NULL,
  `TMDB_id` varchar(10) DEFAULT NULL,
  `FA_id` varchar(10) DEFAULT NULL,
  `IMDB_id` varchar(10) DEFAULT NULL,
  `nombreCastellano` varchar(70) DEFAULT NULL,
  `nombreOriginal` varchar(70) DEFAULT NULL,
  `anoEstreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` tinyint(3) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idiomaOriginal_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `bhr` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipoActuacion_id` tinyint(1) unsigned DEFAULT NULL,
  `publico_id` tinyint(1) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `tema_id` smallint(5) unsigned DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epocaDelAno_id` smallint(5) unsigned DEFAULT 1,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `epocaEstreno_id` tinyint(1) unsigned DEFAULT NULL,
  `linksTrailer` tinyint(1) unsigned DEFAULT 0,
  `linksGral` tinyint(1) unsigned DEFAULT 0,
  `linksGratis` tinyint(1) unsigned DEFAULT 0,
  `linksCast` tinyint(1) unsigned DEFAULT 0,
  `linksSubt` tinyint(1) unsigned DEFAULT 0,
  `HD_Gral` tinyint(1) unsigned DEFAULT 0,
  `HD_Gratis` tinyint(1) unsigned DEFAULT 0,
  `HD_Cast` tinyint(1) unsigned DEFAULT 0,
  `HD_Subt` tinyint(1) unsigned DEFAULT 0,
  `feValores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidadTecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `altaTermEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusColeccion_id` tinyint(3) unsigned DEFAULT 1,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `prod_3capitulos_ibfk_01` (`coleccion_id`),
  KEY `prod_3capitulos_ibfk_02` (`tipoActuacion_id`),
  KEY `prod_3capitulos_ibfk_03` (`idiomaOriginal_id`),
  KEY `prod_3capitulos_ibfk_04` (`publico_id`),
  KEY `prod_3capitulos_ibfk_05` (`personaje_id`),
  KEY `prod_3capitulos_ibfk_06` (`hecho_id`),
  KEY `prod_3capitulos_ibfk_07` (`tema_id`),
  KEY `prod_3capitulos_ibfk_08` (`evento_id`),
  KEY `prod_3capitulos_ibfk_09` (`epocaDelAno_id`),
  KEY `prod_3capitulos_ibfk_10` (`creadoPor_id`),
  KEY `prod_3capitulos_ibfk_11` (`altaRevisadaPor_id`),
  KEY `prod_3capitulos_ibfk_12` (`editadoPor_id`),
  KEY `prod_3capitulos_ibfk_13` (`edicRevisadaPor_id`),
  KEY `prod_3capitulos_ibfk_14` (`statusSugeridoPor_id`),
  KEY `prod_3capitulos_ibfk_15` (`capturadoPor_id`),
  KEY `prod_3capitulos_ibfk_16` (`statusRegistro_id`),
  KEY `prod_3capitulos_ibfk_17` (`motivo_id`),
  KEY `prod_3capitulos_FK` (`epocaOcurrencia_id`),
  KEY `prod_3capitulos_FK_1` (`statusColeccion_id`),
  KEY `prod_3capitulos_FK_2` (`epocaEstreno_id`),
  CONSTRAINT `prod_3capitulos_FK` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `prod_3capitulos_FK_1` FOREIGN KEY (`statusColeccion_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_3capitulos_FK_2` FOREIGN KEY (`epocaEstreno_id`) REFERENCES `prod_epocas_estreno` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_01` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_02` FOREIGN KEY (`tipoActuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_03` FOREIGN KEY (`idiomaOriginal_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_04` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_05` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_06` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_07` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_08` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_09` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_10` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_11` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_12` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_13` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_14` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_15` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_16` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_17` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1409 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_9edicion`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_9edicion` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pelicula_id` int(10) unsigned DEFAULT NULL,
  `coleccion_id` int(10) unsigned DEFAULT NULL,
  `capitulo_id` int(10) unsigned DEFAULT NULL,
  `nombreCastellano` varchar(70) DEFAULT NULL,
  `nombreOriginal` varchar(70) DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `anoEstreno` smallint(5) unsigned DEFAULT NULL,
  `anoFin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idiomaOriginal_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(900) DEFAULT NULL,
  `avatar` varchar(18) DEFAULT NULL,
  `avatarUrl` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `bhr` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipoActuacion_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_id` smallint(5) unsigned DEFAULT NULL,
  `tema_id` smallint(5) unsigned DEFAULT NULL,
  `evento_id` smallint(5) unsigned DEFAULT NULL,
  `epocaDelAno_id` smallint(5) unsigned DEFAULT NULL,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `editadoPor_id` int(10) unsigned NOT NULL,
  `editadoEn` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `prod_9edicion_ibfk_01` (`tipoActuacion_id`),
  KEY `prod_9edicion_ibfk_02` (`idiomaOriginal_id`),
  KEY `prod_9edicion_ibfk_03` (`publico_id`),
  KEY `prod_9edicion_ibfk_04` (`pelicula_id`),
  KEY `prod_9edicion_ibfk_05` (`coleccion_id`),
  KEY `prod_9edicion_ibfk_06` (`capitulo_id`),
  KEY `prod_9edicion_ibfk_07` (`personaje_id`),
  KEY `prod_9edicion_ibfk_08` (`hecho_id`),
  KEY `prod_9edicion_ibfk_09` (`tema_id`),
  KEY `prod_9edicion_ibfk_10` (`evento_id`),
  KEY `prod_9edicion_ibfk_11` (`epocaDelAno_id`),
  KEY `prod_9edicion_ibfk_12` (`editadoPor_id`),
  KEY `prod_9edicion_FK` (`epocaOcurrencia_id`),
  CONSTRAINT `prod_9edicion_FK` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_01` FOREIGN KEY (`tipoActuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_02` FOREIGN KEY (`idiomaOriginal_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_03` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_04` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_05` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_06` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_07` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_08` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_09` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_10` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_11` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_12` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1190 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_categ1`
--

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
-- Table structure for table `prod_epocas_estreno`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_epocas_estreno` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(15) NOT NULL,
  `desde` smallint(4) unsigned NOT NULL,
  `hasta` smallint(4) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_publicos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_publicos` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(1) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `grupo` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_tipos_actuac`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_tipos_actuac` (
  `id` tinyint(1) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(1) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `codigo` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_1personajes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_1personajes` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(35) NOT NULL,
  `apodo` varchar(35) DEFAULT NULL,
  `prodsAprob` tinyint(1) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 400,
  `fechaMovil` tinyint(1) DEFAULT 0,
  `anoFM` smallint(4) DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `anoNacim` smallint(4) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `rolIglesia_id` varchar(3) DEFAULT NULL,
  `canon_id` varchar(3) DEFAULT NULL,
  `apMar_id` smallint(5) unsigned DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `rclv_1personajes_ibfk_01` (`epocaOcurrencia_id`),
  KEY `rclv_1personajes_ibfk_02` (`fechaDelAno_id`),
  KEY `rclv_1personajes_ibfk_03` (`edicRevisadaPor_id`),
  KEY `rclv_1personajes_ibfk_04` (`statusRegistro_id`),
  KEY `rclv_1personajes_ibfk_05` (`statusSugeridoPor_id`),
  KEY `rclv_1personajes_ibfk_06` (`motivo_id`),
  KEY `rclv_1personajes_ibfk_07` (`capturadoPor_id`),
  KEY `rclv_1personajes_ibfk_08` (`apMar_id`),
  KEY `rclv_1personajes_ibfk_09` (`sexo_id`),
  KEY `rclv_1personajes_ibfk_10` (`categoria_id`),
  KEY `rclv_1personajes_ibfk_11` (`canon_id`),
  KEY `rclv_1personajes_ibfk_12` (`rolIglesia_id`),
  KEY `rclv_1personajes_ibfk_13` (`creadoPor_id`),
  KEY `rclv_1personajes_ibfk_14` (`altaRevisadaPor_id`),
  KEY `rclv_1personajes_ibfk_15` (`editadoPor_id`),
  CONSTRAINT `rclv_1personajes_ibfk_01` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_02` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_03` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_04` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_05` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_06` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_07` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_08` FOREIGN KEY (`apMar_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_09` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_10` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_11` FOREIGN KEY (`canon_id`) REFERENCES `rclv_canons` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_12` FOREIGN KEY (`rolIglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_13` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_14` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_15` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_2hechos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_2hechos` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(35) NOT NULL,
  `prodsAprob` tinyint(1) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 400,
  `fechaMovil` tinyint(1) DEFAULT 0,
  `anoFM` smallint(4) DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `anoComienzo` smallint(6) DEFAULT NULL,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `soloCfc` tinyint(1) DEFAULT 0,
  `ama` tinyint(1) DEFAULT 0,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `rclv_2hechos_ibfk_01` (`fechaDelAno_id`),
  KEY `rclv_2hechos_ibfk_02` (`epocaOcurrencia_id`),
  KEY `rclv_2hechos_ibfk_03` (`creadoPor_id`),
  KEY `rclv_2hechos_ibfk_04` (`altaRevisadaPor_id`),
  KEY `rclv_2hechos_ibfk_05` (`editadoPor_id`),
  KEY `rclv_2hechos_ibfk_06` (`edicRevisadaPor_id`),
  KEY `rclv_2hechos_ibfk_07` (`statusSugeridoPor_id`),
  KEY `rclv_2hechos_ibfk_08` (`capturadoPor_id`),
  KEY `rclv_2hechos_ibfk_09` (`statusRegistro_id`),
  KEY `rclv_2hechos_ibfk_10` (`motivo_id`),
  CONSTRAINT `rclv_2hechos_ibfk_01` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_02` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_03` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_04` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_05` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_06` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_07` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_08` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_09` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_10` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_3temas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_3temas` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(35) NOT NULL,
  `prodsAprob` tinyint(1) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 400,
  `fechaMovil` tinyint(1) DEFAULT 0,
  `anoFM` smallint(4) DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`fechaDelAno_id`),
  KEY `creado_por_id` (`creadoPor_id`),
  KEY `alta_revisada_por_id` (`altaRevisadaPor_id`),
  KEY `editado_por_id` (`editadoPor_id`),
  KEY `edic_revisada_por_id` (`edicRevisadaPor_id`),
  KEY `status_registro_id` (`statusRegistro_id`),
  KEY `sugerido_por_id` (`statusSugeridoPor_id`),
  KEY `capturado_por_id` (`capturadoPor_id`),
  KEY `motivo_id` (`motivo_id`),
  CONSTRAINT `rclv_3temas_ibfk_1` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_2` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_3` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_4` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_5` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_6` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_7` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_8` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_9` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_4eventos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_4eventos` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(35) NOT NULL,
  `prodsAprob` tinyint(1) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 400,
  `fechaMovil` tinyint(1) DEFAULT 1,
  `anoFM` smallint(4) DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `creado_por_id` (`creadoPor_id`),
  KEY `alta_revisada_por_id` (`altaRevisadaPor_id`),
  KEY `editado_por_id` (`editadoPor_id`),
  KEY `edic_revisada_por_id` (`edicRevisadaPor_id`),
  KEY `status_registro_id` (`statusRegistro_id`),
  KEY `sugerido_por_id` (`statusSugeridoPor_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturadoPor_id`),
  KEY `rclv_4eventos_FK` (`fechaDelAno_id`),
  CONSTRAINT `rclv_4eventos_FK` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_1` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_2` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_3` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_4` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_5` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_6` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_7` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`),
  CONSTRAINT `rclv_4eventos_ibfk_8` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_5epocas_del_ano`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_5epocas_del_ano` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(35) NOT NULL,
  `prodsAprob` tinyint(1) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned NOT NULL DEFAULT 400,
  `fechaMovil` tinyint(1) DEFAULT 0,
  `anoFM` smallint(4) DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `diasDeDuracion` smallint(5) unsigned DEFAULT NULL,
  `comentarioDuracion` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `carpetaAvatars` varchar(20) DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `solapamiento` tinyint(1) DEFAULT NULL,
  `creadoPor_id` int(10) unsigned NOT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `altaRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `altaRevisadaEn` datetime DEFAULT NULL,
  `leadTimeCreacion` decimal(4,2) unsigned DEFAULT NULL,
  `statusSugeridoPor_id` int(10) unsigned NOT NULL,
  `statusSugeridoEn` datetime DEFAULT utc_timestamp(),
  `editadoPor_id` int(10) unsigned DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `edicRevisadaPor_id` int(10) unsigned DEFAULT NULL,
  `edicRevisadaEn` datetime DEFAULT NULL,
  `leadTimeEdicion` decimal(4,2) unsigned DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `statusRegistro_id` tinyint(3) unsigned DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`fechaDelAno_id`),
  KEY `creado_por_id` (`creadoPor_id`),
  KEY `alta_revisada_por_id` (`altaRevisadaPor_id`),
  KEY `editado_por_id` (`editadoPor_id`),
  KEY `edic_revisada_por_id` (`edicRevisadaPor_id`),
  KEY `sugerido_por_id` (`statusSugeridoPor_id`),
  KEY `capturado_por_id` (`capturadoPor_id`),
  KEY `status_registro_id` (`statusRegistro_id`),
  KEY `motivo_id` (`motivo_id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_1` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_2` FOREIGN KEY (`creadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_3` FOREIGN KEY (`altaRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_4` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_5` FOREIGN KEY (`edicRevisadaPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_6` FOREIGN KEY (`statusSugeridoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_7` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_8` FOREIGN KEY (`statusRegistro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_5epocas_del_ano_ibfk_9` FOREIGN KEY (`motivo_id`) REFERENCES `cam_motivos_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_9edicion`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_9edicion` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `personaje_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_id` smallint(5) unsigned DEFAULT NULL,
  `tema_id` smallint(5) unsigned DEFAULT NULL,
  `evento_id` smallint(5) unsigned DEFAULT NULL,
  `epocaDelAno_id` smallint(5) unsigned DEFAULT NULL,
  `avatar` varchar(25) DEFAULT NULL,
  `nombre` varchar(35) DEFAULT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `fechaMovil` tinyint(1) DEFAULT NULL,
  `anoFM` smallint(4) DEFAULT NULL,
  `fechaDelAno_id` smallint(5) unsigned DEFAULT NULL,
  `comentarioMovil` varchar(70) DEFAULT NULL,
  `diasDeDuracion` smallint(5) unsigned DEFAULT NULL,
  `comentarioDuracion` varchar(70) DEFAULT NULL,
  `prioridad_id` tinyint(1) DEFAULT NULL,
  `carpetaAvatars` varchar(20) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `epocaOcurrencia_id` varchar(3) DEFAULT NULL,
  `anoNacim` smallint(6) DEFAULT NULL,
  `anoComienzo` smallint(6) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `soloCfc` tinyint(1) DEFAULT NULL,
  `canon_id` varchar(3) DEFAULT NULL,
  `apMar_id` smallint(5) unsigned DEFAULT NULL,
  `rolIglesia_id` varchar(3) DEFAULT NULL,
  `ama` tinyint(1) DEFAULT NULL,
  `editadoPor_id` int(10) unsigned NOT NULL,
  `editadoEn` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  KEY `rclv_9edicion_ibfk_01` (`fechaDelAno_id`),
  KEY `rclv_9edicion_ibfk_02` (`sexo_id`),
  KEY `rclv_9edicion_ibfk_03` (`categoria_id`),
  KEY `rclv_9edicion_ibfk_04` (`canon_id`),
  KEY `rclv_9edicion_ibfk_05` (`rolIglesia_id`),
  KEY `rclv_9edicion_ibfk_06` (`epocaOcurrencia_id`),
  KEY `rclv_9edicion_ibfk_07` (`personaje_id`),
  KEY `rclv_9edicion_ibfk_08` (`hecho_id`),
  KEY `rclv_9edicion_ibfk_09` (`tema_id`),
  KEY `rclv_9edicion_ibfk_10` (`evento_id`),
  KEY `rclv_9edicion_ibfk_11` (`epocaDelAno_id`),
  KEY `rclv_9edicion_ibfk_12` (`editadoPor_id`),
  CONSTRAINT `rclv_9edicion_ibfk_01` FOREIGN KEY (`fechaDelAno_id`) REFERENCES `aux_fechas_del_ano` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_02` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_03` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_04` FOREIGN KEY (`canon_id`) REFERENCES `rclv_canons` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_05` FOREIGN KEY (`rolIglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_06` FOREIGN KEY (`epocaOcurrencia_id`) REFERENCES `rclv_epocas_ocurr` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_07` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_08` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_09` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_10` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_11` FOREIGN KEY (`epocaDelAno_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `rclv_9edicion_ibfk_12` FOREIGN KEY (`editadoPor_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_canons`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_canons` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_epocas_ocurr`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_epocas_ocurr` (
  `id` varchar(3) NOT NULL,
  `orden` tinyint(3) unsigned DEFAULT NULL,
  `consulta` varchar(35) NOT NULL,
  `nombre` varchar(15) DEFAULT NULL,
  `ayuda_pers` varchar(50) DEFAULT NULL,
  `ayuda_hecho` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `us_roles`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `us_roles` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `codigo` varchar(15) NOT NULL,
  `permInputs` tinyint(1) DEFAULT 0,
  `autTablEnts` tinyint(1) DEFAULT 0,
  `revisorPERL` tinyint(1) DEFAULT 0,
  `revisorLinks` tinyint(1) DEFAULT 0,
  `revisorEnts` tinyint(1) DEFAULT 0,
  `revisorUs` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `us_status_registro`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `us_status_registro` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

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
  `fechaNacim` date DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `pais_id` varchar(2) DEFAULT NULL,
  `rolIglesia_id` varchar(3) DEFAULT NULL,
  `rolUsuario_id` tinyint(3) unsigned DEFAULT 1,
  `cartelResp_prods` tinyint(1) DEFAULT 1,
  `cartelResp_rclvs` tinyint(1) DEFAULT 1,
  `cartelResp_links` tinyint(1) DEFAULT 1,
  `cartelFinPenaliz` tinyint(1) DEFAULT NULL,
  `autorizadoFA` tinyint(1) DEFAULT 0,
  `documNumero` varchar(15) DEFAULT NULL,
  `documPais_id` varchar(2) DEFAULT NULL,
  `documAvatar` varchar(18) DEFAULT NULL,
  `diasLogin` smallint(5) unsigned DEFAULT 1,
  `versionElcUltimoLogin` varchar(4) NOT NULL,
  `configCons_id` int(10) unsigned DEFAULT NULL,
  `videoConsVisto` tinyint(1) DEFAULT 0,
  `prodsAprob` smallint(6) DEFAULT 0,
  `prodsRech` smallint(6) DEFAULT 0,
  `rclvsAprob` smallint(6) DEFAULT 0,
  `rclvsRech` smallint(6) DEFAULT 0,
  `linksAprob` smallint(6) DEFAULT 0,
  `linksRech` smallint(6) DEFAULT 0,
  `edicsAprob` smallint(6) DEFAULT 0,
  `edicsRech` smallint(6) DEFAULT 0,
  `penalizacAcum` decimal(4,1) unsigned DEFAULT 0.0,
  `fechaUltimoLogin` date DEFAULT utc_date(),
  `fechaContrasena` datetime DEFAULT utc_timestamp(),
  `fechaRevisores` datetime DEFAULT NULL,
  `penalizadoEn` datetime DEFAULT NULL,
  `penalizadoHasta` datetime DEFAULT NULL,
  `creadoEn` datetime DEFAULT utc_timestamp(),
  `completadoEn` datetime DEFAULT NULL,
  `editadoEn` datetime DEFAULT NULL,
  `capturadoEn` datetime DEFAULT NULL,
  `capturadoPor_id` int(10) unsigned DEFAULT NULL,
  `capturaActiva` tinyint(1) DEFAULT NULL,
  `statusRegistro_id` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `Avatar único` (`avatar`),
  UNIQUE KEY `Avatar DNI único` (`documAvatar`),
  KEY `sexo_id` (`sexo_id`),
  KEY `pais_id` (`pais_id`),
  KEY `docum_pais_id` (`documPais_id`),
  KEY `rol_usuario_id` (`rolUsuario_id`),
  KEY `rol_iglesia_id` (`rolIglesia_id`),
  KEY `capturado_por_id` (`capturadoPor_id`),
  KEY `status_registro_id` (`statusRegistro_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `aux_paises` (`id`),
  CONSTRAINT `usuarios_ibfk_3` FOREIGN KEY (`documPais_id`) REFERENCES `aux_paises` (`id`),
  CONSTRAINT `usuarios_ibfk_4` FOREIGN KEY (`rolUsuario_id`) REFERENCES `us_roles` (`id`),
  CONSTRAINT `usuarios_ibfk_5` FOREIGN KEY (`rolIglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `usuarios_ibfk_6` FOREIGN KEY (`capturadoPor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `usuarios_ibfk_7` FOREIGN KEY (`statusRegistro_id`) REFERENCES `us_status_registro` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'c19353_elc'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-15  1:06:43
