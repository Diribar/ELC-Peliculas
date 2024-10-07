"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Vistas - Producto
router.get("/producto/alta", vistaMS.redirecciona.rutasAntiguas); // Altas
router.get("/producto/edicion", vistaMS.redirecciona.rutasAntiguas); // Edición
router.get("/producto/rechazar", vistaMS.redirecciona.rutasAntiguas); // Rechazar
router.get("/producto/inactivar", vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/producto/recuperar", vistaMS.redirecciona.rutasAntiguas); // Recuperar

// Vistas - Rclv
router.get("/rclv/alta", vistaMS.redirecciona.rutasAntiguas); // Altas
router.get("/rclv/edicion", vistaMS.redirecciona.rutasAntiguas); // Edición
router.get("/rclv/rechazar", vistaMS.redirecciona.rutasAntiguas); // Rechazar
router.get("/rclv/inactivar", vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/rclv/recuperar", vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/rclv/solapamiento", vistaMS.redirecciona.rutasAntiguas); // Solapamiento

// Vistas - Links
router.get("/links", vistaMS.redirecciona.rutasAntiguas); // Links

// Fin
module.exports = router;
