// VARIABLE 'GLOBAL' --------------------------------------------------------------
global.unaHora = 60 * 60 * 1000; // Para usar la variable en todo el proyecto
global.unDia = 60 * 60 * 1000 * 24; // Para usar la variable en todo el proyecto
global.unMes = 60 * 60 * 1000 * 24 * 30; // Para usar la variable en todo el proyecto
global.mesesAbrev = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Requires
require("dotenv").config(); // Para usar el archivo '.env' --> se debe colocar al principio
const fs = require("fs");
const BD_genericas = require("./funciones/2-BD/Genericas");
const comp = require("./funciones/3-Procesos/Compartidas");

// Variables que usan funciones
(async () => {
	// Averigua los títulos de la imagen de ayer y hoy
	let rutaNombre = "./funciones/3-Procesos/fecha.json";
	let datos = JSON.parse(fs.readFileSync(rutaNombre, "utf8"));
	global.tituloImgDerAyer = datos.tituloImgDerAyer;
	global.tituloImgDerHoy = datos.tituloImgDerHoy;

	// Averigua la fecha de la 'Línea de Cambio de Fecha'
	global.horarioLCF = null;
	comp.horarioLCF();

	// Completa el objeto 'global'
	// global.status_registro= await BD_genericas.obtieneTodos("status_registro", "orden")
	let campos = {
		// Variables de usuario
		status_registro_us: BD_genericas.obtieneTodos("status_registro_us", "orden"),
		roles_us: BD_genericas.obtieneTodos("roles_usuarios", "orden"),
		// Variable de entidades
		status_registro: BD_genericas.obtieneTodos("status_registro", "orden"),
		// Consultas - Filtro Personalizado
		filtroEstandar: BD_genericas.obtienePorId("filtros_cabecera", 1),
		// Consultas - Complementos de RCLV
		epoca: BD_genericas.obtieneTodos("epoca", "orden"),
		procs_canon: BD_genericas.obtieneTodos("procs_canon", "orden"),
		roles_iglesia: BD_genericas.obtieneTodos("roles_iglesia", "orden"),
		// Consultas - Otros
		publicos: BD_genericas.obtieneTodos("publicos", "orden"),
		interes_opciones: BD_genericas.obtieneTodos("interes_opciones", "orden"),
		tipos_actuacion: BD_genericas.obtieneTodos("tipos_actuacion", "orden"),
	};
	// Espera a que todas se procesen y consolida la info
	let valores = Object.values(campos);
	valores = await Promise.all(valores);
	Object.keys(campos).forEach((campo, i) => (global[campo] = valores[i]));
})();

// REQUIRES Y MIDDLEWARES DE APLICACIÓN ------------------------------------------
const path = require("path");
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
// Para estar siempre logueado, si existe el cookie
const usuario = require("./middlewares/usuarios/loginConCookie");
app.use(usuario);
// Para tener el rastro de los últimos url
const userLogs = require("./middlewares/usuarios/userLogs");
app.use(userLogs);
// Dispara tareas en cierto horario
var cron = require("node-cron");
// 1. Tareas a realizar a la hora 00:05 de GMT-12
cron.schedule("5 0 * * *", () => comp.tareasDiarias(), {timezone: "Etc/GMT-12"});
comp.tareasDiarias();

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
	path.resolve(__dirname, "./vistas/2.1-Prod-Agregar"),
	path.resolve(__dirname, "./vistas/2.1-Prod-Agregar/Includes"),
	path.resolve(__dirname, "./vistas/2.1-Prod-RUD"),
	path.resolve(__dirname, "./vistas/2.1-Prod-RUD/Includes"),
	path.resolve(__dirname, "./vistas/2.2-RCLV-CRUD"),
	path.resolve(__dirname, "./vistas/2.2-RCLV-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/2.3-Links-CRUD"),
	path.resolve(__dirname, "./vistas/2.3-Links-CRUD/Includes"),
	path.resolve(__dirname, "./vistas/3-RevisionEnts"),
	path.resolve(__dirname, "./vistas/3-RevisionEnts/Includes"),
	path.resolve(__dirname, "./vistas/4-RevisionUs"),
	path.resolve(__dirname, "./vistas/4-RevisionUs/Includes"),
	path.resolve(__dirname, "./vistas/5-Consultas"),
	path.resolve(__dirname, "./vistas/5-Consultas/Includes"),
	path.resolve(__dirname, "./vistas/9-Miscelaneas"),
]);

// ************************* Rutas ********************************
// CRUD
const rutaCRUD = require("./rutas_y_controladores/2.0-Familias-CRUD/Rutas");
const rutaProd_Crear = require("./rutas_y_controladores/2.1-Prod-Agregar/Rutas");
const rutaProd_RUD = require("./rutas_y_controladores/2.1-Prod-RUD/Rutas");
const rutaRCLV_CRUD = require("./rutas_y_controladores/2.2-RCLV-CRUD/Rutas");
const rutaLinks_CRUD = require("./rutas_y_controladores/2.3-Links-CRUD/Rutas");
app.use("/crud/api", rutaCRUD);
app.use("/producto/agregar", rutaProd_Crear);
app.use("/producto", rutaProd_RUD);
app.use("/rclv", rutaRCLV_CRUD);
app.use("/links", rutaLinks_CRUD);
// Demás
const rutaUsuarios = require("./rutas_y_controladores/1-Usuarios/Rutas");
const rutaRevisarUs = require("./rutas_y_controladores/4-RevisionUs/Rutas");
const rutaRevisarEnts = require("./rutas_y_controladores/3-RevisionEnts/Rutas");
const rutaConsultas = require("./rutas_y_controladores/5-Consultas/Rutas");
const rutaMiscelaneas = require("./rutas_y_controladores/9-Miscelaneas/Rutas");
app.use("/usuarios", rutaUsuarios);
app.use("/revision/usuarios", rutaRevisarUs);
app.use("/revision", rutaRevisarEnts);
app.use("/consultas", rutaConsultas);
app.use("/", rutaMiscelaneas);

// ************************ Errores *******************************
app.use((req, res) => {
	const variables = require("./funciones/3-Procesos/Variables");
	let informacion = {
		mensajes: ["No tenemos esa dirección de url en nuestro sitio"],
		iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
	};
	res.status(404).render("CMP-0Estructura", {informacion});
});
