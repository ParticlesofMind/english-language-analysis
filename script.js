const textInput = document.getElementById("textInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const charCount = document.getElementById("charCount");
const wordCountEl = document.getElementById("wordCount");
const inputWarning = document.getElementById("inputWarning");
const metricsGrid = document.getElementById("metricsGrid");
const languageSelect = document.getElementById("languageSelect");
const compareBtn = document.getElementById("compareBtn");
const userComparison = document.getElementById("userComparison");
const sampleComparison = document.getElementById("sampleComparison");
const sampleExcerpt = document.getElementById("sampleExcerpt");
const comparisonTitle = document.getElementById("comparisonTitle");

const MIN_CHARS = 50;

const functionWords = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"
]);

const latinSuffixes = ["tion","sion","ity","ment","ence","ance","ous","ious","al","ial","ive","ate"];
const latinPrefixes = ["ex","pre","con","pro","trans","inter","circum"];
const latinRoots = ["port","dict","duct","scribe","script","ject","mit","miss"];
const germanicSuffixes = ["ly","ness","ship","hood","dom"];
const germanicShortWords = new Set([
  "the","and","but","for","with","that","from","have","this","then","than","when","what","who","whom","will","shall","can","may","might","must","shall","upon","onto","into","ever","even","just","only","some","most","much","many","own","over"
]);
const strongVerbs = new Set(["drink","drank","sing","sang","give","gave","speak","spoke","take","took","write","wrote"]);

const irregularPatterns = [
  /([bcdfghjklmnpqrstvwxyz])e\b/, // silent e
  /^kn/, // silent k
  /^wr/, // silent w
  /mb\b/, // silent b
  /^hon/, // silent h
  /ould\b/, // silent l in could/would/should
  /ough/,
  /\bee|ea|ie|ei\b/,
  /(ph|gh)\w*/, // f sound alt
  /^ps|^sc|^pn/, // silent initial consonant leading to s sound
  /nation|mission/, // sh sound patterns
  /ow\b|ow./, // ow variants
  /break|great|bread/ // ea variants
];

const syllableSpecial = { the: 1, area: 3, idea: 3, real: 2 };

const metricMeta = {
  lexicalDensity: {
    label: "Lexical Density",
    explain: "Content words versus function words.",
    format: (v) => `${v.toFixed(1)}%`,
    barMax: 100
  },
  averageWordLength: {
    label: "Average Word Length",
    explain: "Mean letters per word.",
    format: (v) => `${v.toFixed(1)} letters`,
    barMax: 10
  },
  latinRatio: {
    label: "Latin / Germanic",
    explain: "Share of Latin-leaning vocabulary; stacked vs Germanic/neutral.",
    format: (v) => `${v.toFixed(1)}% Latin`,
    barMax: 100
  },
  syllableComplexity: {
    label: "Syllable Complexity",
    explain: "Average syllables per word.",
    format: (v) => `${v.toFixed(1)} syl/word`,
    barMax: 4
  },
  spellingPredictability: {
    label: "Spelling Predictability",
    explain: "Lower irregular patterns = higher score.",
    format: (v) => `${v.toFixed(1)}%`,
    barMax: 100
  }
};

