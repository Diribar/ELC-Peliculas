"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");

// Vistas - Relación con la vida
router.get("/agregar", entValida, vistaMS.redirecciona.rutasAntiguas);
router.get("/detalle", entValida, iDvalido, vistaMS.redirecciona.rutasAntiguas);
router.get("/edicion", entValida, iDvalido, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
