//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/peliculas_CRUD')
const opciones = require('../controladores/peliculas_opciones')

//************************ Middlewares ******************************
const uploadFile = require('../Middlewares/multer');            // Para usar archivos en formularios 
const validaciones = require('../Middlewares/validaciones');    // Validaciones
const login_rutaSI = require('../Middlewares/us_logueado_ruta');// Para prevenir ciertos accesos cuando SI está logueado
const login_rutaNO = require('../Middlewares/us_visita');       // Para prevenir ciertos accesos cuando NO está logueado

// *************************** CRUD *********************************
router.get('/nueva', login_rutaSI, CRUD.altaForm);              // Alta
router.post('/nueva', CRUD.altaGuardar);                        // Alta
router.delete('/eliminar/:id', login_rutaSI, CRUD.baja);        // Baja
router.get('/editar/:id', login_rutaSI, CRUD.editarForm);       // Modificar
router.put('/editar/:id', login_rutaSI, CRUD.editarGuardar);    // Modificar
router.get('/detalle/:id', CRUD.detalle);                       // Detalle

// ************************* Opciones ********************************
router.get('/', opciones.home);                                 // Opción: Home
router.get('/listado', opciones.listado);                       // Opción: Listado
router.get('/cfc', opciones.cfc);                               // Opción: CFC
router.get('/cfc/:id', opciones.cfc);                           // Opción: CFC/id
router.get('/vpc', opciones.vpc);                               // Opción: VPC
router.get('/vpc/:id', opciones.vpc);                           // Opción: VPC/id
router.post('/filtros/:id', opciones.vpc);                      // Filtros

module.exports = router;
