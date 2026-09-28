// Familia `persistent`: fat-nodes, path-copying, retroactive-priority-queue.
// Tres modos bajo un dispatcher — path copying (paneles v0/v1 con aristas de
// compartición), árbol de versiones (recorrido de Euler) y nodo gordo
// (registro de modificaciones + split). Los tres comparten `tidy`/`scale`.

import { tidy, scale, type OrderedNode } from '../shared/tidy-tree.ts';
import { boxWidth, NODE_W, NODE_H, LINE_H, PAD_X, type Frame, type CanvasNode, type CanvasEdge, type CanvasGroup, type CanvasText } from '../canvas-types.ts';

export const W = 720;
const ROW_GAP = 56;
const TOP = 34;
const PANEL_GAP = 40;

export type PersistentMode = 'path-copying' | 'version-tree' | 'fat-node';
export type PersistentNodeState = 'idle' | 'copied' | 'shared' | 'muted';

export type PersistentField = { name: string; value: string | number; time?: number };

export type PersistentNode = {
  id: string;
  value: string | number;
  parent?: string | null;
  /** id de panel/versión; default: la única versión del paso. */
  version?: string;
  state?: PersistentNodeState;
  /** Nodo gordo: registro de modificaciones, en orden. */
  fields?: PersistentField[];
  /** Representa un subárbol completo (compartido o no): se dibuja como
   * triángulo (`shape: 'subtree'`), igual que en la familia `tree`. */
  collapsed?: boolean;
  /** Etiqueta chica arriba de la caja — p.ej. "campo: Value" para marcar de
   * qué campo del enum es esta entrada del registro. */
  tag?: string;
};

export type PersistentLink = { from: string; to: string; kind?: 'tree' | 'shared' | 'pointer'; label?: string };
/** Puntero entrante que un split puede redirigir (conserva su `id` entre
 * pasos: eso es lo que hace que la flecha se anime en vez de remontarse). */
export type PersistentPort = { id: string; label?: string; to: string };

export type PersistentStep = {
  note: string;
  /** default 'path-copying' */
  mode?: PersistentMode;
  nodes: PersistentNode[];
  /** Si falta, se derivan de `parent` con kind 'tree'. */
  links?: PersistentLink[];
  /** Paneles de versión, en orden de izquierda a derecha (path-copying). */
  versions?: { id: string; label: string }[];
  ports?: PersistentPort[];
  highlight?: string[];
  /** Secuencia de Euler acumulada (version-tree). */
  caption?: string;
};

function toOrdered(nodes: PersistentNode[]): OrderedNode[] {
  return nodes.map((n) => ({ id: n.id, label: String(n.value), parent: n.parent ?? null }));
}

function deriveLinks(nodes: PersistentNode[]): PersistentLink[] {
  return nodes.filter((n) => n.parent).map((n) => ({ from: n.parent!, to: n.id, kind: 'tree' as const }));
}

/** Path copying: un panel por versión, lado a lado. Cada nodo se posiciona
 * dentro del panel al que pertenece (`version`); las aristas `shared` cruzan
 * de un panel a otro con curvatura, para pasar por encima de las cajas en
 * vez de por debajo. Se eligen paneles (no superposición diagonal) porque un
 * desplazamiento menor que la caja de un nodo mete uno dentro del otro y hace
 * el no-solape intestable; además es más honesto con el concepto: dos raíces
 * coexistiendo, no una raíz "movida". */
