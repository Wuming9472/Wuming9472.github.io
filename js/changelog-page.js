/* The "What's new" page (it/changelog/ and the other languages): language and theme as on
   the home page. The versions themselves are in the page, written by tools/build-site.py
   from store/whats-new.md. */
(function () {
  const STORE_URL = "https://apps.microsoft.com/detail/9N3TNPDLFPZW";   /* as in site.js */
  const lang = document.documentElement.dataset.lang || "it";
  const page = document.documentElement.dataset.page || "";
  const PAGES = { en: "/", it: "/it/", de: "/de/", es: "/es/", zh: "/zh/" };

  const select = document.getElementById("lang");
  select.value = lang;
  select.addEventListener("change", e => {
    try { localStorage.setItem("saetta-language", e.target.value); } catch (err) {}
    location.href = PAGES[e.target.value] + page + location.hash;   /* the same version */
  });
  document.getElementById("theme").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = current === "light" ? "dark" : "light";
  });
  document.querySelectorAll(".store-link").forEach(a => { a.href = STORE_URL; a.target = "_blank"; a.rel = "noopener"; });
})();
