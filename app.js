(function () {
  const config = window.CITA_CONFIG;
  const phases = ["intro", "puzzle", "reveal", "gallery"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const app = document.getElementById("app");
  const top = document.getElementById("top");
  const wordmark = document.getElementById("wordmark");
  const progressKicker = document.getElementById("progress-kicker");
  const progressList = document.getElementById("progress-list");
  const introTitle = document.getElementById("intro-title");
  const introSalutation = document.getElementById("intro-salutation");
  const introBody = document.getElementById("intro-body");
  const startButton = document.getElementById("start");
  const puzzleTitle = document.getElementById("puzzle-title");
  const puzzleLead = document.getElementById("puzzle-lead");
  const answerForm = document.getElementById("answer-form");
  const answerInput = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  const submitButton = document.getElementById("submit");
  const backClue = document.getElementById("back-clue");
  const confirmation = document.getElementById("confirmation");
  const placeTitle = document.getElementById("place-title");
  const clue = document.getElementById("clue");
  const revealNote = document.getElementById("reveal-note");
  const continueButton = document.getElementById("continue-btn");
  const galleryKicker = document.getElementById("gallery-kicker");
  const galleryTitle = document.getElementById("gallery-title");
  const frame = document.getElementById("frame");
  const slide = document.getElementById("slide");
  const photoFill = document.getElementById("photo-fill");
  const photo = document.getElementById("photo");
  const frameEmpty = document.getElementById("frame-empty");
  const pendingLabel = document.getElementById("pending-label");
  const caption = document.getElementById("caption");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const position = document.getElementById("position");
  const dots = document.getElementById("dots");
  const restartButton = document.getElementById("restart");
  const slideAnnouncement = document.getElementById("slide-announcement");
  const veil = document.getElementById("veil");
  const veilTitle = document.getElementById("veil-title");

  let state = loadState();
  let busy = false;
  let booted = false;
  let quietEntrance = false;
  let gesture = null;

  if (config.stages.some((stage) => !String(stage.answer || "").trim())) {
    console.warn("Cita: hay etapas sin respuesta en config.js. Una respuesta vacía nunca se acepta.");
  }

  document.title = config.documentTitle || document.title;
  bind();
  app.hidden = false;
  render(false);

  function bind() {
    startButton.addEventListener("click", () => {
      transition(() => {
        state.phase = "puzzle";
        state.stage = 0;
      });
    });

    answerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const stage = config.stages[state.stage];
      if (!stage || !isCorrect(answerInput.value, stage.answer)) {
        showIncorrect();
        return;
      }
      if (busy) return;
      busy = true;
      answerInput.value = "";
      celebrate().then(() => {
        busy = false;
        transition(() => {
          state.phase = "reveal";
        });
      });
    });

    answerInput.addEventListener("input", () => {
      if (!feedback.textContent) return;
      feedback.textContent = "";
      answerInput.removeAttribute("aria-invalid");
    });

    continueButton.addEventListener("click", () => {
      if (state.stage >= config.stages.length - 1) {
        openGallery();
        return;
      }
      transition(() => {
        state.stage += 1;
        state.phase = "puzzle";
      });
    });

    backClue.addEventListener("click", () => {
      if (state.stage <= 0) return;
      transition(() => {
        state.stage -= 1;
        state.phase = "reveal";
      });
    });

    prevButton.addEventListener("click", () => changeSlide(state.galleryIndex - 1));
    nextButton.addEventListener("click", () => changeSlide(state.galleryIndex + 1));

    restartButton.addEventListener("click", () => {
      if (busy || state.phase !== "gallery") return;
      try {
        localStorage.removeItem(config.storageKey);
      } catch (error) {
        // Si el navegador bloquea el almacenamiento, el reinicio sigue en esta visita.
      }
      transition(() => {
        state.phase = "intro";
        state.stage = 0;
        state.galleryIndex = 0;
      });
    });

    frame.addEventListener("pointerdown", (event) => {
      if (state.phase !== "gallery") return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
      try {
        frame.setPointerCapture(event.pointerId);
      } catch (error) {
        // Si el navegador no captura el gesto, el deslizamiento sigue funcionando dentro de la foto.
      }
    });

    frame.addEventListener("pointerup", (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      changeSlide(state.galleryIndex + (dx < 0 ? 1 : -1));
    });

    frame.addEventListener("pointercancel", () => {
      gesture = null;
    });

    document.addEventListener("keydown", (event) => {
      if (state.phase !== "gallery") return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        changeSlide(state.galleryIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeSlide(state.galleryIndex - 1);
      }
    });
  }

  function defaultState() {
    return { phase: "intro", stage: 0, galleryIndex: 0 };
  }

  function loadState() {
    const fresh = defaultState();
    try {
      const raw = localStorage.getItem(config.storageKey);
      if (!raw) return fresh;
      const data = JSON.parse(raw);
      const last = Math.max(config.stages.length - 1, 0);
      const stage = Number.isInteger(data.stage) ? Math.min(Math.max(data.stage, 0), last) : 0;
      const phase = phases.includes(data.phase) ? data.phase : "intro";
      const items = Array.isArray(config.gallery.items) ? config.gallery.items.length : 0;
      let galleryIndex = Number.isInteger(data.galleryIndex) ? data.galleryIndex : 0;
      if (items === 0) galleryIndex = 0;
      else galleryIndex = Math.min(Math.max(galleryIndex, 0), items - 1);
      if (phase === "gallery" && stage !== last) return fresh;
      return { phase, stage, galleryIndex };
    } catch (error) {
      return fresh;
    }
  }

  function save() {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(state));
    } catch (error) {
      // Si el navegador bloquea el almacenamiento, la página sigue usable hasta recargar.
    }
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFC")
      .trim()
      .toLocaleLowerCase("es");
  }

  function isCorrect(input, answer) {
    const expected = normalize(answer);
    if (!expected) return false;
    return normalize(input) === expected;
  }

  function safeSrc(src) {
    if (typeof src !== "string") return "";
    const value = src.trim();
    if (!value || /^javascript:/i.test(value)) return "";
    return value;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, reduceMotion ? 0 : ms);
    });
  }

  async function leaveCurrent() {
    const active = document.querySelector(".view.is-active");
    if (!active || reduceMotion) return;
    active.classList.add("is-leaving");
    await wait(430);
  }

  async function transition(update) {
    if (busy) return;
    busy = true;
    try {
      await leaveCurrent();
      update();
      save();
      render(true);
    } finally {
      busy = false;
    }
  }

  async function openGallery() {
    if (busy) return;
    busy = true;
    try {
      state.phase = "gallery";
      state.galleryIndex = 0;
      save();

      if (reduceMotion) {
        render(true);
        return;
      }

      veilTitle.textContent = config.gallery.title;
      veil.classList.remove("is-shown", "is-leaving");
      veil.hidden = false;
      void veil.offsetWidth;
      veil.classList.add("is-shown");
      await wait(920);
      quietEntrance = true;
      render(false);
      await wait(680);
      quietEntrance = false;
      const gallery = document.querySelector('[data-view="gallery"]');
      gallery.classList.remove("is-active", "is-quiet");
      void gallery.offsetWidth;
      gallery.classList.add("is-active");
      veil.classList.add("is-leaving");
      await wait(760);
      veil.hidden = true;
      veil.classList.remove("is-leaving", "is-shown");
      galleryTitle.focus({ preventScroll: true });
    } finally {
      busy = false;
    }
  }

  function celebrate() {
    const bloom = document.querySelector(".bloom");
    if (!bloom || reduceMotion) return Promise.resolve();
    bloom.classList.remove("is-burst");
    void bloom.offsetWidth;
    bloom.classList.add("is-burst");
    return wait(620).then(() => {
      bloom.classList.remove("is-burst");
    });
  }

  function showIncorrect() {
    answerInput.setAttribute("aria-invalid", "true");
    feedback.textContent = "";
    window.requestAnimationFrame(() => {
      feedback.textContent = config.feedback.incorrect;
    });
  }

  function render(focusView) {
    paintChrome();
    if (state.phase === "intro") paintIntro();
    if (state.phase === "puzzle") paintPuzzle();
    if (state.phase === "reveal") paintReveal();
    if (state.phase === "gallery") paintGallery(false);
    syncView(focusView);
  }

  function paintChrome() {
    const onJourney = state.phase === "puzzle" || state.phase === "reveal";
    top.hidden = !onJourney;
    document.body.classList.toggle("is-gallery", state.phase === "gallery");
    if (!onJourney) return;

    wordmark.textContent = config.identity;
    const step = state.stage + 1;
    progressKicker.textContent = "Etapa " + step + " de " + config.stages.length;
    progressList.replaceChildren();

    config.stages.forEach((stage, index) => {
      const item = document.createElement("li");
      const solved = index < state.stage || (index === state.stage && state.phase === "reveal");
      if (solved) item.classList.add("is-done");
      if (index === state.stage) {
        item.classList.add("is-current");
        item.setAttribute("aria-current", "step");
      }
      const status = index === state.stage ? ", actual" : solved ? ", completa" : "";
      item.setAttribute("aria-label", "Etapa " + (index + 1) + status);
      progressList.appendChild(item);
    });
  }

  function paintIntro() {
    introTitle.textContent = config.intro.title;
    introSalutation.textContent = config.intro.salutation;
    startButton.textContent = config.intro.button;
    introBody.replaceChildren();
    config.intro.paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.className = "prose";
      paragraph.textContent = text;
      introBody.appendChild(paragraph);
    });
  }

  function paintPuzzle() {
    puzzleTitle.textContent = config.puzzle.title;
    puzzleLead.textContent = config.puzzle.lead;
    answerInput.placeholder = config.puzzle.placeholder;
    submitButton.textContent = config.puzzle.button;
    backClue.textContent = config.puzzle.back;
    backClue.hidden = state.stage === 0;
    answerInput.value = "";
    feedback.textContent = "";
    answerInput.removeAttribute("aria-invalid");
  }

  function paintReveal() {
    const stage = config.stages[state.stage];
    if (!stage) return;
    const last = state.stage === config.stages.length - 1;
    confirmation.textContent = stage.confirmation;
    placeTitle.textContent = stage.title;
    clue.textContent = stage.clue;
    revealNote.textContent = last ? config.reveal.finalNote : config.reveal.note;
    continueButton.textContent = last ? config.reveal.finalButton : config.reveal.button;
  }

  function paintPosition(index, total) {
    position.replaceChildren();
    const current = document.createElement("span");
    current.className = "position-current";
    current.textContent = String(index + 1).padStart(2, "0");
    const rule = document.createElement("span");
    rule.className = "position-rule";
    const end = document.createElement("span");
    end.className = "position-total";
    end.textContent = String(total).padStart(2, "0");
    position.append(current, rule, end);
  }

  function hidePhoto() {
    photo.hidden = true;
    photoFill.hidden = true;
  }

  function revealPhoto() {
    photo.hidden = false;
    photoFill.hidden = false;
  }

  function paintGallery(announce) {
    const items = Array.isArray(config.gallery.items) ? config.gallery.items : [];
    galleryTitle.textContent = config.gallery.title;
    restartButton.textContent = config.gallery.restart;
    const kicker = String(config.gallery.kicker || "").trim();
    galleryKicker.hidden = !kicker;
    galleryKicker.textContent = kicker;

    if (!items.length) {
      hidePhoto();
      photo.removeAttribute("src");
      photoFill.removeAttribute("src");
      frameEmpty.hidden = false;
      frame.classList.add("is-empty");
      pendingLabel.textContent = config.gallery.empty;
      caption.hidden = true;
      caption.textContent = "";
      position.replaceChildren();
      dots.replaceChildren();
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    const index = Math.min(Math.max(state.galleryIndex, 0), items.length - 1);
    state.galleryIndex = index;
    const item = items[index];
    const src = safeSrc(item.src);
    const text = String(item.caption || "").trim();

    pendingLabel.textContent = config.gallery.pendingImage;
    photo.onload = null;
    photo.onerror = null;

    if (!src) {
      photo.removeAttribute("src");
      photoFill.removeAttribute("src");
      delete photo.dataset.current;
      photo.alt = "";
      hidePhoto();
      frameEmpty.hidden = false;
      frame.classList.add("is-empty");
    } else {
      const alt = String(item.alt || "").trim() || (text ? "" : "Fotografía");
      frame.classList.remove("is-empty");
      frameEmpty.hidden = true;
      photo.alt = alt;
      hidePhoto();
      photo.onload = () => {
        revealPhoto();
      };
      photo.onerror = () => {
        hidePhoto();
        frameEmpty.hidden = false;
        frame.classList.add("is-empty");
      };
      if (photo.dataset.current !== src) {
        photo.dataset.current = src;
        photo.src = src;
        photoFill.src = src;
      }
      if (photo.complete) {
        if (photo.naturalWidth > 0) revealPhoto();
        else {
          hidePhoto();
          frameEmpty.hidden = false;
          frame.classList.add("is-empty");
        }
      }
    }

    caption.hidden = !text;
    caption.textContent = text;
    caption.classList.remove("is-shown");
    if (announce && text) {
      void caption.offsetWidth;
      caption.classList.add("is-shown");
    }
    frame.classList.remove("is-settling");
    if (src) {
      void frame.offsetWidth;
      frame.classList.add("is-settling");
    }
    paintPosition(index, items.length);
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= items.length - 1;

    dots.replaceChildren();
    items.forEach((entry, dotIndex) => {
      const dot = document.createElement("li");
      if (dotIndex === index) dot.classList.add("is-current");
      dots.appendChild(dot);
    });

    if (announce) {
      slideAnnouncement.textContent = text
        ? "Fotografía " + (index + 1) + " de " + items.length + ". " + text
        : "Fotografía " + (index + 1) + " de " + items.length;
    }
  }

  function syncView(focusView) {
    document.querySelectorAll(".view").forEach((view) => {
      const active = view.dataset.view === state.phase;
      view.hidden = !active;
      view.classList.remove("is-leaving");
      if (!active) {
        view.classList.remove("is-active", "is-quiet");
        return;
      }
      if (quietEntrance) {
        view.classList.add("is-active", "is-quiet");
        return;
      }
      if (booted) {
        view.classList.remove("is-active", "is-quiet");
        void view.offsetWidth;
      }
      view.classList.add("is-active");
    });
    booted = true;
    window.scrollTo(0, 0);

    if (!focusView) return;
    const active = document.querySelector(".view.is-active");
    const heading = active && active.querySelector("h1");
    if (heading) heading.focus({ preventScroll: true });
  }

  async function changeSlide(index) {
    const items = Array.isArray(config.gallery.items) ? config.gallery.items : [];
    if (busy || state.phase !== "gallery") return;
    if (index === state.galleryIndex || index < 0 || index >= items.length) return;
    busy = true;
    try {
      frame.dataset.dir = index > state.galleryIndex ? "next" : "prev";
      if (!reduceMotion) {
        slide.classList.remove("is-in");
        slide.classList.add("is-out");
        await wait(400);
      }
      state.galleryIndex = index;
      save();
      paintGallery(true);
      slide.classList.remove("is-out");
      if (!reduceMotion) {
        void slide.offsetWidth;
        slide.classList.add("is-in");
      }
    } finally {
      busy = false;
    }
  }
})();