const sampleTexts = {
  german: {
    title: "German sample",
    text: `Technologie im Alltag praegt fast jede Stunde. Menschen nutzen morgens ihr Smartphone, um Nachrichten zu lesen und den Tag zu planen. In der Bahn arbeiten viele auf dem Laptop, waehrend sie Musik hoeren. Unternehmen setzen auf digitale Werkzeuge, um Projekte zu koordinieren und Teams zu verbinden. Online-Banking hat Bargeld ersetzt, und Termine beim Amt lassen sich inzwischen elektronisch buchen. Auch zu Hause steuern smarte Geraete das Licht und die Heizung, was Energie spart. Trotzdem diskutieren viele ueber Datenschutz und Abhaengigkeit von grossen Plattformen. Schulen fuehren Tablets ein, doch Lehrkraefte muessen neue Methoden lernen. Aeltere Menschen profitieren von Telemedizin, wenn Arztbesuche schwer fallen. Gleichzeitig fuerchten einige den Verlust persoenlicher Begegnungen. In der Freizeit streamen Nutzer Filme, spielen online oder lernen Sprachen mit Apps. Technik erleichtert vieles, aber sie verlangt stetige Aufmerksamkeit und digitale Kompetenz. Wer offline sein moechte, muss es bewusst einplanen.`,
  },
  french: {
    title: "French sample",
    text: `La technologie structure la journee de nombreuses personnes. On consulte le telephone au reveil pour la meteo et les messages. Dans les transports, on ecoute des podcasts ou on repond aux courriels professionnels. Les entreprises utilisent des plateformes collaboratives pour suivre les projets et partager des documents. Le paiement sans contact et les applications bancaires ont remplace le liquide dans la plupart des achats. A la maison, des ampoules et thermostats connectes ajustent la consommation d'energie. Cependant, les questions de vie privee et de dependance aux grands acteurs numeriques demeurent. Les ecoles introduisent des tablettes, mais les enseignants doivent adapter leurs pratiques. Les personnes agees decouvrent la telemedecine, utile quand les deplacements sont difficiles. Certains regrettent la diminution des rencontres physiques. Pendant les loisirs, on regarde des series en streaming, on joue en ligne ou on apprend une nouvelle langue avec des applications. La technologie simplifie beaucoup d'actions quotidiennes, mais elle exige aussi un sens critique et la capacite de deconnecter.`,
  },
  italian: {
    title: "Italian sample",
    text: `La tecnologia accompagna ogni momento della vita quotidiana. Appena svegli molti controllano il telefono per leggere notizie e organizzare gli impegni. In autobus o in treno si ascolta musica o si risponde alle email di lavoro. Le aziende coordinano i progetti tramite piattaforme digitali e riunioni in video. I pagamenti contactless e le app bancarie hanno ridotto l'uso del contante. In casa luci e termostati smart regolano i consumi e inviano avvisi. Restano pero aperti i dubbi su privacy e dipendenza dai grandi servizi online. Le scuole introducono tablet, ma gli insegnanti devono sperimentare nuovi metodi. Gli anziani trovano utile la telemedicina quando spostarsi e difficile. Alcuni temono la perdita di relazioni dirette. Nel tempo libero si guardano film in streaming, si gioca online o si studia una lingua con le app. La tecnologia semplifica molte azioni, ma richiede attenzione continua e scelte consapevoli per evitare sovraccarico.`,
  },
  spanish: {
    title: "Spanish sample",
    text: `La tecnologia esta presente en cada etapa del dia. Al despertar se revisa el movil para ver la agenda y las noticias. En el transporte publico se escuchan podcasts o se responden correos del trabajo. Las empresas coordinan tareas con herramientas en linea y videollamadas. El pago sin contacto y las aplicaciones bancarias han reemplazado el efectivo en muchos comercios. En casa las bombillas y termostatos inteligentes ajustan la energia automaticamente. Persisten inquietudes sobre la privacidad y la dependencia de las grandes plataformas. Las escuelas integran tabletas, pero los docentes deben adaptar sus clases. Las personas mayores usan la telemedicina cuando viajar resulta complicado. Algunos lamentan que disminuyan las reuniones cara a cara. En el ocio se ven series en streaming, se juega en linea o se aprende un idioma con aplicaciones. La tecnologia facilita la vida, aunque exige gestionar las notificaciones y decidir cuando desconectarse para mantener el equilibrio.`,
  }
};

