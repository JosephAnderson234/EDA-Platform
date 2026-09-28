---
kind: operation
title: Consultar una versión vieja (segment tree)
order: 3
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
        Continuando el ejemplo de Update: tras `Update(v1, pos=4)` existen
        dos raíces guardadas — v1 (antes del update) y v2 (después). Se va
        a consultar la posición 4 en la versión **v1**, la vieja, no v2.
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1 }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1 }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1 }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        La consulta arranca desde el puntero guardado de v1-root — no
        desde v2-root. v2 (marcado como no usado en este recorrido) no
        interviene en absoluto: esta consulta ni lo toca ni lo necesita.
      highlight: ["v1-root"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: active }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1 }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1 }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        En v1-root, m=2 y pos=4 > m: se desciende por el hijo derecho,
        v1-34. v1-root queda visitado — `shared`, no se tocó, sigue siendo
        exactamente el nodo de v1 — y el subárbol v1-12 nunca se visita
        para esta consulta.
      highlight: ["v1-34"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: shared }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1, state: active }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1 }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        En v1-34, m=3 y pos=4 > m: se desciende por el hijo derecho,
        v1-44. v1-34 queda visitado — `shared`, sin tocarse — y v1-33
        nunca se visita para esta consulta.
      highlight: ["v1-44"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: shared }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1, state: shared }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1, state: active }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        Caso base: l=r=4, se llegó a la hoja v1-44 de **v1**. Su valor es
        el valor *original* de la posición 4 — el que tenía antes del
        Update — porque v1-44 nunca fue tocado por `Update(v1, pos=4)`.
        Se marca `answer`: es la respuesta de esta consulta.
      highlight: ["v1-44"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: shared }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1, state: shared }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1, state: answer }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        El camino completo recorrido — v1-root, v1-34, v1-44, todos
        `shared` o `answer` — pertenece por entero a v1: ninguno de estos
        tres nodos es el que Update copió para crear v2. Consultar el
        pasado no toca ni un solo nodo de la versión nueva.
      highlight: ["v1-root", "v1-34", "v1-44"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: shared }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1 }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1, state: shared }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1 }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1 }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1 }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1, state: answer }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: muted }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: muted }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: muted }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
    - note: >-
        Contraste: ¿Y si consultáramos la misma pos=4 en v2? Pasando `v2-root`,
        el recorrido desciende por v2-34 hasta v2-44 (el valor nuevo),
        reutilizando v1-12 y v1-33 de v1. Ambas versiones coexisten de forma
        autónoma y responden en O(lg n).
      highlight: ["v2-root", "v2-34", "v2-44"]
      versions:
        - { id: v1, label: v1 }
        - { id: v2, label: v2 }
      nodes:
        - { id: v1-root, value: "[1,4]", parent: null, version: v1, state: muted }
        - { id: v1-12, value: "[1,2]", parent: v1-root, version: v1, state: shared }
        - { id: v1-34, value: "[3,4]", parent: v1-root, version: v1, state: muted }
        - { id: v1-11, value: "[1,1]", parent: v1-12, version: v1, state: shared }
        - { id: v1-22, value: "[2,2]", parent: v1-12, version: v1, state: shared }
        - { id: v1-33, value: "[3,3]", parent: v1-34, version: v1, state: shared }
        - { id: v1-44, value: "[4,4]", parent: v1-34, version: v1, state: muted }
        - { id: v2-root, value: "[1,4]'", parent: null, version: v2, state: active }
        - { id: v2-34, value: "[3,4]'", parent: v2-root, version: v2, state: active }
        - { id: v2-44, value: "[4,4]'", parent: v2-34, version: v2, state: answer, tag: "nuevo" }
      links:
        - { from: v1-root, to: v1-12, kind: tree }
        - { from: v1-root, to: v1-34, kind: tree }
        - { from: v1-12, to: v1-11, kind: tree }
        - { from: v1-12, to: v1-22, kind: tree }
        - { from: v1-34, to: v1-33, kind: tree }
        - { from: v1-34, to: v1-44, kind: tree }
        - { from: v2-root, to: v2-34, kind: tree }
        - { from: v2-34, to: v2-44, kind: tree }
        - { from: v2-root, to: v1-12, kind: shared }
        - { from: v2-34, to: v1-33, kind: shared }
---

## Qué hace

Responde una consulta de rango sobre una versión pasada del segment tree
persistente, sin afectar (ni copiar) ninguna versión.

## Intuición

Esta es la razón de ser de todo el tema: como
[Update](/structures/path-copying/operations/segment-tree-update) nunca
modifica la versión de la que parte, el puntero a la raíz que devolvió en
su momento sigue siendo un segment tree completo y válido. Consultar el
pasado no es una operación distinta de consultar el presente: es la misma
[consulta del segment tree](/structures/segment-tree/operations/query),
sólo que arrancando desde una raíz distinta.

## Algoritmo

1. Guardar, en el momento de cada `Update`, el puntero a la raíz que
   devuelve (esa raíz identifica la versión).
2. Para consultar la versión `k`, usar el puntero guardado de esa versión
   como raíz de entrada.
3. Ejecutar la [consulta normal](/structures/segment-tree/operations/query)
   del segment tree desde esa raíz — sin ninguna variante especial.

## Pseudocódigo

El profesor no da pseudocódigo propio para esta operación: "basta guardar
el puntero a la raíz de esa versión (devuelto por Update en su momento) y
hacer la consulta normal desde ahí." Es la misma
[Query](/structures/segment-tree/operations/query) ya cubierta como
prerrequisito, sin modificaciones.

## C++

Ver `full-implementation.cpp` en el editor de arriba: la consulta reutiliza
la misma función de query sobre cualquier raíz guardada.

## Complejidad temporal

$O(\lg n)$, exactamente el costo de una consulta cualquiera del segment
tree, "sin ningún costo adicional por ser una versión del pasado" — no hay
indirección extra ni reconstrucción: la versión vieja ya existe, completa,
en memoria.

## Complejidad espacial

No aplica costo adicional: consultar no crea nodos nuevos.

## Ejemplo

Con el ejemplo del [diagrama de Update](/structures/path-copying/operations/segment-tree-update):
tras actualizar la posición 4 y obtener la raíz nueva `[1,4]'`, una consulta
sobre la raíz vieja `[1,4]` (guardada antes del Update) sigue devolviendo
los valores originales — incluido el valor viejo de la posición 4 — porque
esa raíz nunca fue tocada.

## Casos límite

- **Consultar la versión más antigua (la inicial, antes de cualquier
  Update)**: funciona igual, siempre que se haya guardado su raíz.
- **Consultar una versión intermedia que comparte nodos con la versión
  consultada actual**: no hay conflicto — cada consulta sólo lee, nunca
  escribe, así que compartir nodos entre versiones es seguro.
- **No guardar el puntero de una versión**: esa versión queda inalcanzable
  (se pierde, aunque sus nodos puedan seguir vivos si otra versión los
  comparte); el material no cubre recolección de basura ni liberación de
  versiones muertas.
