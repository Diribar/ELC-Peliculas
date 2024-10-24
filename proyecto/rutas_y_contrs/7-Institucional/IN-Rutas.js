"use strict";
// Variables
const router = express.Router();
const API = require("./IN-ControlAPI");
const vista = require("./IN-ControlVista");
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];

// API
router.get("/api/in-valida-contactanos", API.validaContactanos);

// Vistas
router.get("/contactanos", aptoUsuario, vista.contactanos.form);
router.post("/contactanos", aptoUsuario, vista.contactanos.guardar);
router.get("/contactanos/envio-exitoso", aptoUsuario, vista.contactanos.envioExitoso);
router.get("/contactanos/envio-fallido", aptoUsuario, vista.contactanos.envioFallido);

router.get("/inicio", vistaMS.redirecciona.inicio);
router.get("/:codigo", vista.institucional); // institucional

// Fin
module.exports = router;
