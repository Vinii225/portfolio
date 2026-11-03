(function () {
    var root = document.documentElement;
    var hasObserver = "IntersectionObserver" in window;

    // Só esconde elementos para animar se o navegador conseguir revelá-los depois
    if (hasObserver) {
        root.classList.add("js-motion");
    }

    document.getElementById("ano").textContent = new Date().getFullYear();

    // Copiar e-mail: troca o rótulo por 1,6s e avisa leitores de tela
    var copyButton = document.querySelector(".copy");
    var copyStatus = document.getElementById("copy-status");
    var copyTimer;

    if (copyButton && navigator.clipboard) {
        copyButton.addEventListener("click", function () {
            navigator.clipboard.writeText(copyButton.dataset.copy).then(function () {
                copyButton.classList.add("is-copied");
                copyStatus.textContent = "E-mail copiado";
                clearTimeout(copyTimer);
                copyTimer = setTimeout(function () {
                    copyButton.classList.remove("is-copied");
                    copyStatus.textContent = "";
                }, 1600);
            });
        });
    } else if (copyButton) {
        // Sem Clipboard API (ex.: http sem TLS), o link mailto já resolve
        copyButton.hidden = true;
    }

    // Borda da topbar aparece só depois de rolar
    var topbar = document.querySelector(".topbar");
    var onScroll = function () {
        topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Lê o scroll no próximo frame, depois do primeiro layout, para não forçar reflow
    requestAnimationFrame(onScroll);

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
