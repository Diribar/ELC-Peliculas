"use strict";
//************************* Requires *******************************
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

//************************ Middlewares ******************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/filtrosPorUsuario/usAltaTerm");
const usPenalizaciones = require("../../middlewares/filtrosPorUsuario/usPenalizaciones");
const usAptoInput = require("../../middlewares/filtrosPorUsuario/usAptoInput");
// Específicos de productos
const entValida = require("../../middlewares/filtrosPorRegistro/entidadValida");
const IDvalido = require("../../middlewares/filtrosPorRegistro/IDvalido");
const statusCorrecto = require("../../middlewares/filtrosPorRegistro/statusCorrecto");
// Temas de captura
const permUserReg = require("../../middlewares/filtrosPorRegistro/permUserReg");
const capturaActivar = require("../../middlewares/varios/capturaActivar");
// Varios
const rutaCRUD_ID = require("../../middlewares/varios/rutaCRUD_ID");

// Consolidados
const aptoUsuario = [usAltaTerm, usPenalizaciones, usAptoInput];
const aptoABM = [...aptoUsuario, entValida, IDvalido, statusCorrecto, permUserReg, rutaCRUD_ID];

//************************ Rutas ****************************
// Rutas de APIs
// Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);
router.get("/api/guardar", API.guarda);
router.get("/api/inactiva-o-elimina", API.inactivaElimina);
router.get("/api/recuperar", API.recupera);
router.get("/api/deshacer", API.deshace);

// Rutas de vistas
// Links
router.get("/abm", aptoABM, capturaActivar, vista.links);

// Fin
module.exports = router;
