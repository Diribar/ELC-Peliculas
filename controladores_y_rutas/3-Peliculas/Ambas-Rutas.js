// Requires
const express = require('express');
const router = express.Router();
const opciones = require("./Ambas1-Opciones");
const crear = require("./Ambas2-Crear");
const RUD = require("./Ambas3-RUD");

// Middlewares de Validaciones
const soloUsuarios = require("../../middlewares/usuarios/soloUsuarios");
const validar1 = require("../../middlewares/PEL-0-validarForms/1-ImportarDatos");
const validar2 = require("../../middlewares/PEL-0-validarForms/2_DatosDuros");
const validar3 = require("../../middlewares/PEL-0-validarForms/3_DatosElaborados");

// Middlewares de Tareas
const importar = require("../../middlewares/PEL-1A-importar_x_API/1importarA");
const uploadFile = require("../../middlewares/varios/multer");

// Controladores de Crear
// 0. Responsabilidad
router.get("/agregar", soloUsuarios, crear.responsabilidad);
// 1. Importar Datos
router.get("/agregar1", soloUsuarios, crear.agregar1Form);
router.post('/agregar1', soloUsuarios, validar1, crear.agregar1Guardar);

// 2. Desambiguar

// 3. Datos Duros
router.get("/agregar2", soloUsuarios, crear.agregar2Form);
router.post("/agregar2", soloUsuarios, validar2, crear.agregar2Guardar);

// 4. Datos Adicionales
router.get("/agregar3", soloUsuarios, crear.agregar3Form);
router.post('/agregar3', soloUsuarios, uploadFile.single('imagen'), validar3, crear.agregar3Guardar);

// Controladores RUD (método GET)
router.get('/detalle/:id/:id', RUD.detalle);
router.get("/detalle/editar/:id", soloUsuarios, RUD.detalle);
router.get("/detalle/eliminar/:id", soloUsuarios, RUD.detalle);
router.get('/detalle/calificala/:id', soloUsuarios, RUD.detalle);

// Controladores UD (método POST)
router.post("/detalle/editar/:id", soloUsuarios, RUD.editarGuardar);
router.post("/detalle/eliminar/:id", soloUsuarios, RUD.bajaGuardar);

// Controladores de Opciones
router.get('/', opciones.home);
router.get('/:id', opciones.opcion);
router.get('/:id/:id', opciones.tipo);
router.post('/:id/:id', soloUsuarios, opciones.filtros);

// Fin
module.exports = router;
