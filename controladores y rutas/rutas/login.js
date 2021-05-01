//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const login = require('../controladores/login')

//************************ Middlewares ******************************
const validarLogin = require('../../middlewares/usuarios/validar0-Login');
const soloVisitas = require('../../middlewares/usuarios/soloVisitas');
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');

//**************************** Login ********************************
router.get('/', soloVisitas, login.loginForm)
router.post('/', soloVisitas, validarLogin, login.loginGuardar)
router.get('/recuperar-contrasena', soloVisitas, login.recupContrForm)
router.put('/recuperar-contrasena', soloVisitas, login.recupContrGuardar)
router.get('/logout', soloUsuarios, login.logout)

module.exports = router;
