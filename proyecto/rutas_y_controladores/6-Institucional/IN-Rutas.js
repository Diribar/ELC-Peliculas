"use strict";
// Variables
const router = express.Router();
const API = require("./IN-ControlAPI");
const vista = require("./IN-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");

// Middlewares - Varios
const institucional = require("../../middlewares/varios/urlInstitDescon");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];

// API
router.get("/api/valida-contactanos", API.validaContactanos);

// Vistas
router.get("/contactanos", aptoUsuario, vista.contactanos.form);
router.post("/contactanos", aptoUsuario, vista.contactanos.guardar);
router.get("/contactanos/envio-exitoso", aptoUsuario, vista.contactanos.envioExitoso);
router.get("/contactanos/envio-fallido", aptoUsuario, vista.contactanos.envioFallido);

router.get("/:id", institucional, vista.institucional); // institucional

// Fin
module.exports = router;
