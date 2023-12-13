"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Middlewares - Varios
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/filtrosPorRegistro/entidadRclv");

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Vistas
router.get("/mantenimiento", aptoUsuario, vista.tableroMantenim);

// Redirecionamientos
router.get("/inactivar-captura", capturaInactivar, vista.redirecciona);
router.get("/", vista.redireccionaInicio);
router.get("/inicio", vista.redireccionaInicio);

// Información para mostrar en el explorador
router.get("/session", vista.session);
router.get("/cookies", vista.cookies);
router.get("/:id", entidadRclv, vista.listadoRCLVs);

// Fin
module.exports = router;
