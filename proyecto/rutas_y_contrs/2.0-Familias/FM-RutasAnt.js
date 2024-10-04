"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Vistas
router.get("/:familia/historial", vistaMS.redirecciona.rutasAntiguas); // Historial
router.get("/:familia/inactivar", vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/:familia/recuperar", vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/:familia/eliminadoPorCreador", vistaMS.redirecciona.rutasAntiguas); // Eliminado por creador
router.get("/:familia/eliminar", vistaMS.redirecciona.rutasAntiguas); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", vistaMS.redirecciona.rutasAntiguas);
router.get("/correccion/status", vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
