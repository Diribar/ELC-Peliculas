"use strict";
// Variables
const comp = require("../1-Procesos/Compartidas");
const BD_genericas = require("../2-BD/Genericas");
const BD_especificas = require("../2-BD/Especificas");
const variables = require("../1-Procesos/Variables");

// Exportar ------------------------------------
module.exports = {
	// Interacciones con el archivo Rutinas.json
	lecturaRutinasJSON: () => {
		// Obtiene información del archivo 'json'
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		const existe = comp.gestionArchivos.existe(rutaNombre);
		const json = existe ? fs.readFileSync(rutaNombre, "utf8") : "";
		const info = json ? JSON.parse(json) : {};

		// Fin
		return info;
	},
	actualizaRutinasJSON: function (datos) {
		// Obtiene la informacion vigente
		let info = this.lecturaRutinasJSON();

		// Actualiza la información
		info = {...info, ...datos};

		// Guarda la información actualizada
		const rutaNombre = path.join(__dirname, "Rutinas.json");
		fs.writeFileSync(rutaNombre, JSON.stringify(info), function writeJSON(err) {
			if (err) return console.log("Actualiza Rutinas JSON:", err, datos);
		});

		// Fin
		return;
	},

	// Imagen Derecha
	borraLosArchivosDeImgDerechaObsoletos: (fechas) => {
		// Variables
		const carpetaImagen = "./publico/imagenes/4-ImagenDerecha/";
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
	obtieneImgDerecha: async function (fechaNum) {
		// Variables
		const fecha = new Date(fechaNum);
		let resultado;

		// Obtiene el 'diaDelAno_id'
		const dia = fecha.getDate();
		const mes_id = fecha.getMonth() + 1;
		const diaDelAno = diasDelAno.find((n) => n.dia == dia && n.mes_id == mes_id);
		delete diaDelAno.epocaDelAno;

		// Obtiene los RCLV
		let rclvs = await this.obtieneLosRCLV(diaDelAno);

		// Acciones si se encontraron rclvs
		if (rclvs.length > 1) {
			// Ordena por prioridad_id
			rclvs.sort((a, b) => b.prioridad_id - a.prioridad_id);

			// Filtra por los que tienen la maxima prioridad_id
			const prioridad_id = rclvs[0].prioridad_id;
			rclvs = rclvs.filter((n) => n.prioridad_id == prioridad_id);

			// Asigna el resultado
			const indice = parseInt(Math.random() * rclvs.length);
			resultado = rclvs[indice];
		}
		// Si se encontró un solo resultado, lo asigna
		else if (rclvs.length == 1) resultado = rclvs[0];

		// Obtiene los datos para la imgDerecha
		const imgDerecha = this.datosImgDerecha(resultado);

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
	obtieneLosRCLV: async (diaDelAno) => {
		// Variables
		let rclvs = [];
		let resultados = [];

		// Obtiene los RCLV de las primeras cuatro entidades
		for (let entidad of variables.entidades.rclvs) {
			// Salteo de la rutina para 'epocasDelAno'
			if (entidad == "epocasDelAno") continue;

			// Condicion estandar: RCLVs del dia y en status aprobado
			const condicion = {diaDelAno_id: diaDelAno.id, statusRegistro_id: aprobado_id};

			// Obtiene los RCLVs
			rclvs.push(
				BD_genericas.obtieneTodosPorCondicion(entidad, condicion)
					// Deja solo los que tienen avatar
					.then((n) => n.filter((m) => m.avatar))
					// Para "personajes", deja solamente aquellos que tienen proceso de canonizacion
					.then((n) => (entidad == "personajes" ? n.filter((m) => m.canon_id && !m.canon_id.startsWith("NN")) : n))
					// Le agrega la entidad
					.then((n) => n.map((m) => (m = {...m, entidad})))
			);
		}

		// Busca el registro de 'epocaDelAno'
		if (diaDelAno.epocaDelAno_id != 1) {
			const condicion = {id: diaDelAno.epocaDelAno_id, statusRegistro_id: aprobado_id};
			const entidad = "epocasDelAno";
			const registros = BD_genericas.obtieneTodosPorCondicion(entidad, condicion);
			rclvs.push(registros.then((n) => n.map((m) => (m = {...m, entidad}))));
		}

		// Espera y consolida la informacion
		await Promise.all(rclvs).then((n) => n.map((m) => resultados.push(...m)));

		// Fin
		return resultados;
	},
	datosImgDerecha: (resultado) => {
		// Variables
		let imgDerecha

		// Acciones si se obtuvo un resultado
		if (resultado) {
			// Datos iniciales
			imgDerecha = {entidad: resultado.entidad, id: resultado.id};

			// Nombre de la imagen
			imgDerecha.titulo = resultado.apodo ? resultado.apodo : resultado.nombre;

			// Datos del archivo, dependiendo de la entidad
			if (!resultado.carpetaAvatars) {
				imgDerecha.carpeta = "2-RCLVs/Final/";
				imgDerecha.nombre_archivo = resultado.avatar;
			} else {
				imgDerecha.carpeta = "3-EpocasDelAno/" + resultado.carpetaAvatars + "/";
				imgDerecha.nombre_archivo = comp.gestionArchivos.imagenAlAzar(imgDerecha.carpeta);
			}
		}
		// Acciones si no encontró una imagen para la fecha
		else
			imgDerecha = {
				titulo: "ELC - Películas",
				carpeta: "0-Base/Varios/",
				nombre_archivo: "Institucional-Imagen.jpg",
			};

		// Fin
		return imgDerecha;
	},

	// Borra imágenes obsoletas
	eliminaImagenesDeFamiliasSinRegistro: async function (familias) {
		// Variables
		const petitFamilias = comp.obtieneDesdeFamilias.petitFamilias(familias);
		const entidadEdic = comp.obtieneDesdeFamilias.entidadEdic(familias);
		let carpeta, avatars, consolidado;

		// Borra los avatar de Revisar - incluye: EDICIONES y Prods/RCLVs creados
		carpeta = "2-" + familias + "/Revisar";
		avatars = [];
		consolidado = [];
		avatars.push(BD_especificas.nombresDeAvatarEnBD(entidadEdic));
		for (let entidad of variables.entidades[petitFamilias])
			avatars.push(BD_especificas.nombresDeAvatarEnBD(entidad, creado_id));
		await Promise.all(avatars).then((n) => n.map((m) => consolidado.push(...m)));
		this.eliminaLasImagenes(consolidado, carpeta);

		// Borra los avatar de Final - incluye: Prods/RCLVs > creados
		carpeta = "2-" + familias + "/Final";
		avatars = [];
		consolidado = [];
		const statusFinal = status_registros.filter((n) => n.id != creado_id).map((n) => n.id);
		for (let entidad of variables.entidades[petitFamilias])
			avatars.push(BD_especificas.nombresDeAvatarEnBD(entidad, statusFinal));
		await Promise.all(avatars).then((n) => n.map((m) => consolidado.push(...m)));
		this.eliminaLasImagenes(consolidado, carpeta);

		// Fin
		return;
	},
	eliminaLasImagenes: (avatars, carpeta) => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		const archivos = fs.readdirSync("./publico/imagenes/" + carpeta);
		const imagenes = avatars.map((n) => n.imagen);

		// Rutina para borrar archivos
		for (let archivo of archivos)
			if (!imagenes.includes(archivo)) comp.gestionArchivos.elimina("./publico/imagenes/" + carpeta, archivo);

		// Rutina para detectar nombres sin archivo
		for (let avatar of avatars)
			if (!archivos.includes(avatar.imagen)) console.log("Registros sin avatar:", avatar.nombre, avatar.entidad);

		// Fin
		return;
	},
	borraImagenesProvisorio: () => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		let archivos = fs.readdirSync("./publico/imagenes/9-Provisorio");

		// Rutina para borrar archivos
		for (let archivo of archivos) {
			const fechaHora = fs.statSync("./publico/imagenes/9-Provisorio/" + archivo).birthtime;
			if (fechaHora < Date.now() - unDia * 3) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio", archivo);
		}

		// Fin
		return;
	},

	// Mail de Feedback
	mailDeFeedback: {
		obtieneRegistros: async () => {
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

			// Obtiene los registros de "edics"
			condiciones = {comunicadoEn: null};
			registros.push(
				BD_genericas.obtieneTodosPorCondicionConInclude("histEdics", condiciones, "motivo")
					// Agrega el nombre de la tabla
					.then((n) => n.map((m) => ({...m, tabla: "histEdics"})))
			);

			// Espera a que se reciba la info
			const [regsAB, regsEdic] = await Promise.all(registros);

			// Fin
			return {regsAB, regsEdic};
		},
		hoyUsuario: (usuario) => {
			// Variables
			const ahora = new Date();

			// Obtiene la hora del usuario, y si no son las 0hs, interrumpe la rutina
			const zona_horaria = usuario.pais.zona_horaria;
			const horaUsuario = ahora.getUTCHours() + zona_horaria;

			// Obtiene la fecha en que se le envió el último comunicado y si coincide con el día de hoy, interrumpe la rutina
			const aux = ahora.getTime() + usuario.pais.zona_horaria * unaHora;
			const hoyUsuario = comp.fechaHora.fechaFormatoBD(aux);

			// Saltear
			let saltear = usuario.fechaRevisores == hoyUsuario; // Si ya envió un mail en el día
			if (!saltear) saltear = zona_horaria < 0 ? horaUsuario < 0 : horaUsuario < 24; // Si todavía no son las 24hs

			// Fin
			return {hoyUsuario, saltear};
		},
		formatos: {
			h2: (texto) => "<h2 " + normalize + "font-size: 18px'>" + texto + "</h2>",
			h3: (texto) => "<h3 " + normalize + "font-size: 16px'>" + texto + "</h3>",
			ol: (texto) => "<ol " + normalize + "font-size: 14px'>" + texto + "</ol>",
			ul: (texto) => "<ul " + normalize + "font-size: 14px'>" + texto + "</ul>",
			li: (texto, color) => {
				let formato = normalize;
				if (color) formato = formato.replace("rgb(37,64,97)", color);
				return "<li " + formato + "font-size: 14px'>" + texto + "</li>";
			},
		},
		mensajeAB: async function (regsAB) {
			// Variables
			let resultados = [];
			let mensajesAcum = "";
			let mensajesAprob = "";
			let mensajesRech = "";
			let color;

			// Proceso de los registros
			for (let regAB of regsAB) {
				// Variables
				const aprobado = regAB.aprobado;
				const familia = comp.obtieneDesdeEntidad.familia(regAB.entidad);
				const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(regAB.entidad);
				const statusFinal = status_registros.find((n) => n.id == regAB.statusFinal_id);
				const statusInicial = status_registros.find((n) => n.id == regAB.statusOriginal_id);
				const motivo = regAB.comentario && !aprobado ? regAB.comentario : "";
				const {nombreOrden, nombreVisual} = await this.nombres(regAB, familia);
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
			resultados.sort((a, b) =>
				a.familia < b.familia
					? -1
					: a.familia > b.familia
					? 1
					: a.entidadNombre < b.entidadNombre
					? -1
					: a.entidadNombre > b.entidadNombre
					? 1
					: a.nombreOrden < b.nombreOrden
					? -1
					: a.nombreOrden > b.nombreOrden
					? 1
					: a.statusFinal.id < b.statusFinal.id
					? -1
					: a.statusFinal.id > b.statusFinal.id
					? 1
					: 0
			);

			resultados.map((n) => {
				let mensaje = n.entidadNombre + ": <b>" + n.nombreVisual + "</b>,";
				mensaje += " de status <em>" + n.statusInicial.nombre.toLowerCase() + "</em>";
				mensaje += " a status <b><em>" + n.statusFinal.nombre.toLowerCase() + "</em></b>";
				if (n.motivo) mensaje += ". <u>Motivo</u>: " + n.motivo;
				color = n.aprobado ? "green" : "firebrick";
				mensaje = this.formatos.li(mensaje, color);
				n.aprobado ? (mensajesAprob += mensaje) : (mensajesRech += mensaje);
			});

			// Ajustes finales
			if (mensajesAprob) mensajesAcum += this.formatos.h2("Altas y Bajas - APROBADAS") + this.formatos.ol(mensajesAprob);
			if (mensajesRech) mensajesAcum += this.formatos.h2("Altas y Bajas - RECHAZADAS") + this.formatos.ol(mensajesRech);
			const mensajeGlobal = mensajesAcum;
			// Fin
			return mensajeGlobal;
		},
		mensajeEdic: async function (regsEdic) {
			// Variables
			let resultados = [];
			let mensajesAcum = "";
			let mensajesCampo, mensaje, color;

			// Obtiene información clave de los registros
			for (let regEdic of regsEdic) {
				// Variables
				const aprobado = !regEdic.motivo_id;
				const familia = comp.obtieneDesdeEntidad.familia(regEdic.entidad);
				const {nombreOrden, nombreVisual} = await this.nombres(regEdic, familia);
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

			// Ordena los registros según el criterio en que se mostrará en el mail
			resultados.sort((a, b) =>
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

			// Arma el mensaje
			resultados.forEach((n, i) => {
				// Acciones por nueva entidad/entidad_id
				if (
					!i ||
					(i && (n.entidadNombre != resultados[i - 1].entidadNombre || n.entidad_id != resultados[i - 1].entidad_id))
				) {
					mensaje = n.entidadNombre + ": <b>" + n.nombreVisual + "</b>";
					mensajesAcum += this.formatos.li(mensaje);
					mensajesCampo = "";
				}

				// Adecua la info para el avatar
				if (n.campo == "Avatar") {
					n.valorAprob = n.valorAprob.includes("/")
						? "<a href='" +
						  n.valorAprob +
						  "' style='color: inherit; text-decoration: none'>'<u>Imagen aprobada</u>'</a>"
						: this.avatar(n.familia, n.valorAprob);
					n.valorDesc = n.valorDesc.includes("/")
						? "<a href='" +
						  n.valorDesc +
						  "' style='color: inherit; text-decoration: none'>'<u>Imagen descartada</u>'</a>"
						: "'Imagen descartada'";
				}

				// Agregado de la info por campo
				mensaje = n.campo + ": ";
				mensaje += n.aprobado
					? "<em><b>" + n.valorAprob + "</b></em> reemplazó a <em>" + n.valorDesc + "</em>"
					: "se mantuvo <em><b>" +
					  n.valorAprob +
					  "</b></em> como mejor opción que <em>" +
					  n.valorDesc +
					  "</em>. Motivo: " +
					  n.motivo.toLowerCase();

				color = n.aprobado ? "green" : "firebrick";
				mensajesCampo += this.formatos.li(mensaje, color);

				// Acciones por fin de la entidad/entidad_id
				if (
					i == resultados.length - 1 ||
					n.entidadNombre != resultados[i + 1].entidadNombre ||
					n.entidad_id != resultados[i + 1].entidad_id
				)
					mensajesAcum += this.formatos.ul(mensajesCampo);
			});

			// Detalles finales
			const titulo = this.formatos.h2("Ediciones");
			mensajesAcum = this.formatos.ol(mensajesAcum);
			const mensajeGlobal = titulo + mensajesAcum;

			// Fin
			return mensajeGlobal;
		},
		nombres: async (reg, familia) => {
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
					"<a href='http:" +
					localhost +
					"/" +
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
				const asociaciones = ["pelicula", "coleccion", "capitulo"];
				const regEntidad = await BD_genericas.obtienePorIdConInclude("links", reg.entidad_id, asociaciones);
				if (!regEntidad.id) return {};

				// Obtiene los nombres
				const asocProd = comp.obtieneDesdeEdicion.asocProd(regEntidad);
				nombreOrden = comp.nombresPosibles(regEntidad[asocProd]);
				nombreVisual =
					"<a href='http://" +
					regEntidad.url +
					"' style='color: inherit; text-decoration: none'>" +
					nombreOrden +
					"</a>";
			}

			// Fin
			return {nombreOrden, nombreVisual};
		},
		avatar: (familia, valorAprob) => {
			const rutaArchivo = "/imagenes/2-" + familia + "s/Final/" + valorAprob;
			const existe = comp.gestionArchivos.existe("./publico" + rutaArchivo);

			return existe
				? "<a href='http:".concat(localhost, rutaArchivo) +
						"' style='color: inherit; text-decoration: none'>'<u>Imagen aprobada</u>'</a>"
				: "'Imagen aprobada'";
		},
		eliminaRegsAB: (regs) => {
			// Variables
			const comunicadoEn = new Date();
			const condicStatus = {
				// Condición 1: creado a creado-aprobado (productos)
				productos: {statusOriginal_id: creado_id, statusFinal_id: creadoAprob_id},
				// Condición 2: creado a aprobado (rclvs y links)
				rclvs: {statusOriginal_id: creado_id, statusFinal_id: aprobado_id},
			};
			condicStatus.links = condicStatus.rclvs;

			// Elimina los registros
			for (let reg of regs) {
				// Condiciones
				const familias = comp.obtieneDesdeEntidad.familias(reg.entidad);
				const condicStatusOrig = reg.statusOriginal_id == condicStatus[familias].statusOriginal_id;
				const condicStatusFinal = reg.statusFinal_id == condicStatus[familias].statusFinal_id;

				// Elimina los registros
				if (condicStatusOrig && condicStatusFinal) BD_genericas.eliminaPorId(reg.tabla, reg.id);
				else BD_genericas.actualizaPorId(reg.tabla, reg.id, {comunicadoEn});
			}

			// Fin
			return;
		},
		eliminaRegsEdic: (regs) => {
			// Variables
			const comunicadoEn = new Date();

			// Elimina los registros
			for (let reg of regs) {
				// Condición: sin duración
				if (!reg.duracion || reg.duracion == "0.0") BD_genericas.eliminaPorId(reg.tabla, reg.id);
				else BD_genericas.actualizaPorId(reg.tabla, reg.id, {comunicadoEn});
			}

			// Fin
			return;
		},
		actualizaHoraRevisorEnElUsuario: (usuario, hoyUsuario) => {
			BD_genericas.actualizaPorId("usuarios", usuario.id, {fechaRevisores: hoyUsuario});
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
	semanaUTC: () => {
		// Obtiene el primer día del año
		const fecha = new Date();
		const comienzoAno = new Date(fecha.getUTCFullYear(), 0, 1).getTime();

		// Obtiene el dia de la semana (lun: 1 a dom: 7)
		let diaSem = new Date(comienzoAno).getDay();
		if (diaSem < 1) diaSem = diaSem + 7;

		// Obtiene el primer domingo del año
		const adicionarDias = 7 - diaSem;
		const primerDomingo = comienzoAno + adicionarDias * unDia;

		// Obtiene la semana del año
		const semana = parseInt((fecha.getTime() - primerDomingo) / unDia / 7);

		// Fin
		return semana;
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
	rutinasFinales: function (campo) {
		// Actualiza el archivo JSON
		this.actualizaRutinasJSON({[campo]: "SI"});

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "Rutina '" + campo + "' actualizada y datos guardados en JSON");

		// Fin
		return;
	},
	rutinasSinGuardar: function (campo) {
		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		console.log(FechaUTC, HoraUTC + "hs. -", "Rutina '" + campo + "' actualizada");

		// Fin
		return;
	},
};
let normalize = "style='font-family: Calibri; line-height 1; color: rgb(37,64,97); ";
