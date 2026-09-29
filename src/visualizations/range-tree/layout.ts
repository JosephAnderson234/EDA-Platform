// Familia `range-tree`: range-tree (1D y 2D anidado), fractional-cascading y
// layered-range-tree. Dos layouts, no uno — el caso de "capas" no es un
// árbol (son arreglos ordenados con puentes entre posiciones), forzarlo en
// el layout de árbol sería peor que tenerlos separados.

import { tidy, scale, type OrderedNode } from '../shared/tidy-tree.ts';
import { boxWidth, CELL_W, CELL_H, type Frame, type CanvasNode, type CanvasEdge, type CanvasGroup, type CanvasText } from '../canvas-types.ts';

export const W = 720;
const ROW_GAP = 56;
const TOP = 34;

export type RangeState = 'idle' | 'marked' | 'answer' | 'muted';
export type RangeMode = 'tree' | 'layers';

export type RangeNode = {
  id: string;
  value: string | number;
  parent?: string | null;
  state?: RangeState;
  /** 'primary' (default) | 'secondary' | cualquier otro id de panel del 2D anidado. */
  panel?: string;
};

export type RangePanel = { id: string; label: string; anchor?: string };

export type RangeArray = {
  id: string;
  label?: string;
  /** 0 = fila del padre, 1 = fila de los hijos. */
  row: number;
  /** default 'full' */
  slot?: 'left' | 'right' | 'full';
  cells: (string | number)[];
  states?: RangeState[];
};

export type RangeBridge = { from: string; fromIndex: number; to: string; toIndex: number; active?: boolean };

export type RangeStep = {
  note: string;
  noteHtml?: string;
  /** default 'tree' */
  mode?: RangeMode;
  nodes?: RangeNode[];
  panels?: RangePanel[];
  arrays?: RangeArray[];
  /** Si falta, se derivan por lower_bound — ver deriveBridges(). */
  bridges?: RangeBridge[];
  highlight?: string[];
  caption?: string;
};

function toOrdered(nodes: RangeNode[]): OrderedNode[] {
  return nodes.map((n) => ({ id: n.id, label: String(n.value), parent: n.parent ?? null }));
}

/** 1D (#29), la consulta (#35) y el 2D anidado (#47): árbol primario en X, y
 * un árbol secundario colgado del nodo ancla dentro de un panel propio.
 *
 * Propiedad importante: la geometría NUNCA depende de `state` — durante los
 * pasos de una consulta ningún nodo cambia de posición, sólo de color, que
 * es lo que hace legible el paso a paso. */
