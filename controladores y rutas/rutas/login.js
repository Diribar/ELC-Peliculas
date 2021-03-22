//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const login = require('../controladores/login')

//************************ Middlewares ******************************
const logoutMiddleware = require('../../middlewares/si_esta_logueado_LOGOUT');  // Para prevenir ciertos accesos cuando SI está logueado
const loginMiddleware = require('../../middlewares/si_no_esta_logueado_LOGIN');  // Para prevenir ciertos accesos cuando NO está logueado

//**************************** Login ********************************
router.get('/', logoutMiddleware, login.loginForm)
router.post('/', logoutMiddleware, login.loginGuardar)
router.get('/recuperar-contrasena', logoutMiddleware, login.recupContrForm)
router.put('/recuperar-contrasena', logoutMiddleware, login.recupContrGuardar)
router.put('/logout', loginMiddleware, login.logout)

module.exports = router;
