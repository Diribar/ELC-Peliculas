"use strict";
// Definir variables
const BD_genericas = require("../2-BD/Genericas");
const funciones = require("../3-Procesos/Compartidas");
const validar = require("../4-Validaciones/RUD");
const procesarRUD = require("./3-RUD");
const variables = require("../../funciones/3-Procesos/Variables");

module.exports = {
	quedanCampos: async function (prodOriginal, prodEditado) {
		// Variables
		let edicion = {...prodEditado};
		let noSeComparan;
		let entidad = funciones.obtenerEntidad(prodEditado);
		let statusAprobado = false;
		// Pulir la información a tener en cuenta
		edicion = procesarRUD.quitarLosCamposSinContenido(edicion);
		[edicion, noSeComparan] = procesarRUD.quitarLosCamposQueNoSeComparan(edicion);
		edicion = funciones.quitarLasCoincidenciasConOriginal(prodOriginal, edicion);
		// Averiguar si queda algún campo
		let quedanCampos = !!Object.keys(edicion).length;
		// Si no quedan, eliminar el registro
		if (!quedanCampos) {
			// Eliminar el registro de la edición
			await BD_genericas.eliminarRegistro("prods_edicion", prodEditado.id);
			// Averiguar si el original no tiene errores
			let errores = await validar.edicion(null, {...prodOriginal, entidad});
			// Si se cumple lo siguiente, cambiarle el status a 'aprobado'
			// 1. Que no tenga errores
			// 2. Que el status del original sea 'alta_aprob'
			if (!errores.hay && prodOriginal.status_registro.alta_aprob) {
				statusAprobado = true;
				// Obtener el 'id' del status 'aprobado'
				let aprobado_id = await this.obtenerELC_id("status_registro", {aprobado: 1});
				// Averiguar el Lead Time de creación en horas
				let ahora = funciones.ahora();
				let leadTime = funciones.obtenerHoras(prodOriginal.creado_en, ahora);
				// Cambiarle el status al producto y liberarlo
				let datos = {
					alta_terminada_en: ahora,
					lead_time_creacion: leadTime,
					status_registro_id: aprobado_id,
				};
				await BD_genericas.actualizarPorId(entidad, prodOriginal.id, {...datos, captura_activa: 0});
				// Si es una colección, cambiarle el status también a los capítulos
				if (entidad == "colecciones") {
					// Generar el objeto para filtrar
					let objeto = {coleccion_id: prodOriginal.id};
					// Actualizar el status de los capitulos
					BD_genericas.actualizarPorCampos("capitulos", objeto, datos);
				}
			}
		} else edicion = {...noSeComparan, ...edicion};
		// Fin
		return [quedanCampos, edicion, statusAprobado];
	},
	tituloCanonizacion: (datos) => {
		let tituloCanoniz = "";
		if (datos.entidad == "RCLV_personajes") {
			tituloCanoniz = datos.proceso_canonizacion.nombre;
			if (
				datos.proceso_canonizacion.nombre == "Santo" &&
				!datos.nombre.startsWith("Domingo") &&
				!datos.nombre.startsWith("Tomás") &&
				!datos.nombre.startsWith("Tomé") &&
				!datos.nombre.startsWith("Toribio")
			)
				tituloCanoniz = "San";
		}
		return tituloCanoniz;
	},
	fichaDelUsuario: async function (userID, ahora) {
		// Obtener los datos del usuario
		let includes = "rol_iglesia";
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// Variables
		let anos = 1000 * 60 * 60 * 24 * 365;
		// Edad
		if (usuario.fecha_nacimiento) {
			var edad = parseInt((ahora - new Date(usuario.fecha_nacimiento).getTime()) / anos) + " años";
		}
		// Antigüedad
		let antiguedad =
			(parseInt(((ahora - new Date(usuario.creado_en).getTime()) / anos) * 10) / 10)
				.toFixed(1)
				.replace(".", ",") + " años";
		// Datos a enviar
		let enviar = {};
		enviar.apodo = ["Apodo", usuario.apodo];
		if (usuario.rol_iglesia) enviar.rolIglesia = ["Vocación", usuario.rol_iglesia.nombre];
		if (usuario.fecha_nacimiento) enviar.edad = ["Edad", edad];
		enviar.antiguedad = ["Tiempo en ELC", antiguedad];
		// Fin
		return enviar;
	},
	calidadAltas: async function (userID) {
		// Obtener los datos del usuario
		let includes = ["status_registro", "peliculas", "colecciones"];
		let usuario = await BD_genericas.obtenerPorIdConInclude("usuarios", userID, includes);
		// 1. Obtener los status
		let altaAprobId = await BD_genericas.obtenerPorCampos("status_registro", {alta_aprob: 1}).then(
			(n) => n.id
		);
		let aprobadoId = await BD_genericas.obtenerPorCampos("status_registro", {aprobado: 1}).then(
			(n) => n.id
		);
		let editadoId = await BD_genericas.obtenerPorCampos("status_registro", {editado: 1}).then(
			(n) => n.id
		);
		let inactivadoId = await BD_genericas.obtenerPorCampos("status_registro", {inactivado: 1}).then(
			(n) => n.id
		);
		// 2. Contar los casos aprobados
		let cantAprob = usuario.peliculas.length
			? usuario.peliculas.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		cantAprob += usuario.colecciones.length
			? usuario.colecciones.filter(
					(n) =>
						n.status_registro_id == altaAprobId ||
						n.status_registro_id == aprobadoId ||
						n.status_registro_id == editadoId
			  ).length
			: 0;
		// 3. Contar los casos rechazados
		let cantRech = usuario.peliculas.length
			? usuario.peliculas.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		cantRech += usuario.colecciones.length
			? usuario.colecciones.filter((n) => n.status_registro_id == inactivadoId).length
			: 0;
		// 4. Precisión de altas
		let cantAltas = cantAprob + cantRech;
		let calidadInputs = cantAltas ? parseInt((cantAprob / cantAltas) * 100) + "%" : "-";
		let diasPenalizacion = await BD_genericas.sumarValores("altas_rech", {id: userID}, "duracion");
		// Datos a enviar
		let enviar = {
			calidadAltas: ["Calidad Altas", calidadInputs],
			cantAltas: ["Cant. Alta Productos", cantAltas],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	calidadEdic: async function (userID) {
		// Obtener la cantidad de aprobaciones y de rechazos
		let cantAprob = await BD_genericas.contarCasos("edic_aprob", {input_por_id: userID});
		let rechazados = await BD_genericas.obtenerTodosPorCampos("edic_rech", {input_por_id: userID});
		let cantRech = rechazados.length ? rechazados.length : 0;
		// Obtener la calidad de las ediciones
		let cantEdics = cantAprob + cantRech;
		let calidadInputs = cantEdics ? parseInt((cantAprob / cantEdics) * 100) + "%" : "-";
		// Obtener la cantidad de penalizaciones con días
		let cantPenalizConDias = rechazados.length ? rechazados.filter((n) => n.duracion).length : "-";
		// Obtener la cantidad de días penalizados
		let diasPenalizacion = rechazados.length ? rechazados.reduce((suma, n) => suma + n.duracion, 0) : "-";
		// Datos a enviar
		let enviar = {
			calidadEdiciones: ["Calidad Edición", calidadInputs],
			cantEdiciones: ["Cant. Campos Proces.", cantEdics],
			cantPenalizConDias: ["Cant. Penaliz. c/Días", cantPenalizConDias],
			diasPenalizacion: ["Días Penalizado", diasPenalizacion],
		};
		// Fin
		return enviar;
	},
	// Funciones -----------------------------------------------------------------------------
	procesarProd: (productos) => {
		// Procesar los registros
		let anchoMax = 30;
		// Reconvertir los elementos
		productos = productos.map((n) => {
			let nombre =
				(n.nombre_castellano.length > anchoMax
					? n.nombre_castellano.slice(0, anchoMax - 1) + "…"
					: n.nombre_castellano) +
				" (" +
				n.ano_estreno +
				")";
			return {
				id: n.id,
				entidad: n.entidad,
				nombre,
				ano_estreno: n.ano_estreno,
				abrev: n.entidad.slice(0, 3).toUpperCase(),
				status_registro_id: n.status_registro_id,
				fecha: n.creado_en,
			};
		});
		// Fin
		return productos;
	},
	procesarRCLVs: (RCLVs, aprobados) => {
		// Definir algunas variables
		let anchoMax = 30;
		let resultados = [];
		let campos = ["peliculas", "colecciones", "capitulos"];
		// Descartar los RCLVs que no tengan productos aprobados
		RCLVs.map((n) => {
			for (let campo of campos) {
				if (n[campo].length)
					for (let registro of n[campo]) {
						if (
							registro.status_registro_id == aprobados[0] ||
							registro.status_registro_id == aprobados[1]
						) {
							resultados.push(n);
							break;
						}
					}
				if (resultados.length && resultados.slice(-1) == n) break;
			}
		});
		RCLVs = resultados;
		// Reconvertir los elementos
		RCLVs = RCLVs.map((n) => {
			let nombre = n.nombre.length > anchoMax ? n.nombre.slice(0, anchoMax - 1) + "…" : n.nombre;
			return {
				id: n.id,
				entidad: n.entidad,
				nombre,
				abrev: n.entidad.slice(5, 8).toUpperCase(),
				status_registro_id: n.status_registro_id,
				fecha: n.creado_en,
			};
		});
		// Fin
		return RCLVs;
	},
	productosLinks: (links, aprobado) => {
		// Resultado esperado:
		//	- Solo productos aprobados
		//	- Campos: {abrev, entidad, id, ano_estreno,}

		// Definir las  variables
		let prods = [];
		let auxs = [
			{nombre: "pelicula", entidad: "peliculas"},
			{nombre: "coleccion", entidad: "colecciones"},
			{nombre: "capitulo", entidad: "capitulos"},
		];
		// Rutina para cada link
		for (let link of links) {
			// Verificación para cada Producto
			for (let aux of auxs) {
				if (
					link[aux.nombre] &&
					aprobado.includes(link[aux.nombre].status_registro_id) &&
					prods.findIndex((n) => n.entidad == aux.entidad && n.id == link[aux.nombre].id) < 0
				)
					prods.push({
						entidad: aux.entidad,
						id: link[aux.nombre].id,
						nombre: link[aux.nombre].nombre_castellano,
						ano_estreno: link[aux.nombre].ano_estreno,
						abrev: aux.nombre.slice(0, 3).toUpperCase(),
					});
			}
		}
		return prods;
	},
	bloquesAltaProd: async function (prodOriginal, paises) {
		// Definir el 'ahora'
		let ahora = funciones.ahora().getTime();
		// Bloque izquierdo
		let [bloque1, bloque2, bloque3] = [[], [], []];
		// Bloque 1
		if (paises) bloque1.push({titulo: "País" + (paises.includes(",") ? "es" : ""), valor: paises});
		if (prodOriginal.idioma_original)
			bloque1.push({titulo: "Idioma original", valor: prodOriginal.idioma_original.nombre});
		// Bloque 2
		if (prodOriginal.direccion) bloque2.push({titulo: "Dirección", valor: prodOriginal.direccion});
		if (prodOriginal.guion) bloque2.push({titulo: "Guión", valor: prodOriginal.guion});
		if (prodOriginal.musica) bloque2.push({titulo: "Música", valor: prodOriginal.musica});
		if (prodOriginal.produccion) bloque2.push({titulo: "Producción", valor: prodOriginal.produccion});
		// Bloque 3
		if (prodOriginal.actuacion) bloque3.push({titulo: "Actuación", valor: prodOriginal.actuacion});
		// Bloque izquierdo consolidado
		let izquierda = [bloque1, bloque2, bloque3];
		// Bloque derecho
		[bloque1, bloque2] = [[], []];
		// Bloque 1
		if (prodOriginal.ano_estreno)
			bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
		if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
		if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
		// Obtener la fecha de alta
		let fecha = this.obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await BD_especificas.fichaDelUsuario(prodOriginal.creado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadAltas = await BD_especificas.calidadAltas(prodOriginal.creado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadAltas}];
		return [izquierda, derecha];
	},
	bloqueDerEdicProd: async function (prodOriginal, prodEditado) {
		// Definir el 'ahora'
		let ahora = funciones.ahora().getTime();
		// Bloque derecho
		let [bloque1, bloque2] = [[], []],
			fecha;
		// Bloque 1
		if (prodOriginal.ano_estreno)
			bloque1.push({titulo: "Año de estreno", valor: prodOriginal.ano_estreno});
		if (prodOriginal.ano_fin) bloque1.push({titulo: "Año de fin", valor: prodOriginal.ano_fin});
		if (prodOriginal.duracion) bloque1.push({titulo: "Duracion", valor: prodOriginal.duracion + " min."});
		// Obtener la fecha de alta
		fecha = this.obtenerLaFecha(prodOriginal.creado_en);
		bloque1.push({titulo: "Fecha de Alta", valor: fecha});
		// Obtener la fecha de edicion
		fecha = this.obtenerLaFecha(prodEditado.editado_en);
		bloque1.push({titulo: "Fecha de Edic.", valor: fecha});
		// 5. Obtener los datos del usuario
		let fichaDelUsuario = await BD_especificas.fichaDelUsuario(prodEditado.editado_por_id, ahora);
		// 6. Obtener la calidad de las altas
		let calidadEdic = await BD_especificas.calidadEdic(prodEditado.editado_por_id);
		// Bloque derecho consolidado
		let derecha = [bloque1, {...fichaDelUsuario, ...calidadEdic}];
		return derecha;
	},
	obtenerLaFecha: (fecha) => {
		let dia = fecha.getDate();
		let mes = variables.meses()[fecha.getMonth()];
		let ano = fecha.getFullYear().toString().slice(-2);
		fecha = dia + "/" + mes + "/" + ano;
		return fecha;
	},
	armarComparacion: (prodOriginal, prodEditado) => {
		let camposAComparar = variables.camposRevisarEdic();
		for (let i = camposAComparar.length - 1; i >= 0; i--) {
			let campo = camposAComparar[i].nombreDelCampo;
			if (!Object.keys(prodEditado).includes(campo)) camposAComparar.splice(i, 1);
			else {
				// Variables
				let verificar = !camposAComparar[i].rclv || prodOriginal[campo] != 1;
				let asoc1 = camposAComparar[i].asociacion1;
				let asoc2 = camposAComparar[i].asociacion2;
				// Valores originales
				camposAComparar[i].valorOrig = verificar ? prodOriginal[campo] : null;
				camposAComparar[i].mostrarOrig =
					camposAComparar[i].asociacion1 && prodOriginal[asoc1] && verificar
						? prodOriginal[asoc1][asoc2]
						: camposAComparar[i].valorOrig;
				// Valores editados
				camposAComparar[i].valorEdic = prodEditado[campo];
				camposAComparar[i].mostrarEdic = asoc1 ? prodEditado[asoc1][asoc2] : prodEditado[campo];
			}
		}
		// Ingresos de edición, sin valor en la versión original
		let ingresos = camposAComparar.filter((n) => !n.valorOrig);
		let reemplazos = camposAComparar.filter((n) => n.valorOrig);
		return [ingresos, reemplazos];
	},
	aprobarAltaRCLV:async(datos)=>{
		// Verificar que existe la entidad+id, y que está en status 'creado'

		// Si no existe => error

		// Si concuerda, actualizar con el status 'creado'

		// Retorno con el status de errores
	}
};
