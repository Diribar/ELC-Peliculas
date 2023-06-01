"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./FM-ControlAPI");
const vista = require("./FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/filtro-usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorEntidad/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Varios
const controles = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtiene-col-cap", API.obtieneColCap);
router.get("/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/api/obtiene-cap-id", API.obtieneCapID);
router.get("/api/obtiene-capitulos", API.obtieneCapitulos);
router.get("/api/motivos-status", API.motivosRechAltas);
router.get("/api/actualiza-visibles", API.actualizarVisibles);

// Fin
module.exports = router;
