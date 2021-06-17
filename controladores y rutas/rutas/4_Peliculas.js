//************************* Requires *******************************
const express = require('express');
const router = express.Router();
const peliculas = require('../controladores/4_Peliculas')
const opciones = require('../controladores/5_Peliculas_opciones')

//************************ Middlewares ******************************
const soloUsuarios = require('../../middlewares/usuarios/soloUsuarios');
const soloAdmin = require('../../middlewares/usuarios/soloAdmin');
const validar1A = require('../../middlewares/PEL-0-validarForms/1A_PalabraClave');
const validar1B = require('../../middlewares/PEL-0-validarForms/1B_ImportarDatos');
const validar1C = require('../../middlewares/PEL-0-validarForms/1C_Datos_a_Mano');
const validar2 = require('../../middlewares/PEL-0-validarForms/2_DatosDuros');
const validar3 = require('../../middlewares/PEL-0-validarForms/3_DatosElaborados');
const importarA = require('../../middlewares/PEL-1A-importar_x_API/1importarA');
const importarB = require('../../middlewares/PEL-1B-importar_x_copy/importarB');
const uploadFile = require('../../middlewares/varios/multer');

//******************* Controladores de CRUD *************************
// -- INTRODUCCIÓN -------------------------
router.get("/agregar", soloUsuarios, peliculas.altaForm);

// -- CREATE -------------------------
router.get("/agregar1", soloUsuarios, peliculas.altaForm1);
router.post('/agregar1A', soloUsuarios, validar1A, importarA, peliculas.altaGuardar1);
router.post('/agregar1B', soloUsuarios, validar1B, importarB, peliculas.altaGuardar1);
router.post("/agregar1C", soloUsuarios, validar1C, peliculas.altaGuardar1);
router.get("/agregar2", soloUsuarios, peliculas.altaForm2);
router.post("/agregar2", soloUsuarios, validar2, peliculas.altaGuardar2);
router.get("/agregar3", soloUsuarios, peliculas.altaForm3);
router.post('/agregar3', soloUsuarios, uploadFile.single('imagen'), validar3, peliculas.altaGuardar3);

// -- RUD (GET) --------------------------
router.get("/detalle/editar/:id", soloUsuarios, peliculas.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, peliculas.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, peliculas.detalle);
router.get('/detalle/:id/:id', peliculas.detalle);
// -- UD (POST) -------------------------
router.post("/detalle/editar/:id", soloUsuarios, peliculas.editarGuardar);
router.post("/detalle/eliminar/:id", soloUsuarios, peliculas.bajaGuardar);

// Controladores de Opciones ****************************************
router.get('/', opciones.rubro);                                // Home
router.get('/:id', opciones.opcion);                            // Opciones
router.get('/:id/:id', opciones.tipo);                          // Opción: Listado
router.post('/:id/:id', soloUsuarios, opciones.filtros);        // Filtros

// Exportarlo *******************************************************
module.exports = router;
