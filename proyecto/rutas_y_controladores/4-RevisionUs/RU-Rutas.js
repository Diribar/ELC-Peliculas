"use strict";
// Variables
const router = express.Router();
const vista = require("./RU-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const revisorUs = require("../../middlewares/filtrosPorUsuario/usRolRevUs");

// Middlewares - Específicos de entidades
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const usAptoValidaIdent = require("../../middlewares/filtrosPorUsuario/usAptoValidaIdent");

// Middlewares - Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// Middlewares - Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorUs];
const aptoRevMasRegistro = [...aptoRevisor, IDvalido, statusCorrecto, usAptoValidaIdent, permUserReg];

// Vistas
router.get("/tablero-de-control", aptoRevisor, vista.tableroControl);

// Fin
module.exports = router;
