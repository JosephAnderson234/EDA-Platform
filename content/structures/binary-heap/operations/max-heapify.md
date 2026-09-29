---
kind: operation
title: Max-Heapify
order: 1
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Estado inicial, A = [4, 14, 10, 8, 2, 9, 3]. Se llama Max-Heapify(A, 1, 7):
        el subárbol podría estar roto sólo en la raíz.
      highlight: []
      nodes:
        - { id: n1, value: 4, parent: null }
        - { id: n2, value: 14, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        Se compara A[1]=4 contra sus dos hijos, A[2]=14 y A[3]=10. El mayor de
        los tres es A[2]=14, así que "largest" pasa a ser 2 y hay que intercambiar.
      highlight: [n1, n2, n3]
      nodes:
        - { id: n1, value: 4, parent: null }
        - { id: n2, value: 14, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        Se intercambian A[1] y A[2]: la raíz ya cumple el invariante localmente,
        pero el 4 bajó a la posición 2 y podría romperlo ahí. La llamada recursiva
        continúa en i=2.
      highlight: [n1, n2]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 4, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        En i=2, A[2]=4 se compara contra sus hijos A[4]=8 y A[5]=2. El mayor es
        A[4]=8, así que "largest" pasa a ser 4.
      highlight: [n2, n4, n5]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 4, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        Se intercambian A[2] y A[4]. Ahora i=4, que es hoja (no tiene hijos en
        n=7): "largest" queda igual a i, la recursión se detiene y el invariante
        de montículo máximo queda restaurado en todo el subárbol.
      highlight: [n2, n4]
      nodes:
        - { id: n1, value: 14, parent: null }
        - { id: n2, value: 8, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 4, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
---

## Qué hace

Recibe una posición `i` de un arreglo donde los subárboles de sus hijos
`left(i)` y `right(i)` ya cumplen el invariante de montículo máximo, pero
`A[i]` podría ser menor que alguno de ellos. Restaura el invariante en todo
el subárbol enraizado en `i`.

## Intuición

Es "hundir" un elemento: se compara contra sus dos hijos, se intercambia
con el mayor si hace falta, y se repite en la nueva posición — hasta que el
elemento llega a una hoja o ya es mayor que ambos hijos.

## Algoritmo

1. Calcular `l = left(i)`, `r = right(i)`.
2. `m ← i`. Si `l ≤ n` y `A[l] > A[m]`, entonces `m ← l`.
3. Si `r ≤ n` y `A[r] > A[m]`, entonces `m ← r`.
4. Si `m ≠ i`: intercambiar `A[i]` y `A[m]`, y repetir el proceso con `i = m`.
5. Si `m = i`: terminar (invariante local ya cumplido).

## Pseudocódigo

```
Algoritmo 1: Max-Heapify(A, i, n)
l ← 2i, r ← 2i + 1 ;
m ← i ;
si l ≤ n y A[l] > A[m] entonces
     m ← l
si r ≤ n y A[r] > A[m] entonces
     m ← r
si m ≠ i entonces
     intercambiar A[i] y A[m] ;
     Max-Heapify(A, m, n)
```

## C++

Ver `step-2-max-heapify.cpp` (versión iterativa de la recursión de cola del
pseudocódigo) y `full-implementation.cpp` en el editor de arriba.

## Complejidad temporal

### Matemática paso a paso

En cada llamada se calculan dos índices, se hacen como máximo dos
comparaciones y, si hace falta, un intercambio. Ese trabajo no depende de
cuántos nodos tenga el heap: es $O(1)$ **por nivel**.

Tras un intercambio, el elemento que estaba en `i` baja a uno de sus hijos.
No vuelve a subir ni visita la otra rama, así que la recursión sigue un único
camino hasta una hoja. Un heap de `n` nodos tiene altura
$\lfloor\lg n\rfloor$, de modo que ese camino contiene a lo más
$O(\lg n)$ niveles.

$$
\underbrace{O(1)}_{\text{trabajo por nivel}}
\times
\underbrace{O(\lg n)}_{\text{niveles de un camino}}
=O(\lg n).
$$

Esto es el **costo real de esta llamada**, no un promedio amortizado sobre
otras llamadas. El peor caso es que el valor de `A[i]` llegue hasta una hoja.

> **Para recordar.** Max-Heapify no recorre el árbol completo: sólo baja por
> una rama. Una rama tiene altura `lg n`, por eso cuesta `O(lg n)`.

## Complejidad espacial

El profesor no la da. La versión recursiva usaría $O(\lg n)$ de pila (una
llamada por nivel); la versión iterativa de arriba usa $O(1)$ adicional.

## Ejemplo

Ver la visualización de arriba y [Ejemplos](/structures/binary-heap/examples):
`A = [4, 14, 10, 8, 2, 9, 3]`, `Max-Heapify(A, 1, 7)` → `[14, 8, 10, 4, 2, 9, 3]`.
Este es el único ejemplo que trae el mazo del profesor (páginas 11-15).

## Casos límite

- **`i` es hoja** ($i > \lfloor n/2 \rfloor$): ni `l` ni `r` son `≤ n`, así que `m` se
  queda en `i` y la función termina de inmediato sin comparar nada — el
  profesor lo señala explícitamente como "ya es trivialmente un montículo
  máximo de un solo nodo".
- **Sólo hijo izquierdo** (`l ≤ n` pero `r > n`): la guarda `r ≤ n` evita
  leer fuera del arreglo; sólo se compara contra `A[l]`.
- **Duplicados**: la comparación es estricta (`>`), así que un empate no
  dispara intercambio — el elemento se queda donde está, lo cual sigue
  siendo válido para el invariante (`≥`).
