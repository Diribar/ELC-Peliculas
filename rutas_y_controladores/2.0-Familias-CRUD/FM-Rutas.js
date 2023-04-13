"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./FM-ControlAPI");
const vista = require("./FM-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/usuarios/filtro-usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
const statusCorrecto = require("../../middlewares/producto/filtro-statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Varios
const controles = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/api/obtiene-col-cap", API.obtieneColCap);
router.get("/api/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/api/obtiene-cap-id", API.obtieneCapID);
router.get("/api/averigua-capitulos", API.obtieneCapitulos);
router.get("/api/averigua-si-comentario-automatico", API.comentarioAutom);

// Fin
module.exports = router;
