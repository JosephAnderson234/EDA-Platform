---
kind: operation
title: Push (stack persistente)
order: 1
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
        Versión v0 de la pila persistente: cima 7 → 2 → 7 (del tope al
        fondo). Se va a ejecutar Push(v0, 42).
      nodes:
        - { id: v0-a, value: 7, parent: null }
        - { id: v0-b, value: 2, parent: v0-a }
        - { id: v0-c, value: 7, parent: v0-b }
    - note: >-
        Push no recorre nada de v0: sólo necesita el puntero a la cima
        actual (v0-a) para enganchar ahí el nodo nuevo. Todo v0 — sus tres
        nodos — permanece intacto y será compartido tal cual.
      highlight: ["v0-a"]
      nodes:
        - { id: v0-a, value: 7, parent: null, state: marked }
        - { id: v0-b, value: 2, parent: v0-a }
        - { id: v0-c, value: 7, parent: v0-b }
    - note: >-
        Se crea el nodo nuevo con valor 42. Todavía no está enlazado a
        nada: es el único nodo que esta operación construye.
      highlight: ["v1-42"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0 }
        - { id: v0-b, value: 2, parent: v0-a, version: v0 }
        - { id: v0-c, value: 7, parent: v0-b, version: v0 }
        - { id: v1-42, value: 42, parent: null, version: v1, state: copied }
    - note: >-
        El nodo 42 enlaza su `siguiente` a la cima vieja (v0-a) — un
        puntero compartido, no una copia: v0-a y todo lo que cuelga de él
        (2, 7) se reutilizan sin duplicarse.
      highlight: ["v1-42"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0 }
        - { id: v0-c, value: 7, parent: v0-b, version: v0 }
        - { id: v1-42, value: 42, parent: null, version: v1, state: copied }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
    - note: >-
        v0 sigue siendo un puntero válido a "7 → 2 → 7": nadie lo tocó.
        Quien todavía tenga ese puntero sigue viendo la pila exactamente
        como estaba antes del Push.
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0, state: shared }
        - { id: v0-c, value: 7, parent: v0-b, version: v0, state: shared }
        - { id: v1-42, value: 42, parent: null, version: v1, state: copied }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
    - note: >-
        Estado final: `Push(v0, 42)` devuelve v1-42 como la nueva cima —
        marcado `answer`, el único nodo nuevo de esta operación. v0 (7 → 2
        → 7) sigue completo y consultable por su propia raíz.
      highlight: ["v1-42"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0, state: shared }
        - { id: v0-c, value: 7, parent: v0-b, version: v0, state: shared }
        - { id: v1-42, value: 42, parent: null, version: v1, state: answer }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
    - note: >-
        ¿Qué pasa si seguimos apilando? Ejecutamos `Push(v1, 100)` para crear `v2`.
        El nodo 100 es la nueva cima de v2 y su `siguiente` apunta a 42 (la cima de v1).
        La cadena de v2 es 100 → 42 → 7 → 2 → 7.
      highlight: ["v2-100"]
      versions:
        - { id: v0, label: v0 }
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0, state: shared }
        - { id: v0-c, value: 7, parent: v0-b, version: v0, state: shared }
        - { id: v1-42, value: 42, parent: null, version: v1, state: shared }
        - { id: v2-100, value: 100, parent: null, version: v2, state: answer }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
        - { from: v2-100, to: v1-42, kind: shared }
    - note: >-
        ¿Podemos volver a operar sobre v0 aunque existan v1 y v2 (o la versión 1 millón)?
        ¡Sí! En Persistencia Total, nada impide hacer `Push(v0, 99)`.
        Se crea el nodo 99 en v3, apuntando directamente a la cima de v0 (7).
      highlight: ["v3-99"]
      versions:
        - { id: v0, label: v0 (base) }
        - { id: v2, label: "v2 (100→42)" }
        - { id: v3, label: "v3 (rama 99)" }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0, state: shared }
        - { id: v0-c, value: 7, parent: v0-b, version: v0, state: shared }
        - { id: v1-42, value: 42, parent: null, version: v2, state: shared }
        - { id: v2-100, value: 100, parent: v1-42, version: v2, state: shared }
        - { id: v3-99, value: 99, parent: null, version: v3, state: answer }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v2-100, to: v1-42, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
        - { from: v3-99, to: v0-a, kind: shared }
    - note: >-
        Árbol de versiones resultante: v2 y v3 son ramas independientes nacidas de v0.
        Ambas convergen hacia v0 (7 → 2 → 7), compartiendo toda la memoria en O(1) adicional.
        Ninguna versión se destruye ni sobrescribe a otra.
      versions:
        - { id: v0, label: "v0 (tronco común)" }
        - { id: v2, label: "v2 (rama A)" }
        - { id: v3, label: "v3 (rama B)" }
      nodes:
        - { id: v0-a, value: 7, parent: null, version: v0, state: shared }
        - { id: v0-b, value: 2, parent: v0-a, version: v0, state: shared }
        - { id: v0-c, value: 7, parent: v0-b, version: v0, state: shared }
        - { id: v1-42, value: 42, parent: null, version: v2, state: shared }
        - { id: v2-100, value: 100, parent: v1-42, version: v2, state: shared }
        - { id: v3-99, value: 99, parent: null, version: v3, state: shared }
      links:
        - { from: v0-a, to: v0-b, kind: tree }
        - { from: v0-b, to: v0-c, kind: tree }
        - { from: v2-100, to: v1-42, kind: tree }
        - { from: v1-42, to: v0-a, kind: shared }
        - { from: v3-99, to: v0-a, kind: shared }
