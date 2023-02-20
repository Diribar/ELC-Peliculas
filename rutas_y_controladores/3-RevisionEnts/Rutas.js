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
const msc = require("../../middlewares/producto/filtro-statusCorrecto");
const rechazoSinMotivo = require("../../middlewares/producto/filtro-rechazoSinMotivo");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, usRolRevEnts];
const aptoRevMasEnt = [...aptoRevisor, entValida, IDvalido, permUserReg, rechazoSinMotivo, capturaActivar];

// APIs -------------------------------------------------
// Producto
router.get("/api/edicion-aprob-rech", ...aptoRevisor, API.edic_AprobRech);
router.get("/api/producto-guarda-avatar", ...aptoRevisor, API.prodEdic_ConvierteUrlEnArchivo);
// Links
router.get("/api/link-alta", ...aptoRevisor, API.linkAltaBaja);
router.get("/api/link-eliminar", ...aptoRevisor, API.linkAltaBaja);
router.get("/api/link-edicion", ...aptoRevisor, API.edic_AprobRech);

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...aptoRevisor, vista.tableroControl);
// Producto
router.get("/producto/alta", ...aptoRevMasEnt, msc.statusCorrecto(creado_id), vista.prodAltaForm);
router.post("/producto/alta", ...aptoRevMasEnt, msc.statusCorrecto(creado_id), vista.registoAltaGuardar);
router.get("/producto/edicion", ...aptoRevMasEnt, msc.statusCorrecto(aprobado_id), vista.prodEdicForm);
router.get("/producto/inactivar", msc.statusCorrecto(inactivar_id));
router.get("/producto/recuperar", msc.statusCorrecto(recuperar_id));
// RCLV
router.get("/rclv/alta", ...aptoRevMasEnt, msc.statusCorrecto(creado_id), vistaAltaRCLV.altaEdicForm);
router.post("/rclv/alta", ...aptoRevMasEnt, msc.statusCorrecto(creado_id), vista.registoAltaGuardar);
router.get("/rclv/edicion", ...aptoRevMasEnt, msc.statusCorrecto(aprobado_id), vista.rclvEdicForm);

// Links
router.get("/links", ...aptoRevMasEnt, vista.linksForm);

// Exportarlo **********************************************
module.exports = router;
