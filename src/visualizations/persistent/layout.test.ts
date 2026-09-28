import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout, layoutFatNodes, type PersistentStep } from './layout.ts';
import { NODE_W, NODE_H } from '../canvas-types.ts';

const box = (n: { x: number; y: number; w?: number; h?: number }) => ({
  l: n.x - (n.w ?? NODE_W) / 2,
  r: n.x + (n.w ?? NODE_W) / 2,
  t: n.y - (n.h ?? NODE_H) / 2,
  b: n.y + (n.h ?? NODE_H) / 2,
});
const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) =>
  a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

function noOverlaps(nodes: { id: string; x: number; y: number; w?: number; h?: number }[]) {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      assert.ok(!overlaps(box(nodes[i]), box(nodes[j])), `${nodes[i].id} se solapa con ${nodes[j].id}`);
    }
  }
}

// El diagrama canónico del profesor (página 57, diapositiva 28): Update de la
// posición 4 sobre un segment tree de 4 hojas. Sólo se copia el camino
// raíz → [3,4] → [4,4]; [1,2] (con sus hojas) y [3,3] se comparten.
const PATH_COPYING_STEP: PersistentStep = {
  note: 'Update(pos=4): se copia el camino, se comparte el resto.',
  mode: 'path-copying',
  versions: [
    { id: 'v0', label: 'v0' },
    { id: 'v1', label: 'v1' },
  ],
  nodes: [
    { id: 'root-v0', value: '[1,4]', parent: null, version: 'v0', state: 'shared' },
    { id: 'n12', value: '[1,2]', parent: 'root-v0', version: 'v0', state: 'shared' },
    { id: 'n34-v0', value: '[3,4]', parent: 'root-v0', version: 'v0', state: 'shared' },
    { id: 'n11', value: '[1,1]', parent: 'n12', version: 'v0', state: 'shared' },
    { id: 'n22', value: '[2,2]', parent: 'n12', version: 'v0', state: 'shared' },
    { id: 'n33', value: '[3,3]', parent: 'n34-v0', version: 'v0', state: 'shared' },
    { id: 'n44-v0', value: '[4,4]', parent: 'n34-v0', version: 'v0', state: 'shared' },
    { id: 'root-v1', value: "[1,4]'", parent: null, version: 'v1', state: 'copied' },
    { id: 'n34-v1', value: "[3,4]'", parent: 'root-v1', version: 'v1', state: 'copied' },
    { id: 'n44-v1', value: "[4,4]'", parent: 'n34-v1', version: 'v1', state: 'copied' },
  ],
  links: [
    { from: 'root-v0', to: 'n12', kind: 'tree' },
    { from: 'root-v0', to: 'n34-v0', kind: 'tree' },
    { from: 'n12', to: 'n11', kind: 'tree' },
    { from: 'n12', to: 'n22', kind: 'tree' },
    { from: 'n34-v0', to: 'n33', kind: 'tree' },
    { from: 'n34-v0', to: 'n44-v0', kind: 'tree' },
    { from: 'root-v1', to: 'n34-v1', kind: 'tree' },
    { from: 'n34-v1', to: 'n44-v1', kind: 'tree' },
    // las dos aristas de compartición: root' reusa el subárbol de n12 entero;
    // 34' reusa la hoja n33. Cruzan de v1 a v0.
    { from: 'root-v1', to: 'n12', kind: 'shared' },
    { from: 'n34-v1', to: 'n33', kind: 'shared' },
  ],
};

test('path copying: todo copiado a la derecha de todo compartido (paneles v0/v1)', () => {
  const frame = layout(PATH_COPYING_STEP);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));
  const copiedX = ['root-v1', 'n34-v1', 'n44-v1'].map((id) => byId.get(id)!.x);
  const sharedX = ['root-v0', 'n12', 'n34-v0', 'n11', 'n22', 'n33', 'n44-v0'].map((id) => byId.get(id)!.x);
  assert.ok(Math.min(...copiedX) > Math.max(...sharedX));
});

