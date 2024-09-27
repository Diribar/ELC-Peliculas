"use strict";
// Variables
const router = express.Router();

// Vistas
router.get("/tablero-de-entidades", comp.redireccionaRutasAnts);
router.get("/tablero-de-mantenimiento", comp.redireccionaRutasAnts);
router.get("/:familia/alta", comp.redireccionaRutasAnts); // Altas
router.get("/:familia/rechazar", comp.redireccionaRutasAnts); // Rechazar
router.get("/:familia/edicion", comp.redireccionaRutasAnts); // Edición
router.get("/:familia/inactivar", comp.redireccionaRutasAnts); // Revisar Inactivar
router.get("/:familia/recuperar", comp.redireccionaRutasAnts); // Revisar Recuperar
router.get("/rclv/solapamiento", comp.redireccionaRutasAnts); // Solapamiento
router.get("/links", comp.redireccionaRutasAnts); // Links

// Fin
module.exports = router;
