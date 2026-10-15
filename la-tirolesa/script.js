// ===== Año dinámico =====
document.getElementById("year").textContent = new Date().getFullYear()

// ===== Header al hacer scroll =====
const header = document.getElementById("header")
const toTop = document.getElementById("toTop")

function onScroll() {
  const y = window.scrollY
  header.classList.toggle("scrolled", y > 40)
  toTop.classList.toggle("show", y > 500)
}
window.addEventListener("scroll", onScroll, { passive: true })
onScroll()

// ===== Menú móvil =====
const navToggle = document.getElementById("navToggle")
const nav = document.getElementById("nav")

function closeNav() {
  nav.classList.remove("open")
  navToggle.classList.remove("active")
  navToggle.setAttribute("aria-expanded", "false")
}

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open")
  navToggle.classList.toggle("active", open)
  navToggle.setAttribute("aria-expanded", String(open))
})

nav.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", closeNav)
})

// ===== Botón volver arriba =====
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
})

// ===== Animaciones al hacer scroll (reveal) =====
const revealEls = document.querySelectorAll(".reveal")
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // pequeño escalonado para elementos hermanos
        setTimeout(() => entry.target.classList.add("visible"), (i % 4) * 80)
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.15 }
)
revealEls.forEach((el) => observer.observe(el))

