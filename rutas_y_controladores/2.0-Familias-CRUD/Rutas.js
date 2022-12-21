"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./FM-ControlAPI");

//************************ Rutas ****************************
// Rutas de APIs
// Tridente: Detalle, Edición, Links
router.get("/obtiene-col-cap", API.obtieneColCap);
router.get("/obtiene-cap-ant-y-post", API.obtieneCapAntPostID);
router.get("/obtiene-cap-id", API.obtieneCapID);
router.get("/averigua-capitulos", API.obtieneCapitulos);

// Fin
module.exports = router;
