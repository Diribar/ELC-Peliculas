"use strict";
// Requires **************************************************
const express = require("express");
const router = express.Router();
// const API = require("./ControlAPI");
const vista = require("./RU-ControlVista");

// Middlewares ***********************************************
// Específicos de usuarios
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const penalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const revisorEnts = require("../../middlewares/usuarios/filtro-usRolRevUs");
// Específicos de entidades
const entValida = require("../../middlewares/producto/filtro-entidadValida");
const IDvalido = require("../../middlewares/producto/filtro-IDvalido");
// Temas de captura
const permUserReg = require("../../middlewares/captura/filtro-permUserReg");
const capturaActivar = require("../../middlewares/captura/capturaActivar");
// Consolidados
const aptoRevisor = [usAltaTerm, penalizaciones, revisorEnts];
const aptoRevMasEnt = [...aptoRevisor, entValida, IDvalido, permUserReg, capturaActivar];

// APIs -------------------------------------------------

// VISTAS --------------------------------------------------
router.get("/tablero-de-control", ...aptoRevisor, vista.tableroControl);
// Identidad
router.get("/identidad", ...aptoRevMasEnt, vista.identidadForm);
router.post("/identidad", ...aptoRevMasEnt, vista.identidadGuardar);

// Exportarlo **********************************************
module.exports = router;
