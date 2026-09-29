import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  NODE_W,
  NODE_H,
  CELL_W,
  CELL_H,
  boxWidth,
  PORT_R,
  LINE_H,
  STATE_LABEL,
  resolveState,
  resolveEdgeState,
  nodeStyle,
  edgeStyle,
  type CanvasNode,
  type CanvasEdge,
  type CanvasGroup,
  type CanvasText,
  type CanvasStep,
} from '../visualizations/canvas-types.ts';

// Tipos y constantes viven en canvas-types.ts (puro, sin JSX: lo importan los
// layout.ts de cada familia, y `node --test` no puede quitar JSX de un .tsx).
// Se re-exportan aquí para que nada que ya importe de este archivo — como
// TreeVisualization.tsx — tenga que cambiar.
export type { CanvasNode, CanvasEdge, CanvasGroup, CanvasText, CanvasStep };

type Props = {
  steps: CanvasStep[];
  height?: number;
  width?: number;
};

/** Extremo de una arista recortado contra el borde de la caja destino, para
 * que una punta de flecha no quede enterrada bajo el nodo. Sólo se usa si la
 * arista pide `arrow` — las aristas de árbol siguen yendo centro a centro,
 * exactamente como hoy. */
function trimToBox(from: { x: number; y: number }, to: CanvasNode): { x: number; y: number } {
  const w = (to.w ?? NODE_W) / 2;
  const h = (to.h ?? NODE_H) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return { x: to.x, y: to.y };
  const scale = 1 / Math.max(Math.abs(dx) / w, Math.abs(dy) / h);
  return { x: to.x - dx * scale, y: to.y - dy * scale };
}

/**
 * Base compartida de todas las familias de visualización (árboles, grafos,
 * persistentes, range trees). No sabe qué está dibujando: recibe nodos ya
 * posicionados y los anima entre pasos.
 *
 * El movimiento sale gratis: cada nodo conserva su elemento del DOM entre pasos
 * (React lo reusa por `key`), así que basta una transición CSS sobre `transform`
 * para que se deslice a su posición nueva en vez de saltar.
 */
