// Spine UI + logic (vanilla JS). No external libraries.

export function mountSpineApp(root, env) {
  const state = {
    env,
    setIndex: 0,
    letters: [],
    drag: { active: false, from: -1 },
    reveal: false,
  };

  const ANAGRAM_SETS = [
    // Each set: same letters; multiple valid words. Keep length 5-7 for mobile.
    { title: "Listen", letters: "LISTEN", words: ["LISTEN","SILENT","ENLIST","TINSEL","INLETS"] },
    { title: "Earn",   letters: "EARN",   words: ["EARN","NEAR"] },
    { title: "Angel",  letters: "ANGEL",  words: ["ANGEL","GLEAN"] },
    { title: "Stressed", letters: "STRESSED", words: ["STRESSED","DESSERTS"] },
    { title: "Night",  letters: "NIGHT",  words: ["NIGHT","THING"] },
    { title: "Earth",  letters: "EARTH",  words: ["EARTH","HEART"] },
    { title: "Cheaters", letters: "CHEATERS", words: ["CHEATERS","TEACHERS","HECTARES"] },
    { title: "Sadder", letters: "SADDER", words: ["SADDER","DREADS"] },
    { title: "Arrest", letters: "ARREST", words: ["ARREST","RAREST","STARER"] },
    { title: "Elbow",  letters: "ELBOW",  words: ["ELBOW","BELOW"] },
    { title: "Fresher", letters: "FRESHER", words: ["FRESHER","REFRESH"] },
    { title: "Rescue", letters: "RESCUE", words: ["RESCUE","SECURE","RECUSE"] },
    { title: "Finder", letters: "FINDER", words: ["FINDER","FRIEND","REDFIN"] },
    { title: "Save", letters: "SAVE", words: ["SAVE","VASE"] },
    { title: "Study", letters: "STUDY", words: ["STUDY","DUSTY"] },
    { title: "Spear", letters: "SPEAR", words: ["SPEAR","PARES","REAPS","SPARE"] },
    { title: "Least", letters: "LEAST", words: ["LEAST","STALE","STEAL","SLATE","TESLA"] },
    { title: "Alert", letters: "ALERT", words: ["ALERT","LATER","ALTER","ARTEL"] },
    { title: "Finder", letters: "REDRAW", words: ["REDRAW","REWARD","WARDER"] },
    { title: "Master", letters: "MASTER", words: ["MASTER","STREAM","TAMERS"] },
    { title: "Melon", letters: "MELON", words: ["MELON","LEMON"] },
    { title: "Items", letters: "ITEMS", words: ["ITEMS","TIMES"] },
    { title: "Ropes", letters: "ROPES", words: ["ROPES","PROSE","SPORE","POSER"] },
    { title: "Cider", letters: "CIDER", words: ["CIDER","CRIED","DICER"] },
    { title: "Stone", letters: "STONE", words: ["STONE","NOTES","TONES"] },
    { title: "Brains", letters: "BRAINS", words: ["BRAINS","BRISAN"] }, // playful rare-ish
    { title: "Secure", letters: "ACRE", words: ["ACRE","RACE","CARE"] },
    { title: "Spare", letters: "PRASE", words: ["PRASE","SPEAR","PARES","REAPS","SPARE"] }, // overlap letters, different start
    { title: "Salt", letters: "SALT", words: ["SALT","LAST"] },
    { title: "Rates", letters: "RATES", words: ["RATES","STARE","TEARS","ASTER"] }
  ].filter(s => /^[A-Z]+$/.test(s.letters));

  // Simple "meaning" blurbs (not dictionary; just vibes)
  const WORD_VIBES = {
    LISTEN: "Attention that feels like care.",
    SILENT: "A quiet that makes room.",
    ENLIST: "Choosing to join in.",
    TINSEL: "Shiny, playful, a little extra.",
    INLETS: "Small openings where things enter.",

    STRESSED: "Tight mind, fast thoughts.",
    DESSERTS: "A sweet ending.",

    NIGHT: "Soft cover for everything.",
    THING: "Anything you can name.",

    EARTH: "Ground. Home. Real.",
    HEART: "Center. Pulse. Meaning.",

    TEACHERS: "People who unlock you.",
    CHEATERS: "Shortcuts with consequences.",
    HECTARES: "Space you can measure.",

    STUDY: "Slow effort that becomes you.",
    DUSTY: "Time left a layer.",

    STEAL: "Taking without asking.",
    SLATE: "A clean start.",
    TESLA: "A name that sparks ideas.",
    STALE: "Old air. Old taste.",

    ALTER: "Change with intent.",
    LATER: "Not now — soon.",
    ALERT: "Eyes open.",

    REWARD: "What you get back.",
    REDRAW: "Try again with new hands.",
    WARDER: "A keeper.",

    STREAM: "Flow with direction.",
    MASTER: "Skill earned over time.",
    TAMERS: "Those who calm wild things.",

    LEMON: "Sharp brightness.",
    MELON: "Soft sweetness.",

    TIMES: "Rhythms, eras, repeats.",
    ITEMS: "Little pieces of a day.",

    PROSE: "Plain words that sing.",
    SPORE: "Tiny beginnings.",
    POSER: "A mask pretending.",
    ROPES: "Ties that hold.",

    CRIED: "Emotion released.",
    CIDER: "Cold, crisp comfort.",
    DICER: "Cuts into pieces.",

    TONES: "Mood as sound.",
    NOTES: "Small thoughts saved.",
    STONE: "Weight that lasts.",

    CARE: "Gentle attention.",
    RACE: "Fast focus.",
    ACRE: "A patch of earth.",

    LAST: "The end that remains.",
    SALT: "Edge, flavor, truth.",

    TEARS: "Saltwater proof.",
    STARE: "Unblinking focus.",
    RATES: "Numbers assigned.",
    ASTER: "A small star-flower."
  };

  function pickSet(i) {
    state.setIndex = (i + ANAGRAM_SETS.length) % ANAGRAM_SETS.length;
    const letters = ANAGRAM_SETS[state.setIndex].letters.split("");
    state.letters = shuffle([...letters]);
    state.reveal = false;
    render();
    // Persist daily: remember last set + arrangement
    try {
      localStorage.setItem("spine:setIndex", String(state.setIndex));
      localStorage.setItem("spine:letters", state.letters.join(""));
    } catch {}
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function currentWord() {
    return state.letters.join("");
  }

  function isValidWord(w) {
    const set = ANAGRAM_SETS[state.setIndex];
    return set.words.includes(w);
  }

  function vibeFor(w) {
    return WORD_VIBES[w] || "A word found by your hands.";
  }

  function haptic() {
    // best-effort haptic without SDK; mini app hosts may map this
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function swapToNearest(fromIdx, clientY) {
    const list = root.querySelector(".letters");
    const items = [...list.querySelectorAll(".letter")];
    const rects = items.map(el => el.getBoundingClientRect());
    // find nearest by vertical center
    const nearest = rects
      .map((r, idx) => ({ idx, dist: Math.abs((r.top + r.bottom) / 2 - clientY) }))
      .sort((a, b) => a.dist - b.dist)[0]?.idx ?? fromIdx;

    if (nearest !== fromIdx) {
      const tmp = state.letters[fromIdx];
      state.letters[fromIdx] = state.letters[nearest];
      state.letters[nearest] = tmp;
      haptic();
    }
    render();
    try { localStorage.setItem("spine:letters", state.letters.join("")); } catch {}
  }

  function restore() {
    try {
      const si = parseInt(localStorage.getItem("spine:setIndex") || "0", 10);
      const letters = localStorage.getItem("spine:letters");
      if (!Number.isNaN(si) && si >= 0 && si < ANAGRAM_SETS.length) state.setIndex = si;
      if (letters && letters.length === ANAGRAM_SETS[state.setIndex].letters.length) {
        state.letters = letters.split("");
      } else {
        state.letters = shuffle(ANAGRAM_SETS[state.setIndex].letters.split(""));
      }
    } catch {
      state.letters = shuffle(ANAGRAM_SETS[state.setIndex].letters.split(""));
    }
  }

  function render() {
    const set = ANAGRAM_SETS[state.setIndex];
    const w = currentWord();
    const valid = isValidWord(w);

    root.innerHTML = `
      <div class="wrap">
        <header class="top">
          <div class="brand">
            <div class="logo">SPINE</div>
            <div class="sub">${escapeHtml(set.title)} • ${set.letters.length} letters</div>
          </div>
          <button class="btn ghost" id="newSet" title="New set">New</button>
        </header>

        <main class="main">
          <div class="card">
            <div class="hint">
              Drag letters to reorder. Find one of <strong>${set.words.length}</strong> hidden words.
            </div>

            <div class="stage">
              <div class="letters" aria-label="Letter spine">
                ${state.letters.map((ch, idx) => `
                  <div class="letter" draggable="false" data-idx="${idx}" role="button" aria-label="Letter ${ch}">
                    <div class="cap"></div>
                    <div class="ch">${escapeHtml(ch)}</div>
                    <div class="cap"></div>
                  </div>
                `).join("")}
              </div>

              <div class="wordline">
                <div class="word ${valid ? "good" : ""}">${escapeHtml(w)}</div>
                <div class="vibe">${escapeHtml(valid ? vibeFor(w) : "Keep rearranging…")}</div>
              </div>

              <div class="actions">
                <button class="btn" id="shuffle">Shuffle</button>
                <button class="btn ghost" id="reveal">${state.reveal ? "Hide" : "Reveal"}</button>
              </div>

              ${state.reveal ? `
                <div class="reveal">
                  ${set.words.map(x => `<span class="pill ${x === w ? "on" : ""}">${escapeHtml(x)}</span>`).join("")}
                </div>
              ` : ``}
            </div>
          </div>

          <footer class="foot">
            <div class="env">${escapeHtml(state.env.label)}</div>
            <div class="tiny">Tip: drag a letter near where you want it to land.</div>
          </footer>
        </main>
      </div>
    `;

    // Wire buttons
    root.querySelector("#newSet").addEventListener("click", () => pickSet(state.setIndex + 1));
    root.querySelector("#shuffle").addEventListener("click", () => {
      state.letters = shuffle([...state.letters]);
      try { localStorage.setItem("spine:letters", state.letters.join("")); } catch {}
      render();
    });
    root.querySelector("#reveal").addEventListener("click", () => { state.reveal = !state.reveal; render(); });

    // Drag handling (touch + mouse)
    const lettersEl = root.querySelector(".letters");
    const items = [...root.querySelectorAll(".letter")];

    function startDrag(idx) {
      state.drag.active = true;
      state.drag.from = idx;
      items[idx]?.classList.add("dragging");
    }
    function endDrag() {
      if (!state.drag.active) return;
      items[state.drag.from]?.classList.remove("dragging");
      state.drag.active = false;
      state.drag.from = -1;
    }

    items.forEach((el) => {
      const idx = parseInt(el.getAttribute("data-idx"), 10);

      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startDrag(idx);
      });

      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startDrag(idx);
      }, { passive: false });
    });

    window.addEventListener("mousemove", (e) => {
      if (!state.drag.active) return;
      swapToNearest(state.drag.from, e.clientY);
    });

    window.addEventListener("touchmove", (e) => {
      if (!state.drag.active) return;
      const t = e.touches[0];
      if (!t) return;
      swapToNearest(state.drag.from, t.clientY);
    }, { passive: false });

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    // Celebrate when valid
    if (valid) {
      root.querySelector(".card")?.classList.add("celebrate");
      setTimeout(() => root.querySelector(".card")?.classList.remove("celebrate"), 550);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // init
  restore();
  render();

  return { pickSet };
}
