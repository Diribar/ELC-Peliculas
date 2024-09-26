"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const entId = [entValida, iDvalido];

// Vistas - Historial
router.get("/producto/historial", entId, vista.redireccionar);
router.get("/rclv/historial", entId, vista.redireccionar);

// Vistas - Inactivar
router.get("/producto/inactivar", entId, vista.redireccionar);
router.get("/rclv/inactivar", entId, vista.redireccionar);

// Vistas - Recuperar
router.get("/producto/recuperar", entId, vista.redireccionar);
router.get("/rclv/recuperar", entId, vista.redireccionar);

// Vistas -  CRUD: Eliminado
router.get("/producto/eliminadoPorCreador", entId, vista.redireccionar);
router.get("/rclv/eliminadoPorCreador", entId, vista.redireccionar);
router.get("/producto/eliminar", entId, vista.redireccionar);
router.get("/rclv/eliminar", entId, vista.redireccionar);

// Vistas - Correcciones
router.get("/correccion/motivo", entId, vista.redireccionar);
router.get("/correccion/status", entId, vista.redireccionar);

// Fin
module.exports = router;
