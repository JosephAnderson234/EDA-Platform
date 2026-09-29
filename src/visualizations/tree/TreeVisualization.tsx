import VisualizationCanvas, { type CanvasStep, type CanvasNode, type CanvasGroup } from '../../components/VisualizationCanvas';
import { boxWidth } from '../canvas-types';
import { layout, W, type TreeNode } from './layout';

export type TreeLink = {
  from: string;
  to: string;
  kind?: 'tree' | 'shared' | 'pointer';
  label?: string;
  curve?: number;
  /** Un par real de punteros opuestos entre los MISMOS dos nodos (`left`/
   * `right` de una lista circular de hermanos) es UNA arista con flecha en
   * ambos extremos — declarar las dos direcciones por separado las dibuja
   * exactamente superpuestas. */
  bidirectional?: boolean;
};
export type TreeStep = {
  note: string;
  noteHtml?: string;
  nodes: TreeNode[];
  highlight: string[];
  /** Aristas extra además de las derivadas de `parent` (p.ej. un puntero de
   * acceso directo indexado). Se agregan, no reemplazan las de `parent`. */
  links?: TreeLink[];
  /** Paneles lado a lado: cada uno es un árbol/bosque INDEPENDIENTE, con su
   * propia caja y etiqueta — para mostrar dos montículos que coexisten
   * antes de fusionarse (Union), no una sola mezcla prematura. Un nodo sin
   * `panel` cae en el primero. Si falta esto, el paso es un solo bosque,
   * como siempre. */
  panels?: { id: string; label: string }[];
};

const GAP = 28;
const TOP = 10;

function collapsedShape(n: { collapsed?: boolean; label: string }) {
  return n.collapsed ? { shape: 'subtree' as const, w: boxWidth(n.label, 14, 44), h: 40 } : {};
}

/**
 * Familia "árbol". Único trabajo: posicionar los nodos (ver ./layout.ts).
 * El render, la línea de tiempo y la animación los pone VisualizationCanvas.
 */
export default function TreeVisualization({ steps }: { steps: TreeStep[] }) {
  const canvasSteps: CanvasStep[] = steps.map((s) => {
    const edges = [
      ...s.nodes.filter((n) => n.parent && n.edge !== false).map((n) => ({ from: n.parent!, to: n.id })),
      // `pointer` siempre lleva punta de flecha — igual que ya hacen
      // persistent/range-tree (layout.ts de cada familia); acá faltaba, así
      // que un link `kind: 'pointer'` se veía como una línea suelta sin
      // indicar dirección, indistinguible de una arista `tree` normal.
      ...(s.links ?? []).map((l) => ({
        from: l.from,
        to: l.to,
        kind: l.kind,
        label: l.label,
        arrow: l.kind === 'pointer',
        arrowStart: l.kind === 'pointer' && l.bidirectional === true,
        curve: l.curve ?? 0,
      })),
    ];

    if (!s.panels || s.panels.length === 0) {
      // Camino de siempre: un solo bosque, sin paneles.
      return {
        note: s.note,
        noteHtml: s.noteHtml,
        highlight: s.highlight,
        nodes: layout(s.nodes).map((n) => ({ ...n, ...collapsedShape(n) })),
        edges,
      };
    }

    // Cada panel es SU PROPIO bosque, posicionado por separado (layout() ya
    // normaliza a [0, W]) y luego reescalado a su propia franja horizontal
    // — así dos montículos se ven a la vez, cada uno reconocible, en vez de
    // una sola mezcla prematura de nodos.
    const bandW = (W - GAP * (s.panels.length - 1)) / s.panels.length;
    const placedByPanel = s.panels.map((p, i) => {
      const nodesIn = s.nodes.filter((n) => (n.panel ?? s.panels![0].id) === p.id);
      const x0 = i * (bandW + GAP);
      const placed = layout(nodesIn).map((n) => ({
        ...n,
        x: x0 + (n.x / W) * bandW,
        ...collapsedShape(n),
      }));
      return { panel: p, x0, placed };
    });

    const nodes: CanvasNode[] = placedByPanel.flatMap((g) => g.placed);
    const maxY = Math.max(TOP, ...nodes.map((n) => n.y), 34);
    const groups: CanvasGroup[] = placedByPanel.map((g) => ({
      id: g.panel.id,
      label: g.panel.label,
      x: g.x0 - 10,
      y: TOP - 4,
      w: bandW + 20,
      h: maxY - TOP + 4 + 40,
    }));

    return { note: s.note, noteHtml: s.noteHtml, highlight: s.highlight, nodes, edges, groups };
  });

  // El lienzo crece con el árbol/panel más profundo de la secuencia.
  const deepest = Math.max(...canvasSteps.flatMap((s) => s.nodes.map((n) => n.y)), 34);
  const hasGroups = canvasSteps.some((s) => (s.groups ?? []).length > 0);
  return <VisualizationCanvas steps={canvasSteps} width={W} height={deepest + (hasGroups ? 60 : 44)} />;
}
