// Variable 'global' - Tiempo
global.unaHora = 60 * 60 * 1000;
global.unDia = unaHora * 24;
global.unaSemana = unDia * 7;
global.unAno = unDia * 365;
global.diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Variable 'global' - Links
global.linksSemsPrimRev = 4;
global.linksSemsEstandar = 26;
global.linksVU_primRev = unaSemana * linksSemsPrimRev;
global.linksVU_estrRec = unaSemana * (linksSemsPrimRev + 1);
global.linksVU_estandar = unaSemana * linksSemsEstandar;
global.sinLinks = 0;
global.linksTalVez = 1;
global.conLinks = 2;
global.linkAnoReciente = 3; // cantidad de años
global.cantLinksVencPorSem = null;

// Variable 'global' - Otras
global.intentosCookies = 3; // cantidad que se tolera
global.intentosBD = 3; // cantidad que se tolera
global.usAutom_id = 2; // usuario 'automático'
global.primerLunesDelAno = null;
global.semanaUTC = null;
global.lunesDeEstaSemana = null;
global.fechaDelAnoHoy_id = null;
global.anoHoy = null;
global.tamMaxImagen = 1000000; // 1Mb
global.layoutDefault_id = 2; // El 'default' es "Al azar"
global.imgInstitucional = "/publico/imagenes/Varios/Institucional-Imagen.jpg";
global.setTimeOutStd = 1000;

// Require 'path'
global.path = require("path");
const carpeta = path.basename(path.resolve());
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
global.versionELC = process.env.versionELC;
global.carpetaPublica = path.join(__dirname, "publico");
global.carpetaExterna = path.join(__dirname, "..", process.env.carpetaExterna);

// Otros requires
global.fs = require("fs");
global.carpsImagsEpocaDelAno = fs.readdirSync(carpetaExterna + "4-EpocasDelAno");
global.db = require("./baseDeDatos/modelos"); // tiene que ir después de 'fs', porque lo usa el archivo 'index'
global.Op = db.Sequelize.Op;
global.express = require("express");
const app = express();

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
	path.resolve(__dirname, "./vistas"),
	path.resolve(__dirname, "./vistas/0-Compartido"),
	path.resolve(__dirname, "./vistas/0-Compartido/Header"),
	path.resolve(__dirname, "./vistas/0-Compartido/Main"),
	path.resolve(__dirname, "./vistas/1.1-Usuarios"),
	path.resolve(__dirname, "./vistas/1.1-Usuarios/Includes"),
	path.resolve(__dirname, "./vistas/1.2-Rev-Usuarios"),
	path.resolve(__dirname, "./vistas/1.2-Rev-Usuarios/Includes"),
	path.resolve(__dirname, "./vistas/2.0-Familias"),
	path.resolve(__dirname, "./vistas/2.0-Familias/Includes"),
	path.resolve(__dirname, "./vistas/2.0-Familias/Iconos"),
	path.resolve(__dirname, "./vistas/2.1-Prods-Agregar"),
	path.resolve(__dirname, "./vistas/2.1-Prods-Agregar/Includes"),
	path.resolve(__dirname, "./vistas/2.1-Prods-RUD"),
	path.resolve(__dirname, "./vistas/2.1-Prods-RUD/Includes"),
	path.resolve(__dirname, "./vistas/2.2-RCLVs"),
	path.resolve(__dirname, "./vistas/2.2-RCLVs/Includes"),
	path.resolve(__dirname, "./vistas/2.3-Links"),
	path.resolve(__dirname, "./vistas/2.3-Links/Includes"),
	path.resolve(__dirname, "./vistas/3-Rev-Entidades"),
	path.resolve(__dirname, "./vistas/3-Rev-Entidades/Includes"),
	path.resolve(__dirname, "./vistas/5-Consultas"),
	path.resolve(__dirname, "./vistas/5-Consultas/Includes"),
	path.resolve(__dirname, "./vistas/6-Graficos"),
	path.resolve(__dirname, "./vistas/7-Institucional"),
	path.resolve(__dirname, "./vistas/7-Institucional/Includes"),
]);

