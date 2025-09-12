(async function () {
  const HOME_LABEL = "トップページ";
  const HOME_HREF = "/";

  // ▼ ラベル辞書を読み込み
  let LABELS = {};
  try {
    const res = await fetch("/labels.json");
    if (!res.ok) throw new Error("labels.json の取得失敗");
    LABELS = await res.json();
  } catch (err) {
    console.warn("labels.json を読み込めませんでした:", err);
  }

  // ▼ パスを分解
  const path = location.pathname
    .replace(/index\.html?$/i, "")
    .replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);

  // トップページはパンくず不要
  if (segments.length === 0) return;

  const ol = document.getElementById("breadcrumbs");
  if (!ol) return;

  // ▼ ヘルパー: ラベル解決
  const getLabel = seg => LABELS[seg] || decodeURIComponent(seg).replace(/-/g, " ");

  // ----------------------
  // ① パンくずHTMLを生成
  // ----------------------

  // Home
  const homeLi = document.createElement("li");
  const homeA = document.createElement("a");
  homeA.href = HOME_HREF;

  const homeIcon = document.createElement("i");
  homeIcon.className = "fa-solid fa-crow";
  homeIcon.setAttribute("aria-hidden", "true");

  const homeText = document.createTextNode(" " + HOME_LABEL);

  homeA.appendChild(homeIcon);
  homeA.appendChild(homeText);
  homeLi.appendChild(homeA);
  ol.appendChild(homeLi);

  // Sub
  let cumulative = "";
  segments.forEach((seg, i) => {
    cumulative += "/" + seg;
    const li = document.createElement("li");
    const isLast = i === segments.length - 1;
    const label = getLabel(seg);

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
        name: getLabel(seg),
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
