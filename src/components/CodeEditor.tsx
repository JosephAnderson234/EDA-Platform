import { useState } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';

export type CodeStep = { label: string; code: string };

// Monaco se carga bajo demanda desde el CDN del loader (@monaco-editor/react),
// no desde nuestro bundle: son varios MB que sólo hacen falta en las páginas
// de operación, y una vez en caché sirve para todas.
const MIN_H = 160;
const MAX_H = 640;

/** Tema oscuro sobre la misma losa (`--slab`) que usan los bloques de código. */
const defineTheme: BeforeMount = (monaco) => {
  const slab =
    getComputedStyle(document.documentElement).getPropertyValue('--slab').trim() || '#14171c';
  monaco.editor.defineTheme('eda-slab', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': slab,
      'editorGutter.background': slab,
      'editor.lineHighlightBackground': '#ffffff08',
      'editor.lineHighlightBorder': '#00000000',
    },
  });
};

/**
 * El brief prohíbe mostrar el código como bloque estático: siempre editable y
 * siempre progresivo (paso 1 nodo → paso N implementación completa).
 * No hay runtime de C++: el editor sirve para tocar y experimentar.
 *
 * La losa es oscura en los dos temas, para que el código no se confunda nunca
 * con la prosa.
 */
export default function CodeEditor({ steps }: { steps: CodeStep[] }) {
  const [i, setI] = useState(0);
  const [code, setCode] = useState(steps.map((s) => s.code));
  const [height, setHeight] = useState(MIN_H);

  // Alto = alto del contenido (acotado): el editor crece con el código en vez
  // de dejar un hueco fijo o un scroll interno en los pasos cortos.
  const onMount: OnMount = (editor) => {
    const fit = () => setHeight(Math.min(MAX_H, Math.max(MIN_H, editor.getContentHeight())));
    editor.onDidContentSizeChange(fit);
    fit();
  };

  const update = (value: string) =>
    setCode((prev) => prev.map((c, idx) => (idx === i ? value : c)));

  const pretty = (label: string) => label.replace(/^step-\d+-/, '').replace(/-/g, ' ');
  const dirty = code[i] !== steps[i].code;

  return (
    <div className="my-12 overflow-hidden rounded-lg border border-[var(--rule)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--fill)] px-4 py-2">
        <span className="tag">implementación progresiva</span>
        <span className="tag">
          {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </span>
      </div>

      {/* Los pasos como una ruta, no como pestañas sueltas: se ve que van en orden. */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--rule)] px-3 py-2.5">
        {steps.map((s, idx) => (
          <div key={s.label} className="flex items-center">
            {idx > 0 && (
              <span
                className={`mx-1 h-px w-4 transition-colors duration-300 ${
                  idx <= i ? 'bg-[var(--accent)]' : 'bg-[var(--rule)]'
                }`}
              />
            )}
            <button
              onClick={() => setI(idx)}
              aria-current={idx === i}
              className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1.5 text-[0.8125rem] transition-colors ${
                idx === i
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : idx < i
                    ? 'text-[var(--ink)] hover:bg-[var(--fill)]'
                    : 'text-[var(--muted)] hover:bg-[var(--fill)]'
              }`}
            >
              <span
                className={`grid h-5 w-5 flex-none place-items-center rounded-full font-mono text-[0.625rem] ${
                  idx === i
                    ? 'bg-[color-mix(in_srgb,var(--accent-ink)_25%,transparent)]'
                    : 'bg-[var(--sunken)]'
                }`}
              >
                {idx + 1}
              </span>
              {pretty(s.label)}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--slab)] py-2">
        <Editor
          height={height}
          language="cpp"
          path={`${steps[i].label}.cpp`}
          value={code[i]}
          onChange={(v) => update(v ?? '')}
          beforeMount={defineTheme}
          onMount={onMount}
          theme="eda-slab"
          loading={<span className="tag px-4 text-[var(--slab-ink)]">cargando editor…</span>}
          options={{
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 13.5,
            lineHeight: 21,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            folding: false,
            renderLineHighlight: 'line',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { alwaysConsumeMouseWheel: false, verticalScrollbarSize: 8 },
            padding: { top: 4, bottom: 4 },
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--rule)] bg-[var(--fill)] px-4 py-2">
        <span className="tag">{dirty ? 'modificado' : 'editable — tócalo'}</span>
        {dirty && (
          <button
            onClick={() => update(steps[i].code)}
            className="tag transition-colors hover:text-[var(--accent)]"
          >
            restaurar
          </button>
        )}
      </div>
    </div>
  );
}
