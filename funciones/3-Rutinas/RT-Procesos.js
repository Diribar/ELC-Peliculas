"use strict";
// Variables
const comp = require("../2-Procesos/Compartidas");
const BD_genericas = require("../1-BD/Genericas");
const BD_especificas = require("../1-BD/Especificas");
const variables = require("../2-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Interacciones con el archivo Rutinas.json
	lecturaRutinasJSON: () => {
		// Obtiene información del archivo 'json'
		const rutaNombre = archsSinVersion + "/Rutinas.json";
		const existe = comp.gestionArchivos.existe(rutaNombre);
		const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
		const info = json ? JSON.parse(json) : {};

		// Fin
		return info;
	},
	guardaArchivoDeRutinas: function (datos, menu) {
		// Obtiene la informacion vigente
		let info = {...rutinasJSON};

		// Averigua si hubo alguna novedad
		let sonIguales = true;
		for (let campo1 in datos) {
			// Variable
			const datoNuevo = datos[campo1];
			const datoGuardado = info[campo1];

			// Si los datos son iguales, saltea los controles posteriores
			if (datoNuevo == datoGuardado) continue;
			else if (!datoGuardado) sonIguales = false;
			// String - varios casos
			else if (typeof datoNuevo == "string") sonIguales = false;
			// Array - RutinasHorarias
			else if (Array.isArray(datoNuevo)) {
				if (!Array.isArray(datoGuardado)) sonIguales = false;
				else if (datoNuevo.length != datoGuardado.length) sonIguales = false;
				else datoNuevo.forEach((campo, i) => (campo != datoGuardado[i] ? (sonIguales = false) : null));
			}
			// Objeto - 'RutinasDiarias' y 'RutinasSemanales' / la de 'ImagenesDerecha' se revisa en una función anterior a esta rutina
			else if (Array.isArray(datoGuardado)) sonIguales = false; // Revisa si el original no es un objeto
			else {
				// Variables
				const camposNuevo = Object.keys(datoNuevo);
				const camposGuardado = Object.keys(datoGuardado);

				// Revisa que tengan la misma cantidad de campos
				if (camposNuevo.length != camposGuardado.length) sonIguales = false;
				// Revisa que tengan el mismo valor de string
				else camposNuevo.forEach((campo, i) => (campo != camposGuardado[i] ? (sonIguales = false) : null));
			}

			// Fin
			if (!sonIguales) break;
		}

		// Si no hubo ninguna novedad, sale de la función
		if (sonIguales) return true;

		// Actualiza la información
		info = menu ? {...info, [menu]: {...info[menu], ...datos}} : {...info, ...datos};

		// Guarda la información actualizada
		const rutaNombre = archsSinVersion + "/Rutinas.json";
		rutinasJSON = {...info};
		fs.writeFileSync(rutaNombre, JSON.stringify(info), function writeJSON(err) {
			if (err) console.log("Actualiza Rutinas JSON:", err, datos);
			return;
		});

		// Fin
		return false;
	},

	// Imagen Derecha
	borraLosArchivosDeImgDerechaObsoletos: (fechas) => {
		// Variables
		const carpetaImagen = "./publico/archSinVersion/5-ImagenDerecha/";
		const archivosDeImagen = fs.readdirSync(carpetaImagen);

		// Revisa si corresponde borrar los archivos
		for (let archivo of archivosDeImagen) {
			const dot = archivo.lastIndexOf(".");
			if (dot < 0) dato = archivo.length;

			if (!fechas.includes(archivo.slice(0, dot))) comp.gestionArchivos.elimina(carpetaImagen, archivo);
		}

		// Fin
		return;
	},
	obtieneImgDerecha: async (fechaNum) => {
		// Variables
		const fecha = new Date(fechaNum);

		// Obtiene el 'fechaDelAno_id'
		const dia = fecha.getDate();
		const mes_id = fecha.getMonth() + 1;
		const fechaDelAno = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes_id);
		delete fechaDelAno.epocaDelAno;

		// Obtiene los RCLV
		const rclvs = await obtieneLosRCLV(fechaDelAno);

		// Acciones si se encontraron varios rclvs
		const resultado = reduceRCLVs(rclvs);

		// Obtiene los datos de la imgDerecha
		const imgDerecha = datosImgDerecha(resultado);

		// Fin
		return imgDerecha;
	},
	diaMesAno: (fecha) => {
		fecha = new Date(fecha);
		let dia = ("0" + fecha.getDate()).slice(-2);
		let mes = mesesAbrev[fecha.getMonth()];
		let ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "-" + mes + "-" + ano;
		return fecha;
	},

	// Borra imágenes obsoletas
	eliminaImagenesSinRegistro: async ({carpeta, familia, entidadEdic, status_id, campoAvatar}) => {
		// Variables
		const petitFamilias = comp.obtieneDesdeFamilias.petitFamilias(familia);
		let avatarsEdic = [];
		let avatarsOrig = [];
		let consolidado = [];

		// Revisa los avatars que están en las ediciones
		if (entidadEdic) avatarsEdic = BD_especificas.nombresDeAvatarEnBD({entidad: entidadEdic});

		// Revisa los avatars que están en los originales
		if (status_id)
			for (let entidad of variables.entidades[petitFamilias])
				avatarsOrig.push(BD_especificas.nombresDeAvatarEnBD({entidad, status_id, campoAvatar}));

		// Espera y consolida los resultados
		await Promise.all([avatarsEdic, ...avatarsOrig]).then((n) => n.map((m) => consolidado.push(...m)));

		// Elimina los avatars
		eliminaLasImagenes(consolidado, carpeta);

		// Fin
		return;
	},
	eliminaImagenesProvisorio: () => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		let archivos = fs.readdirSync("./publico/archSinVersion/9-Provisorio");

		// Rutina para borrar archivos
		for (let archivo of archivos) {
			const fechaHora = fs.statSync("./publico/archSinVersion/9-Provisorio/" + archivo).birthtime;
			if (fechaHora < Date.now() - unDia * 3) comp.gestionArchivos.elimina("./publico/archSinVersion/9-Provisorio", archivo);
		}

		// Fin
		return;
	},

	// Mail de Feedback
	mailDeFeedback: {
		obtieneElHistorial: async () => {
			// Variables
			let registros = [];
			let condiciones;

			// Obtiene los registros de "histStatus"
			condiciones = {aprobado: {[Op.ne]: null}, comunicadoEn: null};
			registros.push(
				BD_genericas.obtieneTodosPorCondicion("histStatus", condiciones)
					// Agrega el nombre de la tabla
					.then((n) => n.map((m) => ({...m, tabla: "histStatus"})))
			);

			// Obtiene los registros de "histEdics"
			condiciones = {comunicadoEn: null};
			registros.push(
				BD_genericas.obtieneTodosPorCondicionConInclude("histEdics", condiciones, "motivo")
					// Agrega el nombre de la tabla
					.then((n) => n.map((m) => ({...m, tabla: "histEdics"})))
			);

			// Espera a que se reciba la info
			const [regsStatus, regsEdic] = await Promise.all(registros);

			// Fin
			return {regsStatus, regsEdic};
		},
		mensajeStatus: async (regsStatus) => {
			// Variables
			let resultados = [];
			let mensajesAcum = "";
			let mensajesAprob = "";
			let mensajesRech = "";
			let color;

			// De cada registro de status, obtiene los campos clave o los elabora
			for (let regStatus of regsStatus) {
				// Variables
				const aprobado = regStatus.aprobado;
				const familia = comp.obtieneDesdeEntidad.familia(regStatus.entidad);
				const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(regStatus.entidad);
				const statusFinal = statusRegistros.find((n) => n.id == regStatus.statusFinal_id);
				const statusInicial = statusRegistros.find((n) => n.id == regStatus.statusOriginal_id);
				const motivo = regStatus.comentario && !aprobado ? regStatus.comentario : "";
				const {nombreOrden, nombreVisual} = await nombres(regStatus, familia);
				if (!nombreOrden) continue;

				// Alimenta el resultado
				resultados.push({
					familia,
					entidadNombre,
					nombreOrden,
					nombreVisual,
					statusInicial,
					statusFinal,
					aprobado,
					motivo,
				});
			}

			// Ordena la información según los campos de mayor criterio, siendo el primero la familia y luego la entidad
			resultados = ordenarStatus(resultados);

			// Crea el mensaje en formato texto para cada registro de status, y se lo asigna a mensajesAprob o mensajesRech
			resultados.map((n) => {
				let mensaje = n.entidadNombre + ": <b>" + n.nombreVisual + "</b>,";
				mensaje += " de status <em>" + n.statusInicial.nombre.toLowerCase() + "</em>";
				mensaje += " a status <b><em>" + n.statusFinal.nombre.toLowerCase() + "</em></b>";
				if (n.motivo) mensaje += ". <u>Motivo</u>: " + n.motivo;
				color = n.aprobado ? "green" : "firebrick";
				mensaje = formatos.li(mensaje, color);
				n.aprobado ? (mensajesAprob += mensaje) : (mensajesRech += mensaje);
			});

			// Crea el mensajeGlobal, siendo primero los aprobados y luego los rechazados
			if (mensajesAprob) mensajesAcum += formatos.h2("Cambios de Status - APROBADOS") + formatos.ol(mensajesAprob);
			if (mensajesRech) mensajesAcum += formatos.h2("Cambios de Status - RECHAZADOS") + formatos.ol(mensajesRech);
			const mensajeGlobal = mensajesAcum;

			// Fin
			return mensajeGlobal;
		},
		mensajeEdic: async (regsEdic) => {
			// Variables
			let resultados = [];
			let mensajesAcum = "";
			let mensajesCampo, mensaje, color;

			// De cada registro, obtiene los campos clave o los elabora
			for (let regEdic of regsEdic) {
				// Variables
				const aprobado = !regEdic.motivo_id;
				const familia = comp.obtieneDesdeEntidad.familia(regEdic.entidad);
				const {nombreOrden, nombreVisual} = await nombres(regEdic, familia);
				if (!nombreOrden) continue;

				// Alimenta el resultado
				resultados.push({
					...{aprobado, familia, nombreOrden, nombreVisual},
					entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(regEdic.entidad),
					entidad_id: regEdic.entidad_id,
					campo: regEdic.titulo,
					valorAprob: regEdic.valorAprob,
					valorDesc: regEdic.valorDesc,
					motivo: !aprobado ? regEdic.motivo.descripcion : "",
				});
			}

			// Ordena la información según los campos de mayor criterio, siendo el primero la familia y luego la entidad
			resultados = ordenarEdic(resultados);

			// Crea el mensaje en formato texto para cada entidad, y sus campos
			resultados.forEach((n, i) => {
				// Acciones por nueva entidad/entidad_id
				if (
					!i ||
					(i && (n.entidadNombre != resultados[i - 1].entidadNombre || n.entidad_id != resultados[i - 1].entidad_id))
				) {
					// Título de la entidad y nombre del producto
					mensaje = n.entidadNombre + ": <b>" + n.nombreVisual + "</b>";
					mensajesAcum += formatos.li(mensaje);
					// Borra los mensajes anteriores que tuviera
					mensajesCampo = "";
				}

				// Adecua la info para el avatar
				if (n.campo == "Avatar") {
					// Variables
					const texto = n.aprobado ? {aprob: "sugerida", desc: "anterior"} : {aprob: "vigente", desc: "sugerida"};
					n.valorAprob = avatarConLink(n.familia, n.valorAprob, texto.aprob);
					n.valorDesc = avatarConLink(n.familia, n.valorDesc, texto.desc);
				}

				// Dots + campo
				mensaje = n.campo + ": ";
				mensaje += n.aprobado
					? n.valorAprob && n.valorDesc
						? "<em><b>" + n.valorAprob + "</b></em> reemplazó a <em>" + n.valorDesc + "</em>"
						: n.valorAprob
						? "<em><b>" + n.valorAprob + "</b></em>"
						: "<em><b>" + n.valorDesc + "</b></em> fue quitado"
					: "se mantuvo <em><b>" +
					  (n.valorAprob ? n.valorAprob : "(vacío)") +
					  "</b></em> como mejor opción que <em>" +
					  (n.valorDesc ? n.valorDesc : "(vacío)") +
					  "</em>. Motivo: " +
					  n.motivo.toLowerCase();

				color = n.aprobado ? "green" : "firebrick";
				mensajesCampo += formatos.li(mensaje, color);

				// Acciones por fin de la entidad/entidad_id
				if (
					i == resultados.length - 1 ||
					n.entidadNombre != resultados[i + 1].entidadNombre ||
					n.entidad_id != resultados[i + 1].entidad_id
				)
					mensajesAcum += formatos.ul(mensajesCampo);
			});

			// Crea el mensajeGlobal
			const titulo = formatos.h2("Ediciones");
			mensajesAcum = formatos.ol(mensajesAcum);
			const mensajeGlobal = titulo + mensajesAcum;

			// Fin
			return mensajeGlobal;
		},
		eliminaRegsStatusComunica: (regs) => {
			// Variables
			const comunicadoEn = new Date();
			const condiciones = [
				{statusOriginal_id: creado_id, statusFinal_id: creadoAprob_id}, // desde 'creado' a creadoAprob'
				{statusOriginal_id: creadoAprob_id, statusFinal_id: aprobado_id}, // desde 'creadoAprob' a 'aprobado'
				{statusOriginal_id: creado_id, statusFinal_id: aprobado_id}, // desde 'creado' a 'aprobado'
			];

			// Elimina los registros o completa el campo 'comunicadoEn'
			for (let reg of regs) {
				// Variables
				const condicOK = condiciones.some(
					(n) => n.statusOriginal_id == reg.statusOriginal_id && n.statusFinal_id == reg.statusFinal_id
				);

				// Elimina los registros
				if (condicOK) BD_genericas.eliminaPorId("histStatus", reg.id);
				else BD_genericas.actualizaPorId("histStatus", reg.id, {comunicadoEn});
			}

			// Fin
			return;
		},
		eliminaRegsEdicComunica: (regs) => {
			// Variables
			const comunicadoEn = new Date();

			// Elimina los registros
			for (let reg of regs) {
				// Condición: sin duración
				if (!reg.penalizac || reg.penalizac == "0.0") BD_genericas.eliminaPorId(reg.tabla, reg.id);
				else BD_genericas.actualizaPorId(reg.tabla, reg.id, {comunicadoEn});
			}

			// Fin
			return;
		},
	},

	// Funciones - Otras
	fechaHoraUTC: () => {
		// Obtiene la fecha y la hora y las procesa
		const ahora = new Date();
		const FechaUTC = diasSemana[ahora.getUTCDay()] + ". " + comp.fechaHora.fechaDiaMes(ahora);
		const HoraUTC = ahora.getUTCHours() + ":" + ("0" + ahora.getUTCMinutes()).slice(-2);

		// Fin
		return {FechaUTC, HoraUTC};
	},
	obtieneLaHora: (dato) => {
		// Obtiene la ubicación de los dos puntos
		const ubicDosPuntos = dato.indexOf(":");
		if (ubicDosPuntos < 1) return 0;

		// Obtiene la hora
		let hora = dato.slice(0, ubicDosPuntos);
		hora = parseInt(hora);

		// Fin
		return hora;
	},
	finRutinasHorarias: function (campo) {
		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "Rutina '" + campo + "' implementada");

		// Fin
		return;
	},
	finRutinasDiariasSemanales: function (campo, menu) {
		// Actualiza el archivo JSON
		const sonIguales = this.guardaArchivoDeRutinas({[campo]: "SI"}, menu);

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		const novedades = sonIguales ? ", sin novedades" : "";
		console.log(FechaUTC, HoraUTC + "hs. -", "Rutina '" + campo + "' implementada" + novedades);

		// Fin
		return;
	},
};
let normalize = "style='font-family: Calibri; line-height 1; color: rgb(37,64,97); ";