export function layoutRangeTree(step: RangeStep): Frame {
  const nodes = step.nodes ?? [];
  const primary = nodes.filter((n) => (n.panel ?? 'primary') === 'primary');
  const secondaryPanels = (step.panels ?? []).filter((p) => p.id !== 'primary');
  const hasSecondary = secondaryPanels.length > 0;

  const primaryWidth = hasSecondary ? W * 0.6 : W;
  const placedPrimary = scale(tidy(toOrdered(primary)), {
    x0: 20,
    width: primaryWidth - 40,
    y0: TOP,
    rowGap: ROW_GAP,
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const posById = new Map(placedPrimary.map((p) => [p.id, p]));

  const outNodes: CanvasNode[] = placedPrimary.map((p) => {
    const src = byId.get(p.id)!;
    return {
      id: p.id,
      label: p.label,
      x: p.x,
      y: p.y,
      w: boxWidth(p.label),
      state: src.state,
    };
  });

  const groups: CanvasGroup[] = [];
  let maxY = Math.max(TOP, ...placedPrimary.map((p) => p.y));
  const outEdges: CanvasEdge[] = primary
    .filter((n) => n.parent)
    .map((n) => ({ from: n.parent!, to: n.id, kind: 'tree' }));

  for (const panel of secondaryPanels) {
    const secondary = nodes.filter((n) => n.panel === panel.id);
    const panelX0 = W * 0.66;
    const panelWidth = W * 0.3;
    const panelTop = TOP - 8;
    const placedSecondary = scale(tidy(toOrdered(secondary)), {
      x0: panelX0 + 10,
      width: panelWidth - 20,
      y0: TOP,
      rowGap: ROW_GAP,
    });
    const secondaryById = new Map(secondary.map((n) => [n.id, n]));
    for (const p of placedSecondary) {
      const src = secondaryById.get(p.id)!;
      outNodes.push({ id: p.id, label: p.label, x: p.x, y: p.y, w: boxWidth(p.label), state: src.state });
    }
    for (const n of secondary) {
      if (n.parent) outEdges.push({ from: n.parent, to: n.id, kind: 'tree' });
    }
    const panelBottom = Math.max(TOP, ...placedSecondary.map((p) => p.y)) + 30;
    groups.push({
      id: panel.id,
      label: panel.label,
      x: panelX0,
      y: panelTop,
      w: panelWidth,
      h: panelBottom - panelTop,
      style: 'panel',
    });
    maxY = Math.max(maxY, panelBottom);

    if (panel.anchor && posById.get(panel.anchor) && placedSecondary[0]) {
      const root = placedSecondary.reduce((a, b) => (a.depth < b.depth ? a : b));
      outEdges.push({
        from: panel.anchor,
        to: root.id,
        id: `${panel.anchor}->${panel.id}`,
        kind: 'pointer',
        arrow: true,
        curve: 24,
      });
    }
  }

  const annotations: CanvasText[] = step.caption
    ? [{ id: 'caption', text: step.caption, x: W / 2, y: maxY + 26, anchor: 'middle', state: 'active' }]
    : [];

  return { nodes: outNodes, edges: outEdges, groups, annotations, height: maxY + (step.caption ? 46 : 20) };
}

/** Deriva los puentes padre→hijo por `lower_bound`: el primer índice `j` tal
 * que `child[j] >= parentValue`, exactamente el pL/pR que el propio Merge
 * del profesor ya calcula. Evita que el frontmatter escriba un puente
 * inconsistente a mano. */
export function deriveBridges(parent: RangeArray, child: RangeArray): RangeBridge[] {
  return parent.cells.map((value, i) => {
    let j = child.cells.findIndex((c) => c >= value);
    if (j === -1) j = Math.max(0, child.cells.length - 1);
    return { from: parent.id, fromIndex: i, to: child.id, toIndex: j, active: false };
  });
}

const slotBox = (slot: RangeArray['slot'] | undefined): { x0: number; width: number } => {
  if (slot === 'left') return { x0: 20, width: W / 2 - 30 };
  if (slot === 'right') return { x0: W / 2 + 10, width: W / 2 - 30 };
  return { x0: 20, width: W - 40 };
};

/** Layered range tree / fractional cascading: filas de celdas con puentes
 * punteados entre posiciones. No es un árbol. */
export function layoutLayers(step: RangeStep): Frame {
  const arrays = step.arrays ?? [];
  const outNodes: CanvasNode[] = [];
  const annotations: CanvasText[] = [];
  const cellPos = new Map<string, { x: number; y: number }>();

  for (const arr of arrays) {
    const { x0, width } = slotBox(arr.slot);
    const y = TOP + arr.row * 78;
    const n = arr.cells.length;
    const gap = Math.min(CELL_W + 4, width / Math.max(n, 1));
    const startX = x0 + width / 2 - (gap * (n - 1)) / 2;

    if (arr.label) {
      annotations.push({ id: `${arr.id}-label`, text: arr.label, x: x0 - 4, y, anchor: 'end' });
    }

    arr.cells.forEach((value, i) => {
      const x = startX + i * gap;
      cellPos.set(`${arr.id}:${i}`, { x, y });
      outNodes.push({
        id: `${arr.id}:${i}`,
        label: String(value),
        x,
        y,
        shape: 'cell',
        w: CELL_W,
        h: CELL_H,
        state: arr.states?.[i],
      });
    });
  }

  const bridges =
    step.bridges ??
    arrays
      .filter((a) => a.row === 0)
      .flatMap((parentArr) =>
        arrays
          .filter((c) => c.row === parentArr.row + 1 && (c.slot === 'left' || c.slot === 'right' || !c.slot))
          .flatMap((childArr) => deriveBridges(parentArr, childArr)),
      );

  const outEdges: CanvasEdge[] = bridges
    .map((b) => {
      const fromId = `${b.from}:${b.fromIndex}`;
      const toId = `${b.to}:${b.toIndex}`;
      const from = cellPos.get(fromId);
      const to = cellPos.get(toId);
      if (!from || !to) return null;
      const dir = to.x >= from.x ? 1 : -1;
      return {
        from: fromId,
        to: toId,
        id: `${fromId}->${toId}`,
        kind: 'pointer' as const,
        arrow: true,
        curve: 14 * dir,
        state: b.active ? ('active' as const) : undefined,
      };
    })
    .filter((e): e is CanvasEdge => e !== null);

  const maxRow = Math.max(0, ...arrays.map((a) => a.row));
  const height = TOP + maxRow * 78 + 40;

  return { nodes: outNodes, edges: outEdges, groups: [], annotations, height };
}

export function layout(step: RangeStep): Frame {
  return (step.mode ?? 'tree') === 'layers' ? layoutLayers(step) : layoutRangeTree(step);
}
