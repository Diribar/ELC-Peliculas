"use strict";
// Variables
const router = express.Router();

// Vistas
router.get("/:familia/historial", comp.redireccionaRutasAnts); // Historial
router.get("/:familia/inactivar", comp.redireccionaRutasAnts); // Inactivar
router.get("/:familia/recuperar", comp.redireccionaRutasAnts); // Recuperar
router.get("/:familia/eliminadoPorCreador", comp.redireccionaRutasAnts); // Eliminado por creador
router.get("/:familia/eliminar", comp.redireccionaRutasAnts); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", comp.redireccionaRutasAnts);
router.get("/correccion/status", comp.redireccionaRutasAnts);

// Fin
module.exports = router;

