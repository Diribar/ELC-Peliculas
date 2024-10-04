"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Vistas
router.get("/:familia/alta", vistaMS.redirecciona.rutasAntiguas); // Altas
router.get("/:familia/edicion", vistaMS.redirecciona.rutasAntiguas); // Edición
router.get("/:familia/rechazar", vistaMS.redirecciona.rutasAntiguas); // Rechazar
router.get("/:familia/inactivar", vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/:familia/recuperar", vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/rclv/solapamiento", vistaMS.redirecciona.rutasAntiguas); // Solapamiento
router.get("/links", vistaMS.redirecciona.rutasAntiguas); // Links

// Fin
module.exports = router;
