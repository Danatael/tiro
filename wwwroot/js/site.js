document.addEventListener('DOMContentLoaded', function () {
	var yearNode = document.getElementById('y');
	if (yearNode) {
		yearNode.textContent = new Date().getFullYear();
	}

	var cargarMapa = document.getElementById('cargar-mapa');
	if (cargarMapa) {
		cargarMapa.addEventListener('click', function () {
			var iframe = document.createElement('iframe');
			iframe.src = 'https://www.google.com/maps?q=Presa+El+Estudiante,+Huayapam,+Oaxaca&output=embed';
			iframe.title = 'Mapa de La Tirolesa';
			iframe.loading = 'lazy';
			iframe.referrerPolicy = 'no-referrer-when-downgrade';
			this.parentNode.replaceChild(iframe, this);
		});
	}

	var hero = document.querySelector('.hero');
	if (hero && 'IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			hero.classList.toggle('paused', !entries[0].isIntersecting);
		}).observe(hero);
	}
});
