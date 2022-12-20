"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControlAPI");
const vista = require("./ControlVista");

//************************ Middlewares ******************************
// Login y Roles de Usuario
const soloUsuariosCompl = require("../../middlewares/usuarios/solo1-usuariosCompl");
const soloAptoInput = require("../../middlewares/usuarios/solo2-aptoInput");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/entidadNombre");
const id = require("../../middlewares/producto/entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const todos = [soloUsuariosCompl, soloAptoInput, entidad, id, permUserReg, capturaActivar];

//************************ Rutas ****************************
// Rutas de APIs
// Links
router.get("/api/valida", API.valida);
router.get("/api/obtiene-provs-links", API.obtieneProvs);
router.get("/api/guardar", API.guardar);
router.get("/api/eliminar", API.eliminar);
router.get("/api/recuperar", API.recuperar);
router.get("/api/deshacer", API.deshacer);

// Rutas de vistas
// Links
router.get("/abm", ...todos, vista.linksForm);

// Fin
module.exports = router;
