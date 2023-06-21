// VARIABLE 'GLOBAL' --------------------------------------------------------------
// Simples
global.unaHora = 60 * 60 * 1000; // Para usar la variable en todo el proyecto
global.unDia = unaHora * 24; // Para usar la variable en todo el proyecto
global.unMes = unDia * 30; // Para usar la variable en todo el proyecto
global.unAno = unDia * 365;
global.diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
global.SI = 2;
global.talVez = 1;
global.NO = null;
// Con 'require'
require("dotenv").config(); // Para usar el archivo '.env' --> se debe colocar al principio
global.localhost = process.env.localhost;
global.fs = require("fs");
global.carpetasImagen = fs.readdirSync("./publico/imagenes/3-EpocasDelAno");
global.path = require("path");
const procesos = require("./funciones/3-Rutinas/RT-Procesos");
global.ImagenesDerecha = procesos.lecturaRutinasJSON().ImagenesDerecha;
global.fetch = require("node-fetch");
global.db = require("./base_de_datos/modelos");
global.Op = db.Sequelize.Op;

// Para usar propiedades de express
const express = require("express");
const app = express();
app.use(express.static(path.resolve(__dirname, "./publico"))); // Para acceder a los archivos de la carpeta publico
app.use(express.urlencoded({extended: false})); // Para usar archivos en los formularios (Multer)
app.use(express.json()); // ¿Para usar JSON con la lectura y guardado de archivos?
// Para usar PUT y DELETE
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
// Para usar la propiedad "session"
const session = require("express-session");
app.use(session({secret: "keyboard cat", resave: false, saveUninitialized: false}));
// Para usar cookies
const cookies = require("cookie-parser");
app.use(cookies());

// Para saber el recorrido del proyecto
// let morgan = require('morgan');
// morgan.token("custom", ":method :url => Tiempo: :total-time[0]ms / :response-time[0]ms (:status)") //Create a new named format
// app.use(morgan("custom")) //use the new format by name

// *********** Para conectarse con el servidor ********************
app.listen(80, () => console.log("Servidor funcionando..."));

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("view engine", "ejs"); // Terminación de los archivos de vista
app.set("views", [
	path.resolve(__dirname, "./vistas"),
	path.resolve(__dirname, "./vistas/0-Compartido"),
	path.resolve(__dirname, "./vistas/0-Compartido/Header"),
	path.resolve(__dirname, "./vistas/0-Compartido/Main"),
	path.resolve(__dirname, "./vistas/1-Usuarios"),
	path.resolve(__dirname, "./vistas/2.0-Familias-CRUD"),
	path.resolve(__dirname, "./vistas/2.0-Familias-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/2.0-Familias-CRUD/Flechas"),
	path.resolve(__dirname, "./vistas/2.1-Prod-Agregar"),
	path.resolve(__dirname, "./vistas/2.1-Prod-Agregar/Includes"),
	path.resolve(__dirname, "./vistas/2.1-Prod-RUD"),
	path.resolve(__dirname, "./vistas/2.1-Prod-RUD/Includes"),
	path.resolve(__dirname, "./vistas/2.2-RCLVs-CRUD"),
	path.resolve(__dirname, "./vistas/2.2-RCLVs-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/2.3-Links-CRUD"),
	path.resolve(__dirname, "./vistas/2.3-Links-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/3-RevisionEnts"),
	path.resolve(__dirname, "./vistas/3-RevisionEnts/Includes"),
	path.resolve(__dirname, "./vistas/4-RevisionUs"),
	path.resolve(__dirname, "./vistas/4-RevisionUs/Includes"),
	path.resolve(__dirname, "./vistas/5-Mantenimiento"),
	path.resolve(__dirname, "./vistas/6-Consultas"),
	path.resolve(__dirname, "./vistas/6-Consultas/Includes"),
	path.resolve(__dirname, "./vistas/7-Institucional"),
	path.resolve(__dirname, "./vistas/7-Institucional/Includes"),
]);

