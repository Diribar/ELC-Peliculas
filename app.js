// VARIABLE 'GLOBAL' --------------------------------------------------------------
// Simples
global.unaHora = 60 * 60 * 1000;
global.unDia = unaHora * 24;
global.cuatroSems = unDia * 28;
global.unAno = unDia * 365;
global.diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
global.conLinks = 2;
global.talVez = 1;
global.sinLinks = 0;
global.usAutom_id = 2;
global.fechaPrimerLunesDelAno = null;
// Con 'require'
require("dotenv").config(); // Para usar el archivo '.env' --> se debe colocar al principio
global.localhost = process.env.localhost;
global.fs = require("fs");
global.carpetasImagen = fs.readdirSync("./publico/imagenes/3-EpocasDelAno");
global.path = require("path");
global.fetch = require("node-fetch");
global.db = require("./base_de_datos/modelos");
global.Op = db.Sequelize.Op;
const procesos = require("./funciones/3-Rutinas/RT-Procesos");
global.ImagenesDerecha = procesos.lecturaRutinasJSON().ImagenesDerecha;
const variables = require("./funciones/1-Procesos/Variables");
global.vistasInstitucs = variables.vistasInstitucs;

// Para usar propiedades de express
global.express = require("express");
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
	const BD_genericas = require("./funciones/2-BD/Genericas");
	let campos = {
		// Variables de usuario
		statusRegistrosUs: BD_genericas.obtieneTodos("statusRegistrosUs", "orden"),
		roles_us: BD_genericas.obtieneTodos("roles_usuarios", "orden"),

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
		roles_iglesia: BD_genericas.obtieneTodos("roles_iglesia", "orden"),

		// Variables de links
		linksProvs: BD_genericas.obtieneTodos("linksProvs", "orden"),
		linksTipos: BD_genericas.obtieneTodos("linksTipos"),

		// Consultas
		cn_layouts: BD_genericas.obtieneTodos("cn_layouts", "orden"),
		cn_ordenes: BD_genericas.obtieneTodos("cn_ordenes", "orden"),
		pppOpciones: BD_genericas.obtieneTodos("pppOpciones"),

		// Otros
		meses: BD_genericas.obtieneTodos("meses"),
		diasDelAno: BD_genericas.obtieneTodosConInclude("diasDelAno", "epocaDelAno"),
	};
	// Procesa todas las lecturas
	let valores = Object.values(campos);
	valores = await Promise.all(valores);
	Object.keys(campos).forEach((campo, i) => (global[campo] = valores[i]));

	// Variables que dependen de las lecturas de BD
	// 1. Status de productos
	global.creado_id = statusRegistros.find((n) => n.creado).id;
	global.creadoAprob_id = statusRegistros.find((n) => n.creadoAprob).id;
	global.aprobado_id = statusRegistros.find((n) => n.aprobado).id;
	global.inactivar_id = statusRegistros.find((n) => n.inactivar).id;
	global.recuperar_id = statusRegistros.find((n) => n.recuperar).id;
	global.inactivo_id = statusRegistros.find((n) => n.inactivo).id;
	global.atributosCalific = {feValores, entretiene, calidadTecnica};

	// 2. Tipos de actuación
	global.anime_id = tiposActuacion.find((n) => n.anime).id;
	global.documental_id = tiposActuacion.find((n) => n.documental).id;
	global.actuada_id = tiposActuacion.find((n) => !n.anime && !n.documental).id;

	// 3. Roles de usuario
	global.rol_consultas_id = roles_us.find((n) => !n.permInputs).id;
	global.rolPermInputs_id = roles_us.find((n) => n.permInputs && !n.revisorEnts && !n.revisorUs).id;

	// 4. Status de usuario
	global.mailPendValidar_id=statusRegistrosUs.find((n) => n.mailPendValidar).id
	global.editables_id = statusRegistrosUs.find((n) => n.editables).id;
	global.identPendValidar_id = statusRegistrosUs.find((n) => n.identPendValidar).id;
	global.identValidada_id = statusRegistrosUs.find((n) => n.identValidada).id;

	// Otros
	global.yaLaVi = pppOpciones.find((n) => n.yaLaVi);
	global.sinPreferencia = pppOpciones.find((n) => n.sinPreferencia);
	global.epocasVarias = epocasOcurrencia.find((n) => n.varias);
	global.epocasSinVarias = epocasOcurrencia.filter((n) => !n.varias);
	global.mesesAbrev = meses.map((n) => n.abrev);
	global.linkPelicula_id = linksTipos.find((n) => n.pelicula).id;
	global.linkTrailer_id = linksTipos.find((n) => n.trailer).id;
	global.hablaHispana = paises.filter((n) => n.idioma == "Spanish");
	global.hablaNoHispana = paises.filter((n) => n.idioma != "Spanish");

	// Procesos que dependen de la variable 'global'
	// Rutinas
	const rutinas = require("./funciones/3-Rutinas/RT-Control");
	await rutinas.startupMasConfiguracion();

	// Middlewares transversales
	app.use(require("./middlewares/transversales/loginConCookie")); // Para estar siempre logueado, si existe el cookie - depende de procesos anteriores
	app.use(require("./middlewares/transversales/urlsUsadas")); // Para tener el rastro de los últimos url - depende de procesos anteriores

	// Urls que dependen de la variable 'global'
	const rutaCRUD = require("./rutas_y_controladores/2.0-Familias-CRUD/FM-Rutas");
	app.use("/crud", rutaCRUD);
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
	app.use("/graficos", require("./rutas_y_controladores/7-Gráficos/GR-Rutas"));
	app.use("/", require("./rutas_y_controladores/9-Miscelaneas/MS-Rutas"));

	// Middlewares transversales
	app.use(require("./middlewares/transversales/urlDesconocida")); // Si no se reconoce el url - se debe informar después de los urls anteriores
})();
