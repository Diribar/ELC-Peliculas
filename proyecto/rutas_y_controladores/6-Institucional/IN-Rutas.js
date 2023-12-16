"use strict";
// Variables
const router = express.Router();
const vista = require("./IN-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");

// Middlewares - Varios
const institucional = require("../../middlewares/varios/urlInstitDescon");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];

// Vistas
router.get("/contactanos", aptoUsuario, vista.contactanos);
router.get("/:id", institucional, vista.institucional); // institucional

// Fin
module.exports = router;
