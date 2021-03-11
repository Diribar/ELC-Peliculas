//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const login = require('../controladores/usuarios_login')

//************************ Middlewares ******************************
const login_rutaSI = require('../../middlewares/login_rutaSI');    // Para prevenir ciertos accesos cuando SI está logueado
const login_rutaNO = require('../../middlewares/login_rutaNO');    // Para prevenir ciertos accesos cuando NO está logueado

//**************************** Login ********************************
//router.get('/', login_rutaNO, login.loginForm)             // Login
router.get('/', login.loginForm)             // Login
router.put('/', login.loginGuardar)                       // Login
router.get('/recuperar-contrasena', login_rutaNO, login.recupContrForm) // Recuperar contraseña
router.put('/recuperar-contrasena', login.recupContrGuardar) // Recuperar contraseña
router.put('/logout', login_rutaSI, login.logout)               // Logout

module.exports = router;
