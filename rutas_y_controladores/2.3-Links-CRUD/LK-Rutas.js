"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorEntidad/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorEntidad/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorEntidad/statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorEntidad/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Varios
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");

// Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoABM = [...aptoUsuario, entValida, IDvalido, statusCorrecto, permUserReg, capturaActivar, rutaCRUD_ID];

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
router.get("/abm", ...aptoABM, vista.linksForm);

// Fin
module.exports = router;