function layoutPathCopying(step: PersistentStep): Frame {
  const versions = step.versions ?? [{ id: '__default', label: '' }];
  const defaultPanelWidth = (W - PANEL_GAP * (versions.length - 1)) / versions.length;

  const outNodes: CanvasNode[] = [];
  const panelBox = new Map<string, { x0: number; width: number }>();
  let maxY = TOP;
  let x0 = 0;

  for (const v of versions) {
    const nodesInVersion = step.nodes.filter((n) => (n.version ?? versions[0].id) === v.id);
    const unscaled = tidy(toOrdered(nodesInVersion));

    // El ancho por defecto (dividir W en partes iguales) asume cajas de
    // NODE_W; una etiqueta como "[1,1]" es más ancha, y en un panel angosto
    // con varias hojas por columna eso puede solapar cajas vecinas. Se mide
    // el ancho que realmente hace falta y se usa el mayor de los dos.
    const xs = unscaled.map((p) => p.x);
    const span = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
    const maxBoxW = Math.max(NODE_W, ...nodesInVersion.map((n) => boxWidth(String(n.value))));
    const neededWidth = (span + 2) * (maxBoxW + 6);
    const panelWidth = Math.max(defaultPanelWidth, neededWidth + 32);

    panelBox.set(v.id, { x0, width: panelWidth });
    const placed = scale(unscaled, { x0: x0 + 16, width: panelWidth - 32, y0: TOP, rowGap: ROW_GAP });
    const collapsedById = new Map(nodesInVersion.map((n) => [n.id, n.collapsed]));
    for (const p of placed) {
      const collapsed = collapsedById.get(p.id);
      outNodes.push(
        collapsed
          ? { id: p.id, label: p.label, x: p.x, y: p.y, shape: 'subtree', w: boxWidth(p.label, 14, 44), h: 40 }
          : { id: p.id, label: p.label, x: p.x, y: p.y, w: boxWidth(p.label) },
      );
      maxY = Math.max(maxY, p.y);
    }
    x0 += panelWidth + PANEL_GAP;
  }

  // Los paneles se dimensionan todos a la misma altura (la del más profundo)
  // después de posicionar, así que ninguno queda más bajo que el árbol que
  // en realidad contiene.
  const groups: CanvasGroup[] = versions.map((v) => {
    const { x0: gx, width } = panelBox.get(v.id)!;
    return { id: v.id, label: v.label, x: gx, y: TOP - 24, w: width, h: maxY - TOP + 24 + 30 };
  });

  const links = step.links ?? deriveLinks(step.nodes);
  const posById = new Map(outNodes.map((n) => [n.id, n]));
  const outEdges: CanvasEdge[] = links.map((l) => {
    const kind = l.kind ?? 'tree';
    const from = posById.get(l.from);
    const to = posById.get(l.to);
    const curve = kind === 'shared' && from && to && from.x !== to.x ? Math.abs(from.x - to.x) * 0.18 : 0;
    return { from: l.from, to: l.to, kind, curve, label: l.label };
  });

  // PersistentNodeState (idle/copied/shared/muted) es un subconjunto del
  // vocabulario de estados del canvas: se pasa tal cual.
  const stateByNode = new Map(step.nodes.map((n) => [n.id, n.state]));
  for (const n of outNodes) {
    const s = stateByNode.get(n.id);
    if (s && s !== 'idle') n.state = s;
  }

  const totalWidth = groups.length ? Math.max(W, Math.max(...groups.map((g) => g.x + g.w))) : W;
  return { nodes: outNodes, edges: outEdges, groups, annotations: [], height: maxY + 40, width: totalWidth };
}

/** Árbol de versiones + recorrido de Euler linealizado como anotación que
 * crece paso a paso. */
function layoutVersionTree(step: PersistentStep): Frame {
  const placed = scale(tidy(toOrdered(step.nodes)), { x0: 20, width: W - 40, y0: TOP, rowGap: ROW_GAP });
  const byId = new Map(step.nodes.map((n) => [n.id, n]));
  const outNodes: CanvasNode[] = placed.map((p) => ({
    id: p.id,
    label: p.label,
    x: p.x,
    y: p.y,
    state: byId.get(p.id)?.state,
  }));
  const outEdges: CanvasEdge[] = (step.links ?? deriveLinks(step.nodes)).map((l) => ({
    from: l.from,
    to: l.to,
    kind: l.kind ?? 'tree',
  }));
  const maxY = Math.max(TOP, ...placed.map((p) => p.y));
  const annotations: CanvasText[] = step.caption
    ? [{ id: 'euler', text: step.caption, x: W / 2, y: maxY + 30, anchor: 'middle', state: 'active' }]
    : [];
  return { nodes: outNodes, edges: outEdges, groups: [], annotations, height: maxY + 50, width: W };
}

