"use client";

import { useMemo, useState } from "react";

type ProductType = "ventana" | "puerta" | "cancel";
type ColorType = "natural" | "blanco" | "negro" | "madera";
type GlassType = "3mm" | "6mm" | "templado" | "doble";

type FormData = {
  ancho: number;
  alto: number;
  cantidad: number;
  producto: ProductType;
  color: ColorType;
  cristal: GlassType;
  instalacion: boolean;
};

const PRODUCT_PRICE_M2: Record<ProductType, number> = {
  ventana: 2200,
  puerta: 2900,
  cancel: 3400
};

const COLOR_FACTOR: Record<ColorType, number> = {
  natural: 1,
  blanco: 1.08,
  negro: 1.12,
  madera: 1.2
};

const GLASS_FACTOR: Record<GlassType, number> = {
  "3mm": 1,
  "6mm": 1.15,
  templado: 1.35,
  doble: 1.55
};

const INSTALLATION_PER_M2 = 450;
const WHATSAPP_NUMBER = "5215512345678";

export default function Home() {
  const [form, setForm] = useState<FormData>({
    ancho: 1.2,
    alto: 1,
    cantidad: 1,
    producto: "ventana",
    color: "natural",
    cristal: "6mm",
    instalacion: true
  });

  const area = useMemo(() => form.ancho * form.alto, [form.ancho, form.alto]);

  const subtotal = useMemo(() => {
    const base = PRODUCT_PRICE_M2[form.producto] * area;
    const adjusted = base * COLOR_FACTOR[form.color] * GLASS_FACTOR[form.cristal];
    const install = form.instalacion ? area * INSTALLATION_PER_M2 : 0;
    return (adjusted + install) * form.cantidad;
  }, [area, form]);

  const total = useMemo(() => subtotal * 1.16, [subtotal]);

  const quoteMessage = useMemo(() => {
    return [
      "Hola EVLuminio, me interesa una cotización:",
      `• Producto: ${form.producto}`,
      `• Medidas: ${form.ancho.toFixed(2)}m x ${form.alto.toFixed(2)}m`,
      `• Cantidad: ${form.cantidad}`,
      `• Color: ${form.color}`,
      `• Cristal: ${form.cristal}`,
      `• Instalación: ${form.instalacion ? "Sí" : "No"}`,
      `• Total estimado: $${total.toLocaleString("es-MX", { maximumFractionDigits: 2 })} MXN`
    ].join("\n");
  }, [form, total]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quoteMessage)}`;

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main>
      <section className="container">
        <h1>Cotizador EVLuminio</h1>
        <p>Calcula un estimado para ventanas, puertas y canceles de aluminio.</p>

        <div className="grid">
          <label className="field">
            Tipo de producto
            <select
              value={form.producto}
              onChange={(e) => update("producto", e.target.value as ProductType)}
            >
              <option value="ventana">Ventana</option>
              <option value="puerta">Puerta</option>
              <option value="cancel">Cancel</option>
            </select>
          </label>

          <label className="field">
            Ancho (m)
            <input
              type="number"
              min={0.2}
              step={0.05}
              value={form.ancho}
              onChange={(e) => update("ancho", Number(e.target.value) || 0)}
            />
          </label>

          <label className="field">
            Alto (m)
            <input
              type="number"
              min={0.2}
              step={0.05}
              value={form.alto}
              onChange={(e) => update("alto", Number(e.target.value) || 0)}
            />
          </label>

          <label className="field">
            Cantidad
            <input
              type="number"
              min={1}
              step={1}
              value={form.cantidad}
              onChange={(e) => update("cantidad", Math.max(1, Number(e.target.value) || 1))}
            />
          </label>

          <label className="field">
            Color de aluminio
            <select
              value={form.color}
              onChange={(e) => update("color", e.target.value as ColorType)}
            >
              <option value="natural">Natural</option>
              <option value="blanco">Blanco</option>
              <option value="negro">Negro</option>
              <option value="madera">Imitación madera</option>
            </select>
          </label>

          <label className="field">
            Tipo de cristal
            <select
              value={form.cristal}
              onChange={(e) => update("cristal", e.target.value as GlassType)}
            >
              <option value="3mm">Claro 3mm</option>
              <option value="6mm">Claro 6mm</option>
              <option value="templado">Templado</option>
              <option value="doble">Doble vidrio</option>
            </select>
          </label>

          <label className="field">
            ¿Incluye instalación?
            <select
              value={form.instalacion ? "si" : "no"}
              onChange={(e) => update("instalacion", e.target.value === "si")}
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>

        <div className="summary">
          <p>Área por pieza: {area.toFixed(2)} m²</p>
          <h2 className="price">
            ${total.toLocaleString("es-MX", { maximumFractionDigits: 2 })} MXN
          </h2>
          <p className="note">Estimado con IVA incluido. El precio final puede variar tras visita técnica.</p>

          <div className="actions">
            <button onClick={() => navigator.clipboard.writeText(quoteMessage)}>
              Copiar cotización
            </button>
            <a className="whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
