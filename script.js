const photos = [
  { file: "F0FE4FCA-C0AA-40DF-9F88-C1A9193700AE", label: "Modern Residence & Plan", position: "center" },
  { file: "282530FF-FE96-4247-B278-9961201E8889", label: "3 BHK Home Design", position: "center" },
  { file: "AD1F7FFF-1D61-49AD-9393-25B29F1C6796", label: "Interior Floor Planning", position: "center" },
  { file: "7E9BC09D-4A30-45F7-BEE6-663C1FB53116", label: "Completed Kerala Home", position: "center" },
  { file: "11E9D697-1E06-4AFA-BEA9-30C4235AE129", label: "Contemporary Exterior", position: "center" }
];

const slidesRoot = document.querySelector(".slides");
const dotsRoot = document.querySelector(".slide-dots");
const galleryRoot = document.querySelector(".project-strip");
const counter = document.querySelector(".slide-counter strong");
let activeIndex = 0;
let timer;
let touchStartX = 0;

async function loadPhoto(photo) {
  const response = await fetch(`assets/${photo.file}.b64`);
  if (!response.ok) throw new Error(`Unable to load ${photo.file}`);
  const base64 = (await response.text()).trim();
  return `data:image/jpeg;base64,${base64}`;
}

async function buildGallery() {
  try {
    const sources = await Promise.all(photos.map(loadPhoto));
    sources.forEach((src, index) => {
      const slide = document.createElement("figure");
      slide.className = `slide${index === 0 ? " active" : ""}`;
      slide.innerHTML = `<img src="${src}" alt="${photos[index].label}" style="object-position:${photos[index].position}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
      slidesRoot.appendChild(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = index === 0 ? "active" : "";
      dot.setAttribute("aria-label", `Show photo ${index + 1}`);
      dot.addEventListener("click", () => showSlide(index, true));
      dotsRoot.appendChild(dot);

      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.label = photos[index].label;
      card.innerHTML = `<img src="${src}" alt="${photos[index].label}" loading="lazy">`;
      card.addEventListener("click", () => {
        showSlide(index, true);
        document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
      });
      galleryRoot.appendChild(card);
    });
    startTimer();
  } catch (error) {
    slidesRoot.innerHTML = '<div class="photo-error">Project photos are temporarily unavailable.</div>';
    console.error(error);
  }
}

function showSlide(index, restart = false) {
  const slides = [...document.querySelectorAll(".slide")];
  const dots = [...dotsRoot.children];
  if (!slides.length) return;
  activeIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === activeIndex));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === activeIndex));
  counter.textContent = String(activeIndex + 1).padStart(2, "0");
  if (restart) startTimer();
}

function startTimer() {
  clearInterval(timer);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = setInterval(() => showSlide(activeIndex + 1), 4500);
  }
}

document.querySelector(".next").addEventListener("click", () => showSlide(activeIndex + 1, true));
document.querySelector(".previous").addEventListener("click", () => showSlide(activeIndex - 1, true));

const hero = document.querySelector(".hero-slideshow");
hero.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
hero.addEventListener("touchend", event => {
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1), true);
}, { passive: true });

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30), { passive: true });

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "☰";
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

document.getElementById("year").textContent = new Date().getFullYear();
buildGallery();
