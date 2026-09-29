// Contrato de VisualizationCanvas + convención visual de estados. Puro: sin
// React, sin DOM, sin JSX — así lo puede importar cualquier layout.ts de
// cualquier familia sin romper `node --test` (type-stripping nativo de Node,
// que no puede quitar JSX de un .tsx).
//
// Todo lo que no era parte del contrato original (CanvasNode/CanvasEdge/
// CanvasStep con sólo {id,label,x,y} / {from,to} / {note,nodes,edges,
// highlight}) es OPCIONAL: un CanvasStep de la familia `tree` sigue siendo
// válido tal cual y se renderiza idéntico a como lo hacía antes.

/** Caja de nodo por defecto: la misma que hoy hardcodea el canvas. */
export const NODE_W = 38;
export const NODE_H = 32;
/** Celda de arreglo (familia range-tree/layers): esquinas rectas, sin el aire
 * de una caja de nodo. */
export const CELL_W = 34;
export const CELL_H = 26;
/** Puerto de un puntero entrante (nodo gordo / split): un punto, no una caja. */
export const PORT_R = 4.5;
/** Alto de una fila de texto dentro de un nodo `record` (nodo gordo). */
export const LINE_H = 15;
export const PAD_X = 10;

/** Ancho aproximado de un glyph de IBM Plex Mono al tamaño dado. */
export function charW(fontSize: number): number {
  return fontSize * 0.6;
}

/** Ancho mínimo para que `text` (mono, `fontSize`) no se salga de la caja. */
export function boxWidth(text: string, fontSize = 14, min = NODE_W): number {
  return Math.max(min, text.length * charW(fontSize) + 2 * PAD_X);
}

export type NodeShape = 'box' | 'cell' | 'record' | 'port' | 'subtree';

/**
 * Vocabulario cerrado de estados — ninguna familia inventa uno nuevo.
 * `active` es el ÚNICO que usa el azul (`--accent`). `marked` (ámbar,
 * delimitador) y `answer` (carmesí, respuesta canónica) son los otros dos
 * estados con color — cada uno con su propia variable, nunca `--accent`.
 * `shared`/`copied`/`muted` siguen sin color: se distinguen por relleno,
 * contorno, opacidad y trazo. Ver AGENTS.md § Diseño.
 */
export const NODE_STATES = [
  'idle',
  'active',
  'marked',
  'answer',
  'shared',
  'copied',
  'muted',
] as const;
export type NodeState = (typeof NODE_STATES)[number];

export type EdgeKind = 'tree' | 'shared' | 'pointer';
export type EdgeState = 'idle' | 'active' | 'muted';

export type CanvasNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Nombre de variable/puntero mostrado ARRIBA de la caja (p.ej. "p", "x",
   * "headLeft") cuando el id del nodo no es el valor que se lee dentro —
   * "p(8)" en la prosa sin esto se veía como una caja con sólo "8" adentro,
   * sin ninguna pista de que ese nodo se llama `p`. Opcional: la mayoría
   * de los diagramas del curso usan ids técnicos (n4, v1, t2) que NO
   * deberían mostrarse así — sólo se pinta cuando el autor lo pide. */
  tag?: string;
  /** default 'box' */
  shape?: NodeShape;
  /** default NODE_W / NODE_H según `shape` */
  w?: number;
  h?: number;
  /** Contenido multi-línea (nodo gordo: campo, valor, tiempo). Si falta se usa `label`. */
  lines?: string[];
  /** Índice de fila tras la cual va la regla separadora de un `record`. */
  divider?: number;
  /** Si falta, se deriva de `highlight` (compatibilidad con `tree`). */
  state?: NodeState;
};

export type CanvasEdge = {
  from: string;
  to: string;
  /** Key estable — hace falta cuando dos aristas pueden compartir `from-to`
   * entre pasos con significados distintos (path copying). Default `${from}-${to}`. */
  id?: string;
  /** default 'tree' */
  kind?: EdgeKind;
  /** Si falta, se deriva de `highlight` (compatibilidad con `tree`). */
  state?: EdgeState;
  /** default false */
  arrow?: boolean;
  /** Punta de flecha también en `from` — un par real de punteros opuestos
   * entre los mismos dos nodos (izquierda/derecha de una lista circular de
   * hermanos) dibujado como UNA arista, no dos superpuestas. default false. */
  arrowStart?: boolean;
  /** Desviación perpendicular del control cuadrático, en px. default 0 (recta). */
  curve?: number;
  label?: string;
};

/** Panel de fondo: versiones coexistiendo, el árbol secundario 2D, una fila
 * de arreglo. Permite "un árbol dentro de otro" sin anidar el modelo. */
export type CanvasGroup = {
  id: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** default 'panel' */
  style?: 'panel' | 'ghost';
};

/** Anotación libre: la secuencia de Euler creciendo, la etiqueta `[5,16]`
 * de una consulta, los índices pL/pR de un puente. */
export type CanvasText = {
  id: string;
  text: string;
  x: number;
  y: number;
  /** default 'start' */
  anchor?: 'start' | 'middle' | 'end';
  /** default 12 */
  size?: number;
  /** default 'idle' */
  state?: 'idle' | 'active' | 'muted';
};

