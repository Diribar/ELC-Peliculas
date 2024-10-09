"use strict";
// Variables
const router = express.Router();
const vista = require("./RU-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const revisorUs = require("../../middlewares/porUsuario/usRolRevUs");

// Middlewares - Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorUs];

// Vistas
router.get("/tablero-de-usuarios", aptoRevisor, vista.tableroControl);

// Fin
module.exports = router;
