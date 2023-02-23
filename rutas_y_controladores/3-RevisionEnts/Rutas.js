"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
const API = require("./RE-ControlAPI");
const vista = require("./RE-ControlVista");
const vistaAltaRCLV = require("../2.2-RCLV-CRUD/RCLV-ControlVista");

// Middlewares ***********************************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usRolRevEnts = require("../../middlewares/usuarios/filtro-usRolRevEnts");
// Específicos de entidades
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const statusCorrecto = require("../../middlewares/producto/filtro-statusCorrecto");
const existeEdicion = require("../../middlewares/producto/filtro-existeEdicion");
const rechazoSinMotivo = require("../../middlewares/producto/filtro-rechazoSinMotivo");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usRolRevEnts];
const aptoStatus = [entValida, IDvalido, statusCorrecto, ...aptoUsuario, permUserReg, capturaActivar];
const aptoEdicion = [entValida, IDvalido, existeEdicion, statusCorrecto, ...aptoUsuario, permUserReg, capturaActivar];

// APIs -------------------------------------------------
// Producto
router.get("/api/edicion-aprob-rech", API.edicAprobRech);
// router.get("/api/producto-guarda-avatar", API.prodEdic_ConvierteUrlEnArchivo);
// Links
router.get("/api/link-alta", API.linkAltaBaja);
router.get("/api/link-eliminar", API.linkAltaBaja);
router.get("/api/link-edicion", API.edicAprobRech);

// VISTAS --------------------------------------------------
// Tablero de Control
router.get("/tablero-de-control", ...aptoUsuario, vista.tableroControl);

// Producto
router.get("/producto/alta", ...aptoStatus, vista.prod_altaForm);
router.post("/producto/alta", ...aptoStatus, rechazoSinMotivo, vista.prodRCLV_altaGuardar);
router.get("/producto/edicion", ...aptoEdicion, vista.prod_edicForm);
router.post("/producto/edicion", ...aptoEdicion, rechazoSinMotivo, vista.prod_edicGuardar);
router.get("/producto/inactivar-o-recuperar");

// RCLV
router.get("/rclv/alta", ...aptoStatus, vistaAltaRCLV.altaEdicForm);
router.post("/rclv/alta", ...aptoStatus, rechazoSinMotivo, vista.prodRCLV_altaGuardar);
router.get("/rclv/edicion", ...aptoEdicion, vista.rclv_edicForm);
router.get("/rclv/inactivar-o-recuperar");

// Links
router.get("/links", ...aptoStatus, vista.linksForm);

// Exportarlo **********************************************
module.exports = router;
