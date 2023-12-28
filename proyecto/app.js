// Variable 'global' - Tiempo
global.unaHora = 60 * 60 * 1000;
global.unDia = unaHora * 24;
global.unaSemana = unDia * 7;
global.unAno = unDia * 365;
global.diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Variable 'global' - Links
global.vidaPrimRevision = unaSemana * 4;
global.vidaUtilLinks = unaSemana * 26;
global.sinLinks = 0;
global.talVez = 1;
global.conLinks = 2;

// Variable 'global' - Otras
global.usAutom_id = 2; // usuario 'automático'
global.primerLunesDelAno = null;
global.semanaUTC = null;
global.lunesDeEstaSemana = null;
global.fechaDelAnoHoy_id = null;
global.anoHoy = null;
global.tamMaxImagen = 1000000; // 1Mb
global.configConsDefault_id = 35; // El 'default' es "Sorprendeme"
global.imgInstitucional = "/publico/imagenes/Varios/Institucional-Imagen.jpg";

// Con 'require'
require("dotenv").config(); // Para usar el archivo '.env' --> se debe colocar al principio
global.fetch = require("node-fetch");
global.nodeEnv = process.env.NODE_ENV; // obtiene si es 'development' o 'production'
global.urlHost = nodeEnv == "development" ? "http://localhost" : "https://elc.lat";
global.db = require("./base_de_datos/modelos");
global.Op = db.Sequelize.Op;
global.path = require("path");
global.carpetaExterna = path.join(__dirname, "../", process.env.carpetaExterna);
global.fs = require("fs");
global.carpsImagsEpocaDelAno = fs.readdirSync(carpetaExterna + "4-EpocasDelAno");

// Obtiene la versión y el año
const {exec} = require("child_process");
const carpeta = path.basename(path.resolve());
exec("git rev-parse --abbrev-ref HEAD", (err, stdout) => (global.versionELC = (err ? carpeta : stdout.trim()).slice(-4)));
exec("git rev-parse --abbrev-ref HEAD", (err, stdout) => (global.anoELC = (err ? carpeta : stdout.trim()).slice(0, 4)));

// Para usar propiedades de express
global.express = require("express");
const app = express();

// Crea carpetas públicas - omit the first arg if you do not want the '/public' prefix for these assets
app.use("/publico", express.static(path.join(__dirname, "publico")));
app.use("/externa", express.static(carpetaExterna));

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
	path.resolve(__dirname, "./vistas"),
	path.resolve(__dirname, "./vistas/0-Compartido"),
	path.resolve(__dirname, "./vistas/0-Compartido/Header"),
	path.resolve(__dirname, "./vistas/0-Compartido/Main"),
	path.resolve(__dirname, "./vistas/1-Usuarios"),
	path.resolve(__dirname, "./vistas/1-Usuarios/Includes"),
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
	path.resolve(__dirname, "./vistas/5-Consultas"),
	path.resolve(__dirname, "./vistas/5-Consultas/Includes"),
	path.resolve(__dirname, "./vistas/6-Institucional"),
	path.resolve(__dirname, "./vistas/6-Institucional/Includes"),
	path.resolve(__dirname, "./vistas/7-Graficos"),
	path.resolve(__dirname, "./vistas/9-Miscelaneas"),
	path.resolve(__dirname, "./vistas/9-Miscelaneas/Includes"),
]);