function normalizeText(raw) {
  return raw.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(raw) {
  const clean = normalizeText(raw).replace(/[^a-z'\-\s]/g, " ");
  return clean.split(" ").filter(Boolean);
}

function stripLetters(word) {
  return word.replace(/[^a-z]/g, "");
}

function countLetters(word) {
  return stripLetters(word).length;
}

function isFunctionWord(word) {
  return functionWords.has(word);
}

function classifyOrigin(word) {
  const w = stripLetters(word);
  if (!w) return 0;
  if (germanicShortWords.has(w) || germanicSuffixes.some((s) => w.endsWith(s)) || strongVerbs.has(w)) return -1;
  if (latinSuffixes.some((s) => w.endsWith(s)) || latinPrefixes.some((p) => w.startsWith(p)) || latinRoots.some((r) => w.includes(r))) return 1;
  return 0;
}

function countSyllables(word) {
  const lower = stripLetters(word).toLowerCase();
  if (!lower) return 0;
  if (syllableSpecial[lower]) return syllableSpecial[lower];
  let count = 0;
  const vowels = "aeiouy";
  let prevIsVowel = false;
  for (let i = 0; i < lower.length; i++) {
    const isVowel = vowels.includes(lower[i]);
    if (isVowel && !prevIsVowel) count += 1;
    prevIsVowel = isVowel;
  }
  if (lower.endsWith("e")) count -= 1;
  if (lower.endsWith("le") && lower.length > 2 && !vowels.includes(lower[lower.length - 3])) count += 1;
  if (count < 1) count = 1;
  return count;
}

function countIrregular(word) {
  const w = stripLetters(word);
  if (!w) return 0;
  return irregularPatterns.some((pattern) => pattern.test(w)) ? 1 : 0;
}

function computeMetrics(text) {
  const tokens = tokenize(text);
  const totalWords = tokens.length;
  if (totalWords === 0) {
    return {
      lexicalDensity: 0,
      averageWordLength: 0,
      latinRatio: 0,
      syllableComplexity: 0,
      spellingPredictability: 0,
    };
  }

  let contentWords = 0;
  let letterSum = 0;
  let latin = 0;
  let germanic = 0;
  let syllables = 0;
  let irregulars = 0;
  let validWordCount = 0;
  let neutral = 0;

  tokens.forEach((token) => {
    const lettersOnly = stripLetters(token);
    if (!lettersOnly) return;
    validWordCount += 1;
    if (!isFunctionWord(token)) contentWords += 1;

    letterSum += countLetters(token);
    const origin = classifyOrigin(token);
    if (origin === 1) latin += 1;
    if (origin === -1) germanic += 1;
    if (origin === 0) neutral += 1;

    syllables += countSyllables(token);
    irregulars += countIrregular(token);
  });

  const lexicalDensity = (contentWords / totalWords) * 100;
  const averageWordLength = validWordCount ? letterSum / validWordCount : 0;
  const latinRatio = (latin + germanic) === 0 ? 0 : (latin / (latin + germanic)) * 100;
  const syllableComplexity = validWordCount ? syllables / validWordCount : 0;
  const spellingPredictability = Math.max(0, Math.min(100, 100 - (irregulars / totalWords) * 100));

  return {
    lexicalDensity,
    averageWordLength,
    latinRatio,
    syllableComplexity,
    spellingPredictability,
    totalWords,
    validWordCount,
    latinCount: latin,
    germanicCount: germanic,
    neutralCount: neutral
  };
}

function statusChip(metric, value) {
  if (metric === "lexicalDensity") {
    if (value < 45) return { label: "Informal", cls: "status-low" };
    if (value <= 55) return { label: "Conversational", cls: "status-mid" };
    return { label: "Formal", cls: "status-high" };
  }
  if (metric === "spellingPredictability") {
    if (value < 70) return { label: "Irregular", cls: "status-low" };
    if (value <= 80) return { label: "Mixed", cls: "status-mid" };
    return { label: "Predictable", cls: "status-high" };
  }
  return null;
}

function renderLatinStack(metrics) {
  const latin = metrics.latinCount || 0;
  const germanic = metrics.germanicCount || 0;
  const neutral = metrics.neutralCount || 0;
  const total = latin + germanic + neutral;
  if (total === 0) return '<div class="bar"><span style="width: 0;"></span></div>';
  const latinPct = (latin / total) * 100;
  const germanicPct = (germanic / total) * 100;
  const neutralPct = (neutral / total) * 100;
  return `
    <div class="stacked-bar">
      <span class="seg latin" style="width:${latinPct}%;"></span>
      <span class="seg germanic" style="width:${germanicPct}%;"></span>
      <span class="seg neutral" style="width:${neutralPct}%;"></span>
    </div>
    <div class="stacked-legend">
      <span class="legend-item"><span class="legend-dot latin"></span>Latin <span class="legend-badge">${latinPct.toFixed(0)}%</span></span>
      <span class="legend-item"><span class="legend-dot germanic"></span>Germanic <span class="legend-badge">${germanicPct.toFixed(0)}%</span></span>
      <span class="legend-item"><span class="legend-dot neutral"></span>Neutral <span class="legend-badge">${neutralPct.toFixed(0)}%</span></span>
    </div>
  `;
}

function renderMetricCard(metricKey, metrics) {
  const meta = metricMeta[metricKey];
  const value = metrics[metricKey] || 0;
  const chip = statusChip(metricKey, value);
  const barWidth = Math.min(100, (value / meta.barMax) * 100);
  const card = document.createElement("div");
  card.className = "metric-card";
  const stacked = metricKey === "latinRatio" ? renderLatinStack(metrics) : `<div class="bar"><span style="width: ${barWidth}%;"></span></div>`;
  card.innerHTML = `
    <div class="metric-top">
      <p class="metric-name">${metricIcon(metricKey)}${meta.label}</p>
      <p class="metric-value">${meta.format(value)}</p>
    </div>
    ${stacked}
    <div class="metric-foot">${meta.explain}</div>
    ${chip ? `<span class="status-chip ${chip.cls}">${chip.label}</span>` : ""}
  `;
  return card;
}

function renderMetrics(container, metrics) {
  container.innerHTML = "";
  Object.keys(metricMeta).forEach((key) => {
    container.appendChild(renderMetricCard(key, metrics));
  });
}

function renderComparison(container, metrics) {
  container.innerHTML = "";
  Object.keys(metricMeta).forEach((key) => {
    const meta = metricMeta[key];
    const value = metrics[key] || 0;
    const barWidth = Math.min(100, (value / meta.barMax) * 100);
    const block = document.createElement("div");
    block.className = "metric-card";
    const stacked = key === "latinRatio" ? renderLatinStack(metrics) : `<div class="bar"><span style="width: ${barWidth}%;"></span></div>`;
    block.innerHTML = `
      <div class="metric-top">
          <p class="metric-name">${metricIcon(key)}${meta.label}</p>
        <p class="metric-value">${meta.format(value)}</p>
      </div>
      ${stacked}
      <div class="metric-foot">${meta.explain}</div>
    `;
    container.appendChild(block);
  });
}

  function metricIcon(key) {
    const icons = {
      lexicalDensity: `<svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4z"/><path d="M4 10h10v4H4z"/><path d="M4 16h7v4H4z"/></svg>`,
      averageWordLength: `<svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M12 5v14"/><circle cx="12" cy="12" r="9"/></svg>`,
      latinRatio: `<svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>`,
      syllableComplexity: `<svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c1.5-5 2.5-10 7-10s5.5 5 7 10"/><path d="M9 10c0-3 1.5-5 3-5s3 2 3 5"/></svg>`,
      spellingPredictability: `<svg class="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/><circle cx="18" cy="18" r="3"/></svg>`
    };
    return icons[key] || "";
  }

function updateCharState() {
  const length = textInput.value.length;
  charCount.textContent = `${length} characters`;
  const wordCount = tokenize(textInput.value).length;
  wordCountEl.textContent = `${wordCount} words`;
  const meetsChars = length >= MIN_CHARS;
  const reliability = meetsChars && wordCount < 50;
  inputWarning.textContent = !meetsChars
    ? "Minimum 50 characters required for reliable metrics."
    : reliability
      ? "Tip: Fewer than 50 words — results may be noisy."
      : "";
  inputWarning.style.visibility = (!meetsChars || reliability) ? "visible" : "hidden";
  analyzeBtn.disabled = !meetsChars;
  compareBtn.disabled = !meetsChars;
}

function resetOutputs() {
  metricsGrid.innerHTML = "";
  userComparison.innerHTML = "";
}

function runAnalysis() {
  const text = textInput.value.trim();
  if (text.length < MIN_CHARS) return;
  const metrics = computeMetrics(text);
  renderMetrics(metricsGrid, metrics);
  return metrics;
}

function runComparison() {
  const userMetrics = runAnalysis();
  if (!userMetrics) return;
  const lang = languageSelect.value;
  const sample = sampleTexts[lang];
  comparisonTitle.textContent = sample.title;
  sampleExcerpt.textContent = sample.text.slice(0, 380) + (sample.text.length > 380 ? "..." : "");
  renderComparison(userComparison, userMetrics);
  renderComparison(sampleComparison, sample.metrics);
}

clearBtn.addEventListener("click", () => {
  textInput.value = "";
  resetOutputs();
  updateCharState();
});

analyzeBtn.addEventListener("click", runAnalysis);
compareBtn.addEventListener("click", runComparison);
textInput.addEventListener("input", updateCharState);

function preloadSamples() {
  Object.keys(sampleTexts).forEach((key) => {
    sampleTexts[key].metrics = computeMetrics(sampleTexts[key].text);
  });
  sampleExcerpt.textContent = sampleTexts.german.text.slice(0, 380) + "...";
}

preloadSamples();
updateCharState();
