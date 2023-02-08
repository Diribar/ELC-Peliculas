"use strict";
//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const API = require("./US-ControlAPI");
const vista = require("./US-ControlVista");

//************************ Middlewares ******************************
const visitas = require("../../middlewares/usuarios/filtro-visitas");
const usuarios = require("../../middlewares/usuarios/filtro-usuarios");
const stMailValidado = require("../../middlewares/usuarios/filtro-usSt2-MailVal");
const stEditables = require("../../middlewares/usuarios/filtro-usSt3-Editables");
const stIdentValidar = require("../../middlewares/usuarios/filtro-usSt4-IdentValidar");
const usAltaTerm = require("../../middlewares/usuarios/filtro-usAltaTerm");
const penalizaciones = require("../../middlewares/usuarios/filtro-usPenalizaciones");
const multer = require("../../middlewares/varios/multer");

//************************ Rutas ****************************
// Rutas de APIs
router.get("/api/valida-login", API.validaLogin);
router.get("/api/valida-mail", API.validaMail);
router.get("/api/valida-editables", API.validaEditables);
router.get("/api/valida-identidad", API.validaIdentidad);

// Rutas de Altas
// 1. Sólo visitas
router.get("/garantiza-login-y-completo", vista.login_y_completo);
router.get("/alta-mail", visitas, vista.altaMailForm);
router.post("/alta-mail", visitas, vista.altaMailGuardar);
// 2. Solo usuarios con status 'mail_validado'
router.get("/editables", stMailValidado, vista.editablesForm);
router.post("/editables", stMailValidado, multer.single("avatar"), vista.editablesGuardar);
// 3. Solo usuarios con status 'editables'
router.get("/bienvenido", stEditables, vista.bienvenido);
// 4. Solo usuarios con status 'editables' y no penalizadas
router.get("/identidad", stEditables, penalizaciones, vista.identidadForm);
router.post("identidad", stEditables, penalizaciones, multer.single("avatar"), vista.identidadGuardar);
// 5. Solo usuarios con status 'ident_a_validar'
router.get("/validacion-en-proceso", stIdentValidar, vista.validacionEnProceso);

// Rutas RUD
router.get("/edicion", usAltaTerm, vista.edicionForm);
router.put("/edicion", usAltaTerm, multer.single("avatar"), vista.edicionGuardar); //Validar mail y editables

// Login
router.get("/login", visitas, vista.loginForm);
router.post("/login", visitas, vista.loginGuardar);
router.get("/logout", usuarios, vista.logout);
router.get("/olvido-contrasena", visitas, vista.altaMailForm);
router.post("/olvido-contrasena", visitas, vista.olvidoContrGuardar);

module.exports = router;
