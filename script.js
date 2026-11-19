"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Открыть меню" : "Закрыть меню");
  navigation.classList.toggle("is-open", !isExpanded);
  document.body.classList.toggle("menu-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const dateInput = document.querySelector("#visit-date");
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
dateInput.min = localToday;

const bookingForm = document.querySelector("#booking-form");
const successMessage = document.querySelector("#form-success");

bookingForm.addEventListener("input", () => {
  successMessage.hidden = true;
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  const formData = new FormData(bookingForm);
  const clientName = formData.get("name").trim();
  successMessage.textContent = `${clientName}, спасибо! Это демонстрационная запись — мы свяжемся с вами для подтверждения.`;
  successMessage.hidden = false;
  bookingForm.reset();
  dateInput.min = localToday;
});

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js-enabled");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}
