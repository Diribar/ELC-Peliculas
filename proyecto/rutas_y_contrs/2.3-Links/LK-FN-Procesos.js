"use strict";
// Variables
const procsRE = require("../3-Rev-Entidades/RE-Procesos");

module.exports = {
	// Links - Controlador Vista
	obtieneLinksConEdicion: async (entidad, prodId, usuario_id) => {
		// Variables
		let campo_id = comp.obtieneDesdeEntidad.campo_id(entidad);
		let include = ["tipo", "prov", "statusRegistro", "ediciones", "motivo"];
		let camposARevisar = variables.camposRevisar.links.map((n) => n.nombre);

		// Obtiene los linksOriginales
		let links = await baseDeDatos.obtieneTodosPorCondicion("links", {[campo_id]: prodId}, include);
		links.sort((a, b) => (a.url < b.url ? -1 : 1));
		links.sort((a, b) => a.parte - b.parte);

		// Los combina con la edición, si existe
		links.forEach((link, i) => {
			if (link.ediciones.length) {
				let edicion = link.ediciones.find((n) => n.editadoPor_id == usuario_id);
				if (edicion)
					for (let prop in edicion)
						if (edicion[prop] !== null && camposARevisar.includes(prop)) links[i][prop] = edicion[prop];
			}
		});

		// Fin
		return links;
	},
	datosLink: async (datos) => {
		// Datos del producto
		const regProd = await baseDeDatos.obtienePorId(datos.prodEntidad, datos.prodId);
		datos.prodAprob = activos_ids.includes(regProd.statusRegistro_id); // antes era 'aprobados_ids'

		// campo_id
		const campo_id = comp.obtieneDesdeEntidad.campo_id(datos.prodEntidad);
		datos[campo_id] = regProd.id;

		// grupoCol_id
		if (datos.prodEntidad == "colecciones") datos.grupoCol_id = regProd.id;
		if (datos.prodEntidad == "capitulos") datos.grupoCol_id = regProd.coleccion_id;

		// Obtiene el proveedor
		let proveedor = linksProvs.find((n) => n.urlDistintivo && datos.url.startsWith(n.urlDistintivo)); // debe ser 'starts'
		proveedor = proveedor ? proveedor : linksProvs.find((n) => n.generico); // Si no se reconoce el proveedor, se asume el 'desconocido'
		datos.prov_id = proveedor.id;

		// Particularidades
		if (datos.castellano == "1") datos.subtitulos = null;
		if (datos.tipo_id == "1") datos.completo = 1;
		if (datos.completo == "1") datos.parte = "-";

		// Fin
		return datos;
	},
	condicion: (link, usuario_id, tema) => {
		// Variables
		let cond = {};
		cond.propio = link.statusSugeridoPor_id == usuario_id;
		cond.ajeno = !cond.propio;
		cond.rud = tema == "linksCrud";
		cond.revision = tema == "revisionEnts";

		// Condiciones de status
		cond.creado = link.statusRegistro_id == creado_id;
		cond.creadoAprob = link.statusRegistro_id == creadoAprob_id;
		cond.aprobado = link.statusRegistro_id == aprobado_id;
		cond.inactivar = link.statusRegistro_id == inactivar_id;
		cond.recuperar = link.statusRegistro_id == recuperar_id;
		cond.inactivo = link.statusRegistro_id == inactivo_id;

		// Condiciones de status combinados
		cond.grCreado = cond.creado || cond.creadoAprob;
		cond.estable = cond.aprobado || cond.inactivo;
		cond.provisorio = cond.inactivar || cond.recuperar;
		cond.inactivos = (cond.rud && cond.inactivar) || cond.inactivo;

		// Condiciones de status y propio/ajeno
		cond.creadoPropio = cond.creado && cond.propio;
		cond.creadoAjeno = cond.creado && cond.ajeno;
		cond.inactivarPropio = cond.inactivar && cond.propio;
		cond.recuperarPropio = cond.recuperar && cond.propio;

		// Condiciones de status combinados y propio/ajeno
		cond.provPropio = cond.provisorio && cond.propio;
		cond.provAjeno = cond.provisorio && cond.ajeno;
		cond.propios = cond.creadoPropio || cond.provPropio;
		cond.ajenos = cond.creadoAjeno || cond.provAjeno;

		// Fin
		return cond;
	},
	sigProdInactivo: async ({producto, entidad, usuario_id}) => {
		// Variables
		const productos = await procsRE.tablManten.obtieneLinksInactivos(usuario_id).then((n) => n.LI);

		// Obtiene el siguiente producto
		const sigProd = productos.find((n) => n.entidad != entidad || n.id != producto.id);

		// Genera el link
		const link = sigProd
			? "/".concat(entidad, "/inactivar-captura") +
			  "/?id=".concat(producto.id) +
			  "&prodEntidad=".concat(sigProd.entidad) +
			  "&prodId=".concat(sigProd.id) +
			  "&origen=LKM&grupo=inactivo"
			: "";

		// Fin
		return link;
	},
	variables: ({link, req}) => {
		const {IN, aprob, motivo_id} = req.query;
		const id = link.id;
		const revId = req.session.usuario.id;
		const decisAprob = aprob == "SI";
		const campoDecision = "links" + (decisAprob ? "Aprob" : "Rech");
		const asocProd = comp.obtieneDesdeCampo_id.asocProd(link);
		const anoEstreno = link[asocProd].anoEstreno;
		const ahora = comp.fechaHora.ahora();
		const fechaVencim = FN_fechaVencim({link, IN, ahora});
		const statusRegistro_id = IN == "SI" ? aprobado_id : inactivo_id;
		const statusCreado = link.statusRegistro_id == creado_id;

		// Variables para el historial
		const {statusRegistro_id: statusOriginal_id, statusSugeridoPor_id: statusOriginalPor_id} = link;
		const statusFinal_id = statusRegistro_id;

		// Arma los datos
		let datosLink = {
			...{fechaVencim, anoEstreno, statusSugeridoPor_id: revId, statusSugeridoEn: ahora, statusRegistro_id},
			motivo_id: statusRegistro_id == inactivo_id ? (motivo_id ? motivo_id : link.motivo_id) : null,
		};
		if (statusCreado) {
			datosLink.altaRevisadaPor_id = revId;
			datosLink.altaRevisadaEn = ahora;
			datosLink.leadTimeCreacion = comp.obtieneLeadTime(link.creadoEn, ahora);
		}

		// Fin
		let respuesta = {id, statusRegistro_id, statusCreado, decisAprob, datosLink, campoDecision};
		respuesta = {...respuesta, motivo_id, revId, statusOriginalPor_id, statusOriginal_id, statusFinal_id};
		return respuesta;
	},
};

const FN_fechaVencim = ({link, ahora, IN}) => {
	// Resultado para rechazado
	if (IN != "SI") return null;

	// Resultado para 'creado'
	const ahoraTiempo = ahora.getTime();
	if (comp.linksVencPorSem.condicCreado(link)) return new Date(ahoraTiempo + linksVU_primRev);

	// Variables - si es una categoría estándar, averigua su semana
	const entidad = comp.linksVencPorSem.condicEstrRec(link) ? "estrRec" : link.capitulo_id ? "capitulos" : "pelisColes";

	// Obtiene la cantidad de links que vence cada semana
	const cantLinksVencsPorSemMayorCorte = Object.values(cantLinksVencPorSem)
		.slice(0, -1) // descarta los registros que no pertenecen a semanas
		.slice(linkSemInicial) // descarta los registros de las semanas anteriores a linkSemInicial
		.map((n) => n[entidad]);

	// Obtiene la semana a la cual agregarle una fecha de vencimiento, comenzando desde la más reciente
	const semana = cantLinksVencsPorSemMayorCorte.findIndex((n) => n < cantLinksVencPorSem.promSem[entidad]) + linkSemInicial;

	// Fin
	return new Date(ahoraTiempo + semana * unaSemana);
};
