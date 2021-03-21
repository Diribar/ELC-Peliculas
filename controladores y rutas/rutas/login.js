//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const login = require('../controladores/login')

//************************ Middlewares ******************************
const logout = require('../../middlewares/login_ruta_logout');    // Para prevenir ciertos accesos cuando NO está logueado
const login_SI = require('../../middlewares/login_ruta_SI');    // Para prevenir ciertos accesos cuando SI está logueado
const login_NO = require('../../middlewares/login_ruta_NO');    // Para prevenir ciertos accesos cuando NO está logueado

//**************************** Login ********************************
router.get('/', logout, login.loginForm)             // Login
//router.post('/', logout, uploadFile.single('avatar'), validations, login.loginGuardar) // Login
router.post('/', login.loginGuardar) // Login
router.get('/recuperar-contrasena', login_NO, login.recupContrForm) // Recuperar contraseña
router.put('/recuperar-contrasena', login.recupContrGuardar) // Recuperar contraseña
router.put('/logout', login_SI, login.logout)               // Logout

module.exports = router;
