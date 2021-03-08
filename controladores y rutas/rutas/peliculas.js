//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const CRUD = require('../controladores/peliculas_CRUD')
const opciones = require('../controladores/peliculas_opciones')

//************************ Middlewares ******************************
const login_rutaSI = require('../../middlewares/login_rutaSI'); // Para prevenir ciertos accesos cuando SI está logueado

// *************************** CRUD *********************************
router.get('/nueva', login_rutaSI, CRUD.altaForm);              // Alta
router.post('/nueva', CRUD.altaGuardar);                        // Alta
router.delete('/eliminar/:id', login_rutaSI, CRUD.baja);        // Baja
router.get('/editar/:id', login_rutaSI, CRUD.editarForm);       // Modificar
router.put('/editar/:id', CRUD.editarGuardar);                  // Modificar
router.get('/detalle/:id', CRUD.detalle);                       // Detalle

// ************************* Opciones ********************************
router.get('/', opciones.home);                                 // Home
router.post('/filtros', login_rutaSI, opciones.filtros);        // Filtros
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/listado/:id', opciones.listadoID);                 // Opción: Listado
router.get('/cfc/:id', opciones.cfcID);                         // Opción: CFC/id
router.get('/vpc/:id', opciones.vpcID);                         // Opción: VPC/id

module.exports = router;