// Funciones
let ordenarStatus = (resultados) => {
	return resultados.sort((a, b) =>
		false
			? false
			: // Familia
			a.familia < b.familia
			? -1
			: a.familia > b.familia
			? 1
			: // Entidad
			a.entidadNombre < b.entidadNombre
			? -1
			: a.entidadNombre > b.entidadNombre
			? 1
			: // Nombre del Producto o RCLV, o url del Link
			a.nombreOrden < b.nombreOrden
			? -1
			: a.nombreOrden > b.nombreOrden
			? 1
			: // Para nombres iguales, separa por id
			a.entidad_id < b.entidad_id
			? -1
			: a.entidad_id > b.entidad_id
			? 1
			: // De status menor a mayor
			a.statusFinal.id < b.statusFinal.id
			? -1
			: a.statusFinal.id > b.statusFinal.id
			? 1
			: 0
	);
};
let ordenarEdic = (resultados) => {
	return resultados.sort((a, b) =>
		false
			? false
			: // Familia
			a.familia < b.familia
			? -1
			: a.familia > b.familia
			? 1
			: // Entidad
			a.entidadNombre < b.entidadNombre
			? -1
			: a.entidadNombre > b.entidadNombre
			? 1
			: // Nombre del Producto o RCLV, o url del Link
			a.nombreOrden < b.nombreOrden
			? -1
			: a.nombreOrden > b.nombreOrden
			? 1
			: // Para nombres iguales, separa por id
			a.entidad_id < b.entidad_id
			? -1
			: a.entidad_id > b.entidad_id
			? 1
			: // Primero los campos aprobados
			a.aprobado > b.aprobado
			? -1
			: a.aprobado < b.aprobado
			? 1
			: // Orden alfabético de los campos
			a.campo < b.campo
			? -1
			: a.campo > b.campo
			? 1
			: 0
	);
};
let avatarConLink = (familia, valorAprob, texto) => {
	// Variables
	const link = valorAprob && valorAprob.includes("/");
	const terminacion = "' style='color: inherit; text-decoration: none'><u>la imagen " + texto + "</u></a>";
	const carpeta = (familia == "producto" ? "2-" : "3-") + familia;
	const rutaArchivo = !link && valorAprob ? "/archSinVersion/" + carpeta + "s/Final/" + valorAprob : "";
	const existe = !link && valorAprob ? comp.gestionArchivos.existe("./publico" + rutaArchivo) : "";

	return link
		? "<a href='" + valorAprob + terminacion
		: existe
		? "<a href='" + rutaArchivo + terminacion
		: "la imagen " + texto;
};
let formatos = {
	h2: (texto) => "<h2 " + normalize + "font-size: 18px'>" + texto + "</h2>",
	h3: (texto) => "<h3 " + normalize + "font-size: 16px'>" + texto + "</h3>",
	ol: (texto) => "<ol " + normalize + "font-size: 14px'>" + texto + "</ol>",
	ul: (texto) => "<ul " + normalize + "font-size: 14px'>" + texto + "</ul>",
	li: (texto, color) => {
		let formato = normalize;
		if (color) formato = formato.replace("rgb(37,64,97)", color);
		return "<li " + formato + "font-size: 14px'>" + texto + "</li>";
	},
};
let nombres = async (reg, familia) => {
	// Variables
	let nombreOrden, nombreVisual;

	// Fórmulas
	if (reg.entidad != "links") {
		// Obtiene el registro
		const regEntidad = await BD_genericas.obtienePorId(reg.entidad, reg.entidad_id);
		if (!regEntidad.id) return {};

		// Obtiene los nombres
		nombreOrden = comp.nombresPosibles(regEntidad);
		nombreVisual =
			"<a href='/" +
			familia +
			"/detalle/?entidad=" +
			reg.entidad +
			"&id=" +
			reg.entidad_id +
			"' style='color: inherit; text-decoration: none'>" +
			nombreOrden +
			"</a>";
	} else {
		// Obtiene el registro
		const asocs = variables.asocs.prods;
		const regEntidad = await BD_genericas.obtienePorIdConInclude("links", reg.entidad_id, asocs);
		if (!regEntidad.id) return {};

		// Obtiene los nombres
		const asocProd = comp.obtieneDesdeEdicion.asocProd(regEntidad);
		nombreOrden = comp.nombresPosibles(regEntidad[asocProd]);
		nombreVisual =
			"<a href='http://" + regEntidad.url + "' style='color: inherit; text-decoration: none'>" + nombreOrden + "</a>";
	}

	// Fin
	return {nombreOrden, nombreVisual};
};
let obtieneLosRCLV = async (fechaDelAno) => {
	// Variables
	let rclvs = [];
	let resultados = [];

	// Obtiene los RCLV de las primeras cuatro entidades
	for (let entidad of variables.entidades.rclvs) {
		// Salteo de la rutina para 'epocasDelAno'
		if (entidad == "epocasDelAno") continue;

		// Condicion estandar: RCLVs del dia y en status aprobado
		const condicion = {fechaDelAno_id: fechaDelAno.id, statusRegistro_id: aprobado_id, avatar: {[Op.ne]: null}};

		// Obtiene los RCLVs
		rclvs.push(
			BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
				// Para "personajes", deja solamente aquellos que tienen proceso de canonizacion
				// .then((n) => (entidad == "personajes" ? n.filter((m) => m.canon_id && !m.canon_id.startsWith("NN")) : n))
				// Le agrega la entidad
				.then((n) => n.map((m) => ({...m, entidad})))
		);
	}

	// Busca el registro de 'epocaDelAno'
	if (fechaDelAno.epocaDelAno_id != 1) {
		const condicion = {id: fechaDelAno.epocaDelAno_id, statusRegistro_id: aprobado_id};
		const entidad = "epocasDelAno";
		const registros = BD_genericas.obtieneTodosPorCondicion(entidad, condicion);
		rclvs.push(registros.then((n) => n.map((m) => (m = {...m, entidad}))));
	}

	// Espera y consolida la informacion
	await Promise.all(rclvs).then((n) => n.map((m) => resultados.push(...m)));

	// Fin
	return resultados;
};
let reduceRCLVs = (rclvs) => {
	// Variables
	let resultado;

	if (rclvs.length > 1) {
		// Ordena por prioridad_id decreciente
		rclvs.sort((a, b) => b.prioridad_id - a.prioridad_id);

		// Filtra por los que tienen la máxima prioridad_id
		const prioridad_id = rclvs[0].prioridad_id;
		rclvs = rclvs.filter((n) => n.prioridad_id == prioridad_id);

		// Prioriza por los de mayor avance de proceso de canonización
		if (rclvs.length > 1)
			rclvs = rclvs.find((n) => n.canon_id && n.canon_id.startsWith("ST"))
				? rclvs.filter((n) => n.canon_id && n.canon_id.startsWith("ST"))
				: rclvs.find((n) => n.canon_id && n.canon_id.startsWith("BT"))
				? rclvs.filter((n) => n.canon_id && n.canon_id.startsWith("BT"))
				: rclvs.find((n) => n.canon_id && n.canon_id.startsWith("VN"))
				? rclvs.filter((n) => n.canon_id && n.canon_id.startsWith("VN"))
				: rclvs.find((n) => n.canon_id && n.canon_id.startsWith("SD"))
				? rclvs.filter((n) => n.canon_id && n.canon_id.startsWith("SD"))
				: rclvs;

		// Elige al azar de entre los que tienen la máxima prioridad
		const indice = rclvs.length > 1 ? parseInt(Math.random() * rclvs.length) : 0;
		resultado = rclvs[indice];
	}
	// Si se encontró un solo resultado, lo asigna
	else if (rclvs.length == 1) resultado = rclvs[0];

	// Fin
	return resultado;
};
let datosImgDerecha = (resultado) => {
	// Variables
	let imgDerecha;

	// Acciones si se obtuvo un resultado
	if (resultado) {
		// Datos iniciales
		imgDerecha = {entidad: resultado.entidad, id: resultado.id};

		// Nombre de la imagen
		const canonNombre = comp.canonNombre(resultado);
		imgDerecha.titulo = canonNombre ? canonNombre : "";
		imgDerecha.titulo += resultado.nombre;

		// Datos del archivo, dependiendo de la entidad
		if (!resultado.carpetaAvatars) {
			imgDerecha.carpeta = "3-RCLVs/Final/";
			imgDerecha.nombreArchivo = resultado.avatar;
		} else {
			imgDerecha.carpeta = "4-EpocasDelAno/" + resultado.carpetaAvatars + "/";
			imgDerecha.nombreArchivo = comp.gestionArchivos.imagenAlAzar(imgDerecha.carpeta);
		}
	}
	// Acciones si no encontró una imagen para la fecha
	else
		imgDerecha = {
			titulo: "ELC - Películas",
			carpeta: "Varios/",
			nombreArchivo: "Institucional-Imagen.jpg",
		};

	// Fin
	return imgDerecha;
};
let eliminaLasImagenes = (avatars, carpeta) => {
	// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
	const archivos = fs.readdirSync("./publico/archSinVersion/" + carpeta);
	const imagenes = avatars.map((n) => n.imagen);

	// Rutina para borrar archivos
	for (let archivo of archivos)
		if (!imagenes.includes(archivo)) comp.gestionArchivos.elimina("./publico/archSinVersion/" + carpeta, archivo);

	// Rutina para detectar nombres sin archivo
	for (let avatar of avatars)
		if (!archivos.includes(avatar.imagen)) console.log("Registros sin avatar:", avatar.nombre, "(" + avatar.entidad + ")");

	// Fin
	return;
};
