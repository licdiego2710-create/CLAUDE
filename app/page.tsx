"use client";

import { FormEvent, useMemo, useState } from "react";
import { TemplateType, templateCatalog } from "@/lib/templates";

type DraftState = {
  expediente: string;
  partes: string;
  juzgado: string;
  fecha: string;
  tipoAcuerdo: TemplateType;
  antecedentes: string;
  fundamentos: string;
  resolutivos: string;
};

const ACCESS_KEY = process.env.NEXT_PUBLIC_JUZGADO_ACCESS_KEY ?? "JMO-privado";

function buildDocumentText(state: DraftState) {
  return `JUZGADO MERCANTIL\n
AUTO: ${state.tipoAcuerdo.toUpperCase()}\n
Expediente: ${state.expediente}\nPartes: ${state.partes}\nJuzgado: ${state.juzgado}\nFecha: ${state.fecha}\n
ANTECEDENTES\n${state.antecedentes}\n
FUNDAMENTOS\n${state.fundamentos}\n
RESOLUTIVOS\n${state.resolutivos}\n`;
}

export default function Home() {
  const defaultTemplate = "providencia precautoria" as TemplateType;
  const [unlocked, setUnlocked] = useState(false);
  const [accessAttempt, setAccessAttempt] = useState("");
  const [draft, setDraft] = useState<DraftState>({
    expediente: "",
    partes: "",
    juzgado: "Juzgado Mercantil",
    fecha: new Date().toISOString().slice(0, 10),
    tipoAcuerdo: defaultTemplate,
    antecedentes: templateCatalog[defaultTemplate].antecedentes,
    fundamentos: templateCatalog[defaultTemplate].fundamentos,
    resolutivos: templateCatalog[defaultTemplate].resolutivos
  });

  const previewText = useMemo(() => buildDocumentText(draft), [draft]);

  function onTemplateChange(template: TemplateType) {
    const tpl = templateCatalog[template];
    setDraft((prev) => ({
      ...prev,
      tipoAcuerdo: template,
      antecedentes: tpl.antecedentes,
      fundamentos: tpl.fundamentos,
      resolutivos: tpl.resolutivos
    }));
  }

  function exportToWord() {
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><pre style="font-family: 'Times New Roman', serif; white-space: pre-wrap;">${previewText.replace(/</g, "&lt;")}</pre></body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `auto-mercantil-${draft.expediente || "borrador"}.doc`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accessAttempt === ACCESS_KEY) {
      setUnlocked(true);
    } else {
      alert("Clave de acceso inválida.");
    }
  }

  if (!unlocked) {
    return (
      <main className="lock-screen">
        <section className="card">
          <h1>Juzgado Mercantil OS</h1>
          <p>Sistema privado para elaboración de autos mercantiles.</p>
          <form onSubmit={handleUnlock} className="lock-form">
            <label htmlFor="key">Clave de acceso</label>
            <input
              id="key"
              type="password"
              value={accessAttempt}
              onChange={(e) => setAccessAttempt(e.target.value)}
              required
            />
            <button type="submit">Ingresar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="layout">
      <header>
        <h1>Juzgado Mercantil OS</h1>
        <p>Generador de borradores de autos mercantiles con plantilla judicial.</p>
      </header>

      <section className="panel form-panel">
        <h2>Datos del auto</h2>
        <div className="grid">
          <label>
            Expediente
            <input
              value={draft.expediente}
              onChange={(e) => setDraft({ ...draft, expediente: e.target.value })}
            />
          </label>
          <label>
            Partes
            <input
              value={draft.partes}
              onChange={(e) => setDraft({ ...draft, partes: e.target.value })}
            />
          </label>
          <label>
            Juzgado
            <input
              value={draft.juzgado}
              onChange={(e) => setDraft({ ...draft, juzgado: e.target.value })}
            />
          </label>
          <label>
            Fecha
            <input
              type="date"
              value={draft.fecha}
              onChange={(e) => setDraft({ ...draft, fecha: e.target.value })}
            />
          </label>
        </div>

        <label>
          Tipo de acuerdo
          <select
            value={draft.tipoAcuerdo}
            onChange={(e) => onTemplateChange(e.target.value as TemplateType)}
          >
            {Object.keys(templateCatalog).map((template) => (
              <option value={template} key={template}>
                {template}
              </option>
            ))}
          </select>
        </label>

        <label>
          Antecedentes
          <textarea
            rows={5}
            value={draft.antecedentes}
            onChange={(e) => setDraft({ ...draft, antecedentes: e.target.value })}
          />
        </label>

        <label>
          Fundamentos
          <textarea
            rows={5}
            value={draft.fundamentos}
            onChange={(e) => setDraft({ ...draft, fundamentos: e.target.value })}
          />
        </label>

        <label>
          Resolutivos
          <textarea
            rows={5}
            value={draft.resolutivos}
            onChange={(e) => setDraft({ ...draft, resolutivos: e.target.value })}
          />
        </label>

        <button onClick={exportToWord} className="export-btn" type="button">
          Exportar a Word (.doc)
        </button>
      </section>

      <section className="panel preview-panel">
        <h2>Vista previa</h2>
        <pre>{previewText}</pre>
      </section>
    </main>
  );
}