// Procesos que requieren de 'async' y 'await'
(async () => {
	// Lectura de la base de datos
	global.baseDeDatos = require("./funciones/2-Procesos/BaseDatos");
	let datos = {
		// Variables de usuario
		statusRegistrosUs: baseDeDatos.obtieneTodosConOrden("statusRegistrosUs", "orden"),
		rolesUs: baseDeDatos.obtieneTodosConOrden("rolesUsuarios", "orden"),

		// Variable de entidades
		statusRegistros: baseDeDatos.obtieneTodosConOrden("statusRegistros", "orden"),
		generos: baseDeDatos.obtieneTodosConOrden("generos", "orden"),
		motivosStatus: baseDeDatos
			.obtieneTodosConOrden("motivosStatus", "orden")
			.then((n) => n.sort((a, b) => (a.grupo < b.grupo ? -1 : a.grupo > b.grupo ? 1 : 0))),
		motivosEdics: baseDeDatos.obtieneTodosConOrden("motivosEdics", "orden"),

		// Variables de productos
		idiomas: baseDeDatos.obtieneTodosConOrden("idiomas", "nombre"),
		paises: baseDeDatos.obtieneTodosConOrden("paises", "nombre"),
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
		linksProvs: baseDeDatos.obtieneTodosConOrden("linksProvs", "cantLinks", "DESC"), // orden descendente
		linksTipos: baseDeDatos.obtieneTodos("linksTipos"),
		linksCategs: baseDeDatos.obtieneTodos("linksCategs"),

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

	// Links - categorías
	global.linksPrimRev_id = linksCategs.find((n) => n.nombre == "primRev").id;
	global.linksEstrRec_id = linksCategs.find((n) => n.nombre == "estrRec").id;
	global.linksEstandar_id = linksCategs.find((n) => n.nombre == "estandar").id;

	// Otros
	global.epocasVarias = epocasOcurrencia.find((n) => n.id == "var");
	global.epocasSinVarias = epocasOcurrencia.filter((n) => n.id != "var");
	global.mesesAbrev = meses.map((n) => n.abrev);
	global.motivoInfoErronea = motivosEdics.find((n) => n.codigo == "infoErronea");
	global.motivoVersionActual = motivosEdics.find((n) => n.codigo == "versionActual");
	global.motivosStatusConComentario_ids = motivosStatus.filter((n) => n.comentNeces).map((n) => n.id);

	// Variables que requieren 'require'
	global.variables = require("./funciones/2-Procesos/Variables");
	global.comp = require("./funciones/2-Procesos/Compartidas"); // tiene que ir antes que las BD
	const procesos = require("./funciones/1-Rutinas/RT-Procesos");
	global.rutinasJSON = procesos.lecturaRutinasJSON();
	global.ImagenesDerecha = rutinasJSON.ImagenesDerecha;
	global.vistasInstitucs = variables.vistasInstitucs;

	// Filtros con 'default'
	global.filtrosConDefault = {};
	for (let prop in variables.filtrosCons)
		if (variables.filtrosCons[prop].default) filtrosConDefault[prop] = variables.filtrosCons[prop].default;

	// Procesos que dependen de la variable 'global'
	const rutinas = require("./funciones/1-Rutinas/RT-Control");
	await rutinas.startupMasConfiguracion();

	// Middlewares transversales
	app.use(require("./middlewares/transversales/loginConCookie")); // Para estar siempre logueado, si existe el cookie - depende de procesos anteriores
	app.use(require("./middlewares/transversales/urlsUsadas")); // Para tener el rastro de los últimos url - depende de procesos anteriores

	// Urls que dependen de la variable 'global'
	app.use("/", require("./rutas_y_contrs/2.0-Familias/FM-Rutas")); // incluye algunas de 'revisión'
	app.use("/producto/agregar", require("./rutas_y_contrs/2.1-Prods-Agregar/PA-Rutas"));
	app.use("/producto", require("./rutas_y_contrs/2.1-Prods-RUD/PR-Rutas"));
	app.use("/rclv", require("./rutas_y_contrs/2.2-RCLVs/RCLV-Rutas"));
	app.use("/links", require("./rutas_y_contrs/2.3-Links/LK-Rutas"));
	app.use("/usuarios", require("./rutas_y_contrs/1.1-Usuarios/US-Rutas"));
	app.use("/revision/usuarios", require("./rutas_y_contrs/1.2-Rev-Usuarios/RU-Rutas"));
	app.use("/revision", require("./rutas_y_contrs/3-Rev-Entidades/RE-Rutas"));
	app.use("/consultas", require("./rutas_y_contrs/5-Consultas/CN-Rutas"));
	app.use("/institucional", require("./rutas_y_contrs/7-Institucional/IN-Rutas"));
	app.use("/graficos", require("./rutas_y_contrs/6-Graficos/GR-Rutas"));
	app.use("/", require("./rutas_y_contrs/9-Miscelaneas/MS-Rutas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlDesconocida")); // Si no se reconoce el url - se debe informar después de los urls anteriores
})();