test('path copying: cada copiado queda a la MISMA profundidad (y) que su original', () => {
  const frame = layout(PATH_COPYING_STEP);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));
  assert.equal(byId.get('root-v1')!.y, byId.get('root-v0')!.y);
  assert.equal(byId.get('n34-v1')!.y, byId.get('n34-v0')!.y);
  assert.equal(byId.get('n44-v1')!.y, byId.get('n44-v0')!.y);
});

test('path copying: exactamente 2 aristas `shared`, curvadas, que cruzan de panel', () => {
  const frame = layout(PATH_COPYING_STEP);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));
  const shared = frame.edges.filter((e) => e.kind === 'shared');
  assert.equal(shared.length, 2);
  for (const e of shared) {
    assert.notEqual(e.curve, 0, `la arista ${e.from}->${e.to} debería estar curvada`);
    assert.notEqual(byId.get(e.from)!.x, byId.get(e.to)!.x, `${e.from}->${e.to} no cruza de panel`);
  }
});

test('path copying: ningún par de nodos se solapa y todo cabe en el viewBox', () => {
  const frame = layout(PATH_COPYING_STEP);
  noOverlaps(frame.nodes);
  for (const n of frame.nodes) {
    const b = box(n);
    assert.ok(b.l >= 0 && b.r <= (frame.width ?? 720), `${n.id} se sale del ancho`);
    assert.ok(b.t >= 0 && b.b <= frame.height, `${n.id} se sale del alto`);
  }
});

test('path copying: 3 versiones (v1, v2, v3) se posicionan ordenadas y caben en frame.width sin solaparse', () => {
  const step: PersistentStep = {
    note: '',
    versions: [
      { id: 'v1', label: 'v1' },
      { id: 'v2', label: 'v2' },
      { id: 'v3', label: 'v3' },
    ],
    nodes: [
      { id: 'v1-1', value: '1', parent: null, version: 'v1' },
      { id: 'v2-1', value: "1'", parent: null, version: 'v2' },
      { id: 'v3-1', value: "1''", parent: null, version: 'v3' },
    ],
    links: [
      { from: 'v2-1', to: 'v1-1', kind: 'shared' },
      { from: 'v3-1', to: 'v2-1', kind: 'shared' },
    ],
  };
  const frame = layout(step);
  noOverlaps(frame.nodes);
  assert.ok((frame.width ?? 0) >= 720);
  assert.equal(frame.groups.length, 3);
  assert.ok(frame.groups[0].x < frame.groups[1].x);
  assert.ok(frame.groups[1].x < frame.groups[2].x);
  for (const n of frame.nodes) {
    const b = box(n);
    assert.ok(b.l >= 0 && b.r <= frame.width!, `${n.id} se sale del ancho`);
  }
});

test('árbol de versiones: 7 nodos → 4 hojas equiespaciadas, cada padre centrado', () => {
  const step: PersistentStep = {
    note: '',
    mode: 'version-tree',
    nodes: [
      { id: '1', value: 1, parent: null },
      { id: '2', value: 2, parent: '1' },
      { id: '3', value: 3, parent: '1' },
      { id: '4', value: 4, parent: '2' },
      { id: '5', value: 5, parent: '2' },
      { id: '6', value: 6, parent: '3' },
      { id: '7', value: 7, parent: '3' },
    ],
  };
  const frame = layout(step);
  const byId = new Map(frame.nodes.map((n) => [n.id, n]));
  const leaves = ['4', '5', '6', '7'].map((id) => byId.get(id)!.x).sort((a, b) => a - b);
  const gaps = leaves.slice(1).map((x, i) => x - leaves[i]);
  assert.ok(gaps.every((g) => Math.abs(g - gaps[0]) < 1e-9));
  assert.equal(byId.get('2')!.x, (byId.get('4')!.x + byId.get('5')!.x) / 2);
});

