"use strict";
// Variables
const router = express.Router();

// Vistas
router.get("/:familia/alta", comp.deRutasAntArutasAct); // Altas
router.get("/:familia/edicion", comp.deRutasAntArutasAct); // Edición
router.get("/:familia/rechazar", comp.deRutasAntArutasAct); // Rechazar
router.get("/:familia/inactivar", comp.deRutasAntArutasAct); // Inactivar
router.get("/:familia/recuperar", comp.deRutasAntArutasAct); // Recuperar
router.get("/rclv/solapamiento", comp.deRutasAntArutasAct); // Solapamiento
router.get("/links", comp.deRutasAntArutasAct); // Links

// Fin
module.exports = router;