// Procesos que requieren de 'async' y 'await'
(async () => {
	// Lectura de la base de datos
	const BD_genericas = require("./funciones/1-BD/Genericas");
	let datos = {
		// Variables de usuario
		statusRegistrosUs: BD_genericas.obtieneTodos("statusRegistrosUs", "orden"),
		rolesUs: BD_genericas.obtieneTodos("rolesUsuarios", "orden"),

		// Variable de entidades
		statusRegistros: BD_genericas.obtieneTodos("statusRegistros", "orden"),
		sexos: BD_genericas.obtieneTodos("sexos", "orden"),
		motivosStatus: BD_genericas.obtieneTodos("motivosStatus", "orden"),
		motivosEdics: BD_genericas.obtieneTodos("motivosEdics", "orden"),

		// Variables de productos
		idiomas: BD_genericas.obtieneTodos("idiomas", "nombre"),
		paises: BD_genericas.obtieneTodos("paises", "nombre"),
		publicos: BD_genericas.obtieneTodos("publicos", "orden"),
		tiposActuacion: BD_genericas.obtieneTodos("tiposActuacion", "orden"),
		criteriosCalif: BD_genericas.obtieneTodos("cal_criterio"),
		feValores: BD_genericas.obtieneTodos("feValores", "orden"),
		entretiene: BD_genericas.obtieneTodos("entretiene", "orden"),
		calidadTecnica: BD_genericas.obtieneTodos("calidadTecnica", "orden"),
		epocasEstreno: BD_genericas.obtieneTodos("epocasEstreno", "orden"),

		// Variables de RCLVs
		epocasOcurrencia: BD_genericas.obtieneTodos("epocasOcurrencia", "orden"),
		canons: BD_genericas.obtieneTodos("canons", "orden"),
		rolesIglesia: BD_genericas.obtieneTodos("rolesIglesia", "orden"),

		// Variables de links
		linksProvs: BD_genericas.obtieneTodos("linksProvs", "cantLinks", true), // orden descendente
		linksTipos: BD_genericas.obtieneTodos("linksTipos"),

		// Consultas
		cn_entidades: BD_genericas.obtieneTodosPorCondicion("cn_entidades", {activo: true}),
		cn_opcionesPorEnt: BD_genericas.obtieneTodosPorCondicionConInclude("cn_opcionesPorEnt", {activo: true}, [
			"entidad",
			"opcion",
		]).then((n) => n.sort((a, b) => a.orden - b.orden)),
		cn_opciones: BD_genericas.obtieneTodos("cn_opciones"),
		pppOpciones: BD_genericas.obtieneTodos("pppOpciones"),

		// Menús
		menuCapacitac: BD_genericas.obtieneTodos("menuCapacitac", "orden").then((n) => n.filter((m) => m.actualizado)),
		menuUsuario: BD_genericas.obtieneTodos("menuUsuario", "orden").then((n) => n.filter((m) => m.actualizado)),

		// Otros
		meses: BD_genericas.obtieneTodos("meses"),
		fechasDelAno: BD_genericas.obtieneTodosConInclude("fechasDelAno", "epocaDelAno"),
		novedadesELC: BD_genericas.obtieneTodos("novedadesELC", "fecha"),
	};
	// Procesa todas las lecturas
	const valores = await Promise.all(Object.values(datos));
	Object.keys(datos).forEach((campo, i) => (global[campo] = valores[i]));

	// Variables que dependen de las lecturas de BD
	// 1. Status de productos
	global.creado_id = statusRegistros.find((n) => n.codigo == "creado").id;
	global.creadoAprob_id = statusRegistros.find((n) => n.codigo == "creadoAprob").id;
	global.aprobado_id = statusRegistros.find((n) => n.codigo == "aprobado").id;
	global.inactivar_id = statusRegistros.find((n) => n.codigo == "inactivar").id;
	global.recuperar_id = statusRegistros.find((n) => n.codigo == "recuperar").id;
	global.inactivo_id = statusRegistros.find((n) => n.codigo == "inactivo").id;
	global.creados_ids = statusRegistros.filter((n) => n.creados).map((n) => n.id);
	global.aprobados_ids = statusRegistros.filter((n) => n.aprobados).map((n) => n.id);

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
	global.mayores_ids = publicos.filter((n) => n.grupo == "mayores").map((n) => n.id);
	global.familia_id = publicos.find((n) => n.grupo == "familia").id;
	global.menores_ids = publicos.filter((n) => n.grupo == "menores").map((n) => n.id);

	// Preferencias por producto
	for (let pppOcion of pppOpciones) global[pppOcion.codigo] = pppOpciones.find((n) => n.codigo == pppOcion.codigo);

	// Otros
	global.epocasVarias = epocasOcurrencia.find((n) => n.id == "var");
	global.epocasSinVarias = epocasOcurrencia.filter((n) => n.id != "var");
	global.mesesAbrev = meses.map((n) => n.abrev);
	global.linkPelicula_id = linksTipos.find((n) => n.pelicula).id;
	global.linkTrailer_id = linksTipos.find((n) => n.trailer).id;
	global.hablaHispana = paises.filter((n) => n.idioma == "Spanish");
	global.hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");
	global.atributosCalific = {feValores, entretiene, calidadTecnica};
	global.motivoInfoErronea = motivosEdics.find((n) => n.codigo == "infoErronea");
	global.motivoVersionActual = motivosEdics.find((n) => n.codigo == "versionActual");
	global.pppOpcionesSimples = pppOpciones.filter((n) => !n.combo);
	global.provsEmbeded = linksProvs.filter((n) => n.embededPoner);

	// Variables que requieren 'require'
	global.variables = require("./funciones/2-Procesos/Variables");
	global.comp = require("./funciones/2-Procesos/Compartidas"); // tiene que ir antes que las BD
	global.BD_genericas = require("./funciones/1-BD/Genericas");
	global.BD_especificas = require("./funciones/1-BD/Especificas");
	const procesos = require("./funciones/3-Rutinas/RT-Procesos");
	global.rutinasJSON = procesos.lecturaRutinasJSON();
	global.ImagenesDerecha = rutinasJSON.ImagenesDerecha;
	global.vistasInstitucs = variables.vistasInstitucs;

	// Filtros con 'default'
	const camposConsultas = variables.camposConsultas;
	global.filtrosConDefault = {};
	for (let filtro in camposConsultas)
		if (camposConsultas[filtro].default) filtrosConDefault[filtro] = camposConsultas[filtro].default;

	// Procesos que dependen de la variable 'global'
	const rutinas = require("./funciones/3-Rutinas/RT-Control");
	await rutinas.startupMasConfiguracion();

	// Middlewares transversales
	app.use(require("./middlewares/transversales/loginConCookie")); // Para estar siempre logueado, si existe el cookie - depende de procesos anteriores
	app.use(require("./middlewares/transversales/urlsUsadas")); // Para tener el rastro de los últimos url - depende de procesos anteriores

	// Urls que dependen de la variable 'global'
	const rutaCRUD = require("./rutas_y_controladores/2.0-Familias-CRUD/FM-Rutas");
	app.use("/", rutaCRUD);
	app.use("/producto/agregar", require("./rutas_y_controladores/2.1-Prod-Agregar/PA-Rutas"));
	app.use("/producto", require("./rutas_y_controladores/2.1-Prod-RUD/PR-Rutas"));
	app.use("/rclv", require("./rutas_y_controladores/2.2-RCLVs-CRUD/RCLV-Rutas"));
	app.use("/links", require("./rutas_y_controladores/2.3-Links-CRUD/LK-Rutas"));
	app.use("/usuarios", require("./rutas_y_controladores/1-Usuarios/US-Rutas"));
	app.use("/revision/usuarios", require("./rutas_y_controladores/4-RevisionUs/RU-Rutas"));
	app.use("/revision", require("./rutas_y_controladores/3-RevisionEnts/RE-Rutas"));
	app.use("/revision", rutaCRUD); // Para vistas compartidas con CRUD
	app.use("/consultas", require("./rutas_y_controladores/5-Consultas/CN-Rutas"));
	app.use("/institucional", require("./rutas_y_controladores/6-Institucional/IN-Rutas"));
	app.use("/graficos", require("./rutas_y_controladores/7-Graficos/GR-Rutas"));
	app.use("/", require("./rutas_y_controladores/9-Miscelaneas/MS-Rutas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlDesconocida")); // Si no se reconoce el url - se debe informar después de los urls anteriores
})();
