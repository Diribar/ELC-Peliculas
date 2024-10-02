"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares - Específicos del registro
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const iDvalidoAnt = require("../../middlewares/porRegistro/iDvalidoAnt");

// Vistas - Relación con la vida
router.get("/agregar", entValidaAnt, vistaMS.redirecciona.rutasAntiguas);
router.get("/detalle", entValidaAnt, iDvalidoAnt, vistaMS.redirecciona.rutasAntiguas);
router.get("/edicion", entValidaAnt, iDvalidoAnt, vistaMS.redirecciona.rutasAntiguas);

// Fin
module.exports = router;
