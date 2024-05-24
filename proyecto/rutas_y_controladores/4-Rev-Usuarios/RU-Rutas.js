"use strict";
// Variables
const router = express.Router();
const vista = require("./RU-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const revisorUs = require("../../middlewares/filtrosPorUsuario/usRolRevUs");

// Middlewares - Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorUs];

// Vistas
router.get("/tablero-de-control", aptoRevisor, vista.tableroControl);

// Fin
module.exports = router;
