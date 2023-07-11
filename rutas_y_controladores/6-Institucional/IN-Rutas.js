"use strict";
// Requires ************************************************
const express = require("express");
const router = express.Router();
const vista = require("./IN-ControlVista");

// Middlewares ***********************************************
const institucional = require("../../middlewares/varios/institucional");

// Vistas *******************************************
// Vistas de vistas - Institucional
router.get("/inicio", vista.inicio);
router.get("/:id",institucional, vista.institucional);

// Exportarlo **********************************************
module.exports = router;
