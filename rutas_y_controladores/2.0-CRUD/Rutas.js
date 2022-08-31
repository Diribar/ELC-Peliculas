"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./ControladorAPI");

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/obtener-col-cap", API.obtenerColCap);
router.get("/obtener-cap-ant-y-post", API.obtenerCapAntPostID);
router.get("/obtener-cap-id", API.obtenerCapID);
router.get("/averiguar-capitulos", API.obtenerCapitulos);

// Fin
module.exports = router;