// Procesos que requieren de 'async' y 'await'
(async () => {
	// Lectura de la base de datos
	const BD_genericas = require("./funciones/2-BD/Genericas");
	let campos = {
		// Variables de usuario
		status_registro_us: BD_genericas.obtieneTodos("status_registro_us", "orden"),
		roles_us: BD_genericas.obtieneTodos("roles_usuarios", "orden"),
		// Variable de entidades
		status_registros: BD_genericas.obtieneTodos("status_registros", "orden"),
		sexos: BD_genericas.obtieneTodos("sexos", "orden"),
		motivosStatus: BD_genericas.obtieneTodos("motivosStatus", "orden"),
		motivosEdics: BD_genericas.obtieneTodos("motivosEdics", "orden"),

		// Variables de productos
		idiomas: BD_genericas.obtieneTodos("idiomas", "nombre"),
		paises: BD_genericas.obtieneTodos("paises", "nombre"),
		publicos: BD_genericas.obtieneTodos("publicos", "orden"),
		tiposActuacion: BD_genericas.obtieneTodos("tiposActuacion", "orden"),

		// Variables de RCLVs
		epocas: BD_genericas.obtieneTodos("epocas", "orden"),
		canons: BD_genericas.obtieneTodos("canons", "orden"),
		roles_iglesia: BD_genericas.obtieneTodos("roles_iglesia", "orden"),

		// Variables de links
		linksProvs: BD_genericas.obtieneTodos("linksProvs", "orden"),
		links_tipos: BD_genericas.obtieneTodos("links_tipos", "id"),

		// Consultas
		filtroEstandarCabecera: BD_genericas.obtienePorId("filtros_cabecera", 1),
		filtroEstandarCampos: BD_genericas.obtieneTodosPorCondicion("filtros_campos", {cabecera_id: 1}),
		layouts: BD_genericas.obtieneTodos("layouts", "orden"),
		ordenes: BD_genericas.obtieneTodos("ordenes", "orden"),
		// interes_opciones: BD_genericas.obtieneTodos("interes_opciones", "orden"),

		// Otros
		meses: BD_genericas.obtieneTodos("meses", "id"),
		diasDelAno: BD_genericas.obtieneTodosConInclude("diasDelAno", "epocaDelAno"),
	};
	// Procesa todas las lecturas
	let valores = Object.values(campos);
	valores = await Promise.all(valores);
	Object.keys(campos).forEach((campo, i) => (global[campo] = valores[i]));

	// Variables que dependen de las lecturas de BD
	// 1. Status de productos
	global.creado_id = global.status_registros.find((n) => n.creado).id;
	global.creadoAprob_id = status_registros.find((n) => n.creadoAprob).id;
	global.aprobado_id = global.status_registros.find((n) => n.aprobado).id;
	global.inactivar_id = global.status_registros.find((n) => n.inactivar).id;
	global.recuperar_id = global.status_registros.find((n) => n.recuperar).id;
	global.inactivo_id = global.status_registros.find((n) => n.inactivo).id;

	// 2. Tipos de actuación
	global.anime_id = tiposActuacion.find((n) => n.anime).id;
	global.documental_id = tiposActuacion.find((n) => n.documental).id;
	global.actuada_id = tiposActuacion.find((n) => !n.anime && !n.documental).id;

	// 3. Roles de usuario
	global.rol_consultas_id = roles_us.find((n) => !n.permInputs).id;
	global.rolPermInputs_id = roles_us.find((n) => n.permInputs && !n.revisorEnts && !n.revisorUs).id;
	
	// 4. Status de usuario
	global.st_editables_id = status_registro_us.find((n) => n.editables).id;
	global.st_ident_a_validar_id = status_registro_us.find((n) => n.ident_a_validar).id;
	global.st_ident_validada_id = status_registro_us.find((n) => n.ident_validada).id;

	// 4. Otros
	global.epocasVarias = global.epocas.find((n) => n.varias);
	global.epocasSinVarias = global.epocas.filter((n) => !n.varias);
	global.mesesAbrev = global.meses.map((n) => n.abrev);
	global.link_pelicula_id = links_tipos.find((n) => n.pelicula).id;
	global.hablaHispana = paises.filter((n) => n.idioma == "Spanish");
	global.hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");

	// Procesos que dependen de la variable 'global'
	// Rutinas
	const rutinas = require("./funciones/3-Rutinas/RT-Control");
	await rutinas.startupMasConfiguracion();

	// Middlewares que dependen de procesos anteriores
	// Para estar siempre logueado, si existe el cookie
	const loginConCookie = require("./middlewares/transversales/loginConCookie");
	app.use(loginConCookie);
	// Para tener el rastro de los últimos url
	const urlsUsadas = require("./middlewares/transversales/urlsUsadas");
	app.use(urlsUsadas);

	// Rutas que dependen de la variable 'global'
	const rutaUsuarios = require("./rutas_y_controladores/1-Usuarios/US-Rutas");
	const rutaCRUD = require("./rutas_y_controladores/2.0-Familias-CRUD/FM-Rutas");
	const rutaProd_Agregar = require("./rutas_y_controladores/2.1-Prod-Agregar/PA-Rutas");
	const rutaProd_RUD = require("./rutas_y_controladores/2.1-Prod-RUD/PR-Rutas");
	const rutaRCLV_CRUD = require("./rutas_y_controladores/2.2-RCLVs-CRUD/RCLV-Rutas");
	const rutaLinks_CRUD = require("./rutas_y_controladores/2.3-Links-CRUD/LK-Rutas");
	const rutaRevisarEnts = require("./rutas_y_controladores/3-RevisionEnts/RE-Rutas");
	const rutaRevisarUs = require("./rutas_y_controladores/4-RevisionUs/RU-Rutas");
	const rutaMantenimiento = require("./rutas_y_controladores/5-Mantenimiento/MT-Rutas");
	const rutaConsultas = require("./rutas_y_controladores/6-Consultas/CN-Rutas");
	const rutaInstitucional = require("./rutas_y_controladores/7-Institucional/IN-Rutas");
	const rutaMiscelaneas = require("./rutas_y_controladores/9-Miscelaneas/MS-Rutas");

	// Urls que dependen de la variable 'global'
	app.use("/crud", rutaCRUD);
	app.use("/producto/agregar", rutaProd_Agregar);
	app.use("/producto", rutaProd_RUD);
	app.use("/rclv", rutaRCLV_CRUD);
	app.use("/links", rutaLinks_CRUD);
	app.use("/usuarios", rutaUsuarios);
	app.use("/revision/usuarios", rutaRevisarUs);
	app.use("/revision", rutaRevisarEnts);
	app.use("/mantenimiento", rutaMantenimiento);
	app.use("/consultas", rutaConsultas);
	app.use("/institucional", rutaInstitucional);
	app.use("/", rutaMiscelaneas);

	// Middleware si un usuario usa un url desconocido - se debe informar después de los urls anteriores
	const urlDesconocida = require("./middlewares/transversales/urlDesconocida");
	app.use(urlDesconocida);
})();
