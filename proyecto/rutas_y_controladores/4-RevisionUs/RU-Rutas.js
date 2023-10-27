"use strict";
// Requires **************************************************
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./RU-ControlVista");

// Middlewares ***********************************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const revisorUs = require("../../middlewares/filtrosPorUsuario/usRolRevUs");
// Específicos de entidades
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
const usAptoValidaIdent = require("../../middlewares/filtrosPorUsuario/usAptoValidaIdent");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
// Consolidados
const aptoRevisor = [usAltaTerm, usPenalizaciones, revisorUs];
const aptoRevMasRegistro = [...aptoRevisor, IDvalido, statusCorrecto, usAptoValidaIdent, permUserReg];

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", aptoRevisor, vista.tableroControl);

// Exportarlo **********************************************
module.exports = router;