test('árbol de versiones: la secuencia de Euler crece paso a paso (no decreciente) y termina en 14 paréntesis', () => {
  const tree: PersistentStep['nodes'] = [
    { id: '1', value: 1, parent: null },
    { id: '2', value: 2, parent: '1' },
    { id: '3', value: 3, parent: '1' },
    { id: '4', value: 4, parent: '2' },
    { id: '5', value: 5, parent: '2' },
    { id: '6', value: 6, parent: '3' },
    { id: '7', value: 7, parent: '3' },
  ];
  // Euler completo de un árbol binario de 7 nodos: 14 símbolos (2 por nodo).
  const captions = ['(1', '(1(2', '(1(2(4)', '(1(2(4)(5)', '(1(2(4)(5))', '(1(2(4)(5))(3', '(1(2(4)(5))(3(6)(7)))'];
  const lengths = captions.map((c) => {
    const frame = layout({ note: '', mode: 'version-tree', nodes: tree, caption: c });
    return frame.annotations[0]!.text.length;
  });
  for (let i = 1; i < lengths.length; i++) assert.ok(lengths[i] >= lengths[i - 1]);
  const last = captions[captions.length - 1];
  const parenCount = (last.match(/[()]/g) ?? []).length;
  assert.equal(parenCount, 14);
});

test('nodo gordo: el alto crece con el número de campos, y record/divider están marcados', () => {
  const withoutFields = layoutFatNodes({
    note: '',
    mode: 'fat-node',
    nodes: [{ id: 'n', value: 'n (0/4)' }],
  });
  const withOneField = layoutFatNodes({
    note: '',
    mode: 'fat-node',
    nodes: [{ id: 'n', value: 'n', fields: [{ name: 'x', value: 5, time: 1 }] }],
  });
  const withTwoFields = layoutFatNodes({
    note: '',
    mode: 'fat-node',
    nodes: [
      {
        id: 'n',
        value: 'n',
        fields: [
          { name: 'x', value: 5, time: 1 },
          { name: 'y', value: 9, time: 2 },
        ],
      },
    ],
  });
  const n0 = withoutFields.nodes[0]!;
  const n1 = withOneField.nodes[0]!;
  const n2 = withTwoFields.nodes[0]!;
  assert.equal(n0.shape, 'box');
  assert.equal(n1.shape, 'record');
  assert.equal(n1.divider, 0);
  assert.ok(n2.h! - n1.h! > 0, 'el alto debería crecer con más campos');
});

test('split: los punteros conservan su `id` de puerto entre pasos y quedan apuntando al nuevo nodo', () => {
  const before: PersistentStep = {
    note: 'antes del split',
    mode: 'fat-node',
    nodes: [{ id: 'n-old', value: 'n (lleno)' }],
    ports: [{ id: 'port-a1', to: 'n-old' }],
  };
  const after: PersistentStep = {
    note: 'después del split',
    mode: 'fat-node',
    nodes: [
      { id: 'n-old', value: 'n (congelado)' },
      { id: 'n-new', value: "n'" },
    ],
    ports: [{ id: 'port-a1', to: 'n-new' }],
  };
  const frameBefore = layout(before);
  const frameAfter = layout(after);
  const edgeBefore = frameBefore.edges.find((e) => e.id === 'port-a1')!;
  const edgeAfter = frameAfter.edges.find((e) => e.id === 'port-a1')!;
  assert.equal(edgeBefore.to, 'n-old');
  assert.equal(edgeAfter.to, 'n-new');
  assert.equal(edgeBefore.id, edgeAfter.id, 'el id del puerto debe conservarse para que la flecha se redirija, no remonte');
});

test('sin nodos no revienta, en los tres modos', () => {
  assert.doesNotThrow(() => layout({ note: '', mode: 'path-copying', nodes: [] }));
  assert.doesNotThrow(() => layout({ note: '', mode: 'version-tree', nodes: [] }));
  assert.doesNotThrow(() => layout({ note: '', mode: 'fat-node', nodes: [] }));
});
