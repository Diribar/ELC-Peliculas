"use strict";
// Variables
const router = express.Router();

// Vistas
router.get("/:familia/historial", comp.deRutasAntArutasAct); // Historial
router.get("/:familia/inactivar", comp.deRutasAntArutasAct); // Inactivar
router.get("/:familia/recuperar", comp.deRutasAntArutasAct); // Recuperar
router.get("/:familia/eliminadoPorCreador", comp.deRutasAntArutasAct); // Eliminado por creador
router.get("/:familia/eliminar", comp.deRutasAntArutasAct); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", comp.deRutasAntArutasAct);
router.get("/correccion/status", comp.deRutasAntArutasAct);

// Fin
module.exports = router;

