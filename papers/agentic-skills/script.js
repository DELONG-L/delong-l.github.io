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
const isChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

function setCopyButtonLabel(label) {
  if (!copyButton) return;
  const defaultLabel = copyButton.dataset.defaultLabel || copyButton.textContent;
  copyButton.dataset.defaultLabel = defaultLabel;
  copyButton.textContent = label;
  setTimeout(() => {
    copyButton.textContent = defaultLabel;
  }, 1400);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

async function copyCitationText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopyText(text);
    }
  }

  return fallbackCopyText(text);
}

if (copyButton && citationBlock) {
  copyButton.addEventListener("click", async () => {
    const citationText = citationBlock.textContent.trim();
    try {
      const copied = await copyCitationText(citationText);
      setCopyButtonLabel(copied ? (isChinese ? "已复制" : "Copied") : (isChinese ? "复制失败" : "Copy failed"));
    } catch {
      setCopyButtonLabel(isChinese ? "复制失败" : "Copy failed");
    }
  });
}
