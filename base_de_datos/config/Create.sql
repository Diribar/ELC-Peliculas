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
-- Table structure for table `aux_hist_cambios_status`
--
CREATE DATABASE elc_peliculas;
USE elc_peliculas;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_hist_cambios_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(11) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL,
  `revisado_por_id` int(10) unsigned NOT NULL,
  `revisado_en` datetime NOT NULL,
  `status_original_id` tinyint(3) unsigned NOT NULL,
  `status_final_id` tinyint(3) unsigned NOT NULL,
  `aprobado` tinyint(1) DEFAULT NULL,
  `duracion` decimal(4,1) unsigned DEFAULT NULL,
  `comunicado_en` datetime DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `comentario` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `analizado_por_id` (`revisado_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `status_original_id` (`status_original_id`),
  KEY `status_final_id` (`status_final_id`),
  CONSTRAINT `aux_hist_cambios_status_ibfk_1` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `aux_hist_cambios_status_ibfk_2` FOREIGN KEY (`revisado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `aux_hist_cambios_status_ibfk_3` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `aux_hist_cambios_status_ibfk_4` FOREIGN KEY (`status_original_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `aux_hist_cambios_status_ibfk_5` FOREIGN KEY (`status_final_id`) REFERENCES `aux_status_registros` (`id`)
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
  `mas_frecuente` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aux_paises`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aux_paises` (
  `id` varchar(2) NOT NULL,
  `alpha3code` varchar(3) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `continente` varchar(20) NOT NULL,
  `idioma` varchar(50) NOT NULL,
  `zona_horaria` tinyint(4) NOT NULL,
  `bandera` varchar(10) NOT NULL,
  `cantProds` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_1registros`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_21fe_valores`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_21fe_valores` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_22entretiene`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_22entretiene` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cal_23calidad_tecnica`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cal_23calidad_tecnica` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `valor` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_filtros_cabecera`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_filtros_cabecera` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `nombre` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cn_filtros_cabecera_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_filtros_campos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_filtros_campos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cabecera_id` int(10) unsigned NOT NULL,
  `campo` varchar(20) NOT NULL,
  `valor` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `filtro_cabecera_id` (`cabecera_id`),
  CONSTRAINT `cn_filtros_campos_ibfk_1` FOREIGN KEY (`cabecera_id`) REFERENCES `cn_filtros_cabecera` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_layouts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_layouts` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `entidad` varchar(20) NOT NULL,
  `ocurrio` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cn_ordenes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_ordenes` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) DEFAULT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `valor` varchar(20) NOT NULL,
  `asc_des` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `edics_aprob`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edics_aprob` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `campo` varchar(25) NOT NULL,
  `titulo` varchar(35) NOT NULL,
  `valorAprob` varchar(100) DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned NOT NULL,
  `edic_revisada_en` datetime DEFAULT utc_timestamp(),
  `comunicado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  CONSTRAINT `edics_aprob_ibfk_1` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `edics_aprob_ibfk_2` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `edics_rech`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edics_rech` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entidad` varchar(20) NOT NULL,
  `entidad_id` int(10) unsigned NOT NULL,
  `campo` varchar(20) NOT NULL,
  `titulo` varchar(21) NOT NULL,
  `valorRech` varchar(100) DEFAULT NULL,
  `valorAprob` varchar(100) DEFAULT NULL,
  `motivo_id` tinyint(3) unsigned NOT NULL,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime NOT NULL,
  `edic_revisada_por_id` int(10) unsigned NOT NULL,
  `edic_revisada_en` datetime NOT NULL,
  `comunicado_en` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  CONSTRAINT `edics_rech_ibfk_1` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_edic` (`id`),
  CONSTRAINT `edics_rech_ibfk_2` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `edics_rech_ibfk_3` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `int_1registros`
--

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
-- Table structure for table `int_opciones`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `int_opciones` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `url` varchar(100) NOT NULL,
  `prov_id` tinyint(3) unsigned NOT NULL,
  `calidad` smallint(6) NOT NULL,
  `castellano` tinyint(1) NOT NULL,
  `subtitulos` tinyint(1) DEFAULT NULL,
  `gratuito` tinyint(1) NOT NULL,
  `tipo_id` tinyint(3) unsigned NOT NULL,
  `completo` tinyint(1) DEFAULT 1,
  `parte` varchar(3) NOT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `vigencia_revisada_en` datetime DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `url` (`url`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `tipo_id` (`tipo_id`),
  KEY `prov_id` (`prov_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `links_ibfk_10` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `links_ibfk_11` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_12` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `links_ibfk_2` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `links_ibfk_3` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `links_ibfk_4` FOREIGN KEY (`tipo_id`) REFERENCES `links_tipos` (`id`),
  CONSTRAINT `links_ibfk_5` FOREIGN KEY (`prov_id`) REFERENCES `links_provs` (`id`),
  CONSTRAINT `links_ibfk_6` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_7` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_8` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `links_ibfk_9` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
-- Table structure for table `links_provs`
--

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
  `buscador_autom` tinyint(1) NOT NULL,
  `url_buscar_pre` varchar(25) DEFAULT NULL,
  `trailer` tinyint(1) NOT NULL,
  `url_buscar_post_tra` varchar(20) DEFAULT NULL,
  `pelicula` tinyint(1) NOT NULL,
  `url_buscar_post_pel` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `url_distintivo` (`url_distintivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `motivos_rech_altas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `motivos_rech_altas` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `descripcion` varchar(23) NOT NULL,
  `bloqueoInput` tinyint(1) DEFAULT 0,
  `prods` tinyint(1) DEFAULT 0,
  `rclvs` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  `coment_aut` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `motivos_rech_edic`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `motivos_rech_edic` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `descripcion` varchar(40) NOT NULL,
  `avatar_prods` tinyint(1) DEFAULT 0,
  `avatar_rclvs` tinyint(1) DEFAULT 0,
  `avatar_us` tinyint(1) DEFAULT 0,
  `prods` tinyint(1) DEFAULT 0,
  `rclvs` tinyint(1) DEFAULT 0,
  `links` tinyint(1) DEFAULT 0,
  `info_erronea` tinyint(1) DEFAULT 0,
  `version_actual` tinyint(1) DEFAULT 0,
  `duracion` decimal(4,1) unsigned DEFAULT 0.0,
  `bloqueoInput` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `nombre_original` varchar(70) DEFAULT NULL,
  `nombre_castellano` varchar(70) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `ocurrio` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipo_actuacion_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `tema_id` smallint(5) unsigned DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT 1,
  `castellano` tinyint(1) unsigned DEFAULT NULL,
  `subtitulos` tinyint(1) unsigned DEFAULT NULL,
  `links_general` tinyint(1) unsigned DEFAULT NULL,
  `links_gratuitos` tinyint(1) unsigned DEFAULT NULL,
  `fe_valores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidad_tecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `momento` smallint(5) unsigned DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `alta_term_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `publico_sugerido_id` (`publico_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `tema_id` (`tema_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `prod_1peliculas_FK` (`tipo_actuacion_id`),
  KEY `prod_1peliculas_FK_1` (`evento_id`),
  KEY `prod_1peliculas_FK_2` (`epoca_del_ano_id`),
  CONSTRAINT `prod_1peliculas_FK` FOREIGN KEY (`tipo_actuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_1peliculas_FK_1` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos_del_ano` (`id`),
  CONSTRAINT `prod_1peliculas_FK_2` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_1` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_10` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_11` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_12` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_13` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_14` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_15` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_16` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_17` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_7` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_8` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_1peliculas_ibfk_9` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `nombre_original` varchar(70) DEFAULT NULL,
  `nombre_castellano` varchar(70) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `ano_fin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `cant_temps` tinyint(3) unsigned DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(50) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `ocurrio` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipo_actuacion_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT 1,
  `hecho_id` smallint(5) unsigned DEFAULT 1,
  `tema_id` smallint(5) unsigned DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT 1,
  `castellano` tinyint(1) unsigned DEFAULT NULL,
  `subtitulos` tinyint(1) unsigned DEFAULT NULL,
  `links_general` tinyint(1) unsigned DEFAULT NULL,
  `links_gratuitos` tinyint(1) unsigned DEFAULT NULL,
  `fe_valores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidad_tecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `momento` smallint(5) unsigned DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `alta_term_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  KEY `publico_sugerido_id` (`publico_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `tema_id` (`tema_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `prod_2colecciones_FK` (`tipo_actuacion_id`),
  KEY `prod_2colecciones_FK_1` (`evento_id`),
  KEY `prod_2colecciones_FK_2` (`epoca_del_ano_id`),
  CONSTRAINT `prod_2colecciones_FK` FOREIGN KEY (`tipo_actuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_2colecciones_FK_1` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos_del_ano` (`id`),
  CONSTRAINT `prod_2colecciones_FK_2` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_1` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_10` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_11` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_12` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_13` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_14` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_15` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_16` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_6` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_7` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_8` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_2colecciones_ibfk_9` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `nombre_original` varchar(70) DEFAULT NULL,
  `nombre_castellano` varchar(70) DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `duracion` tinyint(3) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(1004) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `ocurrio` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipo_actuacion_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned NOT NULL DEFAULT 1,
  `hecho_id` smallint(5) unsigned NOT NULL DEFAULT 1,
  `tema_id` smallint(5) unsigned NOT NULL DEFAULT 1,
  `evento_id` smallint(5) unsigned DEFAULT 1,
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT 1,
  `castellano` tinyint(1) unsigned DEFAULT NULL,
  `subtitulos` tinyint(1) unsigned DEFAULT NULL,
  `links_general` tinyint(1) unsigned DEFAULT NULL,
  `links_gratuitos` tinyint(1) unsigned DEFAULT NULL,
  `fe_valores` tinyint(3) unsigned DEFAULT NULL,
  `entretiene` tinyint(3) unsigned DEFAULT NULL,
  `calidad_tecnica` tinyint(3) unsigned DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `momento` smallint(5) unsigned DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `alta_term_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime NOT NULL DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TMDB_id` (`TMDB_id`),
  UNIQUE KEY `FA_id` (`FA_id`),
  UNIQUE KEY `IMDB_id` (`IMDB_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `publico_sugerido_id` (`publico_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `tema_id` (`tema_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `prod_3capitulos_FK` (`tipo_actuacion_id`),
  KEY `prod_3capitulos_FK_1` (`evento_id`),
  KEY `prod_3capitulos_FK_2` (`epoca_del_ano_id`),
  CONSTRAINT `prod_3capitulos_FK` FOREIGN KEY (`tipo_actuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_3capitulos_FK_1` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos_del_ano` (`id`),
  CONSTRAINT `prod_3capitulos_FK_2` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_1` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_10` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_11` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_12` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_13` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_14` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_15` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_16` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_17` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_18` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_4` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_7` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_8` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_3capitulos_ibfk_9` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `nombre_original` varchar(70) DEFAULT NULL,
  `nombre_castellano` varchar(70) DEFAULT NULL,
  `duracion` smallint(5) unsigned DEFAULT NULL,
  `ano_estreno` smallint(5) unsigned DEFAULT NULL,
  `ano_fin` smallint(5) unsigned DEFAULT NULL,
  `paises_id` varchar(14) DEFAULT NULL,
  `idioma_original_id` varchar(2) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `guion` varchar(100) DEFAULT NULL,
  `musica` varchar(100) DEFAULT NULL,
  `actores` varchar(500) DEFAULT NULL,
  `produccion` varchar(100) DEFAULT NULL,
  `sinopsis` varchar(900) DEFAULT NULL,
  `avatar` varchar(18) DEFAULT NULL,
  `avatar_url` varchar(100) DEFAULT NULL,
  `cfc` tinyint(1) unsigned DEFAULT NULL,
  `ocurrio` tinyint(1) unsigned DEFAULT NULL,
  `musical` tinyint(1) unsigned DEFAULT NULL,
  `color` tinyint(1) unsigned DEFAULT NULL,
  `tipo_actuacion_id` tinyint(3) unsigned DEFAULT NULL,
  `publico_id` tinyint(3) unsigned DEFAULT NULL,
  `personaje_id` smallint(5) unsigned DEFAULT NULL,
  `hecho_id` smallint(5) unsigned DEFAULT NULL,
  `tema_id` smallint(5) unsigned DEFAULT NULL,
  `evento_id` smallint(5) unsigned DEFAULT NULL,
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime NOT NULL DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `pelicula_id` (`pelicula_id`),
  KEY `coleccion_id` (`coleccion_id`),
  KEY `capitulo_id` (`capitulo_id`),
  KEY `idioma_original_id` (`idioma_original_id`),
  KEY `publico_sugerido_id` (`publico_id`),
  KEY `personaje_id` (`personaje_id`),
  KEY `hecho_id` (`hecho_id`),
  KEY `tema_id` (`tema_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `prod_4edicion_FK` (`tipo_actuacion_id`),
  KEY `prod_9edicion_FK` (`evento_id`),
  KEY `prod_9edicion_FK_1` (`epoca_del_ano_id`),
  CONSTRAINT `prod_4edicion_FK` FOREIGN KEY (`tipo_actuacion_id`) REFERENCES `prod_tipos_actuac` (`id`),
  CONSTRAINT `prod_9edicion_FK` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos_del_ano` (`id`),
  CONSTRAINT `prod_9edicion_FK_1` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_1` FOREIGN KEY (`pelicula_id`) REFERENCES `prod_1peliculas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_10` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_11` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_12` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_13` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_2` FOREIGN KEY (`coleccion_id`) REFERENCES `prod_2colecciones` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_3` FOREIGN KEY (`capitulo_id`) REFERENCES `prod_3capitulos` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_6` FOREIGN KEY (`idioma_original_id`) REFERENCES `aux_idiomas` (`id`),
  CONSTRAINT `prod_9edicion_ibfk_9` FOREIGN KEY (`publico_id`) REFERENCES `prod_publicos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
-- Table structure for table `prod_publicos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_publicos` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prod_tipos_actuac`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prod_tipos_actuac` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `orden` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `anime` tinyint(1) NOT NULL,
  `documental` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_1personajes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_1personajes` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `prods_aprob` tinyint(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(1) DEFAULT 0,
  `avatar` varchar(25) DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `epoca_id` varchar(3) DEFAULT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `canon_id` varchar(3) DEFAULT NULL,
  `ap_mar_id` smallint(5) unsigned DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `sexo_id` (`sexo_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `proceso_id` (`canon_id`),
  KEY `rol_iglesia_id` (`rol_iglesia_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `ap_mar_id` (`ap_mar_id`),
  KEY `rclv_1personajes_FK` (`epoca_id`),
  KEY `rclv_1personajes_FK_1` (`avatar`),
  CONSTRAINT `rclv_1personajes_FK` FOREIGN KEY (`epoca_id`) REFERENCES `rclv_epocas` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_10` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_11` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_12` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_13` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_14` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_15` FOREIGN KEY (`ap_mar_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_2` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_3` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_5` FOREIGN KEY (`canon_id`) REFERENCES `rclv_canons` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_6` FOREIGN KEY (`rol_iglesia_id`) REFERENCES `aux_roles_iglesia` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_7` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_8` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_1personajes_ibfk_9` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_2hechos`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_2hechos` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `prods_aprob` tinyint(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(1) DEFAULT 0,
  `avatar` varchar(25) DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `solo_cfc` tinyint(1) NOT NULL,
  `epoca_id` varchar(3) DEFAULT NULL,
  `ama` tinyint(1) DEFAULT 0,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  KEY `rclv_2hechos_FK` (`epoca_id`),
  CONSTRAINT `rclv_2hechos_FK` FOREIGN KEY (`epoca_id`) REFERENCES `rclv_epocas` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_2` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_3` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_4` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_5` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_6` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_7` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_8` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `rclv_2hechos_ibfk_9` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_3temas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_3temas` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `prods_aprob` tinyint(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(1) DEFAULT 0,
  `avatar` varchar(25) DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `dia_del_ano_id` (`dia_del_ano_id`),
  KEY `creado_por_id` (`creado_por_id`),
  KEY `alta_revisada_por_id` (`alta_revisada_por_id`),
  KEY `editado_por_id` (`editado_por_id`),
  KEY `edic_revisada_por_id` (`edic_revisada_por_id`),
  KEY `status_registro_id` (`status_registro_id`),
  KEY `sugerido_por_id` (`sugerido_por_id`),
  KEY `motivo_id` (`motivo_id`),
  KEY `capturado_por_id` (`capturado_por_id`),
  CONSTRAINT `rclv_3temas_ibfk_1` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_2` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_3` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_4` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_5` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_6` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_7` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_8` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_9` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_4eventos_del_ano`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_4eventos_del_ano` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `prods_aprob` tinyint(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(1) DEFAULT 0,
  `avatar` varchar(25) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  CONSTRAINT `rclv_3temas_ibfk_2_copy` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_3_copy` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_4_copy` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_5_copy` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_6_copy` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_7_copy` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_8_copy` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `rclv_3temas_ibfk_9_copy` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_5epocas_del_ano`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_5epocas_del_ano` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `prods_aprob` tinyint(1) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `fecha_movil` tinyint(1) DEFAULT 0,
  `prioridad` tinyint(1) DEFAULT 0,
  `avatar` varchar(25) DEFAULT NULL,
  `dias_de_rango` smallint(5) unsigned NOT NULL,
  `carpeta_avatars` varchar(20) NOT NULL,
  `creado_por_id` int(10) unsigned NOT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `alta_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `alta_revisada_en` datetime DEFAULT NULL,
  `lead_time_creacion` decimal(4,2) unsigned DEFAULT NULL,
  `editado_por_id` int(10) unsigned DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `edic_revisada_por_id` int(10) unsigned DEFAULT NULL,
  `edic_revisada_en` datetime DEFAULT NULL,
  `lead_time_edicion` decimal(4,2) unsigned DEFAULT NULL,
  `status_registro_id` tinyint(3) unsigned DEFAULT 1,
  `motivo_id` tinyint(3) unsigned DEFAULT NULL,
  `sugerido_por_id` int(10) unsigned NOT NULL,
  `sugerido_en` datetime DEFAULT utc_timestamp(),
  `capturado_por_id` int(10) unsigned DEFAULT NULL,
  `capturado_en` datetime DEFAULT NULL,
  `captura_activa` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  CONSTRAINT `regla01` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`)
  CONSTRAINT `regla02` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regla03` FOREIGN KEY (`alta_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regla04` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regla05` FOREIGN KEY (`edic_revisada_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regla06` FOREIGN KEY (`status_registro_id`) REFERENCES `aux_status_registros` (`id`),
  CONSTRAINT `regla07` FOREIGN KEY (`sugerido_por_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `regla08` FOREIGN KEY (`motivo_id`) REFERENCES `motivos_rech_altas` (`id`),
  CONSTRAINT `regla09` FOREIGN KEY (`capturado_por_id`) REFERENCES `usuarios` (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `nombre` varchar(30) DEFAULT NULL,
  `dia_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  `ano` smallint(6) DEFAULT NULL,
  `epoca_id` varchar(3) DEFAULT NULL,
  `apodo` varchar(30) DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `categoria_id` varchar(3) DEFAULT NULL,
  `ap_mar_id` smallint(5) unsigned DEFAULT NULL,
  `canon_id` varchar(3) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `solo_cfc` tinyint(1) DEFAULT NULL,
  `ama` tinyint(1) DEFAULT NULL,
  `editado_por_id` int(10) unsigned NOT NULL,
  `editado_en` datetime DEFAULT utc_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `regla01` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`),
  CONSTRAINT `regla02` FOREIGN KEY (`personaje_id`) REFERENCES `rclv_1personajes` (`id`),
  CONSTRAINT `regla03` FOREIGN KEY (`hecho_id`) REFERENCES `rclv_2hechos` (`id`),
  CONSTRAINT `regla04` FOREIGN KEY (`tema_id`) REFERENCES `rclv_3temas` (`id`),
  CONSTRAINT `regla05` FOREIGN KEY (`evento_id`) REFERENCES `rclv_4eventos_del_ano` (`id`),
  CONSTRAINT `regla06` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `regla07` FOREIGN KEY (`epoca_id`) REFERENCES `rclv_epocas` (`id`),
  CONSTRAINT `regla08` FOREIGN KEY (`sexo_id`) REFERENCES `aux_sexos` (`id`),
  CONSTRAINT `regla09` FOREIGN KEY (`categoria_id`) REFERENCES `prod_categ1` (`id`),
  CONSTRAINT `regla10` FOREIGN KEY (`canon_id`) REFERENCES `rclv_canons` (`id`),
  CONSTRAINT `regla11` FOREIGN KEY (`rol_iglesia_id`) REFERENCES `aux_roles_iglesia` (`id`)
  CONSTRAINT `regla12` FOREIGN KEY (`editado_por_id`) REFERENCES `usuarios` (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
-- Table structure for table `rclv_dias_del_ano`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_dias_del_ano` (
  `id` smallint(5) unsigned NOT NULL,
  `dia` tinyint(3) unsigned NOT NULL,
  `mes_id` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(9) NOT NULL,
  `epoca_del_ano_id` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mes_id` (`mes_id`),
  KEY `epoca` (`epoca_del_ano_id`),
  CONSTRAINT `epoca` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`),
  CONSTRAINT `rclv_dias_del_ano_ibfk_1` FOREIGN KEY (`mes_id`) REFERENCES `rclv_meses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_dias_edicion`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_dias_edicion` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `dia_del_ano_id` smallint(5) unsigned NOT NULL,
  `epoca_del_ano_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `dia_del_ano` FOREIGN KEY (`dia_del_ano_id`) REFERENCES `rclv_dias_del_ano` (`id`),
  CONSTRAINT `rclv_dias_edicion_FK` FOREIGN KEY (`epoca_del_ano_id`) REFERENCES `rclv_5epocas_del_ano` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rclv_epocas`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_epocas` (
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
-- Table structure for table `rclv_meses`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rclv_meses` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(10) NOT NULL,
  `abrev` varchar(3) NOT NULL,
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
  `nombre` varchar(30) NOT NULL,
  `perm_inputs` tinyint(1) NOT NULL,
  `revisor_ents` tinyint(1) NOT NULL,
  `revisor_us` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `mail_a_validar` tinyint(1) DEFAULT NULL,
  `mail_validado` tinyint(1) DEFAULT NULL,
  `editables` tinyint(1) DEFAULT NULL,
  `ident_a_validar` tinyint(1) DEFAULT NULL,
  `ident_validada` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `fecha_nacim` date DEFAULT NULL,
  `sexo_id` varchar(1) DEFAULT NULL,
  `pais_id` varchar(2) DEFAULT NULL,
  `rol_iglesia_id` varchar(3) DEFAULT NULL,
  `rol_usuario_id` tinyint(3) unsigned DEFAULT 1,
  `cartel_resp_prods` tinyint(1) DEFAULT 1,
  `cartel_resp_rclvs` tinyint(1) DEFAULT 1,
  `cartel_resp_links` tinyint(1) DEFAULT 1,
  `cartel_fin_penaliz` tinyint(1) DEFAULT NULL,
  `autorizado_fa` tinyint(1) DEFAULT 0,
  `docum_numero` varchar(15) DEFAULT NULL,
  `docum_pais_id` varchar(2) DEFAULT NULL,
  `docum_avatar` varchar(18) DEFAULT NULL,
  `dias_login` smallint(5) unsigned DEFAULT 1,
  `version_elc_ultimo_login` varchar(4) DEFAULT '1.0',
  `fecha_ultimo_login` date DEFAULT utc_date(),
  `fecha_contrasena` datetime DEFAULT utc_timestamp(),
  `fecha_revisores` datetime DEFAULT NULL,
  `filtro_id` int(10) unsigned DEFAULT NULL,
  `creado_en` datetime DEFAULT utc_timestamp(),
  `completado_en` datetime DEFAULT NULL,
  `editado_en` datetime DEFAULT NULL,
  `prods_aprob` smallint(6) DEFAULT 0,
  `prods_rech` smallint(6) DEFAULT 0,
  `rclvs_aprob` smallint(6) DEFAULT 0,
  `rclvs_rech` smallint(6) DEFAULT 0,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

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

-- Dump completed on 2023-04-21 16:56:13
