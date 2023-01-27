"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const soloVisitas = require("../../middlewares/usuarios/filtro-soloVisitas");
const soloUsuarios = require("../../middlewares/usuarios/filtro-soloUsuarios");
const soloMailValidado = require("../../middlewares/usuarios/filtro-soloSt2-MailVal");
const soloEditables = require("../../middlewares/usuarios/filtro-soloSt3-Editables");
const soloIdentValidar = require("../../middlewares/usuarios/filtro-soloSt4-IdentValidar");

const soloUsuariosTerm = require("../../middlewares/usuarios/filtro-soloUsuariosTerm");
const usPenalizado = require("../../middlewares/usuarios/filtro-usuarioPenalizado");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-identidad", API.validaIdentidad);

// Rutas de Altas
// 1. Sólo visitas
router.get("/redireccionar", vista.redireccionar);
router.get("/alta-mail", soloVisitas, vista.altaMailForm);
router.post("/alta-mail", soloVisitas, vista.altaMailGuardar);
// 2. Solo usuarios con status 'mail_validado'
router.get("/editables", soloMailValidado, vista.editablesForm);
router.post("/editables", soloMailValidado, multer.single("avatar"), vista.editablesGuardar);
// 3. Solo usuarios con status 'editables'
router.get("/bienvenido", soloEditables, vista.bienvenido);
// 4. Solo usuarios con status 'editables' y no penalizadas
router.get("/valida-identidad", soloEditables, usPenalizado, vista.validaForm);
router.post("valida-identidad", soloEditables, usPenalizado, multer.single("avatar"), vista.validaGuardar);
// 5. Solo usuarios con status 'ident_a_validar'
router.get("/validacion-en-proceso", soloIdentValidar, vista.validacionEnProceso);

// Rutas RUD
router.get("/edicion", soloUsuariosTerm, vista.edicionForm);
router.put("/edicion", soloUsuariosTerm, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", soloVisitas, vista.loginForm);
router.post("/login", soloVisitas, vista.loginGuardar);
router.get("/logout", soloUsuarios, vista.logout);
router.get("/olvido-contrasena", soloVisitas, vista.altaMailForm);
router.post("/olvido-contrasena", soloVisitas, vista.olvidoContrGuardar);

module.exports = router;
