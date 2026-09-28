---
kind: operation
title: Insert (trie persistente)
order: 4
cppSteps:
  - step-1-node.cpp
  - step-2-stack-push.cpp
  - step-3-segment-tree-update.cpp
  - step-4-trie-insert.cpp
  - full-implementation.cpp
visualization:
  type: persistent
  steps:
    - note: >-
        Versión v0 del trie: ya tiene insertadas "at" y "on" (raíz con
        hijos 'a' y 'o'; 'a' tiene hijo 't', final; 'o' tiene hijo 'n',
        final). Se va a ejecutar Insert(v0, "ab", 0).
      versions:
        - { id: v0, label: v0 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0 }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0 }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0 }
    - note: >-
        En la raíz: `c = s[0] = 'a'`, así que el camino baja por el hijo
        'a'. El hijo 'o' — y todo lo que cuelga de él, el nodo 'n' de
        "on" — queda fuera del camino desde ahora: nunca se visita.
      highlight: ["v0-root", "v0-a"]
      versions:
        - { id: v0, label: v0 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0, state: muted }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0 }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0, state: muted }
    - note: >-
        En el nodo 'a': `c = s[1] = 'b'`. `hijoViejo = a.hijos['b']` no
        existe todavía (sólo tiene 't', de "at"). El hijo 't' — un solo
        nodo — queda descartado del camino igual que el subárbol de 'o',
        pero de un solo nodo.
      highlight: ["v0-a"]
      versions:
        - { id: v0, label: v0 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0, state: muted }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0, state: muted }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0, state: muted }
    - note: >-
        Caso base: `i = 2 = |"ab"|` sobre un trie vacío (no había hijo
        'b'). Se crea el nodo nuevo v1-b con `esFinal ← verdadero` — el
        primer nodo nuevo de esta inserción.
      highlight: ["v1-b"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0 }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0 }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0 }
        - { id: v1-b, value: "b", tag: "final", parent: null, version: v1, state: copied }
    - note: >-
        Al volver de la recursión en 'a': se copia como v1-a. Su hijo 't'
        apunta al v0-t original tal cual — compartido, no se copia — y su
        hijo 'b' apunta al v1-b nuevo.
      highlight: ["v1-a"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0 }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0, state: shared }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0 }
        - { id: v1-a, value: "a", parent: null, version: v1, state: copied }
        - { id: v1-b, value: "b", tag: "final", parent: v1-a, version: v1, state: copied }
      links:
        - { from: v0-root, to: v0-a, kind: tree }
        - { from: v0-root, to: v0-o, kind: tree }
        - { from: v0-a, to: v0-t, kind: tree }
        - { from: v0-o, to: v0-n, kind: tree }
        - { from: v1-a, to: v1-b, kind: tree }
        - { from: v1-a, to: v0-t, kind: shared }
    - note: >-
        Al volver a la raíz: se copia como v1-root. Su hijo 'a' apunta al
        v1-a nuevo; su hijo 'o' apunta al v0-o de v0 **completo** —
        subárbol de dos nodos ('o', 'n') compartido entero, sin tocarlo.
      highlight: ["v1-root"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0, state: shared }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0, state: shared }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0, state: shared }
        - { id: v1-root, value: "•", parent: null, version: v1, state: copied }
        - { id: v1-a, value: "a", parent: v1-root, version: v1, state: copied }
        - { id: v1-b, value: "b", tag: "final", parent: v1-a, version: v1, state: copied }
      links:
        - { from: v0-root, to: v0-a, kind: tree }
        - { from: v0-root, to: v0-o, kind: tree }
        - { from: v0-a, to: v0-t, kind: tree }
        - { from: v0-o, to: v0-n, kind: tree }
        - { from: v1-root, to: v1-a, kind: tree }
        - { from: v1-a, to: v1-b, kind: tree }
        - { from: v1-root, to: v0-o, kind: shared }
        - { from: v1-a, to: v0-t, kind: shared }
    - note: >-
        Estado final: sólo tres nodos son nuevos (raíz', 'a'', 'b''),
        marcados `answer` — un nodo por carácter de "ab" más la raíz. El
        subárbol 'o'/'n' completo y el nodo 't' se comparten con v0 sin
        duplicarse; v0 sigue intacta y consultable por su propia raíz
        (todavía sólo tiene "at" y "on").
      highlight: ["v1-root", "v1-a", "v1-b"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0, state: shared }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0, state: shared }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0, state: shared }
        - { id: v1-root, value: "•", parent: null, version: v1, state: answer }
        - { id: v1-a, value: "a", parent: v1-root, version: v1, state: answer }
        - { id: v1-b, value: "b", tag: "final", parent: v1-a, version: v1, state: answer }
      links:
        - { from: v0-root, to: v0-a, kind: tree }
        - { from: v0-root, to: v0-o, kind: tree }
        - { from: v0-a, to: v0-t, kind: tree }
        - { from: v0-o, to: v0-n, kind: tree }
        - { from: v1-root, to: v1-a, kind: tree }
        - { from: v1-a, to: v1-b, kind: tree }
        - { from: v1-root, to: v0-o, kind: shared }
        - { from: v1-a, to: v0-t, kind: shared }
    - note: >-
        Bifurcación y extensión: ¿Y si ahora insertamos "as" partiendo de v0 (`v2 = Insert(v0, "as")`)?
        No tocamos ni v0 ni v1. Se crea la rama v2 con sólo 3 nodos (raíz'', a'', s''),
        compartiendo 't' y el subárbol 'o'→'n' de v0. Las tres versiones coexisten en paralelo.
      highlight: ["v2-root", "v2-a", "v2-s"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v0-root, value: "•", parent: null, version: v0 }
        - { id: v0-a, value: "a", parent: v0-root, version: v0 }
        - { id: v0-o, value: "o", parent: v0-root, version: v0, state: shared }
        - { id: v0-t, value: "t", tag: "final", parent: v0-a, version: v0, state: shared }
        - { id: v0-n, value: "n", tag: "final", parent: v0-o, version: v0, state: shared }
        - { id: v1-root, value: "•", parent: null, version: v1, state: shared }
        - { id: v1-a, value: "a", parent: v1-root, version: v1, state: shared }
        - { id: v1-b, value: "b", tag: "final", parent: v1-a, version: v1, state: shared }
        - { id: v2-root, value: "•", parent: null, version: v2, state: answer }
        - { id: v2-a, value: "a", parent: v2-root, version: v2, state: answer }
        - { id: v2-s, value: "s", tag: "final", parent: v2-a, version: v2, state: answer }
      links:
        - { from: v0-root, to: v0-a, kind: tree }
        - { from: v0-root, to: v0-o, kind: tree }
        - { from: v0-a, to: v0-t, kind: tree }
        - { from: v0-o, to: v0-n, kind: tree }
        - { from: v1-root, to: v1-a, kind: tree }
        - { from: v1-a, to: v1-b, kind: tree }
        - { from: v1-root, to: v0-o, kind: shared }
        - { from: v1-a, to: v0-t, kind: shared }
        - { from: v2-root, to: v2-a, kind: tree }
        - { from: v2-a, to: v2-s, kind: tree }
        - { from: v2-root, to: v0-o, kind: shared }
        - { from: v2-a, to: v0-t, kind: shared }
