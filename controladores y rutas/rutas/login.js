//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const login = require('../controladores/login')

//************************ Middlewares ******************************
const validarMail = require('../../middlewares/US-validarMail');    // Validar mail y contraseña
const soloVisitas = require('../../middlewares/soloVisitas');  // Para prevenir ciertos accesos cuando SI está logueado
const soloUsuarios = require('../../middlewares/soloUsuarios');  // Para prevenir ciertos accesos cuando NO está logueado

//**************************** Login ********************************
router.get('/', soloVisitas, login.loginForm)
router.post('/', soloVisitas, validarMail, login.loginGuardar)
router.get('/recuperar-contrasena', soloVisitas, login.recupContrForm)
router.put('/recuperar-contrasena', soloVisitas, login.recupContrGuardar)
router.get('/logout', soloUsuarios, login.logout)

module.exports = router;
