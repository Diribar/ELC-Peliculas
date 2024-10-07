"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const idValidoAnt = require("../../middlewares/porRegistro/idValidoAnt");
const entID = [entValidaAnt, idValidoAnt];

// Vistas - Producto
router.get("/producto/historial", entID, vistaMS.redirecciona.rutasAntiguas); // Historial
router.get("/producto/inactivar", entID, vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/producto/recuperar", entID, vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/producto/eliminadoPorCreador", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado por creador
router.get("/producto/eliminar", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado

// Vistas - Rclv
router.get("/rclv/historial", entID, vistaMS.redirecciona.rutasAntiguas); // Historial
router.get("/rclv/inactivar", entID, vistaMS.redirecciona.rutasAntiguas); // Inactivar
router.get("/rclv/recuperar", entID, vistaMS.redirecciona.rutasAntiguas); // Recuperar
router.get("/rclv/eliminadoPorCreador", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado por creador
router.get("/rclv/eliminar", entID, vistaMS.redirecciona.rutasAntiguas); // Eliminado

// Vistas - Correcciones
router.get("/correccion/motivo", entID, vistaMS.redirecciona.rutasAntiguas);
router.get("/correccion/status", entID, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
