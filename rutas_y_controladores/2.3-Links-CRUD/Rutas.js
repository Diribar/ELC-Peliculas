"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./LK-ControlAPI");
const vista = require("./LK-ControlVista");

//************************ Middlewares ******************************
// Comunes a todas las entidades
const usPenalizado = require("../../middlewares/usuarios/filtro-usuarioPenalizado");
const soloAptoInput = require("../../middlewares/usuarios/filtro-soloAptoInput");
const cartelRespons = require("../../middlewares/usuarios/filtro-cartelRespons");
// Existen la entidad y el producto
const entidad = require("../../middlewares/producto/filtro-entidadNombre");
const id = require("../../middlewares/producto/filtro-entidadID");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const todos = [usPenalizado, cartelRespons,soloAptoInput, entidad, id, permUserReg, capturaActivar];

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
