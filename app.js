const pricing = {
  productBase: {
    ventana: 1950,
    puerta: 2650,
    cancel: 3250,
    barandal: 2950
  },
  colorMultiplier: {
    natural: 1,
    blanco: 1.06,
    negro: 1.08,
    champagne: 1.12,
    madera: 1.2
  },
  glassMultiplier: {
    claro6: 1,
    tintex6: 1.08,
    templado9: 1.22,
    laminado6: 1.35
  },
  locationFee: {
    "gdl-centro": 650,
    "gdl-periferia": 950,
    "zapopan-centro": 700,
    "zapopan-norte": 980
  },
  installationMultiplier: {
    incluida: 1,
    sin: 0.83
  }
};

const labels = {
  productType: {
    ventana: "Ventana",
    puerta: "Puerta",
    cancel: "Cancel de baño",
    barandal: "Barandal"
  },
  color: {
    natural: "Natural",
    blanco: "Blanco",
    negro: "Negro mate",
    champagne: "Champagne",
    madera: "Imitación madera"
  },
  glass: {
    claro6: "Claro 6mm",
    tintex6: "Tintex 6mm",
    templado9: "Templado 9mm",
    laminado6: "Laminado 6+6"
  },
  installation: {
    incluida: "Incluida",
    sin: "Sin instalación"
  },
  location: {
    "gdl-centro": "Guadalajara centro",
    "gdl-periferia": "Guadalajara periferia",
    "zapopan-centro": "Zapopan centro",
    "zapopan-norte": "Zapopan norte"
  }
};

const form = document.getElementById("quoteForm");
const priceEl = document.getElementById("estimatedPrice");
const metaEl = document.getElementById("metaInfo");
const breakdownEl = document.getElementById("breakdown");
const whatsappBtn = document.getElementById("whatsappBtn");

const whatsappPhone = "523300000000";

function toCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

function getFormValues() {
  return {
    productType: form.productType.value,
    width: Number(form.width.value),
    height: Number(form.height.value),
    color: form.color.value,
    glass: form.glass.value,
    installation: form.installation.value,
    location: form.location.value,
    notes: form.notes.value.trim()
  };
}

function calculateQuote(values) {
  const area = Math.max(values.width * values.height, 0.3);
  const basePrice = pricing.productBase[values.productType] * area;
  const colorAdj = basePrice * (pricing.colorMultiplier[values.color] - 1);
  const glassAdj = basePrice * (pricing.glassMultiplier[values.glass] - 1);
  const installAdjusted = (basePrice + colorAdj + glassAdj) * pricing.installationMultiplier[values.installation];
  const location = pricing.locationFee[values.location];
  const subtotal = installAdjusted + location;
  const total = Math.round(subtotal * 1.16);

  return {
    area,
    basePrice,
    colorAdj,
    glassAdj,
    location,
    total
  };
}

function renderBreakdown(calculation, values) {
  const rows = [
    ["Base por m²", toCurrency(calculation.basePrice)],
    [`Ajuste color (${labels.color[values.color]})`, toCurrency(calculation.colorAdj)],
    [`Ajuste cristal (${labels.glass[values.glass]})`, toCurrency(calculation.glassAdj)],
    [`Traslado (${labels.location[values.location]})`, toCurrency(calculation.location)]
  ];

  breakdownEl.innerHTML = rows
    .map(([name, amount]) => `<div class="break-row"><span>${name}</span><strong>${amount}</strong></div>`)
    .join("");
}

function buildWhatsappMessage(values, calc) {
  const lines = [
    "Hola EVLuminio, quiero solicitar una cotización.",
    `Producto: ${labels.productType[values.productType]}`,
    `Medidas: ${values.width}m x ${values.height}m (${calc.area.toFixed(2)} m²)`,
    `Color: ${labels.color[values.color]}`,
    `Cristal: ${labels.glass[values.glass]}`,
    `Instalación: ${labels.installation[values.installation]}`,
    `Ubicación: ${labels.location[values.location]}`,
    `Precio estimado: ${toCurrency(calc.total)}`
  ];

  if (values.notes) {
    lines.push(`Notas: ${values.notes}`);
  }

  return encodeURIComponent(lines.join("\n"));
}

function updateQuote() {
  const values = getFormValues();
  const calc = calculateQuote(values);

  priceEl.textContent = toCurrency(calc.total);
  metaEl.textContent = `${calc.area.toFixed(2)} m² · 1 pieza · IVA incluido`;
  renderBreakdown(calc, values);

  const whatsappMessage = buildWhatsappMessage(values, calc);
  whatsappBtn.onclick = () => {
    window.open(`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`, "_blank");
  };
}

form.addEventListener("input", updateQuote);
form.addEventListener("change", updateQuote);
updateQuote();