export default function VisualizationCanvas({ steps, width = 640, height = 260 }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const arrowId = useId();

  const last = steps.length - 1;
  const step = steps[Math.min(i, last)];

  const go = useCallback(
    (n: number) => setI((prev) => Math.max(0, Math.min(last, prev + n))),
    [last],
  );

  // Arranca sola la primera vez que entra en pantalla: si no, el usuario ve un
  // diagrama estático y nunca descubre que hay pasos.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    // Una nota de una cláusula y una de tres oraciones no merecen el mismo
    // tiempo en pantalla — 900ms de piso más ~45ms por palabra, acotado para
    // que un paso larguísimo no estanque el autoplay.
    const words = (step.note ?? '').trim().split(/\s+/).filter(Boolean).length;
    const delay = Math.min(3200, Math.max(900, 900 + words * 45));
    const t = setTimeout(() => setI((p) => p + 1), delay);
    return () => clearTimeout(t);
  }, [playing, i, last, step.note]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  const pos = new Map(step.nodes.map((n) => [n.id, n]));
  const progress = steps.length > 1 ? (i / last) * 100 : 100;
  const groups = step.groups ?? [];
  const annotations = step.annotations ?? [];
  // Un paso con menos contenido que el más grande (p.ej. un registro de nodo
  // gordo recién empezado, o uno con un solo nodo angosto) se ve más CHICO
  // si no se hace nada — el `viewBox` (fijo en `width`/`height`, el paso más
  // grande de todos) le deja de sobra alrededor. Se corrige con un zoom
  // real: un único `<g transform="scale(...)">` alrededor de TODO el
  // dibujo, centrado en el punto medio del lienzo. `transform` en un `<g>`
  // es exactamente lo mismo que ya anima cada nodo (`translate` con
  // `transition: transform`) — mismo mecanismo, sin re-render ni
  // remontaje, sólo que aquí escala el grupo entero en vez de mover un nodo
  // suelto.
  //
  // El zoom se calcula por AMBOS ejes (`Math.min`, "contain") y no sólo por
  // ancho: si sólo importara el ancho, un paso angosto pero con contenido
  // alto (un registro de varias líneas, un tag, un caption cerca del borde)
  // recibía un zoom pensado para caber a lo ancho que en el eje vertical lo
  // sacaba del viewBox — el layout ya centra ese contenido en `width`/
  // `height` compartidos (ver PersistentVisualization), así que sólo falta
  // no escalarlo más de lo que el eje más corto tolera.
  const stepWidth = step.width ?? width;
  const stepHeight = step.height ?? height;
  const zoom = Math.min(width / stepWidth, height / stepHeight);
  const cx = width / 2;
  const cy = height / 2;
  const zoomTransform = `translate(${cx}, ${cy}) scale(${zoom}) translate(${-cx}, ${-cy})`;

  return (
    <figure
      ref={box}
      tabIndex={0}
      onKeyDown={onKey}
      className="my-12 overflow-hidden rounded-lg border border-[var(--rule)] focus:outline-none focus-visible:border-[var(--accent)]"
      aria-label="Visualización paso a paso. Usa las flechas izquierda y derecha."
    >
      {/* Barra de progreso: el primer indicio de que esto se mueve. */}
      <div className="h-0.5 w-full bg-[var(--sunken)]">
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="flex justify-center px-4 py-6"
        style={{
          background: 'var(--fill)',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted) 22%, transparent) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: width }}
          className="block w-full"
          role="img"
          aria-label={step.note}
        >
          <defs>
            <marker
              id={`${arrowId}-ink`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
            </marker>
            <marker
              id={`${arrowId}-accent`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
            </marker>
          </defs>

          <g
            transform={zoomTransform}
            style={{ transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }}
          >
          {groups.map((g) => (
            // La transición va en los atributos que de verdad cambian (x/y/
            // width/height en el rect, x/y en el label) — antes estaba en el
            // `<g>` envolvente, que nunca lleva `transform`, así que nunca
            // disparaba: un panel que se movía o cambiaba de tamaño entre
            // pasos (Union de heaps, versiones de path-copying, paneles
            // secundarios de range-tree) tele-transportaba en vez de deslizar.
            <g key={g.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={6}
                fill={g.style === 'ghost' ? 'transparent' : 'color-mix(in srgb, var(--muted) 6%, transparent)'}
                stroke="var(--rule)"
                strokeWidth={1}
                strokeDasharray={g.style === 'ghost' ? '3 3' : undefined}
                style={{ transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1), width 450ms cubic-bezier(.2,.7,.3,1), height 450ms cubic-bezier(.2,.7,.3,1)' }}
              />
              {g.label && (
                <text
                  x={g.x + 8}
                  y={g.y + 14}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.06em"
                  fill="var(--faint)"
                  style={{
                    textTransform: 'uppercase',
                    transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)',
                  }}
                >
                  {g.label}
                </text>
              )}
            </g>
          ))}

          {step.edges.map((e) => {
            const aRaw = pos.get(e.from);
            const bRaw = pos.get(e.to);
            if (!aRaw || !bRaw) return null;
            const state = resolveEdgeState(e, step.highlight);
            const visual = edgeStyle(e.kind ?? 'tree', state);
            const a = e.arrowStart ? trimToBox(bRaw, aRaw) : aRaw;
            const b = e.arrow ? trimToBox(a, bRaw) : bRaw;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            // `pointer` sin `curve` explícito ya no es una línea recta: dos
            // punteros opuestos entre el mismo par de nodos (el `left` de
            // uno = el `right` del otro) se dibujaban exactamente encima,
            // ilegibles. Un default FIJO (20px) se notaba entre nodos
            // lejanos pero se perdía entre nodos pegados (poco ángulo real
            // → las dos flechas casi se pisan) — ahora escala con la
            // distancia, con un piso más alto, así el par siempre queda
            // visiblemente separado sin que el autor tenga que adivinar.
            const curve = e.curve ?? (e.kind === 'pointer' ? Math.max(26, len * 0.24) : 0);
            // Entre dos HERMANOS (misma fila: `dy` ~0) la arista siempre se
            // curva hacia ABAJO, nunca hacia arriba — antes el signo salía
            // de `dx/dy`, que se invertía con la dirección del puntero, así
            // que el anillo de un padre con 3+ hijos (todos adyacentes entre
            // sí) mandaba el arco de "vuelta" (último → primero) hacia
            // arriba, atravesando la fila del padre y su propio puntero
            // `child`. Fuera de una fila (padre↔hijo) se deja el cálculo de
            // siempre: ahí no hay ambigüedad de signo que resolver.
            const sameRow = Math.abs(dy) < 1;
            const cx = sameRow ? mx : mx - (dy / len) * curve;
            const cy = sameRow ? my + Math.abs(curve) : my + (dx / len) * curve;
            const d = curve === 0 ? `M${a.x},${a.y} L${b.x},${b.y}` : `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`;
            return (
              <g key={e.id ?? `${e.from}-${e.to}`}>
                <path
                  d={d}
                  fill="none"
                  stroke={visual.stroke}
                  strokeWidth={visual.strokeWidth}
                  strokeDasharray={visual.dash}
                  markerStart={e.arrowStart ? `url(#${state === 'active' ? `${arrowId}-accent` : `${arrowId}-ink`})` : undefined}
                  markerEnd={e.arrow ? `url(#${state === 'active' ? `${arrowId}-accent` : `${arrowId}-ink`})` : undefined}
                  // `d` explícito (no `all`): `all` también intentaba transicionar
                  // `marker-end`/`fill`, que no son animables o no deben, y en
                  // navegadores sin soporte de interpolación de `d` (Safari
                  // &lt;16.4) degradaba de "no transiciona una cosa" a "no
                  // transiciona nada" por el shorthand.
                  style={{ transition: 'd 450ms cubic-bezier(.2,.7,.3,1), stroke 300ms, stroke-width 300ms' }}
                />
                {e.label && (
                  // `label` existía en el schema desde siempre pero nunca se
                  // pintaba — sin esto no hay forma de distinguir en el
                  // dibujo "este es el puntero left" de "este es right"
                  // cuando dos aristas `pointer` van entre el mismo par de
                  // nodos en direcciones opuestas. El chip de fondo evita que
                  // el texto se pierda encima de otra línea que cruza justo
                  // por el punto medio de la curva.
                  <g style={{ transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)' }} transform={`translate(${cx}, ${cy})`}>
                    <rect
                      x={-(e.label.length * 3.4 + 4)}
                      y={-6.5}
                      width={e.label.length * 6.8 + 8}
                      height={13}
                      rx={3}
                      fill="var(--paper)"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={10}
                      fontWeight={600}
                      fontFamily="var(--font-mono)"
                      fill={visual.stroke}
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {step.nodes.map((n) => {
            const state = resolveState(n, step.highlight);
            const visual = nodeStyle(state);
            const shape = n.shape ?? 'box';
            const [defaultW, defaultH] = shape === 'cell' ? [CELL_W, CELL_H] : [NODE_W, NODE_H];
            // La caja crece con su texto. Sin esto, una etiqueta larga
            // ("ins(3) <- se inserta aqui") se desborda de un recuadro de 38px.
            const w = n.w ?? boxWidth(String(n.label ?? ''), shape === 'cell' ? 11 : 13, defaultW);
            const h = n.h ?? defaultH;

            return (
              <g
                key={n.id}
                // El nombre accesible va en aria-label, NO en un <title>: React
                // 19 trata cualquier <title> como metadato de documento y lo iza
                // al <head> (está pensado para el título de la página, no para
                // el de un elemento SVG). El servidor lo vaciaba de su <g> y el
                // cliente no, lo que provocaba el "Minified React error #418" —
                // un desajuste de hidratación — en TODAS las páginas con
                // visualización. El escape hatch `itemProp` no lo evitaba dentro
                // del namespace SVG. aria-label da el mismo nombre accesible sin
                // crear ningún nodo que React pueda izar.
                role="img"
                aria-label={`${n.label} — ${STATE_LABEL[state]}`}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                  transition: 'transform 450ms cubic-bezier(.2,.7,.3,1)',
                }}
              >
                {shape === 'subtree' ? (
                  // Convención de los libros para "esto es un subárbol
                  // entero, no un nodo suelto": triángulo, vértice hacia el
                  // padre (arriba), base ancha abajo. El estado (idle/active/
                  // …) sigue viniendo de nodeStyle, igual que una caja.
                  <>
                    <polygon
                      points={`0,${-h / 2} ${-w / 2},${h / 2} ${w / 2},${h / 2}`}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    <text
                      x={0}
                      y={h / 2 - 11}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={500}
                      fontFamily="var(--font-mono)"
                      fill={visual.text}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms' }}
                    >
                      {n.label}
                    </text>
                  </>
                ) : shape === 'port' ? (
                  <>
                    <circle
                      r={PORT_R}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {n.label && (
                      <text
                        x={0}
                        y={-PORT_R - 6}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={500}
                        fontFamily="var(--font-mono)"
                        fill={visual.text}
                        opacity={visual.opacity}
                        style={{ transition: 'fill 300ms' }}
                      >
                        {n.label}
                      </text>
                    )}
                  </>
                ) : shape === 'record' ? (
                  <>
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx={4}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {visual.double && (
                      <rect
                        x={-w / 2 + 3}
                        y={-h / 2 + 3}
                        width={w - 6}
                        height={h - 6}
                        rx={2}
                        fill="none"
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                    {(n.lines ?? [n.label]).map((line, idx) => (
                      <text
                        key={idx}
                        x={0}
                        y={-h / 2 + LINE_H * (idx + 0.5)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fontFamily="var(--font-mono)"
                        fill={visual.text}
                      >
                        {line}
                      </text>
                    ))}
                    {n.divider !== undefined && (
                      <line
                        x1={-w / 2 + 4}
                        x2={w / 2 - 4}
                        y1={-h / 2 + LINE_H * (n.divider + 1)}
                        y2={-h / 2 + LINE_H * (n.divider + 1)}
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <rect
                      x={-w / 2}
                      y={-h / 2}
                      width={w}
                      height={h}
                      rx={shape === 'cell' ? 2 : 5}
                      fill={visual.fill}
                      stroke={visual.stroke}
                      strokeWidth={visual.strokeWidth}
                      strokeDasharray={visual.dash}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms, stroke 300ms, opacity 300ms' }}
                    />
                    {visual.double && (
                      <rect
                        x={-w / 2 + 3}
                        y={-h / 2 + 3}
                        width={w - 6}
                        height={h - 6}
                        rx={2}
                        fill="none"
                        stroke={visual.stroke}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={shape === 'cell' ? 12 : 14}
                      fontWeight={500}
                      fontFamily="var(--font-mono)"
                      fill={visual.text}
                      opacity={visual.opacity}
                      style={{ transition: 'fill 300ms' }}
                    >
                      {n.label}
                    </text>
                  </>
                )}
                {n.tag && (
                  // Nombre de variable/puntero arriba de la caja — "p" sobre
                  // "8", no sólo "8" solo. Sin esto, una nota que dice "p(8)"
                  // no tenía ninguna pista visual de cuál caja era `p`.
                  <text
                    x={0}
                    y={-h / 2 - 7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="var(--font-mono)"
                    fill="var(--muted)"
                    style={{ transition: 'x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)' }}
                  >
                    {n.tag}
                  </text>
                )}
              </g>
            );
          })}

          {annotations.map((a) => (
            <text
              key={a.id}
              x={a.x}
              y={a.y}
              textAnchor={a.anchor ?? 'start'}
              fontSize={a.size ?? 12}
              fontFamily="var(--font-mono)"
              fill={a.state === 'active' ? 'var(--accent)' : a.state === 'muted' ? 'var(--faint)' : 'var(--muted)'}
              style={{ transition: 'fill 300ms, x 450ms cubic-bezier(.2,.7,.3,1), y 450ms cubic-bezier(.2,.7,.3,1)' }}
            >
              {a.text}
            </text>
          ))}
          </g>
        </svg>
      </div>

      <figcaption className="border-t border-[var(--rule)]">
        {step.noteHtml ? (
          <p
            className="viz-note min-h-[3.25rem] px-5 py-3.5 text-[0.9375rem] leading-snug"
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: step.noteHtml }}
          />
        ) : (
          <p className="viz-note min-h-[3.25rem] px-5 py-3.5 text-[0.9375rem] leading-snug" aria-live="polite">
            {step.note}
          </p>
        )}

        <div className="flex items-center gap-1 border-t border-[var(--rule)] bg-[var(--fill)] px-3 py-2">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            className="rounded px-2.5 py-1 text-sm transition-colors hover:bg-[var(--sunken)] disabled:opacity-25 disabled:hover:bg-transparent"
            aria-label="Paso anterior"
          >
            ←
          </button>
          <button
            onClick={() => (i >= last ? (setI(0), setPlaying(true)) : setPlaying((p) => !p))}
            className="rounded px-3 py-1 text-[0.8125rem] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-wash)]"
          >
            {playing ? 'pausa' : i >= last ? 'repetir' : 'reproducir'}
          </button>
          <button
            onClick={() => go(1)}
            disabled={i === last}
            className="rounded px-2.5 py-1 text-sm transition-colors hover:bg-[var(--sunken)] disabled:opacity-25 disabled:hover:bg-transparent"
            aria-label="Paso siguiente"
          >
            →
          </button>

          <div className="ml-3 flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setPlaying(false); setI(idx); }}
                aria-label={`Paso ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === i ? 'w-5 bg-[var(--accent)]' : 'w-1.5 bg-[var(--rule)] hover:bg-[var(--muted)]'
                }`}
              />
            ))}
          </div>

          <span className="ml-auto font-mono text-[0.6875rem] tracking-widest text-[var(--faint)] uppercase">
            paso {i + 1}/{steps.length}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
