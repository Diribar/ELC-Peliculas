"use strict";
window.addEventListener("load", () => {
	let contrasena = document.querySelector("input[name='contrasena']");
	let ojito = document.getElementById("eye");
	ojito.addEventListener("mousedown", () => {
		contrasena.type = "text";
		ojito.classList.remove("fa-eye-slash");
		ojito.classList.add("fa-eye");
	});
	ojito.addEventListener("mouseup", () => {
		contrasena.type = "password";
		ojito.classList.remove("fa-eye");
		ojito.classList.add("fa-eye-slash");
	});
});
