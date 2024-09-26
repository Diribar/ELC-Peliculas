"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const entId = [entValida, iDvalido];

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
