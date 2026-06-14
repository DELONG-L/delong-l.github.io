const navLinks = [...document.querySelectorAll(".nav-scroll a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = `#${entry.target.id}`;
      for (const link of navLinks) {
        link.classList.toggle("active", link.getAttribute("href") === id);
      }
    }
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0.01,
  },
);

for (const section of sections) {
  observer.observe(section);
}

const copyButton = document.querySelector("#copy-citation");
const citationBlock = document.querySelector("#citation-block");

if (copyButton && citationBlock) {
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citationBlock.textContent.trim());
      const previous = copyButton.textContent;
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = previous;
      }, 1400);
    } catch {
      copyButton.textContent = "Copy failed";
      setTimeout(() => {
        copyButton.textContent = "Copy BibTeX";
      }, 1400);
    }
  });
}
