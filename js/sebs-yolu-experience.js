(function () {
  if (typeof document === "undefined") return;

  var body = document.body;
  if (!body) return;
  body.classList.add("sebs-premium-page");

  function mountBackgroundOrbs() {
    if (document.querySelector(".premium-fx-orb")) return;
    var orbA = document.createElement("div");
    orbA.className = "premium-fx-orb premium-fx-orb--a";
    var orbB = document.createElement("div");
    orbB.className = "premium-fx-orb premium-fx-orb--b";
    body.appendChild(orbA);
    body.appendChild(orbB);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    window.addEventListener(
      "mousemove",
      function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 18;
        var y = (e.clientY / window.innerHeight - 0.5) * 18;
        orbA.style.transform = "translate(" + x + "px, " + y + "px)";
        orbB.style.transform = "translate(" + -x + "px, " + -y + "px)";
      },
      { passive: true }
    );
  }

  function interactiveTilt(selector) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cards = document.querySelectorAll(selector);
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 5;
        var y = ((e.clientY - r.top) / r.height - 0.5) * -5;
        card.style.transform = "rotateX(" + y + "deg) rotateY(" + x + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function init() {
    mountBackgroundOrbs();
    interactiveTilt(".pricing-card, .simulation-card-detailed, .sebs-visual-card");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
