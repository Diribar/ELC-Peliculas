"use strict";
window.addEventListener("load", () => {
	// Variables
	let botonActivo = document.querySelector("#datos #tags #activo");
	let botonInactivo = document.querySelector("#datos #tags #inactivo");
	let filasConStatusActivo = document.querySelectorAll("#datos .inactivo_false");
	let filasConStatusInActivo = document.querySelectorAll("#datos .inactivo_true");

	// AddEventListeners
	botonActivo.addEventListener("click", ()=> {
		filasConStatusActivo.forEach((fila)=> {
			fila.classList.remove("inactivo_ocultar")
		})
		filasConStatusInActivo.forEach(fila=>{
			fila.classList.add("inactivo_ocultar")
		})
		botonActivo.classList.remove("traslucido")
		botonInactivo.classList.add("traslucido")
	})
	botonInactivo.addEventListener("click", ()=> {
		filasConStatusInActivo.forEach(fila=>{
			fila.classList.remove("inactivo_ocultar")
		})
		filasConStatusActivo.forEach((fila)=> {
			fila.classList.add("inactivo_ocultar")
		})
		botonInactivo.classList.remove("traslucido")
		botonActivo.classList.add("traslucido")
	})
});
