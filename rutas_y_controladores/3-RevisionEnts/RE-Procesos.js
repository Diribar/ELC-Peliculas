"use strict";
// Definir variables
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const validar = require("../2.1-Prod-RUD/FN-Validar");

module.exports = {
	// Tablero
	TC_obtieneProds: async (ahora, userID) => {
		// Obtiene productos en situaciones particulares
		// Variables
		let entidades = ["peliculas", "colecciones"];
		let creado_id = status_registro.find((n) => n.creado).id;
		let creado_aprob_id = status_registro.find((n) => n.creado_aprob).id;
		let inactivar_id = status_registro.find((n) => n.inactivar).id;
		let recuperar_id = status_registro.find((n) => n.recuperar).id;
		let campos;
		// PA: Pendientes de Aprobar (en status creado)
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", ""];
		let PA = await TC_obtieneRegs(...campos);
		// SE: Sin Edición (en status creado_aprob)
		campos = [entidades, ahora, creado_aprob_id, userID, "creado_en", "creado_por_id", "ediciones"];
		let SE = await TC_obtieneRegs(...campos);
		SE = SE.filter((n) => !n.ediciones.length);
		// IN: En staus 'inactivar'
		campos = [entidades, ahora, inactivar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let IN = await TC_obtieneRegs(...campos);
		// RC: En status 'recuperar'
		campos = [entidades, ahora, recuperar_id, userID, "sugerido_en", "sugerido_por_id", ""];
		let RC = await TC_obtieneRegs(...campos);

		// Fin
		return {PA, IN, RC, SE};
	},
	TC_obtieneProdsConEdicAjena: async function (ahora, userID) {
		// 1. Variables
		const campoFechaRef = "editado_en";
		const aprobado_id = status_registro.find((n) => n.aprobado).id;
		const gr_aprobado_id = [status_registro.find((n) => n.creado_aprob).id, aprobado_id];
		let includes = ["pelicula", "coleccion", "capitulo", "personaje", "hecho", "valor"];
		let productos = [];
		// 2. Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("prods_edicion", userID, includes);
		// 3.A. Elimina las edicionesProd con RCLV no aprobado
		if (ediciones.length)
			for (let i = ediciones.length - 1; i >= 0; i--)
				if (
					(ediciones[i].personaje && ediciones[i].personaje.status_registro_id != aprobado_id) ||
					(ediciones[i].hecho && ediciones[i].hecho.status_registro_id != aprobado_id) ||
					(ediciones[i].valor && ediciones[i].valor.status_registro_id != aprobado_id)
				)
					ediciones.splice(i, 1);
		// 3.B. Obtiene los productos originales
		if (ediciones.length) {
			ediciones.map((n) => {
				let entidad = comp.obtieneEntidad(n);
				let asociacion = comp.obtieneEntidadSingular(entidad);
				productos.push({
					...n[asociacion],
					entidad,
					edicion_id: n.id,
					fechaRef: n[campoFechaRef],
					fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
				});
			});
		}
		// 4.A Elimina los repetidos
		productos.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
		productos = comp.eliminaRepetidos(productos);
		// 4.B. Deja solamente los productos en status creado_aprob y aprobado
		if (productos.length)
			productos = productos.filter((n) => gr_aprobado_id.includes(n.status_registro_id));
		// 5. Deja solamente los sin problemas de captura
		if (productos.length) productos = this.sinProblemasDeCaptura(productos, userID, ahora);

		// Fin
		return productos;
	},
	TC_obtieneProdsConLink: async function (ahora, userID) {
		// Obtiene todos los productos aprobados, con algún link ajeno en status no estable
		// Obtiene los links 'a revisar'
		let links = await BD_especificas.TC_obtieneLinks_y_Edics();
		// Si no hay => salir
		if (!links.length) return [];
		// Obtiene los links ajenos
		let linksAjenos = links.filter(
			(n) =>
				(n.status_registro &&
					((n.status_registro.creado && n.creado_por_id != userID) ||
						((n.status_registro.inactivar || n.status_registro.recuperar) &&
							n.sugerido_por_id != userID))) ||
				(!n.status_registro && n.editado_por_id != userID)
		);
		// Obtiene los productos
		let productos = linksAjenos.length ? this.obtieneProdsDeLinks(linksAjenos, ahora, userID) : [];
		// Fin
		return productos;
	},
	obtieneProdsDeLinks: function (links, ahora, userID) {
		// 1. Variables
		const aprobado_id = status_registro.find((n) => n.aprobado).id;
		let productos = [];
		// 3. Obtiene los productos
		links.map((n) => {
			let entidad = comp.obtieneEntidad(n);
			let asociacion = comp.obtieneEntidadSingular(entidad);
			let campoFechaRef = !n.status_registro_id
				? "editado_en"
				: n.status_registro.creado
				? "creado_en"
				: "sugerido_en";
			productos.push({
				...n[asociacion],
				entidad,
				fechaRef: n[campoFechaRef],
				fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
			});
		});
		// 4.A. Elimina repetidos
		productos.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
		productos = comp.eliminaRepetidos(productos);
		// 4.B. Deja solamente los productos aprobados
		if (productos.length) productos = productos.filter((n) => n.status_registro_id == aprobado_id);
		// 5. Deja solamente los sin problemas de captura
		if (productos.length) productos = this.sinProblemasDeCaptura(productos, userID, ahora);

		// Fin
		return productos;
	},
	TC_obtieneRCLVs: async (ahora, userID) => {
		// Obtiene RCLVs en situaciones particulares
		// Variables
		let entidades = ["personajes", "hechos", "valores"];
		let creado_id = status_registro.find((n) => n.creado).id;
		let campos, regs, includes;
		//	PA: Pendientes de Aprobar (c/producto o c/edicProd)
		includes = ["peliculas", "colecciones", "capitulos", "prods_edic"];
		campos = [entidades, ahora, creado_id, userID, "creado_en", "creado_por_id", includes];
		let PA = await TC_obtieneRegs(...campos);
		PA = PA.filter((n) => n.peliculas || n.colecciones || n.capitulos || n.prods_edic);

		// Fin
		return {PA};
	},
	TC_obtieneRCLVsConEdicAjena: async (ahora, userID) => {
		// 1. Variables
		const campoFechaRef = "editado_en";
		let aprobado_id = status_registro.find((n) => n.aprobado).id;
		let includes = ["personaje", "hecho", "valor"];
		let RCLVs = [];
		// 2. Obtiene todas las ediciones ajenas
		let ediciones = await BD_especificas.TC_obtieneEdicsAjenas("rclvs_edicion", userID, includes);
		// 3. Obtiene los RCLVs originales y deja solamente los RCLVs aprobados
		if (ediciones.length) {
			// Obtiene los RCLVs originales
			ediciones.map((n) => {
				let entidad = comp.obtieneEntidad(n);
				let asociacion = comp.obtieneEntidadSingular(entidad);
				RCLVs.push({
					...n[asociacion],
					entidad,
					editado_en: n.editado_en,
					edicion_id: n.id,
					fechaRef: n[campoFechaRef],
					fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
				});
			});
			// Deja solamente los RCLVs aprobados
			RCLVs = RCLVs.filter((n) => n.status_registro_id == aprobado_id);
		}
		// 4. Elimina los repetidos
		if (RCLVs.length) {
			RCLVs.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
			RCLVs = comp.eliminaRepetidos(RCLVs);
		}
		// 5. Deja solamente los sin problemas de captura
		if (RCLVs.length) RCLVs = this.sinProblemasDeCaptura(RCLVs, userID, ahora);

		// Fin
		return RCLVs;
	},
	TC_prod_ProcesarCampos: (productos) => {
		// Procesar los registros
		// Variables
		const anchoMax = 40;
		const rubros = Object.keys(productos);

		// Reconvertir los elementos
		for (let rubro of rubros)
			productos[rubro] = productos[rubro].map((n) => {
				let nombre =
					(n.nombre_castellano.length > anchoMax
						? n.nombre_castellano.slice(0, anchoMax - 1) + "…"
						: n.nombre_castellano) +
					" (" +
					n.ano_estreno +
					")";
				let datos = {
					id: n.id,
					entidad: n.entidad,
					nombre,
					ano_estreno: n.ano_estreno,
					abrev: n.entidad.slice(0, 3).toUpperCase(),
					fechaRefTexto: n.fechaRefTexto,
				};
				if (rubro == "ED") datos.edicion_id = n.edicion_id;
				return datos;
			});

		// Fin
		return productos;
	},
	TC_RCLV_ProcesarCampos: (RCLVs) => {
		// Procesar los registros
		let anchoMax = 30;
		const rubros = Object.keys(RCLVs);

		// Reconvertir los elementos
		for (let rubro of rubros)
			RCLVs[rubro] = RCLVs[rubro].map((n) => {
				let nombre = n.nombre.length > anchoMax ? n.nombre.slice(0, anchoMax - 1) + "…" : n.nombre;
				return {
					id: n.id,
					entidad: n.entidad,
					nombre,
					abrev: n.entidad.slice(0, 3).toUpperCase(),
					status_registro_id: n.status_registro_id,
					fecha: n.creado_en,
				};
			});

		// Fin
		return RCLVs;
	},
	sinProblemasDeCaptura: (familia, userID, ahora) => {
		// Variables
		const haceUnaHora = comp.nuevoHorario(-1, ahora);
		const haceDosHoras = comp.nuevoHorario(-2, ahora);
		// Fin
		return familia.filter(
			(n) =>
				// Que no esté capturado
				!n.capturado_en ||
				// Que esté capturado hace más de dos horas
				n.capturado_en < haceDosHoras ||
				// Que la captura haya sido por otro usuario y hace más de una hora
				(n.capturado_por_id != userID && n.capturado_en < haceUnaHora) ||
				// Que la captura haya sido por otro usuario y esté inactiva
				(n.capturado_por_id != userID && !n.captura_activa) ||
				// Que esté capturado por este usuario hace menos de una hora
				(n.capturado_por_id == userID && n.capturado_en > haceUnaHora)
		);
	},

	// Productos Alta
	prodAltaForm_ficha: async (prodOrig, paises) => {
		// Funciones
		let usuario_CalidadAltas = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
			// 2. Contar los casos aprobados y rechazados
			let cantAprob = usuario.prods_aprob;
			let cantRech = usuario.prods_rech;
			// 3. Precisión de altas
			let cantAltas = cantAprob + cantRech;
			let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
			// let diasPenalizacion = usuario.dias_penalizacion
			// Datos a enviar
			let enviar = {
				calidadAltas: ["Calidad Altas", calidadInputs],
				cantAltas: ["Cant. Prod. Agregados", cantAltas],
				// diasPenalizacion: ["Días Penalizado", diasPenalizacion],
			};
			// Fin
			return enviar;
		};
		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
		// Bloque izquierdo
		let [bloque1, bloque2, bloque3] = [[], [], []];
		// Bloque 1
		if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
		if (prodOrig.idioma_original)
			bloque1.push({titulo: "Idioma original", valor: prodOrig.idioma_original.nombre});
		// Bloque 2
		if (prodOrig.direccion) bloque2.push({titulo: "Dirección", valor: prodOrig.direccion});
		if (prodOrig.guion) bloque2.push({titulo: "Guión", valor: prodOrig.guion});
		if (prodOrig.musica) bloque2.push({titulo: "Música", valor: prodOrig.musica});
		if (prodOrig.produccion) bloque2.push({titulo: "Producción", valor: prodOrig.produccion});
		// Bloque 3
		if (prodOrig.actuacion) bloque3.push({titulo: "Actuación", valor: prodOrig.actuacion});
		// Bloque izquierdo consolidado
		let izquierda = [bloque1, bloque2, bloque3];
		// Bloque derecho
		[bloque1, bloque2] = [[], []];
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtiene la fecha de alta
		let fecha = comp.fechaTexto(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuario_Ficha(prodOrig.creado_por_id, ahora);
		// 6. Obtiene la calidad de las altas
		let calidadAltas = await usuario_CalidadAltas(prodOrig.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	prodAltaGuardar_informacion: (req, producto) => {
		// Variables
		const {entidad, id, rechazado} = req.query;
		const motivo_id = req.body.motivo_id;
		let informacion;
		// Rechazado sin motivo => Recarga la vista
		if (rechazado && !motivo_id) {
			let link = req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id;
			informacion = {
				mensajes: ["Se rechazó sin decirnos el motivo"],
				iconos: [{nombre: "fa-circle-left", link, titulo: "Volver a la vista anterior"}],
			};
		}
		// El producto no está en status 'creado' => Vuelve al tablero
		if (!producto.status_registro.creado) {
			const vistaInactivar = variables.vistaInactivar(req);
			informacion = {
				mensajes: ["El producto ya fue procesado anteriormente"],
				iconos: [vistaInactivar],
			};
		}
		// Fin
		return informacion;
	},
	// Prod/RCLV-Edición Form
	prodEdicForm_obtieneProdEdic: async (req) => {
		// Variables
		const {entidad, id: prodID, edicion_id: edicID} = req.query;
		const userID = req.session.usuario.id;
		const producto_id = comp.obtieneEntidad_id(entidad);
		// Mensajes
		let mensajeSinEdicion = {
			mensajes: ["No encontramos ninguna edición ajena para revisar"],
			iconos: [
				{
					nombre: "fa-spell-check ",
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&origen=tableroEnts",
					titulo: "Regresar al Tablero de Control",
				},
			],
		};
		let mensajeSinEsaEdicion = {
			mensajes: [
				"No encontramos esa edición.",
				"Te sugerimos que regreses al tablero y lo vuelvas a intentar",
			],
			iconos: [
				{
					nombre: "fa-spell-check ",
					link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "&origen=tableroEnts",
					titulo: "Regresar al Tablero de Control",
				},
			],
		};
		// Obtiene las ediciones del producto
		let prodEdics = await BD_especificas.edicForm_EdicsAjenas(
			"prods_edicion",
			{entidad_id: producto_id, entID: prodID, userID},
			comp.includes("productos")
		);
		// Si no existe ninguna edición => informa el error
		if (!prodEdics.length) return {informacion: mensajeSinEdicion};
		// Si no existe la edicID => informa el error
		let prodEdic = prodEdics.find((n) => n.id == edicID);
		if (!prodEdic) return {informacion: mensajeSinEsaEdicion};
		// Fin - Envía la edición
		return {prodEdic};
	},
	prodEdicForm_ingrReempl: (prodOrig, edicion) => {
		// Obtiene todos los campos a revisar
		let campos = [...variables.camposRevisar.productos];
		let resultado = [];

		// Deja solamente los campos presentes en edicion
		for (let nombre in edicion) {
			// Obtiene el campo con varios datos
			let campo = campos.find((n) => n.nombre == nombre);
			// Si el campo no existe en los campos a revisar, saltea la rutina
			if (!campo) continue;
			// Obtiene las variables de include
			let relac_include = campo.relac_include;
			let campo_include = campo.campo_include;
			// Criterio para determinar qué valores originales mostrar
			campo.mostrarOrig =
				relac_include && prodOrig[relac_include] // El producto original tiene un valor 'include'
					? prodOrig[relac_include][campo_include] // Muestra el valor 'include'
					: prodOrig[nombre]; // Muestra el valor 'simple'
			// Criterio para determinar qué valores editados mostrar
			campo.mostrarEdic =
				relac_include && edicion[relac_include] // El producto editado tiene un valor 'include'
					? edicion[relac_include][campo_include] // Muestra el valor 'include'
					: edicion[nombre]; // Muestra el valor 'simple'
			// Consolidar los resultados
			resultado.push(campo);
		}
		// Separa los resultados entre ingresos y reemplazos
		let ingresos = resultado.filter((n) => !n.mostrarOrig); // Datos de edición, sin valor en la versión original
		let reemplazos = resultado.filter((n) => n.mostrarOrig);
		// Fin
		return [ingresos, reemplazos];
	},
	prodEdic_ficha: async (prodOrig, prodEdic) => {
		// Funciones
		let usuario_CalidadEdic = async (userID) => {
			// 1. Obtiene los datos del usuario
			let usuario = await BD_genericas.obtienePorId("usuarios", userID);
			// 2. Contar los casos aprobados y rechazados
			let cantAprob = usuario.edics_aprob;
			let cantRech = usuario.edics_rech;
			// 3. Precisión de ediciones
			let cantEdics = cantAprob + cantRech;
			let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
			// let diasPenalizacion = usuario.dias_penalizacion
			// Datos a enviar
			let enviar = {
				calidadEdiciones: ["Calidad Edición", calidadInputs],
				cantEdiciones: ["Cant. Campos Proces.", cantEdics],
				// diasPenalizacion: ["Días Penalizado", diasPenalizacion],
			};
			// Fin
			return enviar;
		};

		// Definir el 'ahora'
		let ahora = comp.ahora().getTime();
		// Bloque derecho
		let bloque1 = [];
		let fecha;
		// Bloque 1
		if (prodOrig.ano_estreno) bloque1.push({titulo: "Año de estreno", valor: prodOrig.ano_estreno});
		if (prodOrig.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOrig.ano_fin});
		if (prodOrig.duracion) bloque1.push({titulo: "Duracion", valor: prodOrig.duracion + " min."});
		// Obtiene la fecha de alta
		fecha = comp.fechaTexto(prodOrig.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtiene la fecha de edicion
		fecha = comp.fechaTexto(prodEdic.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtiene los datos del usuario
		let fichaDelUsuario = await comp.usuario_Ficha(prodEdic.editado_por_id, ahora);
		// 6. Obtiene la calidad de las altas
		let calidadEdic = await usuario_CalidadEdic(prodEdic.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},

	// Prod/RCLV-Edición Guardar
	prodEdicGuardar_Avatar: async (req, prodOrig, prodEdic) => {
		// Variables
		const edicAprob = req.query.aprob == "true";
		const avatarOrig = prodOrig.avatar;
		const avatarEdic = prodEdic.avatar;

		// Gestión de archivos
		if (edicAprob) {
			// Mueve el archivo de edición a la carpeta definitiva
			comp.mueveUnArchivoImagen(avatarEdic, "4-ProdsRevisar", "3-Productos");
			// Si el 'avatar original' es un archivo, lo elimina
			if (comp.averiguaSiExisteUnArchivo("./publico/imagenes/3-Productos/" + avatarOrig))
				comp.borraUnArchivo("./publico/imagenes/3-Productos/", avatarOrig);
		}
		// Elimina el archivo de edicion
		else comp.borraUnArchivo("./publico/imagenes/4-ProdsRevisar/", avatarEdic);

		// Borra el campo 'avatar_url' en el registro de edicion y la variable
		await BD_genericas.actualizaPorId("prods_edicion", prodEdic.id, {avatar_url: null});
		delete prodEdic.avatar_url;

		// Fin
		return prodEdic;
	},
	prodEdicGuardar_Gral: async (req, prodOrig, prodEdic) => {
		// Variables
		const {entidad, campo, aprob} = req.query;
		const edicAprob = aprob == "true";
		const decision = "edics_" + (edicAprob ? "aprob" : "rech");
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const statusAprobInicial = prodOrig.status_registro.aprobado;
		const datosEdicion = {
			id: prodEdic.id,
			editado_por_id: prodEdic.editado_por_id,
			editado_en: prodEdic.editado_en,
		};
		let motivo, statusAprobFinal;

		// Genera la información a actualizar
		let datos = {
			[campo]: prodEdic[campo],
			editado_por_id: prodEdic.editado_por_id,
			editado_en: prodEdic.editado_en,
			edic_analizada_por_id: userID,
			edic_analizada_en: ahora,
			lead_time_edicion: comp.obtieneLeadTime(prodEdic.editado_en, ahora),
		};

		// Agrega un registro en la tabla 'edics_aprob/edics_rech', según corresponda
		await (async () => {
			// Si fue rechazado, amplía la información
			if (!edicAprob) {
				let {motivo_id} = req.query;
				let condicion = motivo_id ? {id: motivo_id} : {info_erronea: true};
				motivo = await BD_genericas.obtienePorCampos("edic_motivos_rech", condicion);
				datos = {...datos, duracion: motivo.duracion, motivo_id: motivo.id};
			}
			// Obtiene los valores aprob/rech
			let fn_valoresAprobRech = () => {
				// Fórmulas
				let obtieneElValorDeUnCampo = (registro, campo) => {
					// Variables
					let familia = comp.obtieneFamiliaEnPlural(entidad);
					let camposConVinculo = [...variables.camposRevisar[familia]]; // Hay que desconectarse del original
					camposConVinculo = camposConVinculo.filter((n) => n.relac_include);
					let campos = camposConVinculo.map((n) => n.nombre);
					let indice = campos.indexOf(campo);
					let vinculo = indice >= 0 ? camposConVinculo[indice].relac_include : "";
					let respuesta;
					// Resultado
					if (indice >= 0)
						respuesta = registro[vinculo]
							? registro[vinculo].productos
								? registro[vinculo].productos
								: registro[vinculo].nombre
							: "-";
					else respuesta = registro[campo];

					// Fin
					if (respuesta === null) respuesta = "-";
					return respuesta;
				};
				// Amplía la información con los valores aprob/rech de edición
				let valorOrig = obtieneElValorDeUnCampo(prodOrig, campo);
				let valorEdic = obtieneElValorDeUnCampo(prodEdic, campo);
				// Obtiene los valores 'aprobado' y 'rechazado'
				let valor_aprob = edicAprob ? valorEdic : valorOrig;
				let valor_rech = !edicAprob ? valorEdic : valorOrig;
				// Fin
				return {valor_aprob, valor_rech};
			};
			let valoresAprobRech = fn_valoresAprobRech();
			// Obtiene datos adicionales
			const titulo = variables.camposRevisar.productos.find((n) => n.nombre == campo).titulo;
			let datosAdicionales = {entidad, entidad_id: prodOrig.id, campo, titulo};
			// Agrega un registro a la tabla 'edics_aprob' / 'edics_rech'
			datos = {...datos, ...valoresAprobRech, ...datosAdicionales};
			BD_genericas.agregarRegistro(decision, datos);
		})();

		// Aumenta el campo aprob/rech en el registro del usuario
		BD_genericas.aumentaElValorDeUnCampo("usuarios", prodEdic.editado_por_id, decision, 1);

		// Si corresponde, penaliza al usuario
		if (datos.duracion) comp.usuario_aumentaPenalizacAcum(prodEdic.editado_por_id, motivo);

		// Si se aprobó, actualiza el registro y la variable de 'original'
		if (edicAprob) {
			await BD_genericas.actualizaPorId(entidad, prodOrig.id, datos);
			prodOrig = {...prodOrig, [campo]: prodEdic[campo]};
		}

		// Actualiza el registro y la variable de 'edición'
		await BD_genericas.actualizaPorId("prods_edicion", prodEdic.id, {[campo]: null});
		delete prodEdic[campo];

		// Averigua si quedan campos por procesar
		let [edicion, quedanCampos] = comp.puleEdicion(prodOrig, prodEdic, "productos");

		// Acciones si no quedan campos
		if (!quedanCampos) {
			// 1. Si corresponde, actualiza el status del registro original (y eventualmente capítulos)
			// 2. Informa si el status pasó a aprobado
			statusAprobFinal = await (async () => {
				// Variables
				let statusAprob;
				// Averigua si tiene errores
				let errores = await validar.consolidado(null, {...prodOrig, entidad});
				// Acciones si el original no tiene errores y está en status 'gr_creado'
				if (!errores.hay && prodOrig.status_registro.gr_creado) {
					// Genera la información a actualizar en el registro original
					let datosCambioStatus = {
						alta_terminada_en: ahora,
						lead_time_creacion: comp.obtieneLeadTime(prodOrig.creado_en, ahora),
						status_registro_id: status_registro.find((n) => n.aprobado).id,
						captura_activa: 0,
					};
					// Cambia el status del producto e inactiva la captura
					await BD_genericas.actualizaPorId(entidad, prodOrig.id, datosCambioStatus);
					// Si es una colección, le cambia el status también a los capítulos
					if (entidadOrig == "colecciones") {
						// Amplía los datos
						datosCambioStatus = {
							...datosCambioStatus,
							alta_analizada_por_id: 2,
							alta_analizada_en: ahora,
						};
						// Actualiza el status de todos los capítulos a la vez
						BD_genericas.actualizaTodosPorCampos("capitulos", {coleccion_id: prodOrig.id}, datos);
					}
					// Cambia el valor de la variable que se informará
					statusAprob = true;
				}
				return statusAprob;
			})();
		} else edicion = {...datosEdicion, ...edicion};

		// Actualiza RCLV si corresponde
		if (!statusAprobInicial && statusAprobFinal)
			this.RCLV_prodsAprob(prodOrig, campo, edicAprob, statusAprobInicial, statusAprobFinal);
		// Fin
		return [prodOrig, edicion, quedanCampos, statusAprobFinal];
	},
	cartelNoQuedanCampos: {
		mensajes: ["Se terminó de procesar esta edición.", "Podés volver al tablero de control"],
		iconos: [
			{
				nombre: "fa-spell-check",
				link: "/revision/tablero-de-control",
				titulo: "Ir al 'Tablero de Control' de Revisiones",
			},
		],
	},

	// RCLV Alta
	RCLV_AltaGuardar: async (entidad, original, userID) => {
		// Actualiza la info de aprobados/rechazados
		// Funcion
		let RCLV_valorVinculo = (RCLV, campo) => {
			return campo == "dia_del_ano_id"
				? RCLV.dia_del_ano
					? RCLV.dia_del_ano.dia + "/" + mesesAbrev[RCLV.dia_del_ano.mes_id - 1]
					: "Sin fecha conocida"
				: campo == "proceso_id"
				? RCLV.proc_canoniz
					? RCLV.proc_canoniz.nombre
					: ""
				: campo == "rol_iglesia_id"
				? RCLV.rol_iglesia
					? RCLV.rol_iglesia.nombre
					: ""
				: RCLV[campo];
		};
		// Variables
		let ahora = comp.ahora();
		let camposComparar = variables.camposRevisar.RCLVs.filter((n) => !!n.titulo).filter(
			(n) => n[entidad]
		);
		// Obtiene RCLV actual
		let includes = [];
		if (entidad != "valores") includes.push("dia_del_ano");
		if (entidad == "personajes") includes.push("proc_canoniz", "rol_iglesia");
		let RCLV_actual = await BD_genericas.obtienePorIdConInclude(entidad, original.id, includes);
		// Obtiene los motivos posibles
		let motivos = await BD_genericas.obtieneTodos("edic_motivos_rech");
		let motivoGenerico = motivos.find((n) => n.generico);
		let motivoInfoErronea = motivos.find((n) => n.info_erronea);
		// Rutina para comparar los campos
		for (let campoComparar of camposComparar) {
			// Valor aprobado
			let valor_aprob = RCLV_valorVinculo(RCLV_actual, campoComparar.nombre);
			let valor_rech = RCLV_valorVinculo(original, campoComparar.nombre);
			if (!valor_aprob && !valor_rech) continue;
			// Genera la información
			let datos = {
				entidad,
				entidad_id: original.id,
				campo: campoComparar.nombre,
				titulo: campoComparar.titulo,
				valor_aprob,
				input_por_id: original.creado_por_id,
				input_en: original.creado_en,
				evaluado_por_id: userID,
				evaluado_en: ahora,
			};
			// Obtiene la entidad
			let entidadAprobRech;
			if (original[campoComparar.nombre] != RCLV_actual[campoComparar.nombre]) {
				entidadAprobRech = "edics_rech";
				datos.valor_rech = valor_rech;
				motivo =
					campoComparar.nombre == "nombre" || campoComparar.nombre == "apodo"
						? motivoGenerico
						: motivoInfoErronea;
				datos.motivo_id = motivo.id;
				datos.duracion = motivo.duracion;
			} else entidadAprobRech = "edics_aprob";
			// Guarda los registros
			await BD_genericas.agregarRegistro(entidadAprobRech, datos);
		}
		// Fin
		return;
	},
	RCLV_prodsAprob: function (prodOrig, campo, edicAprob, statusAprobOrig, statusAprob) {
		// Actualiza en RCLVs el campo 'prods_aprob', si ocurre 1 y (2 ó 3)
		// 1. Se aprobó un cambio y el producto está aprobado
		// 2. El cambio es un campo RCLV con valor distinto de 1
		// 3. El registro no estaba aprobado
		const entidades_id = ["personaje_id", "hecho_id", "valor_id"];
		if (
			edicAprob && // Se aprobó un cambio
			statusAprob && // El producto está aprobado
			((entidades_id.includes(campo) && prodOrig[campo] != 1) || // El cambio es un campo RCLV con valor distinto de 1
				!statusAprobOrig) // El registro no estaba aprobado
		)
			entidades_id.forEach((entidad_id) => {
				let RCLV_id = prodOrig[entidad_id]; // Obtiene el RCLV_id
				if (RCLV_id) {
					let entidad = comp.obtieneEntidadDesdeEdicion({[entidad_id]: true}); // Obtiene el campo a analizar (pelicula_id, etc.) y su valor en el producto
					BD_genericas.actualizaPorId(entidad, RCLV_id, {prods_aprob: true}); // Actualiza la entidad_RCLV
				}
			});

		// Fin
		return;
	},

	// Links
	problemasLinks: (producto, urlAnterior) => {
		// Variables
		let informacion;
		const vistaAnterior = variables.vistaAnterior(urlAnterior);
		const vistaTablero = variables.vistaTablero;

		// El producto no está en status 'aprobado'
		if (!informacion && !producto.status_registro.aprobado)
			informacion = {
				mensajes: [
					"El producto no está en status 'Aprobado'",
					"Su status es " + producto.status_registro.nombre,
				],
			};

		// El producto no posee links
		if (!informacion && !producto.links.length)
			informacion = {mensajes: ["Este producto no tiene links en nuestra Base de Datos"]};
		// Agregar los íconos
		if (informacion) informacion.iconos = [vistaAnterior, vistaTablero];

		// Fin
		return informacion;
	},
	linksEdic_LimpiarEdiciones: async (linkOrig) => {
		// Limpia las ediciones
		// 1. Obtiene el link con sus ediciones
		linkOrig = await BD_genericas.obtienePorIdConInclude("links", linkOrig.id, ["ediciones"]);
		// Genera un objeto con valores null
		let camposVacios = {};
		variables.camposRevisar.links.forEach((campo) => (camposVacios[campo.nombre] = null));
		// Purga cada edición
		linkOrig.ediciones.forEach(async (linkEdic) => {
			let edicID = linkEdic.id;
			// La variable 'linkEdic' queda solamente con los camos con valor
			linkEdic = {...linkEdic, entidad: "links_edicion"};
			[linkEdic, quedanCampos] = await comp.puleEdicion(linkOrig, linkEdic);
			// Si quedan campos, actualiza la edición
			if (quedanCampos)
				await BD_genericas.actualizaPorId("links_edicion", edicID, {
					...camposVacios,
					...linkEdic,
				});
			// Si no quedan, elimina el registro de la edición
			else await BD_genericas.eliminaPorId("links_edicion", edicID);
		});
		// Fin
		return;
	},
	links_prodCampoLG_OK: async (prodEntidad, prodID, campo) => {
		if (campo == "gratuito" && prodEntidad.gratuito) {
			// Obtiene los ID de si, no y TalVez
			let si_no_parcial = await BD_genericas.obtieneTodos("si_no_parcial", "id");
			let si = si_no_parcial.find((n) => n.si).id;
			BD_genericas.actualizaPorId("links", prodID, {
				links_gratuitos_cargados_id: si,
				links_gratuitos_en_la_web_id: si,
			});
		}
	},
	obtieneCamposLinkEdic: (edicAprob, linkEdicion, campo) => {
		// Se preparan los datos 'consecuencia' a guardar
		let datos = {[campo]: edicAprob ? linkEdicion[campo] : null};
		if (campo == "tipo_id" && linkEdicion.completo !== null)
			datos.completo = edicAprob ? linkEdicion.completo : null;
		if (campo == "tipo_id" && linkEdicion.parte !== null)
			datos.parte = edicAprob ? linkEdicion.parte : null;
		// Fin
		return datos;
	},
};
let TC_obtieneRegs = async (entidades, ahora, status, userID, campoFechaRef, autor_id, includes) => {
	// Variables
	let campos = [ahora, status, userID, includes, campoFechaRef, autor_id];
	let resultados = [];
	// Obtiene el resultado por entidad
	for (let entidad of entidades)
		resultados.push(...(await BD_especificas.TC_obtieneRegs(entidad, ...campos)));
	// Elimina los propuestos hace menos de una hora, o por el Revisor
	const haceUnaHora = comp.nuevoHorario(-1, ahora);
	if (resultados.length)
		for (let i = resultados.length - 1; i >= 0; i--)
			if (resultados[i][campoFechaRef] > haceUnaHora || resultados[i][autor_id] == userID)
				resultados.splice(i, 1);
	// Agrega el campo 'fecha-ref'
	resultados = resultados.map((n) => {
		return {
			...n,
			fechaRef: n[campoFechaRef],
			fechaRefTexto: comp.fechaTextoCorta(n[campoFechaRef]),
		};
	});
	// Ordena los resultados
	if (resultados.length) resultados.sort((a, b) => new Date(a.fechaRef) - new Date(b.fechaRef));
	// Fin
	return resultados;
};
