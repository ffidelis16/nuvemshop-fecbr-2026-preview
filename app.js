const header = document.querySelector("[data-header]");
const progressBar = document.querySelector("[data-progress]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const mobileCta = document.querySelector("[data-mobile-cta]");

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;

  header?.classList.toggle("is-scrolled", scrollTop > 20);
  mobileCta?.classList.toggle("is-visible", scrollTop > window.innerHeight * 0.72);

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const ctaSuppressSections = document.querySelectorAll("[data-cta-suppress]");
if (mobileCta && "IntersectionObserver" in window) {
  const visibleSuppressSections = new Set();
  const ctaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSuppressSections.add(entry.target);
        } else {
          visibleSuppressSections.delete(entry.target);
        }
      });
      mobileCta.classList.toggle("is-suppressed", visibleSuppressSections.size > 0);
    },
    { threshold: 0.12 },
  );
  ctaSuppressSections.forEach((section) => ctaObserver.observe(section));
}

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  siteNav?.classList.remove("is-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav?.classList.toggle("is-open", !isOpen);
});

siteNav?.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("click", closeMenu);
});

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const arena = document.querySelector("[data-arena]");
const arenaOrder = ["content", "diagnostic", "experience", "happy"];
let activeArenaIndex = 0;

const setArenaPanel = (targetName, moveFocus = false) => {
  const targetIndex = arenaOrder.indexOf(targetName);
  if (!arena || targetIndex < 0) return;

  activeArenaIndex = targetIndex;
  const triggers = arena.querySelectorAll("[data-arena-trigger]");
  const panels = arena.querySelectorAll("[data-arena-panel]");

  triggers.forEach((trigger) => {
    const isActive = trigger.dataset.arenaTrigger === targetName;
    trigger.classList.toggle("is-active", isActive);
    trigger.setAttribute("aria-pressed", String(isActive));
    if (isActive && moveFocus) trigger.focus({ preventScroll: true });
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.arenaPanel === targetName;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
};

arena?.querySelectorAll("[data-arena-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => setArenaPanel(trigger.dataset.arenaTrigger));
});

arena?.querySelector("[data-arena-prev]")?.addEventListener("click", () => {
  const nextIndex = (activeArenaIndex - 1 + arenaOrder.length) % arenaOrder.length;
  setArenaPanel(arenaOrder[nextIndex], true);
});

arena?.querySelector("[data-arena-next]")?.addEventListener("click", () => {
  const nextIndex = (activeArenaIndex + 1) % arenaOrder.length;
  setArenaPanel(arenaOrder[nextIndex], true);
});

arena?.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = (activeArenaIndex + direction + arenaOrder.length) % arenaOrder.length;
  setArenaPanel(arenaOrder[nextIndex], true);
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((otherDetail) => {
      if (otherDetail !== detail) otherDetail.open = false;
    });
  });
});

const dialog = document.querySelector("[data-dialog]");
const form = document.querySelector("[data-prototype-form]");
const formFields = document.querySelector("[data-form-fields]");
const formSuccess = document.querySelector("[data-form-success]");
let dialogTrigger = null;

const openDialog = (trigger) => {
  if (!dialog) return;
  dialogTrigger = trigger;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
  document.body.classList.add("dialog-open");
  window.setTimeout(() => dialog.querySelector("input")?.focus(), 40);
};

const closeDialog = () => {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
};

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button));
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", closeDialog);
});

dialog?.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const isBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (isBackdrop) closeDialog();
});

dialog?.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  dialogTrigger?.focus();
});

dialog?.addEventListener("cancel", () => {
  document.body.classList.remove("dialog-open");
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Confirmando sua presença...";

  window.setTimeout(() => {
    formFields.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
    submitButton.disabled = false;
    submitButton.textContent = "Confirmar minha presença";
  }, 650);
});