---

## Qué hace

Agrega un elemento `x` a una pila persistente `S`, devolviendo una nueva
versión de la pila. La versión vieja `S` sigue intacta y consultable.

## Intuición

Un stack implementado como lista enlazada ya es un "camino" de un solo
nodo de largo: la cima. Por eso path copying, en este caso, se reduce a
crear un único nodo nuevo que apunta al resto de la lista vieja — no hay
nada más que copiar, porque no hay más camino que recorrer. Es el caso
degenerado de la técnica, y el profesor lo señala así: es persistencia
funcional en su forma más pura, en cualquier nivel de persistencia, sin
necesitar llamarla "path copying".

## Algoritmo

1. Crear un nodo `nuevo` con valor `x` y `siguiente` apuntando a la cima
   actual de `S`.
2. Devolver `nuevo` como la raíz (cima) de la versión nueva de la pila.
3. `S` (la versión vieja) no se toca: sigue siendo un puntero válido a la
   pila tal como estaba antes del push.

## Pseudocódigo

```
Algoritmo 2: Push(S, x) — persistente
nuevo ← nodo con valor x y siguiente ← S ;
devolver nuevo ;        // S (la versión vieja) sigue intacta
```

## C++

Ver `step-2-stack-push.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

$O(1)$: crear un nodo y enlazarlo cuesta lo mismo sin importar cuántos
elementos tenga la pila o cuántas versiones existan.

## Complejidad espacial

$O(1)$ nuevo por operación: un solo nodo. Ninguna estructura anterior se
copia ni se recorre.

## Ejemplo

*(Derivado del pseudocódigo; no aparece en las diapositivas — el material no
instancia el stack con elementos concretos.)* Sea `S` la pila persistente
con cima `7 → 2 → 7` (de la más reciente a la más antigua). `Push(S, 42)`
crea un nodo `42` con `siguiente` apuntando al nodo `7` que era la cima de
`S`, y devuelve ese nodo `42` como la nueva versión. La versión vieja sigue
siendo `7 → 2 → 7`, accesible por quien todavía tenga ese puntero.

## Casos límite

- **Pila vacía**: `S = nulo`. `Push(nulo, x)` crea un nodo con
  `siguiente ← nulo`: el primer elemento de una pila nueva, sin ningún
  caso especial en el algoritmo.
- **Empujar sobre una versión vieja**: nada lo impide — se puede hacer
  `Push` sobre cualquier versión pasada de `S`, no sólo sobre la más
  reciente, y eso genera una rama distinta de versiones (persistencia
  confluente si esas ramas se combinan después).
- **`Pop` no aparece en el material** (sólo `Push`): el profesor no da
  pseudocódigo para retirar el tope de la pila persistente.