/** Nodo gordo: registro de modificaciones como filas de `(campo, valor, t)`,
 * y los `p` punteros entrantes como `port`s que un split puede redirigir sin
 * remontar (mismo `id` de puerto, sólo cambia su `to`). El alto, igual que
 * el ancho, se mide del contenido real de ESTE paso (un registro de 2
 * entradas no es tan alto como uno de 2p=4) en vez de un valor fijo: un
 * registro largo, un `tag` o un `caption` cerca del borde superior son
 * justo lo que un alto fijo no contemplaba, y el zoom-fit de
 * VisualizationCanvas (que sí escala por el eje que haga falta) terminaba
 * sacándolos del viewBox por arriba en un paso angosto. */
export function layoutFatNodes(step: PersistentStep): Frame {
  const GAP = 46;

  // Primera pasada: medir cada nodo antes de decidir dónde va el eje
  // horizontal de los nodos — hace falta el h máximo para eso.
  const dims = step.nodes.map((n) => {
    const lines = n.fields
      ? [String(n.value), ...n.fields.map((f) => `${f.name}=${f.value}${f.time !== undefined ? ` @${f.time}` : ''}`)]
      : undefined;
    const w = n.collapsed
      ? boxWidth(String(n.value), 14, 44)
      : lines
        ? Math.max(...lines.map((l) => boxWidth(l, 12, 0))) + 2 * PAD_X
        : boxWidth(String(n.value));
    const h = n.collapsed ? 40 : lines ? LINE_H * lines.length + 12 : NODE_H;
    return { n, lines, w, h };
  });

  const maxNodeH = Math.max(NODE_H, ...dims.map((d) => d.h));
  const ports = step.ports ?? [];
  // Rango vertical que ya usaban los ports (140px de punta a punta con 2+),
  // ahora relativo al eje de los nodos en vez de a un y=90 fijo.
  const portSpan = ports.length > 1 ? 140 : 0;
  const rowSpan = Math.max(maxNodeH, portSpan);

  const TOP_PAD = 16;
  const TAG_ROOM = step.nodes.some((n) => n.tag) ? 18 : 0;
  const CAPTION_ROOM = step.caption ? 30 : 0;
  const BOTTOM_PAD = 20;
  const y = TOP_PAD + CAPTION_ROOM + TAG_ROOM + rowSpan / 2;

  const outNodes: CanvasNode[] = [];
  let x = 60;
  for (const { n, lines, w, h } of dims) {
    x += w / 2;
    outNodes.push({
      id: n.id,
      label: String(n.value),
      x,
      y,
      shape: n.collapsed ? 'subtree' : lines ? 'record' : 'box',
      lines: n.collapsed ? undefined : lines,
      divider: !n.collapsed && lines ? 0 : undefined,
      w,
      h: n.collapsed ? 40 : lines ? h : undefined,
      state: n.state,
      tag: n.tag,
    });
    x += w / 2 + GAP;
  }

  const portGap = ports.length > 1 ? portSpan / (ports.length - 1) : 0;
  ports.forEach((port, i) => {
    const py = y - portSpan / 2 + i * portGap;
    outNodes.push({ id: port.id, label: port.label ?? '', x: 20, y: py, shape: 'port' });
  });

  const outEdges: CanvasEdge[] = [
    ...(step.links ?? []).map((l) => ({ from: l.from, to: l.to, kind: l.kind ?? ('pointer' as const), arrow: true })),
    ...ports.map((port) => ({ from: port.id, to: port.to, id: port.id, kind: 'pointer' as const, arrow: true })),
  ];

  // `caption`: texto chico centrado arriba del registro — la condición que
  // se está evaluando en este paso (p.ej. "campo == Next?"), no la nota de
  // abajo (que ya explica el paso en prosa completa).
  const annotations: CanvasText[] = step.caption
    ? [{ id: 'condition', text: step.caption, x: (x + 60) / 2, y: TOP_PAD + 10, anchor: 'middle', state: 'muted' }]
    : [];

  const height = y + rowSpan / 2 + BOTTOM_PAD;

  return { nodes: outNodes, edges: outEdges, groups: [], annotations, height, width: x + 60 };
}

export function layout(step: PersistentStep): Frame {
  const mode = step.mode ?? 'path-copying';
  if (mode === 'version-tree') return layoutVersionTree(step);
  if (mode === 'fat-node') return layoutFatNodes(step);
  return layoutPathCopying(step);
}
