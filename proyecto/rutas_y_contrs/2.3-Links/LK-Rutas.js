"use strict";
// Variables
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

// Middlewares - Específicos de usuarios
const usAltaTerm = require("../../middlewares/porUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/porUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/porUsuario/usAptoInput");

// Middlewares - Específicos del registro
const entValida = require("../../middlewares/porRegistro/entidadValida");
const iDvalido = require("../../middlewares/porRegistro/iDvalido");
const linkIDvalido = require("../../middlewares/porRegistro/linkIDvalido");
const statusCorrecto = require("../../middlewares/porRegistro/statusCorrecto");

// Middlewares - Otros
const permUserReg = require("../../middlewares/porRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");

// Middlewares - Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoABM = [...aptoUsuario, entValida, iDvalido, statusCorrecto, permUserReg, rutaCRUD_ID];

// APIs - Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);

// APIs - ABM
router.get("/api/guardar", API.guarda);
router.get("/api/inactiva-o-elimina", API.inactivaElimina);
router.get("/api/recuperar", API.recupera);
router.get("/api/deshacer", API.deshace);

// Vistas
router.get("/abp", aptoABM, capturaActivar, vista.abm);
router.get("/vsl", linkIDvalido, vista.visualizacion);

// Fin
module.exports = router;
