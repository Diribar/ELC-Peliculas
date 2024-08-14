"use strict";
// Variables
const router = express.Router();
const vista = require("./MS-ControlVista");

// Middlewares - Varios
const entidadRclv = require("../../middlewares/porRegistro/entidadRclv");

// Redireciona
router.get("/inicio", vista.redirecciona.redireccionaInicio);
router.get("/", vista.redirecciona.inicio);

// Información para mostrar en el explorador
router.get("/session", vista.listados.session);
router.get("/cookies", vista.listados.cookies);
router.get("/listados/rclvs/:id", entidadRclv, vista.listados.rclvs);
router.get("/listados/links", vista.listados.links);

// Fin
module.exports = router;
