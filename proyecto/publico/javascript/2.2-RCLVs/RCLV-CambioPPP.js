"use strict";
window.addEventListener("load", async () => {
	// Variables DOM
	const iconosPPP = document.querySelectorAll(".prodsNuevos #prod #ppp i");
	const leyendaPPP = document.querySelectorAll(".prodsNuevos #prod #ppp #texto");
	const anchors = document.querySelectorAll(".prodsNuevos a");

	// Variables varias
	const v = await fetch(rutas.obtieneVariables).then((n) => n.json());
	let entsProd = [];
	let ids = [];

	// Obtiene las entsProd e ids de cada botón
	for (let anchor of anchors) {
		const entProd = entidades.find((n) => anchor.href.includes(n));
		const idProd = new URL(anchor.href).searchParams.get("id");
		entsProd.push(entProd);
		ids.push(idProd);
	}

	// Funciones
	let cambiosEnPpp = async (indice) => {
		// Opción actual
		const pppActual = v.pppOpcsArray.find((n) => iconosPPP[indice].className.endsWith(n.icono));
		const pppActual_id = pppActual.id;

		// Opción nueva
		const pppNueva_id = pppActual_id > 1 ? pppActual_id - 1 : v.pppOpcsSimples.length;
		const pppNueva = v.pppOpcsArray.find((n) => n.id == pppNueva_id);

		// Actualiza el ícono y el título
		iconosPPP[indice].classList.remove(...pppActual.icono.split(" "));
		iconosPPP[indice].classList.add(...pppNueva.icono.split(" "));
		iconosPPP[indice].title = pppNueva.nombre;
		leyendaPPP[indice].innerHTML = pppNueva.nombre;

		// Actualiza la preferencia
		iconosPPP[indice].classList.add("inactivo");
		await fetch(
			rutas.pppRutaGuardar + "/?entidad=" + entsProd[indice] + "&entidad_id=" + ids[indice] + "&ppp_id=" + pppNueva_id
		);
		iconosPPP[indice].classList.remove("inactivo");

		// Muestra la leyenda 'ppp'
		leyendaPPP[indice].classList.remove("ocultar");
		setTimeout(() => leyendaPPP[indice].classList.add("ocultar"), v.setTimeOutStd);

		// Fin
		return;
	};

	// Eventos
	iconosPPP.forEach((iconoPPP, indice) => {
		iconoPPP.addEventListener("click", async (e) => {
			e.preventDefault(); // Previene el efecto del anchor
			if (!iconosPPP[indice].className.includes("inactivo")) cambiosEnPpp(indice);
			return;
		});
	});
});

const rutas = {
	obtieneVariables: "/rclv/api/rc-obtiene-variables-detalle",
	pppRutaGuardar: "/producto/api/pr-guarda-la-preferencia-del-usuario",
};
