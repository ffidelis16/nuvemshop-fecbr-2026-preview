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
const arenaOrder = ["people", "lumi", "ecosystem", "happy"];
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
    if (isActive && moveFocus) trigger.focus();
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

const memoryGame = document.querySelector("[data-memory-game]");
if (memoryGame) {
  const cards = [...memoryGame.querySelectorAll("[data-card]")];
  const status = memoryGame.querySelector("[data-memory-status]");
  const completion = memoryGame.querySelector("[data-memory-complete]");
  const resetButton = memoryGame.querySelector("[data-reset-game]");
  let openCards = [];
  let matchedCards = 0;
  let isLocked = false;
  let resetTimer;
  let celebrationTimer;

  const updateCardLabel = (card, state) => {
    const cardNumber = cards.indexOf(card) + 1;
    const labels = {
      hidden: `Carta ${cardNumber}, virada para baixo`,
      open: `Carta ${cardNumber}, ${card.dataset.card} revelado`,
      matched: `Carta ${cardNumber}, par encontrado`,
    };
    card.setAttribute("aria-label", labels[state]);
  };

  const resetGame = () => {
    window.clearTimeout(resetTimer);
    window.clearTimeout(celebrationTimer);
    openCards = [];
    matchedCards = 0;
    isLocked = false;
    memoryGame.classList.remove("is-celebrating");
    completion.hidden = true;
    cards.forEach((card) => {
      card.classList.remove("is-flipped", "is-matched");
      card.disabled = false;
      updateCardLabel(card, "hidden");
    });
    status.textContent = "Escolha duas cartas.";
    cards[0]?.focus();
  };

  const checkPair = () => {
    const [firstCard, secondCard] = openCards;
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;

    if (isMatch) {
      firstCard.classList.add("is-matched");
      secondCard.classList.add("is-matched");
      firstCard.disabled = true;
      secondCard.disabled = true;
      updateCardLabel(firstCard, "matched");
      updateCardLabel(secondCard, "matched");
      matchedCards += 2;
      openCards = [];
      isLocked = false;

      if (matchedCards === cards.length) {
        status.textContent = "Você encontrou todos os pares. No L60, o jogo continua.";
        isLocked = true;
        celebrationTimer = window.setTimeout(() => {
          completion.hidden = false;
          memoryGame.classList.add("is-celebrating");
          completion.focus();
        }, 620);
      } else {
        status.textContent = "Você encontrou o par. Continue jogando.";
      }
      return;
    }

    status.textContent = "Ainda não. Tente outra combinação.";
    resetTimer = window.setTimeout(() => {
      openCards.forEach((card) => {
        card.classList.remove("is-flipped");
        updateCardLabel(card, "hidden");
      });
      openCards = [];
      isLocked = false;
    }, 850);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (isLocked || card.classList.contains("is-flipped") || card.classList.contains("is-matched")) return;

      card.classList.add("is-flipped");
      updateCardLabel(card, "open");
      openCards.push(card);

      if (openCards.length === 1) {
        status.textContent = "Agora escolha outra carta.";
      }

      if (openCards.length === 2) {
        isLocked = true;
        checkPair();
      }
    });
  });

  resetButton.addEventListener("click", resetGame);
}

const ecosystem = document.querySelector("[data-ecosystem]");
if (ecosystem) {
  const products = [
    {
      key: "Envio",
      name: "Nuvem Envio",
      eyebrow: "Logística integrada",
      copy: "Gerencie etiquetas, rastreamentos e custos de frete no próprio painel da loja, conectando a rotina de envios aos pedidos da operação."
    },
    {
      key: "Marketing",
      name: "Nuvem Marketing",
      eyebrow: "Growth conectado",
      copy: "Crie campanhas de e-mail, segmente clientes e recupere carrinhos abandonados com automações conectadas aos dados da loja."
    },
    {
      key: "Pago",
      name: "Nuvem Pago",
      eyebrow: "Pagamentos nativos",
      copy: "Receba por cartão, Pix e boleto e acompanhe recebíveis, estornos e transferências no mesmo painel da operação."
    },
    {
      key: "Chat",
      name: "Nuvem Chat",
      eyebrow: "Conversa que vende",
      copy: "Atenda e venda no WhatsApp e no Instagram com IA conectada ao catálogo, ao carrinho e ao checkout da loja."
    },
    {
      key: "PDV",
      name: "Nuvem PDV",
      eyebrow: "Canais integrados",
      copy: "Registre vendas presenciais e de outros canais com catálogo, estoque e clientes sincronizados à Nuvemshop."
    },
    {
      key: "Next",
      name: "Nuvemshop Next",
      eyebrow: "Operações complexas",
      copy: "Ganhe autonomia para personalizar e conte com suporte prioritário e acompanhamento próximo para escalar operações de e-commerce mais complexas."
    }
  ];
  const productButtons = [...ecosystem.querySelectorAll("[data-product]")];
  const productPages = [...ecosystem.querySelectorAll("[data-product-page]")];
  const productName = ecosystem.querySelector("[data-product-name]");
  const productEyebrow = ecosystem.querySelector("[data-product-eyebrow]");
  const productCopy = ecosystem.querySelector("[data-product-copy]");
  const productIndex = ecosystem.querySelector("[data-product-index]");
  const productVisual = ecosystem.querySelector(".ecosystem-visual");
  const previousButton = ecosystem.querySelector("[data-product-prev]");
  const nextButton = ecosystem.querySelector("[data-product-next]");
  const mobileEcosystem = window.matchMedia("(max-width: 900px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let transitionTimer;

  const showProductPanel = () => {
    if (!mobileEcosystem.matches) return;
    window.setTimeout(() => {
      productVisual.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    }, 60);
  };

  const setProduct = (requestedIndex) => {
    const index = (requestedIndex + products.length) % products.length;
    if (index === currentIndex && productButtons[index].classList.contains("is-active")) return;
    currentIndex = index;

    productButtons.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    productPages.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.classList.toggle("is-active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    productVisual.classList.add("is-changing");
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      const product = products[index];
      productVisual.dataset.product = product.key.toLowerCase();
      productName.textContent = product.name;
      productEyebrow.textContent = product.eyebrow;
      productCopy.textContent = product.copy;
      productIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(products.length).padStart(2, "0")}`;
      productVisual.classList.remove("is-changing");
    }, 180);
  };

  productButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      setProduct(index);
      showProductPanel();
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const targetIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? products.length - 1
          : currentIndex + (event.key === "ArrowRight" ? 1 : -1);
      const normalizedIndex = (targetIndex + products.length) % products.length;
      setProduct(normalizedIndex);
      productButtons[normalizedIndex].focus({ preventScroll: true });
    });
  });

  productPages.forEach((button, index) => button.addEventListener("click", () => setProduct(index)));
  previousButton.addEventListener("click", () => setProduct(currentIndex - 1));
  nextButton.addEventListener("click", () => setProduct(currentIndex + 1));
}

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
