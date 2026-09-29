import VisualizationCanvas, { type CanvasStep } from '../../components/VisualizationCanvas';
import { layout, W, type PersistentStep } from './layout';

/**
 * Familia "persistent": path copying, árbol de versiones (Euler) y nodo
 * gordo (registro + split). Único trabajo: posicionar (ver ./layout.ts). El
 * render, la línea de tiempo y la animación los pone VisualizationCanvas.
 */
export default function PersistentVisualization({ steps }: { steps: PersistentStep[] }) {
  const frames = steps.map(layout);
  const height = Math.max(...frames.map((f) => f.height), 34);
  const width = Math.max(...frames.map((f) => f.width ?? W), W);

  // El `viewBox` es fijo en `width`/`height` (el paso más grande en cada
  // eje) en todos los pasos; VisualizationCanvas hace zoom-fit sobre el
  // centro del lienzo para que un paso más chico se vea a tamaño completo
  // en vez de chico y perdido. Para que ese zoom quede centrado en el
  // contenido real (no en un punto arbitrario, que en el eje que no se
  // centra saca contenido del viewBox), el contenido de cada paso se centra
  // aquí en AMBOS ejes dentro del `width`/`height` compartidos, y
  // `width: f.width` / `height: f.height` es lo que le dice a cuánto hacer
  // zoom.
  const canvasSteps: CanvasStep[] = steps.map((s, i) => {
    const f = frames[i];
    const offsetX = (width - (f.width ?? width)) / 2;
    const offsetY = (height - f.height) / 2;
    const shift = <T extends { x: number; y: number }>(p: T): T =>
      offsetX || offsetY ? { ...p, x: p.x + offsetX, y: p.y + offsetY } : p;
    return {
      note: s.note,
      noteHtml: s.noteHtml,
      highlight: s.highlight ?? [],
      nodes: f.nodes.map(shift),
      edges: f.edges,
      groups: (offsetX || offsetY) ? f.groups.map((g) => ({ ...g, x: g.x + offsetX, y: g.y + offsetY })) : f.groups,
      annotations: f.annotations.map(shift),
      width: f.width,
      height: f.height,
    };
  });

  return <VisualizationCanvas steps={canvasSteps} width={width} height={height} />;
}
