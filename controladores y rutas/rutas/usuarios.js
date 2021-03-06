//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/usuarios_CRUD')
const login = require('../controladores/usuarios_login')

//************************ Middlewares ******************************
const uploadFile = require('../Middlewares/multer');            // Para usar archivos en formularios 
const validaciones = require('../Middlewares/validaciones');    // Validaciones
const login_rutaSI = require('../Middlewares/us_logueado_ruta');// Para prevenir ciertos accesos cuando SI está logueado
const login_rutaNO = require('../Middlewares/us_visita');       // Para prevenir ciertos accesos cuando NO está logueado

//**************************** CRUD *********************************
router.get('/nuevo', login_rutaNO, CRUD.altaForm)               // Alta
router.post('/nuevo', uploadFile.single('imagen'), validaciones, CRUD.altaGuardar)
router.delete('/eliminar/:id', login_rutaSI, CRUD.baja)         // Baja
router.get('/editar/:id', login_rutaSI, CRUD.editarForm)        // Modificar
router.put('/editar/:id', uploadFile.single('imagen'), validaciones, CRUD.editarGuardar)
router.get('/detalle/:id', login_rutaSI, CRUD.detalle)          // Detalle

//**************************** Login ********************************
router.get('/login', login_rutaNO, login.loginForm)             // Login
router.post('/login', login.loginGuardar)                       // Login
router.get('/login/recuperar-contrasena', login_rutaNO, login.recupContrForm) // Recuperar contraseña
router.post('/login/recuperar-contrasena', login.recupContrGuardar) // Recuperar contraseña
router.post('/login', login_rutaSI, login.logout)               // Logout

module.exports = router;
