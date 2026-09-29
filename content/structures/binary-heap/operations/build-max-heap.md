---
kind: operation
title: Build-Max-Heap
order: 2
cppSteps:
  - step-1-array-indices.cpp
  - step-2-max-heapify.cpp
  - step-3-build-max-heap.cpp
  - full-implementation.cpp
visualization:
  type: tree
  steps:
    - note: >-
        Derivado del pseudocódigo; no aparece en las diapositivas (que sólo
        traen el ejemplo de Max-Heapify aislado). Se reutiliza el mismo
        arreglo, ahora tratado como entrada arbitraria de Build-Max-Heap:
        A = [4, 14, 10, 8, 2, 9, 3], n=7, así que se recorre i = ⌊7/2⌋=3 hasta 1.
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
        i=3: Max-Heapify(A,3,7). A[3]=10 contra hijos A[6]=9 y A[7]=3: 10 ya
        es el mayor de los tres, "largest" se queda en 3, no hay intercambio.
      highlight: [n3, n6, n7]
      nodes:
        - { id: n1, value: 4, parent: null }
        - { id: n2, value: 14, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        i=2: Max-Heapify(A,2,7). A[2]=14 contra hijos A[4]=8 y A[5]=2: 14 ya
        es el mayor, no hay intercambio.
      highlight: [n2, n4, n5]
      nodes:
        - { id: n1, value: 4, parent: null }
        - { id: n2, value: 14, parent: n1 }
        - { id: n3, value: 10, parent: n1 }
        - { id: n4, value: 8, parent: n2 }
        - { id: n5, value: 2, parent: n2 }
        - { id: n6, value: 9, parent: n3 }
        - { id: n7, value: 3, parent: n3 }
    - note: >-
        i=1: Max-Heapify(A,1,7). Aquí sí hay violación: A[1]=4 es menor que
        A[2]=14. Esta es exactamente la secuencia de intercambios del ejemplo
        de Max-Heapify (ver esa operación) — termina en [14, 8, 10, 4, 2, 9, 3].
      highlight: [n1, n2]
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

Convierte un arreglo `A[1..n]` arbitrario en un montículo máximo, en el
propio arreglo (in-place).

## Intuición

Si se llama Max-Heapify de abajo hacia arriba, cada llamada puede confiar en
que los subárboles de sus hijos ya son montículos válidos (porque ya se
procesaron), así que sólo necesita reparar la raíz de su propio subárbol.
Las hojas ya son montículos triviales de un solo nodo, así que ni siquiera
hace falta tocarlas.

> **Duda frecuente: ¿por qué empieza en $\lfloor n/2\rfloor$?** Para un
> índice `i > floor(n/2)`, el hijo izquierdo sería `2i > n`. No existe ni
> siquiera ese primer hijo, así que `i` es hoja. Una hoja ya es por sí sola
> un Max-Heap válido; no hace falta llamar Max-Heapify sobre ella.

## Algoritmo

1. Para `i` desde $\lfloor n/2 \rfloor$ hasta `1` (en orden decreciente): llamar
   `Max-Heapify(A, i, n)`.
2. Toda posición con $i > \lfloor n/2 \rfloor$ es hoja y ya es trivialmente un
   montículo máximo de un solo nodo, por eso el recorrido empieza en
   $\lfloor n/2 \rfloor$ y no en `n`.

## Pseudocódigo

```
Algoritmo 3: Build-Max-Heap(A, n)
para i ← ⌊n/2⌋ a 1 hacer
   Max-Heapify(A, i, n) ;
```

## C++

Ver `step-3-build-max-heap.cpp` y `full-implementation.cpp` en el editor de
arriba.

## Complejidad temporal

### ¿Qué significa?

El costo que se suma aquí es el **costo real total de una sola ejecución**
de `Build-Max-Heap`. No es costo amortizado: no estamos repartiendo el costo
de una secuencia de operaciones en el tiempo. Estamos contando cuánto puede
trabajar cada llamada a `Max-Heapify` según la altura donde empezó.

La idea ingenua dice:

$$\frac n2\text{ llamadas}\times O(\lg n) = O(n\lg n).$$

Es una cota válida, pero no ajustada. Trata como si cada una de las `n/2`
llamadas pudiera bajar desde la raíz hasta una hoja. En realidad, casi todas
empiezan muy cerca de las hojas y sólo unas pocas están cerca de la raíz.

### Ejemplo: árbol de 15 nodos

```text
altura desde las hojas     cuántos nodos aproximadamente
h = 0  (hojas)             n/2  = 8
h = 1                       n/4  = 4
h = 2                       n/8  = 2
h = 3                       n/16 = 1
```

Al subir un nivel, dos subárboles de abajo comparten un mismo padre. Por eso
el número de nodos se divide entre 2 cada vez. En general, para una altura
`h`, el profesor usa la cota:

$$\text{nodos a altura }h\le \left\lceil\frac{n}{2^{h+1}}\right\rceil.$$

El `h+1` aparece porque en altura 0 ya queremos `n/2`, no `n`: al reemplazar
`h` por 0 queda $n/2^{0+1}=n/2$. Si `h=1`, queda `n/4`; si `h=2`, `n/8`.

### Matemática paso a paso

Un nodo a altura `h` puede bajar como máximo `h` niveles, así que su
`Max-Heapify` cuesta $O(h)$. Multiplicamos dos cantidades que ya sabemos
qué representan: cuántos nodos hay a esa altura, por el trabajo de cada uno.

$$
T(n)\le \sum_{h=0}^{\lfloor\lg n\rfloor}
\left\lceil\frac{n}{2^{h+1}}\right\rceil O(h).
$$

Para la cota asintótica, el factor importante es `n/2^(h+1)`; sacar `n`
fuera de la suma deja una constante `1/2` que se absorbe en $O(\cdot)$:

$$
T(n)=O\left(n\sum_{h=0}^{\lfloor\lg n\rfloor}\frac{h}{2^h}\right).
$$

Todos los términos $h/2^h$ son no negativos. Agregar más términos no
puede hacer menor la suma, por lo que podemos usar una suma más fácil de
acotar:

$$
\sum_{h=0}^{\lfloor\lg n\rfloor}\frac{h}{2^h}
\le
\sum_{h=0}^{\infty}\frac{h}{2^h}.
$$

> **Duda frecuente: ¿por qué se permite llegar hasta infinito?** No estamos
> diciendo que el heap tenga infinitos niveles. Sólo reemplazamos una suma
> finita por una cota superior: los términos nuevos son positivos y hacen el
> lado derecho mayor, nunca menor.

Ahora llamemos `S` a esa serie infinita. Escribimos sus primeros términos:

$$
S=\frac12+\frac24+\frac38+\frac4{16}+\cdots
$$

Al dividir toda la igualdad entre 2, cada denominador se duplica:

$$
\frac S2=\frac14+\frac28+\frac3{16}+\cdots
$$

Restamos la segunda línea de la primera. Cada término que queda vale una
potencia de $1/2$:

$$
S-\frac S2=\frac12+\frac14+\frac18+\frac1{16}+\cdots=1.
$$

Como el lado izquierdo es $S/2$, obtenemos $S/2=1$, y por tanto
$S=2$. Sustituir una constante por 2 da:

$$T(n)=O(n\cdot2)=O(n).$$

También hay una cota inferior $\Omega(n)$: el bucle examina
$\lfloor n/2\rfloor$ posiciones internas incluso cuando el arreglo ya
es un heap. Por ello hay trabajo lineal inevitable. Juntando ambas cotas:

$$\text{Build-Max-Heap}=\Theta(n).$$

> **Para recordar.** Hay muchos nodos baratos cerca de las hojas y muy pocos
> nodos caros cerca de la raíz. Por eso sumar los costos reales da `Θ(n)`,
> no `Θ(n lg n)`.

## Complejidad espacial

El profesor no la da. La construcción es in-place: no reserva arreglos
adicionales ($O(1)$ más allá de la pila de Max-Heapify).

## Ejemplo

Derivado del pseudocódigo (ver visualización arriba): sobre
`A = [4, 14, 10, 8, 2, 9, 3]`, las posiciones `i=3` e `i=2` ya cumplen el
invariante localmente; sólo `i=1` dispara la misma cadena de intercambios
que el ejemplo de Max-Heapify, terminando en `[14, 8, 10, 4, 2, 9, 3]`.

## Casos límite

- **Arreglo ya es montículo**: cada llamada a Max-Heapify termina de
  inmediato (ningún intercambio), pero igual se hacen las $\lfloor n/2 \rfloor$ llamadas.
- **$n \le 1$**: $\lfloor n/2 \rfloor = 0$, el bucle no itera — un arreglo de 0 o 1
  elementos ya es trivialmente un montículo.
- **Orden inverso** (el peor caso real para el número de intercambios):
  sigue siendo $\Theta(n)$ total, no por elemento — es justamente lo que el
  argumento agregado por niveles demuestra.