---

## Qué hace

Inserta la cadena `s` en un trie persistente a partir de `nodo`, devolviendo
la raíz de una nueva versión del trie. La versión vieja sigue intacta.

## Intuición

El camino relevante aquí no es la altura de un árbol balanceado sino el
largo de la cadena: cada carácter de `s` es un nivel de descenso, y path
copying copia exactamente un nodo por carácter — el resto del trie (todas
las demás ramas, de todas las demás cadenas ya insertadas) se comparte sin
tocarse. Por eso el espacio total tras insertar varias cadenas es
$O(\sum L_i)$, el mismo orden que un trie efímero normal: cada carácter
insertado crea a lo más un nodo nuevo, sin importar cuántas versiones
acumules.

## Algoritmo

1. Copiar `nodo` en `nuevo`.
2. Si se llegó al final de la cadena (`i = |s|`): marcar `nuevo.esFinal ←
   verdadero` y **devolver `nuevo`** (caso base).
3. Si no: tomar el carácter `c = s[i]`; buscar `hijoViejo = nodo.hijos[c]`
   (o un trie vacío si ese hijo no existe todavía).
4. `nuevo.hijos[c] ← Insert(hijoViejo, s, i+1)`; los demás hijos de `nuevo`
   siguen apuntando a los mismos subárboles que tenía `nodo` (compartidos,
   no se copian).
