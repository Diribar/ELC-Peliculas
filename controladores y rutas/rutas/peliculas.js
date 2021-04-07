// Requires *********************************************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/peliculas')
const opciones = require('../controladores/peliculas_opciones')

// Middlewares ******************************************************
const soloUsuarios = require('../../middlewares/soloUsuarios');  // Para prevenir ciertos accesos cuando NO está logueado
const soloAdmin = require('../../middlewares/soloAdmin');        // Para prevenir ciertos accesos cuando NO está logueado

// Controladores de CRUD ********************************************
// -- CREATE -------------------------
router.get('/agregar', soloAdmin, peliculas.altaForm);
router.post('/agregar', peliculas.altaGuardar);
// -- RUD (GET) --------------------------
router.get('/detalle/editar/:id', soloAdmin, peliculas.detalle);
router.get('/detalle/eliminar/:id', soloAdmin, peliculas.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, peliculas.detalle);
router.get('/detalle/:id/:id', peliculas.detalle);
// -- UD (POST) -------------------------
router.post('/detalle/editar/:id', peliculas.editarGuardar);
router.post('/detalle/eliminar/:id', peliculas.bajaGuardar);

// Controladores de Opciones ****************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.post('/:id/:id', soloUsuarios, opciones.filtros);         // Filtros

// Exportarlo *******************************************************
module.exports = router;
