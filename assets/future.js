(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const nav = document.querySelector(".site-nav");

    const updateScrollState = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        document.body.style.setProperty("--scroll-progress", progress.toFixed(4));
        nav?.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    const revealTargets = [...document.querySelectorAll(
        ".section-heading, .update-row, .paper-card, .contact-band, .profile-layout, " +
        ".principle-card, .archive-paper, .featured-project, .project-index-row"
    )];

    if (!reduceMotion && "IntersectionObserver" in window) {
        root.classList.add("js-motion");
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const siblings = [...entry.target.parentElement.children];
                const order = Math.max(0, siblings.indexOf(entry.target));
                entry.target.style.transitionDelay = `${Math.min(order * 70, 210)}ms`;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -7%" });

        revealTargets.forEach((target) => revealObserver.observe(target));
    } else {
        revealTargets.forEach((target) => target.classList.add("is-visible"));
    }

    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            navLinks.forEach((link) => {
                const active = link.getAttribute("href") === `#${visible.target.id}`;
                link.classList.toggle("is-active", active);
                if (active) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        }, { rootMargin: "-28% 0px -58%", threshold: [0.05, 0.25, 0.5] });
        sections.forEach((section) => sectionObserver.observe(section));
    }

    const tracks = [...document.querySelectorAll(".research-track[data-domain]")];
    const publicationResults = document.getElementById("publication-results");
    const papers = [...document.querySelectorAll(".paper-card[data-domains], .archive-paper[data-domains]")];
    let lockedDomain = null;

    const applyDomain = (domain) => {
        publicationResults?.classList.toggle("has-filter", Boolean(domain));
        tracks.forEach((track) => {
            const active = track.dataset.domain === domain;
            track.classList.toggle("is-active", active);
            track.setAttribute("aria-pressed", active && lockedDomain === domain ? "true" : "false");
        });
        papers.forEach((paper) => {
            const domains = paper.dataset.domains.split(/\s+/);
            const related = Boolean(domain) && domains.includes(domain);
            paper.classList.toggle("is-related", related);
            paper.classList.toggle("is-dimmed", Boolean(domain) && !related);
        });
    };

    const filterButtons = [...document.querySelectorAll("[data-publication-filter]")];
    const publicationCount = document.getElementById("publication-count");
    const featuredList = document.querySelector(".featured-publications");
    const featuredHeading = featuredList?.previousElementSibling;
    const publicationArchive = document.querySelector(".publication-archive");

    const applyPublicationFilter = (filter) => {
        papers.forEach((paper) => {
            const domains = paper.dataset.domains.split(/\s+/);
            const visible = filter === "all" || domains.includes(filter);
            paper.classList.toggle("is-filtered-out", !visible);
        });

        filterButtons.forEach((button) => {
            const active = button.dataset.publicationFilter === filter;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        const visiblePapers = papers.filter((paper) => !paper.classList.contains("is-filtered-out"));
        const visibleFeatured = visiblePapers.filter((paper) => paper.classList.contains("paper-card"));
        const visibleArchive = visiblePapers.filter((paper) => paper.classList.contains("archive-paper"));

        if (publicationCount) {
            const label = visiblePapers.length === 1
                ? publicationCount.dataset.labelSingle
                : publicationCount.dataset.label;
            publicationCount.textContent = `${visiblePapers.length}${label}`;
        }

        if (featuredList) featuredList.hidden = visibleFeatured.length === 0;
        if (featuredHeading) featuredHeading.hidden = visibleFeatured.length === 0;
        if (publicationArchive) publicationArchive.hidden = visibleArchive.length === 0;
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => applyPublicationFilter(button.dataset.publicationFilter));
    });

    if (filterButtons.length) applyPublicationFilter("all");

    tracks.forEach((track) => {
        track.addEventListener("pointerenter", () => applyDomain(track.dataset.domain));
        track.addEventListener("pointerleave", () => applyDomain(lockedDomain));
        track.addEventListener("focus", () => applyDomain(track.dataset.domain));
        track.addEventListener("blur", () => applyDomain(lockedDomain));
        track.addEventListener("click", () => {
            lockedDomain = lockedDomain === track.dataset.domain ? null : track.dataset.domain;
            applyDomain(lockedDomain);
        });
        track.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            track.click();
        });
    });

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
})();
