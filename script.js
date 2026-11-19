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
const nameInput = document.querySelector("#client-name");
const phoneInput = document.querySelector("#client-phone");
const fullPhoneInput = document.querySelector("#full-phone");

function filterName(value) {
  return Array.from(value)
    .filter((character) => /[\p{L}\s'’\-]/u.test(character))
    .join("");
}

function updateNameValidity() {
  nameInput.setCustomValidity(
    /\p{L}/u.test(nameInput.value) ? "" : "Введите имя буквами.",
  );
}

function capitalizeName() {
  nameInput.value = nameInput.value.trim().replace(
    /\p{L}/u,
    (letter) => letter.toLocaleUpperCase("ru-RU"),
  );
  updateNameValidity();
}

function normalizePhoneDigits(value) {
  let digits = value.replace(/\D/g, "");
  if ((digits.startsWith("7") || digits.startsWith("8")) && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function formatPhone(digits) {
  if (!digits) return "";
  let formatted = `(${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ")";
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

function caretAfterDigits(value, digitCount) {
  if (digitCount <= 0) return 0;
  let seenDigits = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1;
      if (seenDigits === digitCount) return index + 1;
    }
  }
  return value.length;
}

function updatePhoneValidity() {
  const digits = normalizePhoneDigits(phoneInput.value);
  phoneInput.setCustomValidity(
    digits.length === 10 ? "" : "Введите 10 цифр номера телефона.",
  );
  fullPhoneInput.value = digits.length === 10 ? `+7${digits}` : "";
}

nameInput.addEventListener("input", () => {
  const currentValue = nameInput.value;
  const caret = nameInput.selectionStart;
  const filteredValue = filterName(currentValue);

  if (filteredValue !== currentValue) {
    const filteredCaret = filterName(currentValue.slice(0, caret)).length;
    nameInput.value = filteredValue;
    nameInput.setSelectionRange(filteredCaret, filteredCaret);
  }

  updateNameValidity();
});

nameInput.addEventListener("blur", capitalizeName);

phoneInput.addEventListener("keydown", (event) => {
  if ((event.key !== "Backspace" && event.key !== "Delete")
    || event.ctrlKey || event.metaKey || event.altKey
    || phoneInput.selectionStart !== phoneInput.selectionEnd) {
    return;
  }

  const value = phoneInput.value;
  const isBackspace = event.key === "Backspace";
  let digitIndex = phoneInput.selectionStart + (isBackspace ? -1 : 0);

  while (digitIndex >= 0 && digitIndex < value.length && !/\d/.test(value[digitIndex])) {
    digitIndex += isBackspace ? -1 : 1;
  }

  if (digitIndex < 0 || digitIndex >= value.length) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  const digitsBeforeRemoved = value.slice(0, digitIndex).replace(/\D/g, "").length;
  const digits = value.replace(/\D/g, "");
  const updatedDigits = `${digits.slice(0, digitsBeforeRemoved)}${digits.slice(digitsBeforeRemoved + 1)}`;
  phoneInput.value = formatPhone(updatedDigits);
  const caretPosition = caretAfterDigits(phoneInput.value, digitsBeforeRemoved);
  phoneInput.setSelectionRange(caretPosition, caretPosition);
  updatePhoneValidity();
  successMessage.hidden = true;
});

phoneInput.addEventListener("input", () => {
  const currentValue = phoneInput.value;
  const caret = phoneInput.selectionStart;
  const rawDigits = currentValue.replace(/\D/g, "");
  const digitsBeforeCaret = currentValue.slice(0, caret).replace(/\D/g, "").length;
  const hasCountryPrefix = (rawDigits.startsWith("7") || rawDigits.startsWith("8")) && rawDigits.length > 10;
  const phoneDigits = normalizePhoneDigits(currentValue);

  phoneInput.value = formatPhone(phoneDigits);

  const adjustedCaret = Math.max(0, digitsBeforeCaret - (hasCountryPrefix ? 1 : 0));
  const caretPosition = caretAfterDigits(phoneInput.value, adjustedCaret);
  phoneInput.setSelectionRange(caretPosition, caretPosition);
  updatePhoneValidity();
});

updateNameValidity();
updatePhoneValidity();

bookingForm.addEventListener("input", () => {
  successMessage.hidden = true;
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  capitalizeName();
  updatePhoneValidity();

  if (!bookingForm.reportValidity()) return;

  const formData = new FormData(bookingForm);
  const clientName = formData.get("name").trim();
  successMessage.textContent = `${clientName}, спасибо! Это демонстрационная запись — мы свяжемся с вами для подтверждения.`;
  successMessage.hidden = false;
  bookingForm.reset();
  updateNameValidity();
  updatePhoneValidity();
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
