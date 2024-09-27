"use strict";
// Variables
const router = express.Router();
const API = require("./MS-ControlAPI");
const vista = require("./MS-ControlVista");

// Middlewares - Varios
const entidadRclv = require("../../middlewares/porRegistro/entidadRclv");
const capturaInactivar = require("../../middlewares/varios/capturaInactivar");

// APIs
router.get("/api/horario-inicial/", API.horarioInicial);
router.get("/api/busqueda-rapida/", API.busquedaRapida);

// Redireciona
router.get("/", vista.redirecciona.inicio);
router.get("/inicio", vista.redirecciona.redireccionaInicio);
router.get("/inactivar-captura", capturaInactivar, vista.redirecciona);

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/rclvs/:id", entidadRclv, vista.listados.rclvs);
router.get("/listados/links", vista.listados.links);

// Fin
module.exports = router;
