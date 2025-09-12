(async function () {
  const HOME_LABEL = "トップページ";
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

  // トップページならパンくずを生成せず終了
  if (segments.length === 0) return;

  const ol = document.getElementById("breadcrumbs");
  if (!ol) return;

  // ----------------------
  // ① パンくずHTMLを生成
  // ----------------------
  const homeLi = document.createElement("li");
  const homeA = document.createElement("a");
  homeA.href = HOME_HREF;
  homeA.textContent = HOME_LABEL;
  homeLi.appendChild(homeA);
  ol.appendChild(homeLi);

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

  // ----------------------
  // ② JSON-LD（構造化データ）を生成
  // ----------------------
  try {
    const items = [];
    let pos = 1;

    // Home
    items.push({
      "@type": "ListItem",
      position: pos++,
      name: HOME_LABEL,
      item: location.origin + HOME_HREF
    });

    // Sub
    let cum = "";
    segments.forEach(seg => {
      cum += "/" + seg;
      items.push({
        "@type": "ListItem",
        position: pos++,
        name: LABELS[seg] || decodeURIComponent(seg).replace(/-/g, " "),
        item: location.origin + cum + "/"
      });
    });

    const ld = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(ld, null, 2);
    document.head.appendChild(script);
  } catch (e) {
    console.warn("BreadcrumbList の生成に失敗:", e);
  }
})();
