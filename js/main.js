(function () {
    var root = document.documentElement;
    var hasObserver = "IntersectionObserver" in window;

    // Só esconde elementos para animar se o navegador conseguir revelá-los depois
    if (hasObserver) {
        root.classList.add("js-motion");
    }

    document.getElementById("ano").textContent = new Date().getFullYear();

    // Borda da topbar aparece só depois de rolar
    var topbar = document.querySelector(".topbar");
    var onScroll = function () {
        topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!hasObserver) {
        return;
    }

    // Reveal ao rolar, com stagger curto entre itens que entram juntos
    var pending = [];
    var flushScheduled = false;

    var flush = function () {
        pending.forEach(function (el, i) {
            el.style.setProperty("--stagger", Math.min(i * 60, 240) + "ms");
            el.classList.add("is-visible");
        });
        pending = [];
        flushScheduled = false;
    };

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                pending.push(entry.target);
                revealObserver.unobserve(entry.target);
            }
        });
        if (pending.length && !flushScheduled) {
            flushScheduled = true;
            requestAnimationFrame(flush);
        }
    }, { rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) {
        revealObserver.observe(el);
    });

    // Destaca no menu a seção visível
    var links = {};
    document.querySelectorAll(".topbar nav a").forEach(function (a) {
        links[a.getAttribute("href").slice(1)] = a;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var link = links[entry.target.id];
            if (link) {
                link.classList.toggle("is-active", entry.isIntersecting);
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("section[id]").forEach(function (section) {
        sectionObserver.observe(section);
    });
})();
