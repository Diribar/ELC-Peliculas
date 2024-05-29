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
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");
const entidadRclv = require("../../middlewares/filtrosPorRegistro/entidadRclv");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Redireciona
router.get("/inactivar-captura", capturaInactivar, vista.redirecciona.rutaAnterior);
router.get("/inicio", vista.redirecciona.redireccionaInicio);
router.get("/", vista.redirecciona.inicio);

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/rclvs/:id", entidadRclv, vista.listados.rclvs);
router.get("/listados/links", vista.listados.links);

// Fin
module.exports = router;
