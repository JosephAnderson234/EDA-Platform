---
kind: theory
title: Montículo Binario
---

## ¿Qué problema resuelve?

El material no plantea un problema motivador explícito para el montículo
binario: lo introduce directamente como definición ("un arreglo que
representa un árbol binario casi completo"). Su utilidad como estructura de
datos aparece implícita en la tabla comparativa de colas de prioridad
(insert, find-min, extract-min, union, decrease-key, delete) y se hace
explícita recién en el resumen: "el montículo binario es simple y $\Theta(n)$ para
construir, pero $\Theta(n)$ para Union" — la debilidad que motiva pasar al
montículo binomial.

## Intuición

### ¿Qué significa?

Un **árbol binario casi completo** tiene todos sus niveles llenos, salvo
quizá el último. Si el último no está lleno, sus nodos aparecen de izquierda
a derecha, sin huecos intermedios. Esa forma es la razón por la que el árbol
se puede guardar en un arreglo: al no haber huecos arbitrarios, la posición
de un nodo ya indica dónde deben estar su padre y sus hijos.

Un **Max-Heap** (o montículo máximo) no ordena todo el arreglo de mayor a
menor. Sólo exige una regla local: cada padre es mayor o igual que cada hijo.
Por eso la raíz contiene el máximo, aunque dos nodos de ramas distintas no
tengan por qué estar ordenados entre sí.

### Ejemplo

Con índices que empiezan en 1, como en el material:

```text
A = [14, 8, 10, 4, 2, 9, 3]

          14
        /    \
       8      10
      / \    / \
     4   2  9   3
```

El arreglo se lee por niveles, de izquierda a derecha. Por ejemplo, el valor
de `A[2]` es 8 y sus hijos están en `A[4]` y `A[5]`: 4 y 2. Se verifica que
14 es mayor que 8 y 10; 8 es mayor que 4 y 2; y 10 es mayor que 9 y 3.

> **Para recordar.** Un Max-Heap no es un arreglo ordenado. Es un árbol casi
> completo guardado por niveles, donde cada padre domina sólo a sus hijos.

## Estructura interna

### ¿Qué significa?

Sea `i` el índice de una celda del arreglo `A[1..n]`. Como el árbol se llena
por niveles, al agrupar los índices de dos en dos aparece la relación:

$$
parent(i)=\lfloor i/2\rfloor,\qquad left(i)=2i,\qquad right(i)=2i+1.
$$

Aquí `floor` ($\lfloor\ \rfloor$) significa redondear hacia abajo. Por
ejemplo, `parent(5)=floor(5/2)=2`; por eso el nodo `A[5]=2` del ejemplo tiene
como padre a `A[2]=8`.

La regla que debe mantenerse es el **invariante de montículo máximo**:

$$A[parent(i)] \ge A[i].$$

La variable `i` representa cualquier nodo que sí tenga padre. La fórmula no
ordena hermanos ni ramas distintas: sólo compara una arista padre-hijo. Esa
es exactamente la pequeña parte de la estructura que `Max-Heapify` repara.

### Duda frecuente: ¿por qué no hay hijos después de $\lfloor n/2\rfloor$?

Si `i > floor(n/2)`, entonces `2i > n`. Pero `2i` sería el índice del hijo
izquierdo, así que ese nodo no puede tener hijos: es una hoja. De ahí sale
que `Build-Max-Heap` empiece en `floor(n/2)`.

## Operaciones

- [Max-Heapify](/structures/binary-heap/operations/max-heapify) — hunde un
  elemento hasta restaurar el invariante en su subárbol.
- [Build-Max-Heap](/structures/binary-heap/operations/build-max-heap) —
  convierte un arreglo arbitrario en montículo máximo.
- [Insert](/structures/binary-heap/operations/insert) — agrega un elemento
  y lo sube hasta su lugar.
- [Find-Min](/structures/binary-heap/operations/find-min) — lee el extremo
  del montículo (ver nota de apoyo abajo sobre el nombre).
- [Extract-Min](/structures/binary-heap/operations/extract-min) — retira el
  extremo y restaura el invariante.
- [Union](/structures/binary-heap/operations/union) — combina dos
  montículos en uno.
- [Decrease-Key](/structures/binary-heap/operations/decrease-key) — cambia
  la prioridad de un elemento ya insertado.
- [Delete](/structures/binary-heap/operations/delete) — retira un elemento
  arbitrario del montículo.

## Análisis de complejidad

### ¿Por qué aparece $\lg n$ en los heaps?

Primero llamemos `h` a la altura del árbol y `n` a su número de nodos. Un
árbol binario casi completo de altura `h` tiene al menos un nivel completo
hasta esa altura y no alcanza a tener un nivel completo más. Por eso el
tamaño `n` queda entre estas dos potencias de 2:

$$h \le \lg n < h+1.$$

No es todavía una conclusión: dice que el logaritmo de `n` está entre la
altura entera `h` y el siguiente entero. Elevamos los tres lados en base 2;
como la potencia de base 2 crece al aumentar el exponente, se conserva el
orden:

$$2^h \le 2^{\lg n} < 2^{h+1}.$$

Por definición de `lg`, $2^{\lg n}=n$. Sustituyendo ese término central:

$$2^h \le n < 2^{h+1}.$$

Esta desigualdad significa: `n` nodos alcanzan para tener altura `h`, pero
no para completar un árbol de altura `h+1`. Por tanto, el entero que está
debajo de $\lg n$ es justamente `h`:

$$h=\lfloor\lg n\rfloor.$$

Una operación que baja por un solo camino raíz-hoja o sube por un único
camino hoja-raíz visita como máximo un nodo por nivel. Por ello visita a lo
sumo $O(\lg n)$ niveles; no explora todos los nodos del árbol.

> **Para recordar.** El `log n` no aparece por magia: contar niveles de un
> árbol binario equivale a preguntar cuántas veces se puede duplicar hasta
> llegar a `n`.

El profesor usa dos estilos distintos, ambos **recurrence-based por conteo
de niveles**, nunca amortizado ni potencial (esos aparecen recién con el
montículo binomial y de Fibonacci):

- **Max-Heapify**: no plantea la recurrencia $T(n) = T(2n/3) + O(1)$ con
  teorema maestro. Razona directo por altura del camino: "$O(1)$ de trabajo
  por nivel, y a lo más $O(\lg n)$ niveles: $T(n) = O(\lg n)$".
- **Build-Max-Heap**: suma el costo real nivel por nivel usando el lema de
  que a lo más $\lceil n/2^{h+1} \rceil$ nodos están a altura `h`:

  $$T(n) \le \sum_{h=0}^{\lfloor \lg n \rfloor} \lceil n/2^{h+1} \rceil \cdot O(h) = O\left(n \cdot \sum h/2^h\right)$$

  y cierra porque esa serie geométrica derivada converge a 2. Es análisis
  agregado por sumatoria — de ahí sale la cota **ajustada** $\Theta(n)$, en
  vez de la cota ingenua $O(n \lg n)$ de llamar Max-Heapify n/2 veces sin
  este argumento.

> **Nota de apoyo** (no está en las diapositivas): el profesor enseña el
> montículo binario como **máximo**, pero la tabla comparativa de la
> diapositiva 19 nombra las operaciones de cola de prioridad en su forma
> de **mínimo** (find-min, extract-min, decrease-key) — convención genérica
> que usa para comparar contra el montículo binomial y el de Fibonacci
> (que sí enseña como min-heap). En este montículo *máximo*, esos nombres
> se leen con la raíz jugando el papel del extremo: "find-min" devuelve la
> raíz (el máximo), "extract-min" la retira, y "decrease-key" es en
> realidad *aumentar* una llave y subirla (porque en un max-heap moverse
> hacia la raíz significa hacerse más grande, no más chico). La simetría es
> exacta: todo lo dicho aquí para "máximo" vale para "mínimo" invirtiendo
> el comparador (`≥` por `≤`).

Insert, find-min, extract-min, union, decrease-key y delete **sólo
aparecen como filas de esa tabla**: el profesor no da pseudocódigo ni
análisis propio de ninguna para el binario. Sus páginas de operaciones se
derivan del mismo argumento de altura (sift-up/sift-down recorren a lo más
$\lfloor \lg n \rfloor$ niveles) — marcado como derivado en cada operación.

## Tabla de complejidad

La tabla se genera desde `meta.yaml`. El profesor nunca distingue
mejor/promedio/peor ni menciona espacio en este mazo: sólo da una cota por
operación (peor caso), y eso es lo único que aparece.

## Ejemplos

Ver [Ejemplos](/structures/binary-heap/examples). Sólo el de Max-Heapify
(`[4, 14, 10, 8, 2, 9, 3]`) está en las diapositivas; el resto se deriva.

## Comparación con estructuras relacionadas

| | Insert | Find-min | Extract-min | Union | Decrease-key | Delete |
| --- | --- | --- | --- | --- | --- | --- |
| Montículo binario | $\Theta(\lg n)$ | $\Theta(1)$ | $\Theta(\lg n)$ | $\Theta(n)$ | $\Theta(\lg n)$ | $\Theta(\lg n)$ |

El profesor sólo da esta fila para el binario en la tabla comparativa
(diapositiva 19); las filas de binomial y Fibonacci se explican en sus
propias estructuras. La razón declarada para pasar al montículo binomial es
que este "arregla Union ($O(\lg n)$)".

## Prueba de dominio

Ver [Prueba de dominio](/structures/binary-heap/mastery-check).
