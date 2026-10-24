// Pet Ziggy: tap the family photo for hearts and a purr (every seventh pet he meows back).
// The pet count lives only in this browser (localStorage); nothing is sent anywhere.
(function () {
  "use strict";

  var frame = document.getElementById("pet");
  var hearts = frame.querySelector(".hearts");
  var text = document.getElementById("pet-text");
  var moodLine = document.getElementById("pet-mood");
  var soundBtn = document.getElementById("sound");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var purr = new Audio("sounds/purr.mp3");
  var meow = new Audio("sounds/meow.mp3");
  purr.preload = meow.preload = "none";
  purr.volume = 0.8;
  meow.volume = 0.7;

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) { /* private mode: the count just isn't remembered */ }
  }

  var count = parseInt(load("crumble.pets", "0"), 10) || 0;
  var soundOn = load("crumble.sound", "on") === "on";

  // a little line that grows with the count
  var MOODS = [
    [1, "Ziggy approves."],
    [3, "Slow blink received."],
    [5, "Purr level: tractor."],
    [8, "He's making biscuits."],
    [12, "One braincell, fully charged."],
    [18, "Loaf mode activated."],
    [25, "I'm getting a bit jealous."],
    [35, "Belly offered. It's a trap."],
    [50, "Ziggy forgot every other human."],
    [75, "Low on polygons, high on love."],
    [100, "Certified Ziggy petter."],
    [150, "Ziggy asks: free on Sundays?"],
    [200, "Your hand is now 30% orange fur."],
    [250, "Okay, now he's just a puddle."],
    [365, "One pet for every day of the year."],
    [500, "You're now his fan club president."],
    [1000, "A legend. Kittens will hear of you."]
  ];

  function mood(n) {
    var line = "";
    for (var i = 0; i < MOODS.length; i++) {
      if (n >= MOODS[i][0]) line = MOODS[i][1];
    }
    return line;
  }

  function render() {
    if (count === 0) {
      text.textContent = "Ziggy is waiting for a pet.";
      moodLine.textContent = "";
      return;
    }
    text.innerHTML = "";
    var b = document.createElement("b");
    b.textContent = count.toLocaleString("en");
    text.append("Pets given: ", b);
    moodLine.textContent = mood(count);
  }

  function renderSound() {
    soundBtn.textContent = soundOn ? "sound on" : "sound off";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }

  function play() {
    if (!soundOn) return;
    var clip = count % 7 === 0 ? meow : purr;
    if (clip === purr && !purr.paused) return;  // let a running purr keep going
    clip.currentTime = 0;
    var p = clip.play();
    if (p && p.catch) p.catch(function () {});
  }

  function burst(x, y) {
    var n = reduceMotion ? 1 : 5;
    for (var i = 0; i < n; i++) {
      var h = document.createElement("span");
      h.className = "heart";
      h.style.left = x + (Math.random() * 30 - 15) + "px";
      h.style.top = y + (Math.random() * 16 - 8) + "px";
      h.style.setProperty("--dx", (Math.random() * 90 - 45).toFixed(0) + "px");
      h.style.setProperty("--r", (Math.random() * 30 - 15).toFixed(0) + "deg");
      h.style.animationDelay = (i * 70) + "ms";
      h.addEventListener("animationend", function () { this.remove(); });
      hearts.appendChild(h);
    }
  }

  frame.addEventListener("click", function (e) {
    var r = frame.getBoundingClientRect();
    // keyboard "clicks" have no position: hearts rise from Ziggy's head instead
    var keyboard = e.detail === 0;
    var x = keyboard ? r.width * 0.62 : e.clientX - r.left;
    var y = keyboard ? r.height * 0.62 : e.clientY - r.top;

    count += 1;
    save("crumble.pets", String(count));
    render();
    burst(x, y);
    play();

    frame.classList.add("was-petted");
    frame.classList.remove("is-petted");
    void frame.offsetWidth;  // restart the squish animation
    frame.classList.add("is-petted");
  });

  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    save("crumble.sound", soundOn ? "on" : "off");
    if (!soundOn) {
      purr.pause();
      meow.pause();
    }
    renderSound();
  });

  render();
  renderSound();
})();
