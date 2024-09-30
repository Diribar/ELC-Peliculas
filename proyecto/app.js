// Variable 'global'
const constantes = require("./funciones/Variables1.js");
for (let metodo in constantes) global[metodo] = constantes[metodo];

// Require 'path'
global.path = require("path");
const carpeta = global.path.basename(path.resolve());
global.urlHost =
	carpeta == "Proyecto"
		? "http://localhost" // development
		: carpeta.includes("Pruebas")
		? "https://pruebas.elc.lat" // test
		: "https://elc.lat"; // producción
global.nodeEnv = carpeta == "Proyecto" ? "development" : "production";

// Variables que toman valores de '.env'
require("dotenv").config();
global.fetch = require("node-fetch");
global.anoELC = process.env.anoELC;
global.versionElc = process.env.versionElc;
global.carpetaPublica = path.join(__dirname, "publico");
global.carpetaExterna = path.join(__dirname, "..", process.env.carpetaExterna);

// Otros requires
global.express = require("express");
const app = express();
global.fs = require("fs");
global.carpsImagsEpocaDelAno = fs.readdirSync(carpetaExterna + "4-EpocasDelAno");

// Base de datos
global.config = require("./baseDeDatos/config/config.js")[nodeEnv];
global.Sequelize = require("sequelize");
global.sequelize = new Sequelize(config.database, config.username, config.password, config);
global.db = require("./baseDeDatos/modelos"); // tiene que ir después de 'fs', porque lo usa el archivo 'index'
global.Op = db.Sequelize.Op;

// Crea carpetas públicas - omit the first arg if you do not want the '/public' prefix for these assets
app.use("/publico", express.static(carpetaPublica));
app.use("/Externa", express.static(carpetaExterna));

// Otros
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
const PORT = nodeEnv == "development" ? "80" : process.env.PORT;
app.listen(PORT, () => console.log("Servidor funcionando..."));

// ******** Todas las carpetas donde se almacenan vistas **********
app.set("view engine", "ejs"); // Terminación de los archivos de vista
app.set("views", [
	...["./vistas/0-Compartido", "./vistas/0-Compartido/Header", "./vistas/0-Compartido/Main"],
	...["./vistas/1.1-Usuarios", "./vistas/1.1-Usuarios/Includes"],
	...["./vistas/1.2-Rev-Usuarios", "./vistas/1.2-Rev-Usuarios/Includes"],
	...["./vistas/2.0-Familias", "./vistas/2.0-Familias/Iconos", "./vistas/2.0-Familias/Includes"],
	...["./vistas/2.1-Prods-Agregar", "./vistas/2.1-Prods-Agregar/Includes"],
	...["./vistas/2.1-Prods-RUD", "./vistas/2.1-Prods-RUD/Includes"],
	...["./vistas/2.2-RCLVs", "./vistas/2.2-RCLVs/Includes"],
	...["./vistas/2.3-Links", "./vistas/2.3-Links/Includes"],
	...["./vistas/3-Rev-Entidades", "./vistas/3-Rev-Entidades/Includes"],
	...["./vistas/5-Consultas", "./vistas/5-Consultas/Includes"],
	...["./vistas/6-Graficos"],
	...["./vistas/7-Institucional", "./vistas/7-Institucional/Includes"],
]);

// Procesos que requieren de 'async' y 'await'
(async () => {
	// Variables que dependen de las lecturas de BD
	global.baseDeDatos = require("./funciones/BaseDatos");
	const variables3 = require("./funciones/Variables3.js");
	const lecturasDeBd = await variables3.lecturasDeBd();
	for (let campo in lecturasDeBd) global[campo] = lecturasDeBd[campo];
	const datosPartics = await variables3.datosPartics();
	for (let campo in datosPartics) global[campo] = datosPartics[campo];

	// Variables que requieren 'require'
	global.variables = require("./funciones/Variables2.js");
	global.comp = require("./funciones/Compartidas"); // tiene que ir antes que las BD
	const procesos = require("./funciones/Rutinas/RT-Procesos");
	global.rutinasJSON = procesos.lecturaRutinasJSON();
	global.ImagenesDerecha = rutinasJSON.ImagenesDerecha;

	// Filtros con 'default'
	global.filtrosConDefault = {};
	for (let prop in variables.filtrosCons)
		if (variables.filtrosCons[prop].default) filtrosConDefault[prop] = variables.filtrosCons[prop].default;

	// Procesos que dependen de la variable 'global'
	const rutinas = require("./funciones/Rutinas/RT-Control");
	await rutinas.startupMasConfiguracion();

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlsUsadas")); // para tener los últimos url
	app.use(require("./middlewares/transversales/clientes-0Bienvenido.js")); // para filtrar los 'bots'
	app.use(require("./middlewares/transversales/clientes-1Session.js")); // para obtener el cliente y usuario
	app.use(require("./middlewares/transversales/clientes-2Contador.js")); // para contar la cantidad de días de navegación
	app.use(require("./middlewares/transversales/clientes-3Carteles.js")); // en función de las novedades, revisa si se debe mostrar algún cartel

	// Vistas - Antiguas
	app.use("/", require("./rutas_y_contrs/2.0-Familias/FM-RutasAnt")); // incluye algunas de 'revisión' y corrección
	app.use("/producto/agregar", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-RutasAnt"));
	app.use("/producto", require("./rutas_y_contrs/2.1-Prods-RUD/PR-RutasAnt"));
	app.use("/rclv", require("./rutas_y_contrs/2.2-RCLVs/RCLV-RutasAnt"));
	app.use("/revision", require("./rutas_y_contrs/3-Rev-Entidades/RE-RutasAnt"));
	app.use("/revision/usuarios", require("./rutas_y_contrs/1.2-Rev-Usuarios/RU-RutasAnt"));

	// Vistas - Actuales
	app.use("/:entidad", require("./rutas_y_contrs/2.0-Familias/FM-Rutas")); // incluye algunas de 'revisión' y corrección
	app.use("/:entidad", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-Rutas")); // producto
	app.use("/:entidad", require("./rutas_y_contrs/2.1-Prods-RUD/PR-Rutas")); // producto
	app.use("/:entidad", require("./rutas_y_contrs/2.2-RCLVs/RCLV-Rutas")); // rclv
	app.use("/links", require("./rutas_y_contrs/2.3-Links/LK-Rutas"));
	app.use("/usuarios", require("./rutas_y_contrs/1.1-Usuarios/US-Rutas"));
	app.use("/revision", require("./rutas_y_contrs/3-Rev-Entidades/RE-Rutas"));
	app.use("/revision", require("./rutas_y_contrs/1.2-Rev-Usuarios/RU-Rutas"));
	app.use("/consultas", require("./rutas_y_contrs/5-Consultas/CN-Rutas"));
	app.use("/institucional", require("./rutas_y_contrs/7-Institucional/IN-Rutas"));
	app.use("/graficos", require("./rutas_y_contrs/6-Graficos/GR-Rutas"));
	app.use("/", require("./rutas_y_contrs/9-Miscelaneas/MS-Rutas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlDesconocida")); // Si no se reconoce el url - se debe informar después de los urls anteriores
})();
