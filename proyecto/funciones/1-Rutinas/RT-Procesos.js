"use strict";

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
	guardaArchivoDeRutinas: function (datos, menu) {
		// Obtiene la informacion vigente
		let info = {...rutinasJSON};

		// Averigua si hubo alguna novedad
		let sonIguales = true;
		for (let prop in datos) {
			// Variable
			const datoNuevo = datos[prop];
			const datoGuardado = info[prop];

			// Si los datos son iguales, saltea los controles posteriores
			if (datoNuevo == datoGuardado) continue;
			else if (!datoGuardado) sonIguales = false;
			// String - varios casos
			else if (typeof datoNuevo == "string") sonIguales = false;
			// Array - RutinasHorarias
			else if (Array.isArray(datoNuevo)) {
				if (!Array.isArray(datoGuardado)) sonIguales = false;
				else if (datoNuevo.length != datoGuardado.length) sonIguales = false;
				else
					datoNuevo.forEach((n, i) => {
						if (n != datoGuardado[i]) sonIguales = false;
					});
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
				else
					camposNuevo.forEach((n, i) => {
						if (n != camposGuardado[i]) sonIguales = false;
					});
			}

			// Fin
			if (!sonIguales) break;
		}

		// Si no hubo ninguna novedad, sale de la función
		if (sonIguales) return true;

		// Actualiza la información
		info = menu ? {...info, [menu]: {...info[menu], ...datos}} : {...info, ...datos};

		// Guarda la información actualizada
		const rutaNombre = path.join(__dirname, "Rutinas.json");
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
		const carpetaImagen = "./publico/imagenes/ImagenDerecha/";
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

		// Obtiene la 'fechaDelAno_id'
		const dia = fecha.getDate();
		const mes_id = fecha.getMonth() + 1;
		const fechaDelAno = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes_id);
		delete fechaDelAno.epocaDelAno; // quita el include

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
		const dia = ("0" + fecha.getDate()).slice(-2);
		const mes = mesesAbrev[fecha.getMonth()];
		const ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "-" + mes + "-" + ano;
		return fecha;
	},
	ABM_noRevs: async () => {
		// Variables
		const statusProvisorios = [creado_id, inactivar_id, recuperar_id];
		let entsPERL, include, condicion;

		// regsPERL
		condicion = {statusRegistro_id: statusProvisorios, statusSugeridoPor_id: {[Op.ne]: usAutom_id}};
		entsPERL = [...variables.entidades.prods, ...variables.entidades.rclvs];
		include = "statusSugeridoPor";
		let regsPERL = [];
		for (let entidad of entsPERL) {
			const familia = comp.obtieneDesdeEntidad.familia(entidad);
			const registros = await baseDeDatos
				.obtieneTodosPorCondicion(entidad, condicion, include)
				.then((regs) => regs.filter((reg) => !rolesRevPERL_ids.includes(reg.statusSugeridoPor.rolUsuario_id)))
				.then((regs) => regs.map((reg) => ({...reg, entidad, familia})));
			regsPERL.push(...registros);
		}

		// edicsPERL
		entsPERL = ["prodsEdicion", "rclvsEdicion"];
		include = {prodsEdicion: variables.entidades.asocProds, rclvsEdicion: variables.entidades.asocRclvs};
		let edicsPERL = [];
		for (let entPERL of entsPERL) {
			const registros = await baseDeDatos
				.obtieneTodos(entPERL, ["editadoPor", ...include[entPERL]])
				.then((edics) => edics.filter((edic) => !rolesRevPERL_ids.includes(edic.editadoPor.rolUsuario_id)))
				.then((edics) =>
					edics.map((edic) => {
						const asociacion = comp.obtieneDesdeCampo_id.asociacion(edic);
						const entidad = comp.obtieneDesdeCampo_id.entidad(edic, entPERL);
						const familia = comp.obtieneDesdeEntidad.familia(entidad);
						return {...edic[asociacion], entidad, familia};
					})
				)
				.then((prods) => prods.filter((prod) => !statusProvisorios.includes(prod.statusRegistro_id)));
			edicsPERL.push(...registros);
		}

		// regsLinks
		condicion = {...condicion, prodAprob: true};
		include = ["statusSugeridoPor", ...variables.entidades.asocProds];
		const regsLinks = await baseDeDatos
			.obtieneTodosPorCondicion("links", condicion, include)
			.then((links) => links.filter((link) => !rolesRevLinks_ids.includes(link.statusSugeridoPor.rolUsuario_id)))
			.then((links) =>
				links.map((link) => {
					const asociacion = comp.obtieneDesdeCampo_id.asocProd(link);
					const entidad = comp.obtieneDesdeCampo_id.entidadProd(link);
					return {...link[asociacion], entidad, familia: "links"};
				})
			)
			.then((prods) => comp.eliminaRepetidos(prods));

		// edicsLinks
		include = ["editadoPor", ...variables.entidades.asocProds];
		const edicsLinks = await baseDeDatos
			.obtieneTodos("linksEdicion", include)
			.then((edics) => edics.filter((edic) => !rolesRevPERL_ids.includes(edic.editadoPor.rolUsuario_id)))
			.then((edics) =>
				edics.map((edic) => {
					const asociacion = comp.obtieneDesdeCampo_id.asocProd(edic);
					const entidad = comp.obtieneDesdeCampo_id.entidadProd(edic);
					return {...edic[asociacion], entidad, familia: "links"};
				})
			)
			.then((prods) => comp.eliminaRepetidos(prods));

		// Fin
		return {regs: {perl: regsPERL, links: regsLinks}, edics: {perl: edicsPERL, links: edicsLinks}};
	},

	// Borra imágenes obsoletas
	eliminaImagenesSinRegistro: async ({carpeta, familia, entidadEdic, status_id, campoAvatar}) => {
		// Variables
		const petitFamilias = comp.obtieneDesdeFamilias.petitFamilias(familia);
		let avatarsEdic = [];
		let avatarsOrig = [];
		let consolidado = [];

		// Revisa los avatars que están en las ediciones
		if (entidadEdic) avatarsEdic = nombresDeAvatarEnBD({entidad: entidadEdic});

		// Revisa los avatars que están en los originales
		if (status_id)
			for (let entidad of variables.entidades[petitFamilias])
				avatarsOrig.push(nombresDeAvatarEnBD({entidad, status_id, campoAvatar}));

		// Espera y consolida los resultados
		await Promise.all([avatarsEdic, ...avatarsOrig]).then((n) => n.map((m) => consolidado.push(...m)));

		// Elimina los avatars
		eliminaLasImagenes(consolidado, carpeta);

		// Fin
		return;
	},
	eliminaImagenesProvisorio: () => {
		// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
		let archivos = fs.readdirSync(carpetaExterna + "9-Provisorio");

		// Rutina para borrar archivos
		for (let archivo of archivos) {
			const fechaHora = fs.statSync(carpetaExterna + "9-Provisorio/" + archivo).birthtime;
			if (fechaHora < Date.now() - unDia * 3) comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio", archivo);
		}

		// Fin
		return;
	},

	// Mail de Feedback
	mailDeFeedback: {
		obtieneElHistorial: async () => {
			// Variables
			let registros = [];
			let condicion;

			// Obtiene los registros de "statusHistorial"
			condicion = {
				statusOriginalPor_id: {[Op.ne]: usAutom_id}, // sugerido por una persona
				statusOriginal_id: [creado_id, inactivar_id, recuperar_id], // descarta los cambios que no sean revisiones
				comunicadoEn: null, // no fue comunicado
			};
			registros.push(
				baseDeDatos
					.obtieneTodosPorCondicion("statusHistorial", condicion)
					.then((n) => n.map((m) => ({...m, tabla: "statusHistorial"})))
			);

			// Obtiene los registros de "histEdics"
			condicion = {comunicadoEn: null};
			registros.push(
				baseDeDatos
					.obtieneTodosPorCondicion("histEdics", condicion, "motivo")
					.then((n) => n.map((m) => ({...m, tabla: "histEdics"}))) // Agrega el nombre de la tabla
			);

			// Espera a que se reciba la info
			const [regsStatus, regsEdic] = await Promise.all(registros);

			// Fin
			return {regsStatus, regsEdic};
		},
		mensajeStatus: async (regsStatus) => {
			// Variables
			let resultados = [];

			// De cada registro de status, obtiene los campos clave o los elabora
			for (let regStatus of regsStatus) {
				// Variables
				const familia = comp.obtieneDesdeEntidad.familia(regStatus.entidad);
				const {nombre, anchor} = await nombres(regStatus, familia);
				if (!nombre) continue;

				// Más variables
				const aprobado =
					([creado_id, recuperar_id].includes(regStatus.statusOriginal_id) &&
						aprobados_ids.includes(regStatus.statusFinal_id)) ||
					(regStatus.statusOriginal_id == inactivar_id && regStatus.statusFinal_id == inactivo_id);
				const altaAprob = regStatus.statusOriginal_id == creado_id && aprobado;
				const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(regStatus.entidad);
				const statusOrigNombre = statusRegistros.find((n) => n.id == regStatus.statusOriginal_id).nombre;
				const statusFinalNombre = statusRegistros.find((n) => n.id == regStatus.statusFinal_id).nombre;

				// Motivo
				let motivo;
				if (!aprobado) {
					const motivoAux = statusMotivos.find((n) => n.id == regStatus.motivo_id);
					motivo = regStatus.comentario ? regStatus.comentario : motivoAux ? motivoAux.descripcion : "";
				}

				// Transforma el resultado
				resultados.push({
					...{familia, entidadNombre, nombre, anchor, altaAprob},
					...{statusOrigNombre, statusFinalNombre, aprobado, motivo},
				});
			}

			// Ordena la información según los campos de mayor criterio, siendo el primero la familia y luego la entidad
			resultados.sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0));
			resultados.sort((a, b) => (a.entidadNombre < b.entidadNombre ? -1 : a.entidadNombre > b.entidadNombre ? 1 : 0));
			resultados.sort((a, b) => (a.familia < b.familia ? -1 : a.familia > b.familia ? 1 : 0));

			// Crea el mensaje
			const mensajeGlobal = creaElMensajeStatus(resultados);

			// Fin
			return mensajeGlobal;
		},
		mensajeEdicion: async (regsEdic) => {
			// Variables
			let resultados = [];
			let mensajesAcum = "";
			let mensajesCampo, mensaje, color;

			// De cada registro, obtiene los campos clave o los elabora
			for (let regEdic of regsEdic) {
				// Variables
				const aprobado = !regEdic.motivo_id;
				const familia = comp.obtieneDesdeEntidad.familia(regEdic.entidad);
				const {nombre, anchor} = await nombres(regEdic, familia);
				if (!nombre) continue;

				// Alimenta el resultado
				resultados.push({
					...{aprobado, familia, nombre, anchor},
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
					mensaje = n.entidadNombre + ": <b>" + n.anchor + "</b>";
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
						: "<em><b>" + n.valorAprob + "</b></em>"
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
		mensRevsTablero: ({regs, edics}) => {
			// Variables
			let cuerpoMail = {perl: "", links: ""};
			let registros, prods, rclvs;

			// Productos - Cambios de Status
			registros = regs.perl.filter((n) => n.familia == "producto");
			if (registros.length) {
				cuerpoMail.perl += formatos.h2("Productos");
				prods = true;
				let mensajes = "";
				for (let registro of registros) {
					// Variables
					let mensaje = registro.nombreCastellano ? registro.nombreCastellano : registro.nombreOriginal;

					// Formatos
					mensaje = formatos.a(mensaje, registro);
					mensajes += formatos.li(mensaje);
				}
				cuerpoMail.perl += formatos.ol(mensajes);
			}

			// Productos - Ediciones
			registros = edics.perl.filter((n) => n.familia == "producto");
			if (registros.length) {
				if (!prods) cuerpoMail.perl += formatos.h2("Productos");
				let mensajes = "";
				for (let registro of registros) {
					// Variables
					const operacion = "edicion/";
					let mensaje = registro.nombreCastellano ? registro.nombreCastellano : registro.nombreOriginal;

					// Formatos
					mensaje = formatos.a(mensaje, registro, operacion);
					mensajes += formatos.li(mensaje);
				}
				cuerpoMail.perl += formatos.ol(mensajes);
			}

			// RCLVS - Cambios de Status
			registros = regs.perl.filter((n) => n.familia == "rclv");
			if (registros.length) {
				cuerpoMail.perl += formatos.h2("RCLVs");
				rclvs = true;
				let mensajes = "";
				for (let registro of registros) {
					// Formatos
					let mensaje = formatos.a(registro.nombre, registro);
					mensajes += formatos.li(mensaje);
				}
				cuerpoMail.perl += formatos.ol(mensajes);
			}

			// RCLVs - Ediciones
			registros = edics.perl.filter((n) => n.familia == "rclv");
			if (registros.length) {
				if (!rclvs) cuerpoMail.perl += formatos.h2("RCLVs");
				let mensajes = "";
				for (let registro of registros) {
					// Variables
					const operacion = "edicion/";

					// Formatos
					let mensaje = formatos.a(registro.nombre, registro, operacion);
					mensajes += formatos.li(mensaje);
				}
				cuerpoMail.perl += formatos.ol(mensajes);
			}

			// Links
			registros = [...regs.links, ...edics.links];
			if (registros.length) {
				cuerpoMail.links += formatos.h2("Links");
				let mensajes = "";
				for (let registro of registros) {
					// Variables
					let mensaje = registro.nombreCastellano ? registro.nombreCastellano : registro.nombreOriginal;

					// Formatos
					mensaje = formatos.a(mensaje, registro, "");
					mensajes += formatos.li(mensaje);
				}
				cuerpoMail.links += formatos.ol(mensajes);
			}

			// Fin
			return cuerpoMail;
		},
		eliminaRegsHistStatus: (regs) => {
			// Variables
			const ids = regs.map((n) => n.id);
			const condicion = {
				id: ids,
				statusOriginal_id: creado_id,
				statusFinal_id: aprobados_ids,
			};
			const comunicadoEn = new Date();

			// Elimina los que corresponda
			baseDeDatos.eliminaTodosPorCondicion("statusHistorial", condicion);

			// Agrega la fecha 'comunicadoEn'
			baseDeDatos.actualizaTodosPorCondicion("statusHistorial", {id: ids}, {comunicadoEn});

			// Fin
			return;
		},
		eliminaRegsHistEdics: (regs) => {
			// Variables
			const comunicadoEn = new Date();

			// Elimina los registros
			for (let reg of regs) {
				// Condición: sin duración
				if (!reg.penalizac || reg.penalizac == "0.0") baseDeDatos.eliminaPorId(reg.tabla, reg.id);
				else baseDeDatos.actualizaPorId(reg.tabla, reg.id, {comunicadoEn});
			}

			// Fin
			return;
		},
	},

	// Funciones - Otras
	variablesDiarias: () => {
		// Startup
		anoHoy = new Date().getUTCFullYear();
		const dia = new Date().getUTCDate();
		const mes = new Date().getUTCMonth() + 1;
		fechaDelAnoHoy_id = fechasDelAno.find((n) => n.dia == dia && n.mes_id == mes).id;

		// Fin
		return;
	},
	fechaHoraUTC: () => {
		// Obtiene la fecha y la hora y las procesa
		const ahora = new Date();
		const FechaUTC = diasSemana[ahora.getUTCDay()] + ". " + comp.fechaHora.diaMes(ahora);
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
	finRutinasHorarias: function (campo, duracion) {
		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		if (campo != "feedbackParaUsers" || nodeEnv != "development")
			console.log(FechaUTC, HoraUTC + "hs. -", (duracion + "ms").padStart(5, " ") + " -", campo);

		// Fin
		return;
	},
	finRutinasDiariasSemanales: function (campo, menu, duracion) {
		// Actualiza el archivo JSON
		const sonIguales = menu ? this.guardaArchivoDeRutinas({[campo]: "SI"}, menu) : null;

		// Feedback del proceso
		const {FechaUTC, HoraUTC} = this.fechaHoraUTC();
		const novedades = sonIguales ? ", sin novedades" : "";
		console.log(FechaUTC, HoraUTC + "hs. -", (duracion + "ms").padStart(5, " ") + " -", campo + novedades);

		// Fin
		return;
	},
	actualizaElProximoValorDeID: async (entidad) => {
		// Variables
		const nuevoValor = await baseDeDatos.maxValor(entidad, "id").then((n) => n + 1);

		// Actualiza el autoincrement
		// const config = require(__dirname + "/../../baseDeDatos/config/config.js")[nodeEnv];
		// const Sequelize = require("sequelize");
		// const sequelize = new Sequelize(config.database, config.username, config.password, config);
		const texto = process.env.DB_NAME + "." + db[entidad].tableName;
		// console.log(584, texto, nuevoValor);
		await sequelize.query("ALTER TABLE " + texto + " AUTO_INCREMENT = " + nuevoValor + ";");

		// Fin
		return;
	},
	revisaStatus: {
		consolidado: async function () {
			// Variables
			const ultsHist = await this.ultsRegsHistStatus();

			// Elimina todos los registros de la tabla 'statusErrores'
			await baseDeDatos.eliminaTodosPorCondicion("statusErrores", {id: {[Op.not]: null}});

			// Historial vs registro de la entidad
			const histRegEnt = await this.historialVsProdRclv(ultsHist);

			// Registro de la entidad vs historial
			const regEntHist = await this.prodRclvVsHistorial(ultsHist, histRegEnt);

			// Consolida
			const regsAgregar = [...histRegEnt, ...regEntHist];
			regsAgregar.forEach((regAgregar, i) => baseDeDatos.agregaRegistro("statusErrores", {id: i + 1, ...regAgregar}));

			// Fin
			return;
		},
		ultsRegsHistStatus: async () => {
			// Variables
			const condicion = {[Op.or]: [{statusOriginal_id: {[Op.gt]: aprobado_id}}, {statusFinal_id: {[Op.gt]: aprobado_id}}]};

			// Obtiene el último registro de status de cada producto
			let ultsHist = [];
			await baseDeDatos
				.obtieneTodosPorCondicion("statusHistorial", condicion)
				.then((n) => n.sort((a, b) => b.statusFinalEn - a.statusFinalEn))
				.then((n) =>
					n.map((m) => {
						if (!ultsHist.find((o) => o.entidad == m.entidad && o.entidad_id == m.entidad_id)) ultsHist.push(m);
					})
				); // retiene sólo el último de cada producto

			// Fin
			return ultsHist;
		},
		historialVsProdRclv: async (ultsHist) => {
			// Variables
			let regsAgregar = [];
			if (!ultsHist.length) return regsAgregar;

			// Rutina historial vs prodRclv
			for (let ultHist of ultsHist) {
				// Obtiene los datos del historial
				const {entidad, entidad_id, statusFinalEn, statusFinal_id} = ultHist;

				// Obtiene los datos del prodRclv
				const prodRclv = await baseDeDatos.obtienePorId(entidad, entidad_id);
				const nombre = comp.nombresPosibles(prodRclv);
				const {statusRegistro_id} = prodRclv;

				// Asigna lo datos a guardar
				const datos = {entidad, entidad_id, nombre, fechaRef: statusFinalEn};

				// Valida el status
				if (
					statusFinal_id != statusRegistro_id && // status distinto
					(statusFinal_id != creadoAprob_id || statusRegistro_id != aprobado_id) // descarta que la diferencia se deba a que se completó la revisión de la edición
				)
					regsAgregar.push({...datos, ST: true});
				else if (statusFinal_id == inactivar_id) regsAgregar.push({...datos, IN: true});
				else if (statusFinal_id == recuperar_id) regsAgregar.push({...datos, RC: true});
			}

			// Fin
			return regsAgregar;
		},
		prodRclvVsHistorial: async (ultsHist, errores) => {
			// Variables
			const entidades = [...variables.entidades.prods, ...variables.entidades.rclvs];
			let regsAgregar = [];

			// Obtiene los Inactivos y Recuperar
			let IN = comp.obtieneRegs({entidades, status_id: inactivar_id});
			let RC = comp.obtieneRegs({entidades, status_id: recuperar_id});
			let IO = comp.obtieneRegs({entidades, status_id: inactivo_id});
			[IN, RC, IO] = await Promise.all([IN, RC, IO]);
			let regsEnt = {IN, RC, IO};

			// Revisa en 'IN, RC, IO'
			for (let ST in regsEnt) {
				// Revisa en cada registro
				for (let prodRclv of regsEnt[ST]) {
					// Variables
					const {entidad, id, statusSugeridoEn: fechaRef} = prodRclv;
					const nombre = comp.nombresPosibles(prodRclv);
					const datos = {entidad, entidad_id: id, nombre, fechaRef};

					// Si no lo encuentra en el historial, lo agrega a status
					const regHist = ultsHist.find((n) => n.entidad == entidad && n.entidad_id == id);
					if (!regHist) regsAgregar.push({...datos, ST: true});
				}
			}

			// Fin
			return regsAgregar;
		},
	},
	sumaUnDia: (fecha) => new Date(new Date(fecha).getTime() + unDia).toISOString().slice(0, 10),
};

// Variables
let normalize = "style='font-family: Calibri; line-height 1; color: rgb(37,64,97); ";

// Funciones
let creaElMensajeStatus = (resultados) => {
	// Variables
	let mensajesAcum = "";
	let mensajesAltas = "";
	let mensajesAprob = "";
	let mensajesRech = "";
	let color;

	// Crea el mensaje en formato texto para cada registro de status, y se lo asigna a mensajesAprob o mensajesRech
	resultados.map((n) => {
		// Crea el mensaje
		let mensaje = n.entidadNombre + ": <b>" + n.anchor + "</b>";

		if (!n.altaAprob) {
			// Mensaje adicional
			mensaje += ", de status <em>" + n.statusOrigNombre.toLowerCase() + "</em>";
			mensaje += " a status <em>" + n.statusFinalNombre.toLowerCase() + "</em>";

			// Mensaje adicional si hay un motivo
			if (n.motivo) mensaje += ". <u>Motivo</u>: " + n.motivo;
		}

		// Le asigna un color
		color = n.aprobado ? "green" : "firebrick";
		mensaje = formatos.li(mensaje, color);

		// Agrega el mensaje al sector que corresponda
		n.altaAprob
			? (mensajesAltas += mensaje) // altas aprobadas
			: n.aprobado
			? (mensajesAprob += mensaje) // otros cambios aprobados
			: (mensajesRech += mensaje); // rechazados
	});

	// Crea el mensajeGlobal, siendo primero los aprobados y luego los rechazados
	if (mensajesAltas) mensajesAcum += formatos.h2("Altas APROBADAS") + formatos.ol(mensajesAltas);
	if (mensajesAprob) mensajesAcum += formatos.h2("Status - Cambios APROBADOS") + formatos.ol(mensajesAprob);
	if (mensajesRech) mensajesAcum += formatos.h2("Status - Cambios RECHAZADOS") + formatos.ol(mensajesRech);

	// Fin
	return mensajesAcum;
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
			a.nombre < b.nombre
			? -1
			: a.nombre > b.nombre
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
let avatarConLink = (familia, valor, texto) => {
	// Variables
	texto = "la imagen " + texto;
	const terminacion = '" style="color: inherit; text-decoration: none"><u>' + texto + "</u></a>";
	const carpeta = familia == "producto" ? "2-Productos" : "3-RCLVs";
	const rutaArchivo = carpeta + "/Final/" + valor;

	// Fin
	return !valor
		? "" // si no tiene un valor
		: valor.includes("/")
		? '<a href="' + valor + terminacion // si es una imagen Externa
		: comp.gestionArchivos.existe(carpetaExterna + rutaArchivo)
		? '<a href="' + urlHost + "/Externa/" + rutaArchivo + terminacion // si se encuentra el archivo
		: texto; // si no se encuentra el archivo
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
	a: (texto, registro) => {
		// Variables
		const operacion = {[creado_id]: "alta", [inactivar_id]: "inactivar", [recuperar_id]: "recuperar"};

		// Arma la respuesta
		let respuesta = '<a href="' + urlHost + "/revision/" + registro.familia + "/";
		respuesta += operacion[registro.statusRegistro_id];
		respuesta += "?entidad=" + registro.entidad + "&id=" + registro.id;
		respuesta += '" style="color: inherit; text-decoration: none">' + texto + "</a>";

		// Fin
		return respuesta;
	},
};
let nombres = async (reg, familia) => {
	// Variables
	let nombre, anchor;

	// Fórmulas
	if (reg.entidad != "links") {
		// Obtiene el registro
		const prodRclv = await baseDeDatos.obtienePorId(reg.entidad, reg.entidad_id);
		if (!prodRclv) return {};

		// Obtiene los nombres
		nombre = comp.nombresPosibles(prodRclv);
		anchor =
			"<a href='" +
			urlHost +
			"/" +
			familia +
			"/detalle/?entidad=" +
			reg.entidad +
			"&id=" +
			reg.entidad_id +
			"' style='color: inherit; text-decoration: none'>" +
			nombre +
			"</a>";
	} else {
		// Obtiene el registro
		const asocs = variables.entidades.asocProds;
		const link = await baseDeDatos.obtienePorId("links", reg.entidad_id, [...asocs, "prov"]);
		if (!link.id) return {};

		// Obtiene el nombre
		const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
		nombre = comp.nombresPosibles(link[asocProd]);

		// Obtiene el anchor
		link.href = link.prov.embededPoner ? urlHost + "/links/visualizacion/?link_id=" + link.id : "//" + link.url;
		anchor = "<a href='" + link.href + "' style='color: inherit; text-decoration: none'>" + nombre + "</a>";
	}

	// Fin
	return {nombre, anchor};
};
let obtieneLosRCLV = async (fechaDelAno) => {
	// Variables
	const include = variables.entidades.prods;
	let rclvs = [];
	let resultados = [];

	// Obtiene los RCLV
	for (let entidad of variables.entidades.rclvs) {
		// Si corresponde, saltea la rutina
		if (entidad == "epocasDelAno" && fechaDelAno.epocaDelAno_id == 1) continue;

		// Condicion
		let condicion = {statusRegistro_id: aprobado_id, avatar: {[Op.ne]: null}, anoFM: {[Op.or]: [null, anoHoy]}}; // es necesario escribir anoFM de esa manera, para que funcione
		entidad != "epocasDelAno" ? (condicion.fechaDelAno_id = fechaDelAno.id) : (condicion.id = fechaDelAno.epocaDelAno_id);

		// Obtiene los RCLVs
		const registros = baseDeDatos.obtieneTodosPorCondicion(entidad, condicion).then((n) => n.map((m) => ({...m, entidad})));
		rclvs.push(registros);
	}
	await Promise.all(rclvs).then((n) => n.map((m) => resultados.push(...m)));

	// Fin
	return resultados;
};
let reduceRCLVs = (rclvs) => {
	// Variables
	let resultado;

	if (rclvs.length > 1) {
		// Obtiene la máxima prioridad
		const prioridades_id = rclvs.map((n) => n.prioridad_id);
		const prioridad_id = Math.max(...prioridades_id);

		// Filtra por los que tienen la máxima prioridad_id
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
		const {entidad, id, hoyEstamos_id, leyNombre, nombre} = resultado;
		imgDerecha = {entidad, id};

		// hoyEstamos
		const hoyEstamosFinal = hoyEstamos_id
			? hoyEstamos.find((n) => n.id == hoyEstamos_id).nombre
			: hoyEstamos.find((n) => n.entidad == entidad).nombre;

		// leyNombre
		const leyNombreFinal = leyNombre ? leyNombre : nombre;

		// Nombre de la imagen
		imgDerecha.leyenda = hoyEstamosFinal + " " + leyNombreFinal;

		// Datos del archivo, dependiendo de la entidad
		if (!resultado.carpetaAvatars) {
			imgDerecha.carpeta = "3-RCLVs/Final/";
			imgDerecha.nombreArchivo = resultado.avatar;
		} else {
			imgDerecha.carpeta = "4-EpocasDelAno/" + resultado.carpetaAvatars + "/";
			imgDerecha.nombreArchivo = comp.gestionArchivos.imagenAlAzar(carpetaExterna + imgDerecha.carpeta);
		}
	}
	// Acciones si no encontró una imagen para la fecha
	else
		imgDerecha = {
			titulo: "ELC - Películas",
			carpeta: "./publico/imagenes/Varios/",
			nombreArchivo: "Institucional-Imagen.jpg",
		};

	// Fin
	return imgDerecha;
};
let eliminaLasImagenes = (avatars, carpeta) => {
	// Obtiene el nombre de todas las imagenes de los archivos de la carpeta
	const archivos = fs.readdirSync(carpetaExterna + carpeta);
	const imagenes = avatars.map((n) => n.imagen);

	// Rutina para borrar archivos
	for (let archivo of archivos)
		if (!imagenes.includes(archivo)) comp.gestionArchivos.elimina(carpetaExterna + carpeta, archivo);

	// Rutina para detectar nombres sin archivo
	for (let avatar of avatars)
		if (!archivos.includes(avatar.imagen)) console.log("Registros sin avatar:", avatar.nombre, "(" + avatar.entidad + ")");

	// Fin
	return;
};
let nombresDeAvatarEnBD = async ({entidad, status_id, campoAvatar}) => {
	// Variables
	campoAvatar = campoAvatar ? campoAvatar : "avatar";
	const condicion = {[campoAvatar]: {[Op.and]: [{[Op.ne]: null}, {[Op.notLike]: "%/%"}]}};
	if (status_id) condicion.statusRegistro_id = status_id;

	// Obtiene los registros
	const registros = await baseDeDatos.obtieneTodosPorCondicion(entidad, condicion).then((n) =>
		n.map((m) => ({
			imagen: m[campoAvatar],
			nombre: m.nombre ? m.nombre : m.nombreCastellano ? m.nombreCastellano : m.nombreOriginal,
			entidad,
		}))
	);

	// Fin
	return registros;
};