5. Devolver `nuevo`.

## Pseudocódigo

```
Algoritmo 4: Insert(nodo, s, i)
nuevo ← copia de nodo ;
si i = |s| entonces
     nuevo.esFinal ← verdadero ;
     devolver nuevo ;
en otro caso
     c ← s[i] ;
     hijoViejo ← nodo.hijos[c] (o un Trie vacío si no existe) ;
     nuevo.hijos[c] ← Insert(hijoViejo, s, i+1) ;
     devolver nuevo ;
```

## C++

Ver `step-4-trie-insert.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(L)$ con $L = |s|$, por conteo directo: Insert copia exactamente un nodo
por carácter de `s`, uno por cada nivel del camino desde la raíz hasta el
nodo final. No se toca ninguna otra rama del trie.

## Complejidad espacial

$O(L)$ de espacio nuevo por inserción — los mismos nodos copiados en
tiempo. Tras `n` inserciones de cadenas con largos $L_1, \dots, L_n$, el
espacio total es $O(\sum L_i)$: el mismo orden que un trie efímero normal,
porque cada carácter insertado crea a lo más un nodo nuevo sin importar
cuántas versiones se acumulen.

## Ejemplo

*(Derivado del pseudocódigo; no aparece en las diapositivas — el material
nunca instancia el trie con cadenas concretas.)* Sea un trie vacío (versión
`v0`). `Insert(v0, "ab", 0)` copia la raíz (`nuevo`), ve `c = 'a'`, no
encuentra `hijos['a']` en `v0` (usa un trie vacío como `hijoViejo`), e
inserta recursivamente `"ab"` desde `i=1` en ese trie vacío: se crea un
nodo para `'a'` cuyo hijo `'b'` es otro nodo nuevo con `esFinal =
verdadero`. El resultado, `v1`, es un camino nuevo de dos nodos (`a → b`)
colgando de una raíz también nueva; `v0` sigue siendo el trie vacío
original.

## Casos límite

- **Hijo inexistente** (único caso límite codificado en el pseudocódigo
  del profesor): `hijoViejo ← nodo.hijos[c]`, o un trie vacío si `c` no
  tenía hijo todavía — así se puede insertar sobre una rama que no existía
  sin caso especial adicional.
- **Caso base sin retorno explícito**: tal como aparece en las diapositivas,
  el pseudocódigo marca `nuevo.esFinal ← verdadero` cuando `i = |s|` pero
  no corta ahí — sigue a `c ← s[i]`, que indexa fuera de la cadena. Aquí se
  corrige agregando `devolver nuevo` dentro de ese caso (ver también el
  bloque `en otro caso` que aísla el resto), tanto en el pseudocódigo de
  arriba como en el C++.
- **Insertar una cadena que ya es prefijo de otra insertada antes** (o
  viceversa): el algoritmo no distingue este caso — simplemente marca
  `esFinal` en el nodo correspondiente a esa longitud; el material no lo
  menciona explícitamente.
- **`s` vacía (`L = 0`)**: la raíz misma se marca `esFinal ← verdadero` de
  inmediato, sin ninguna copia adicional.
