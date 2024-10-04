"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const idValidoAnt = require("../../middlewares/porRegistro/idValidoAnt");
const entID = [entValidaAnt, idValidoAnt];

// Vistas
router.get("/:familia/historial", entID, vistaMS.redirecciona.rutasAntiguas); // Historial
router.get("/:familia/inactivar", entID, vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/:familia/recuperar", entID, vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/:familia/eliminadoPorCreador", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado por creador
router.get("/:familia/eliminar", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", entID, vistaMS.redirecciona.rutasAntiguas);
router.get("/correccion/status", entID, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
