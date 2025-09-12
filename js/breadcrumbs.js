(async function () {
  const HOME_LABEL = "もるらぼ";
  const HOME_HREF = "/";

  let LABELS = {};
  try {
    const res = await fetch("/labels.json");
    if (!res.ok) throw new Error("labels.json の取得失敗");
    LABELS = await res.json();
  } catch (err) {
    console.warn("labels.json を読み込めませんでした:", err);
  }

  const path = location.pathname
    .replace(/index\.html?$/i, "")
    .replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);

  const ol = document.getElementById("breadcrumbs");
  if (!ol) return;

  // Home
  const homeLi = document.createElement("li");
  const homeA = document.createElement("a");
  homeA.href = HOME_HREF;
  homeA.textContent = HOME_LABEL;
  homeLi.appendChild(homeA);
  ol.appendChild(homeLi);

  // Sub
  let cumulative = "";
  segments.forEach((seg, i) => {
    cumulative += "/" + seg;
    const li = document.createElement("li");
    const isLast = i === segments.length - 1;
    const label = LABELS[seg] || decodeURIComponent(seg).replace(/-/g, " ");

    if (isLast) {
      const span = document.createElement("span");
      span.textContent = label;
      span.setAttribute("aria-current", "page");
      li.appendChild(span);
    } else {
      const a = document.createElement("a");
      a.href = cumulative + "/";
      a.textContent = label;
      li.appendChild(a);
    }
    ol.appendChild(li);
  });
})();
