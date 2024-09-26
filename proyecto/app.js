// Variable 'global'
const constantes = require("./funciones/Constantes");
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
	// Lectura de la base de datos
	global.baseDeDatos = require("./funciones/BaseDatos");
	let datos = {
		// Variables de usuario
		statusRegistrosUs: baseDeDatos.obtieneTodosConOrden("statusRegistrosUs", "orden"),
		rolesUs: baseDeDatos.obtieneTodosConOrden("rolesUsuarios", "orden"),

		// Variable de entidades
		statusRegistros: baseDeDatos.obtieneTodosConOrden("statusRegistros", "orden"),
		generos: baseDeDatos.obtieneTodosConOrden("generos", "orden"),
		statusMotivos: baseDeDatos
			.obtieneTodosConOrden("statusMotivos", "orden")
			.then((n) => n.sort((a, b) => (a.grupo < b.grupo ? -1 : a.grupo > b.grupo ? 1 : 0))),
		motivosEdics: baseDeDatos.obtieneTodosConOrden("motivosEdics", "orden"),

		// Variables de productos
		idiomas: baseDeDatos.obtieneTodosConOrden("idiomas", "nombre"),
		paises: baseDeDatos.obtieneTodos("paises", "cantProds").then((n) => n.sort((a, b) => (a.nombre < b.nombre ? -1 : 1))),
		publicos: baseDeDatos.obtieneTodosConOrden("publicos", "orden"),
		tiposActuacion: baseDeDatos.obtieneTodosConOrden("tiposActuacion", "orden"),
		epocasEstreno: baseDeDatos.obtieneTodosConOrden("epocasEstreno", "hasta", "DESC"),

		// Calificación de productos
		calCriterios: baseDeDatos.obtieneTodos("calCriterios"),
		feValores: baseDeDatos.obtieneTodosConOrden("feValores", "orden"),
		entretiene: baseDeDatos.obtieneTodosConOrden("entretiene", "orden"),
		calidadTecnica: baseDeDatos.obtieneTodosConOrden("calidadTecnica", "orden"),

		// Variables de RCLVs
		epocasOcurrencia: baseDeDatos.obtieneTodosConOrden("epocasOcurrencia", "orden"),
		rolesIglesia: baseDeDatos.obtieneTodosConOrden("rolesIglesia", "orden"),
		canons: baseDeDatos.obtieneTodosConOrden("canons", "orden"),
		hoyEstamos: baseDeDatos.obtieneTodosConOrden("hoyEstamos", "nombre"),

		// Variables de links
		linksProvs: baseDeDatos
			.obtieneTodos("linksProvs", "cantLinks")
			.then((n) => n.sort((a, b) => b.cantLinks.cantidad - a.cantLinks.cantidad)),
		linksTipos: baseDeDatos.obtieneTodos("linksTipos"),

		// Consultas
		cnEntidades: baseDeDatos.obtieneTodos("cnEntidades"),
		cnLayouts: baseDeDatos
			.obtieneTodos("cnLayouts", "entidades")
			.then((n) => n.filter((m) => m.activo))
			.then((n) => n.sort((a, b) => a.orden - b.orden)),
		pppOpcsArray: baseDeDatos.obtieneTodos("pppOpciones"),

		// Menús
		menuCapacitac: baseDeDatos.obtieneTodosConOrden("menuCapacitac", "orden").then((n) => n.filter((m) => m.actualizado)),
		menuUsuario: baseDeDatos.obtieneTodosConOrden("menuUsuario", "orden").then((n) => n.filter((m) => m.actualizado)),

		// Otros
		meses: baseDeDatos.obtieneTodos("meses"),
		fechasDelAno: baseDeDatos.obtieneTodos("fechasDelAno", "epocaDelAno"),
		novedadesELC: baseDeDatos.obtieneTodosConOrden("novedadesELC", "fecha"),
	};

	// Procesa todas las lecturas
	const valores = await Promise.all(Object.values(datos));
	Object.keys(datos).forEach((campo, i) => (global[campo] = valores[i]));

	// Variables que dependen de las lecturas de BD
	// 1. Status de productos - Simples
	global.creado_id = statusRegistros.find((n) => n.codigo == "creado").id;
	global.creadoAprob_id = statusRegistros.find((n) => n.codigo == "creadoAprob").id;
	global.aprobado_id = statusRegistros.find((n) => n.codigo == "aprobado").id;
	global.inactivar_id = statusRegistros.find((n) => n.codigo == "inactivar").id;
	global.recuperar_id = statusRegistros.find((n) => n.codigo == "recuperar").id;
	global.inactivo_id = statusRegistros.find((n) => n.codigo == "inactivo").id;
	// 1. Status de productos - Combinados
	global.creados_ids = [creado_id, creadoAprob_id];
	global.aprobados_ids = [creadoAprob_id, aprobado_id];
	global.estables_ids = [aprobado_id, inactivo_id];
	global.inacRecup_ids = [inactivar_id, recuperar_id];
	global.activos_ids = [creado_id, creadoAprob_id, aprobado_id];
	global.inactivos_ids = [inactivar_id, inactivo_id];

	// 2. Tipos de actuación
	global.anime_id = tiposActuacion.find((n) => n.codigo == "anime").id;
	global.documental_id = tiposActuacion.find((n) => n.codigo == "documental").id;
	global.actuada_id = tiposActuacion.find((n) => n.codigo == "actuada").id;

	// 3.A. Roles de usuario
	global.rolConsultas_id = rolesUs.find((n) => n.codigo == "consultas").id;
	global.rolPermInputs_id = rolesUs.find((n) => n.codigo == "permInputs").id;
	global.rolOmnipotente_id = rolesUs.find((n) => n.codigo == "omnipotente").id;
	global.rolesRevPERL_ids = rolesUs.filter((n) => n.revisorPERL).map((n) => n.id);
	global.rolesRevLinks_ids = rolesUs.filter((n) => n.revisorLinks).map((n) => n.id);

	// 3.B. Status de usuario
	global.mailPendValidar_id = statusRegistrosUs.find((n) => n.codigo == "mailPendValidar").id;
	global.mailValidado_id = statusRegistrosUs.find((n) => n.codigo == "mailValidado").id;
	global.editables_id = statusRegistrosUs.find((n) => n.codigo == "editables").id;
	global.perennes_id = statusRegistrosUs.find((n) => n.codigo == "perennes").id;

	// 4. Públicos
	global.mayores_ids = publicos.filter((n) => n.mayores).map((n) => n.id);
	global.familia_ids = publicos.find((n) => n.familia).id;
	global.menores_ids = publicos.filter((n) => n.menores).map((n) => n.id);

	// Preferencias por producto
	global.pppOpcsObj = {};
	for (let pppOcion of pppOpcsArray) global.pppOpcsObj[pppOcion.codigo] = pppOpcsArray.find((n) => n.codigo == pppOcion.codigo);

	// Otros - Productos
	global.atributosCalific = {feValores, entretiene, calidadTecnica};
	global.pppOpcsSimples = pppOpcsArray.filter((n) => !n.combo);
	global.hablaHispana = paises.filter((n) => n.idioma_id == "ES");
	global.hablaNoHispana = paises.filter((n) => n.idioma_id != "ES");

	// Links
	global.linkPelicula_id = linksTipos.find((n) => n.pelicula).id;
	global.linkTrailer_id = linksTipos.find((n) => n.trailer).id;
	global.provsEmbeded = linksProvs.filter((n) => n.embededPoner);

	// Otros
	global.epocasVarias = epocasOcurrencia.find((n) => n.id == "var");
	global.epocasSinVarias = epocasOcurrencia.filter((n) => n.id != "var");
	global.mesesAbrev = meses.map((n) => n.abrev);
	global.motivoInfoErronea = motivosEdics.find((n) => n.codigo == "infoErronea");
	global.motivoVersionActual = motivosEdics.find((n) => n.codigo == "versionActual");
	global.motivoDupl_id = statusMotivos.find((n) => n.codigo == "duplicado").id;

	// Variables que requieren 'require'
	global.variables = require("./funciones/Variables");
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

	// Urls que dependen de la variable 'global'
	// app.use("/:uno/:dos", (req,res)=>{res.send(req.params)});
	app.use("/", require("./rutas_y_contrs/2.0-Familias/FM-RutasAnt")); // incluye algunas de 'revisión' y corrección
	app.use("/producto/agregar", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-RutasAnt"));
	app.use("/producto", require("./rutas_y_contrs/2.1-Prods-RUD/PR-RutasAnt"));
	app.use("/rclv", require("./rutas_y_contrs/2.2-RCLVs/RCLV-RutasAnt"));

	app.use("/", require("./rutas_y_contrs/2.0-Familias/FM-Rutas")); // incluye algunas de 'revisión' y corrección
	app.use("/producto/ap", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-Rutas")); // producto
	app.use("/:entidad/ap", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-Rutas")); // producto
	app.use("/:entidad", require("./rutas_y_contrs/2.1-Prods-RUD/PR-Rutas")); // producto
	app.use("/:entidad", require("./rutas_y_contrs/2.2-RCLVs/RCLV-Rutas")); // rclv
	app.use("/links", require("./rutas_y_contrs/2.3-Links/LK-Rutas"));
	app.use("/usuarios", require("./rutas_y_contrs/1.1-Usuarios/US-Rutas"));
	app.use("/revision/usuarios", require("./rutas_y_contrs/1.2-Rev-Usuarios/RU-Rutas"));
	app.use("/revision", require("./rutas_y_contrs/3-Rev-Entidades/RE-Rutas"));
	app.use("/consultas", require("./rutas_y_contrs/5-Consultas/CN-Rutas"));
	app.use("/institucional", require("./rutas_y_contrs/7-Institucional/IN-Rutas"));
	app.use("/graficos", require("./rutas_y_contrs/6-Graficos/GR-Rutas"));
	app.use("/", require("./rutas_y_contrs/0-Compartido/CMP-Rutas"));
	app.use("/", require("./rutas_y_contrs/9-Miscelaneas/MS-Rutas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlDesconocida")); // Si no se reconoce el url - se debe informar después de los urls anteriores
})();