export type CanvasStep = {
  note: string;
  /** `note` pre-renderada en build (KaTeX + markdown en línea). */
  noteHtml?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  highlight: string[];
  groups?: CanvasGroup[];
  annotations?: CanvasText[];
  /** Ancho/alto que necesita este paso, si es menor que el más grande de
   * todos — el canvas hace zoom-fit (nunca estira) a este tamaño y lo
   * centra en ambos ejes. Sin `height`, sólo se ajustaba el ancho: un paso
   * angosto con contenido alto (un registro de varias líneas, un tag, un
   * caption cerca del borde) terminaba con un zoom pensado sólo para el
   * eje horizontal, que en el vertical lo sacaba del viewBox por arriba. */
  width?: number;
  height?: number;
};

/** Lo que devuelve el layout puro de cada familia para UN paso. */
export type Frame = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  groups: CanvasGroup[];
  annotations: CanvasText[];
  /** Alto que necesita este paso. */
  height: number;
  /** Ancho que necesita este paso, si es mayor que el ancho por defecto de
   * la familia (p.ej. un registro de nodo gordo con muchas modificaciones). */
  width?: number;
};

/** Un nodo sin `state` explícito hereda el comportamiento de hoy: activo si
 * está en `highlight`, si no, en reposo. */
export function resolveState(node: { id: string; state?: NodeState }, highlight: string[]): NodeState {
  if (node.state) return node.state;
  return highlight.includes(node.id) ? 'active' : 'idle';
}

export function resolveEdgeState(
  edge: { from: string; to: string; state?: EdgeState },
  highlight: string[],
): EdgeState {
  if (edge.state) return edge.state;
  return highlight.includes(edge.from) || highlight.includes(edge.to) ? 'active' : 'idle';
}

export type NodeVisual = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
  opacity: number;
  text: string;
  /** Doble contorno = frontera (el amarillo del profesor: delimitador). */
  double?: boolean;
};

/** Nombre en palabras del estado, para el `<title>` accesible del nodo: el
 * estado no puede depender sólo del trazo para quien usa lector de pantalla. */
export const STATE_LABEL: Record<NodeState, string> = {
  idle: 'en reposo',
  active: 'activo — lo que se toca en este paso',
  marked: 'delimitador',
  answer: 'respuesta canónica',
  shared: 'compartido con la versión anterior',
  copied: 'copiado en esta versión',
  muted: 'descartado',
};

/**
 * Estilo visual de cada estado. `active` es el ÚNICO que menciona
 * `var(--accent)` — es la regla del brief convertida en función, y
 * `canvas-types.test.ts` la verifica por máquina.
 */
export function nodeStyle(state: NodeState): NodeVisual {
  switch (state) {
    case 'idle':
      return { fill: 'var(--paper)', stroke: 'var(--rule)', strokeWidth: 1.5, opacity: 1, text: 'var(--ink)' };
    case 'active':
      return {
        fill: 'var(--accent)',
        stroke: 'var(--accent)',
        strokeWidth: 1.5,
        opacity: 1,
        text: 'var(--accent-ink)',
      };
    case 'marked':
      return {
        fill: 'var(--marked)',
        stroke: 'var(--marked-ink)',
        strokeWidth: 2,
        opacity: 1,
        text: 'var(--marked-ink)',
        double: true,
      };
    case 'answer':
      return { fill: 'var(--answer)', stroke: 'var(--answer)', strokeWidth: 1.5, opacity: 1, text: 'var(--answer-ink)' };
    case 'shared':
      return {
        fill: 'var(--sunken)',
        stroke: 'var(--rule)',
        strokeWidth: 1.5,
        dash: '4 3',
        opacity: 0.75,
        text: 'var(--muted)',
      };
    case 'copied':
      return { fill: 'var(--paper)', stroke: 'var(--ink)', strokeWidth: 2, opacity: 1, text: 'var(--ink)' };
    case 'muted':
      return {
        fill: 'var(--fill)',
        stroke: 'var(--rule)',
        strokeWidth: 1.5,
        dash: '2 3',
        opacity: 0.45,
        text: 'var(--faint)',
      };
  }
}

export type EdgeVisual = { stroke: string; strokeWidth: number; dash?: string };

/**
 * Estilo de arista por familia + estado. Una arista sólo se pinta de azul
 * cuando une algo activo — nunca por decoración.
 */
export function edgeStyle(kind: EdgeKind, state: EdgeState): EdgeVisual {
  if (state === 'active') return { stroke: 'var(--accent)', strokeWidth: 2 };
  if (state === 'muted') return { stroke: 'var(--rule)', strokeWidth: 1.5, dash: '2 3' };
  switch (kind) {
    case 'tree':
      return { stroke: 'var(--rule)', strokeWidth: 1.5 };
    case 'shared':
      return { stroke: 'var(--rule)', strokeWidth: 1.5, dash: '4 3' };
    case 'pointer':
      return { stroke: 'var(--ink)', strokeWidth: 1.5 };
  }
}
