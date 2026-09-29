import { useRef, useState } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import { EDITOR_BG, LANGUAGE, THEME, setupOneDark } from './monaco-one-dark';

export type CodeStep = { label: string; code: string };

// Monaco se carga bajo demanda desde el CDN del loader (@monaco-editor/react),
// no desde nuestro bundle: son varios MB que sólo hacen falta en las páginas
// de operación, y una vez en caché sirve para todas.
const MIN_H = 160;
const MAX_H = 640;

// Constantes de módulo, no literales en el JSX: un objeto nuevo en cada
// render hace que @monaco-editor/react llame `updateOptions` en cada tecla.
// Métrica y gutter calcados del editor anterior (CodeMirror + One Dark):
// monospace del sistema a 13.5px, interlineado 1.4, 4px arriba/abajo,
// números de línea angostos y sin guías ni pares de llaves coloreados.
const OPTIONS = {
  fontFamily: 'monospace',
  fontSize: 13.5,
  lineHeight: 19,
  wordWrap: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  folding: false,
  glyphMargin: false,
  lineNumbersMinChars: 2,
  lineDecorationsWidth: 8,
  renderLineHighlight: 'gutter',
  guides: { indentation: false },
  bracketPairColorization: { enabled: false },
  occurrencesHighlight: 'off',
  matchBrackets: 'near',
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  scrollbar: { alwaysConsumeMouseWheel: false, verticalScrollbarSize: 8 },
  padding: { top: 4, bottom: 4 },
  // Sólo para cambios de ANCHO (ventana, riel); el alto lo fija `fit()`.
  automaticLayout: true,
  tabSize: 4,
} as const;
const LOADING = <span className="tag px-4 text-[#7d8799]">cargando editor…</span>;

const setup: BeforeMount = (monaco) => setupOneDark(monaco);

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
  const boxRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  // Alto = alto del contenido (acotado): el editor crece con el código en vez
  // de dejar un hueco fijo o un scroll interno en los pasos cortos.
  // Se aplica directo al DOM + `editor.layout()` en el mismo frame. Pasarlo
  // por estado de React (re-render → automaticLayout un frame después) hacía
  // que Monaco pintara un frame con el tamaño viejo en cada salto de línea:
  // el parpadeo.
  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
    const fit = () => {
      const box = boxRef.current;
      if (!box) return;
      const h = Math.min(MAX_H, Math.max(MIN_H, editor.getContentHeight()));
      if (box.style.height === `${h}px`) return;
      box.style.height = `${h}px`;
      editor.layout({ width: box.clientWidth, height: h });
    };
    editor.onDidContentSizeChange(fit);
    editor.onDidChangeModel(fit); // cambiar de paso = otro modelo, otro alto
    fit();
  };

  // El editor NO es controlado: cada paso es su propio modelo de Monaco
  // (prop `path`), que conserva sus ediciones y su historial de deshacer al
  // cambiar de paso. `code` sólo sirve para saber si está "modificado".
  const update = (value: string) =>
    setCode((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  const restore = () => editorRef.current?.setValue(steps[i].code);

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

      <div style={{ background: EDITOR_BG }}>
        <div ref={boxRef} style={{ height: MIN_H }}>
          <Editor
            height="100%"
            language={LANGUAGE}
            path={`${steps[i].label}.cpp`}
            defaultValue={steps[i].code}
            onChange={(v) => update(v ?? '')}
            beforeMount={setup}
            onMount={onMount}
            theme={THEME}
            loading={LOADING}
            options={OPTIONS}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--rule)] bg-[var(--fill)] px-4 py-2">
        <span className="tag">{dirty ? 'modificado' : 'editable — tócalo'}</span>
        {dirty && (
          <button
            onClick={restore}
            className="tag transition-colors hover:text-[var(--accent)]"
          >
            restaurar
          </button>
        )}
      </div>
    </div>
  );
}
