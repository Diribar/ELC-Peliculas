"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const iDvalidoAnt = require("../../middlewares/porRegistro/iDvalidoAnt");
const entId = [entValidaAnt, iDvalidoAnt];

// Vistas
router.get("/:familia/historial", entId, vista.redireccionar); // Historial
router.get("/:familia/inactivar", entId, vista.redireccionar); // Inactivar
router.get("/:familia/recuperar", entId, vista.redireccionar); // Recuperar
router.get("/:familia/eliminadoPorCreador", entId, vista.redireccionar); // Eliminado por creador
router.get("/:familia/eliminar", entId, vista.redireccionar); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", entId, vista.redireccionar);
router.get("/correccion/status", entId, vista.redireccionar);

// Fin
module.exports = router;
