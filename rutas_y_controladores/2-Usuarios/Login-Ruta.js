//************************* Requires *******************************
const express = require("express");
const router = express.Router();
const login = require("./Login-Controller");

//************************ Middlewares ******************************
const validarLogin = require("../../middlewares/validarUserForms/validar0-Login");
const soloVisitas = require("../../middlewares/usuarios/soloVisitas");
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");

//**************************** Login ********************************
router.get("/", soloVisitas, login.loginForm);
router.post("/", soloVisitas, validarLogin, login.loginGuardar);
router.get("/logout", soloUsuarios, login.logout);

module.exports = router;
