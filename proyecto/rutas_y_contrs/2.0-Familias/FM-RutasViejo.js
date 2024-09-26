"use strict";
// Variables
const router = express.Router();
const vista = require("./FM-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");

// Vistas form - Motivos
router.get("/producto/inactivar", entValida, iDvalido, vista.form.motivos);
router.get("/rclv/inactivar", entValida, iDvalido, vista.form.motivos);
router.get("/revision/producto/rechazar", entValida, iDvalido, vista.form.motivos);
router.get("/revision/rclv/rechazar", entValida, iDvalido, vista.form.motivos);

// Vistas form - Historial
router.get("/producto/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/rclv/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/revision/producto/inactivar", entValida, iDvalido, vista.form.historial);
router.get("/revision/rclv/inactivar", entValida, iDvalido, vista.form.historial);
router.get("/revision/producto/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/revision/rclv/recuperar", entValida, iDvalido, vista.form.historial);
router.get("/producto/historial", entValida, iDvalido, vista.form.historial);
router.get("/rclv/historial", entValida, iDvalido, vista.form.historial);

// Vistas -  CRUD: Eliminado
router.get("/producto/eliminadoPorCreador", entValida, iDvalido, vista.form.elimina);
router.get("/rclv/eliminadoPorCreador", entValida, iDvalido, vista.form.elimina);
router.get("/producto/eliminar", entValida, iDvalido, vista.form.elimina);
router.get("/rclv/eliminar", entValida, iDvalido, vista.form.elimina);

// Vistas - Correcciones
router.get("/correccion/motivo", entValida, iDvalido, vista.correcs.motivoForm);
router.get("/correccion/status", entValida, iDvalido, vista.correcs.statusForm);

// Fin
module.exports = router;
