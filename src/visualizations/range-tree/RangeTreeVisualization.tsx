import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas';
import { layout, W, type RangeStep } from './layout';

/**
 * Familia "range-tree": el range tree 1D/2D y el layered range tree (arreglos
 * en capas con puentes). Único trabajo: posicionar (ver ./layout.ts). El
 * render, la línea de tiempo y la animación los pone VisualizationCanvas.
 */
export default function RangeTreeVisualization({ steps }: { steps: RangeStep[] }) {
  const frames = steps.map(layout);
  const canvasSteps: CanvasStep[] = steps.map((s, i) => ({
    note: s.note,
    noteHtml: s.noteHtml,
    highlight: s.highlight ?? [],
    nodes: frames[i].nodes,
    edges: frames[i].edges,
    groups: frames[i].groups,
    annotations: frames[i].annotations,
  }));

  const height = Math.max(...frames.map((f) => f.height), 34);
  return <VisualizationCanvas steps={canvasSteps} width={W} height={height} />;
}
