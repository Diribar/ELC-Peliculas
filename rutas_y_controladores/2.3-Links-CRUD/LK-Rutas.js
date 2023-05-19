"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/filtro-usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/filtro-usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/filtro-usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorEntidad/filtro-entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/filtro-IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/filtro-statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Varios
const prodID = require("../../middlewares/varios/prodID");

// Consolidados
const ABM = [usAltaTerm, usPenalizaciones, usAptoInput, entValida, IDvalido, statusCorrecto, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);
router.get("/api/guardar", API.guarda);
router.get("/api/eliminar", API.elimina);
router.get("/api/recuperar", API.recupera);
router.get("/api/deshacer", API.deshace);

// Rutas de vistas
// Links
router.get("/abm", ...ABM, prodID, vista.linksForm);

// Fin
module.exports = router;
