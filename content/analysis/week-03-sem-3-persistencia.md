# Sem_3_Persistencia-1.pdf
semana: week-03
páginas totales: 74 (páginas PDF; 37 diapositivas lógicas — Beamer con overlays)

> Nota de notación: mismo esquema que semanas 1 y 2. Doy **siempre el rango de páginas
> PDF** (lo que usa el knowledge map) y entre paréntesis la diapositiva lógica del pie
> (`N / 37`).
>
> Mapa completo diapositiva → páginas PDF:
> 1→1, 2→2-5, sección "Máquina de Punteros"→6, 4→7-8, 5→9-12,
> sección "Persistencia"→13, 7→14-15, 8→16-17, 9→18-20, 10→21-22, 11→23-24,
> 12→25-26, 13→27-28, 14→29-30, 15→31-33, 16→34-35, 17→36-37, 18→38-39,
> 19→40-41, 20→42-43, 21→44-45, 22→46-47, 23→48-49, 24→50-51,
> sección "Path Copying en la Práctica"→52, 26→53-54, 27→55-56, 28→57, 29→58,
> 30→59-61, 31→62, 32→63-65, 33→66-70, 34→71, 35→72, 36→73, 37→74.

Metadatos de portada (página 1): "CS3014 - Estructura de Datos Avanzados /
Persistencia / Semana 3 / Víctor Racsó Galván Oyola / vgalvan@utec.edu.pe /
25 de agosto de 2026".

> **Aviso de ordenamiento de la semana 3.** Esta carpeta tiene dos mazos. Éste
> (Persistencia) está fechado el **25 de agosto**; el otro
> (`CS3014_Estructuras_de_Datos_Avanzadas_2s2026 (2).pdf`, Retroactividad) está fechado
> el **28 de agosto**. O sea, Persistencia va **primero** dentro de la semana 3, y el
> mazo de Retroactividad la referencia como concepto ya visto. Importante para el orden
> del knowledge map.

Agenda declarada por el profesor (páginas 2-5, diapositiva 2):
- La máquina de punteros: nuestro modelo de cómputo
- Persistencia: parcial, total, confluente y funcional
- Path Copying en la práctica: Stack, Segment Tree y Trie

## Temas cubiertos

### pointer-machine
- título como lo llama el profesor: "La máquina de punteros (*pointer machine*)"
- tipo: concept
- diapositivas: #6-12 (páginas PDF), es decir la diapositiva de sección (página 6)
  más las diapositivas lógicas 4-5
- qué problema resuelve (según el material, no según yo): fijar el modelo de cómputo
  para poder hablar de costos. Textual (página 7, diapositiva 4): "Para poder decir
  cosas como 'esta estructura se puede volver persistente en O(1) amortizado',
  necesitamos primero acordar **qué operaciones cuestan O(1)** en la estructura
  original." Y la elección (página 8): "La respuesta de este curso: la máquina de
  punteros. Un modelo simple, pero suficientemente general para describir casi
  cualquier estructura enlazada (listas, árboles, heaps, tries, …)."
- operaciones cubiertas: no es una estructura con operaciones propias; son las **reglas
  del modelo** (páginas 9-12, diapositiva 5), construidas en 3 overlays:
  - Cada nodo tiene `O(1)` campos (datos o punteros a otros nodos) — página 10.
  - Hay un único nodo raíz, punto de entrada a toda la estructura — página 11.
  - Cada operación (leer/escribir un campo, seguir un puntero) cuesta `O(1)` — página 12.
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | leer un campo | — | — | `O(1)` (por definición del modelo) | — |
  | escribir un campo | — | — | `O(1)` (por definición del modelo) | — |
  | seguir un puntero | — | — | `O(1)` (por definición del modelo) | — |

  No son complejidades derivadas: son **axiomas del modelo**. El profesor no distingue
  mejor/prom/peor ni habla de espacio aquí.
- estilo de análisis del profesor: **otro — definición de modelo de cómputo**.
  Por qué: no hay análisis. Son tres reglas enunciadas como postulados, acompañadas de
  una figura. Todo el análisis posterior del mazo (nodos gordos, path copying) se apoya
  en estas reglas como premisas.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - Punteros y estructuras enlazadas. El profesor los nombra ("listas, árboles, heaps,
    tries") asumiendo familiaridad total.
  - Notación asintótica `O`.
  - **Menciona explícitamente** heaps y tries entre los ejemplos de estructuras
    enlazadas — heaps se vieron en semanas 1-2; tries **no se han visto** (aparecen
    recién en la última sección de este mismo mazo).
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `usedBy: partial-persistence` — el teorema de Driscoll–Sarnak–Sleator–Tarjan
    (página 34, diapositiva 16) se enuncia **explícitamente sobre este modelo**:
    "Cualquier estructura de datos **sobre la máquina de punteros** en la que a lo mucho
    p = O(1) punteros apuntan a un mismo nodo…". Dependencia dura declarada.
  - El profesor lo enmarca como el modelo de todo el curso ("La respuesta de **este
    curso**"), no sólo de esta clase.
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - Páginas 9-12 (diapositiva 5): figura de la máquina de punteros. Verificada
    visualmente. Muestra cuatro **nodos rectangulares partidos en dos celdas**
    (celda superior = dato, celda inferior = puntero, dibujado como un punto `•`).
    Una etiqueta "raíz" con flecha entra al primero. Los datos son `7`, `2`, `7`, `42`.
    Las flechas van: raíz → nodo(7) → nodo(2) → nodo(7) → nodo(42) (este último
    colgando hacia abajo del tercero). El último nodo (42) también tiene su celda de
    puntero dibujada.
  - **No es una visualización paso a paso**, es un diagrama estático de referencia.
    Pero es el diagrama que la plataforma debería reutilizar como base para animar
    nodos gordos y path copying: ambas técnicas se explican **sobre este mismo modelo
    de nodo** y el mazo nunca las dibuja.
- pseudocódigo presente: ninguno.
- ejemplos concretos que usa el profesor (valores, árboles, secuencias): sólo la figura
  de las páginas 9-12, con los valores `7`, `2`, `7`, `42`. Sin operaciones trazadas
  sobre ella.
- casos límite que menciona: ninguno. El profesor no discute qué queda fuera del modelo
  (aritmética de direcciones, arreglos de acceso aleatorio, la RAM machine), lo cual es
  justamente lo que haría interesante el contraste.

### persistence-levels
- título como lo llama el profesor: "Persistencia" (la sección), con las diapositivas
  "¿Qué significa que una estructura sea persistente?", "Niveles de persistencia:
  parcial y total" y "Niveles de persistencia: confluente y funcional"
- tipo: concept
- diapositivas: #13-20 (páginas PDF), es decir la diapositiva de sección (página 13)
  más las diapositivas lógicas 7-9. La persistencia confluente se retoma en las páginas
  46-47 (diapositiva 22) y la funcional en las páginas 48-49 (diapositiva 23).
- qué problema resuelve (según el material, no según yo): conservar todas las versiones
  anteriores de una estructura. Textual (páginas 14-15, diapositiva 7): "Una estructura
  de datos es persistente si, al modificarla, conserva todas sus versiones anteriores:
  cada operación se realiza sobre una versión específica, y una actualización crea (y
  devuelve) una versión nueva sin destruir la anterior." Contraste explícito: "En una
  estructura **efímera** (lo normal), actualizar destruye el estado anterior: solo existe
  'el ahora'. La persistencia agrega una **dimensión de tiempo** a la estructura."
- operaciones cubiertas: no aplica. Es una **taxonomía de cuatro niveles**:
  - **Persistencia parcial** — páginas 16-17 (diapositiva 8). "Solo se puede actualizar
    la versión más reciente; se puede consultar cualquier versión anterior. Las
    versiones quedan ordenadas **linealmente**, como una línea de tiempo."
  - **Persistencia total (full)** — páginas 16-17 (diapositiva 8). "Se puede actualizar
    cualquier versión, no solo la última — cada actualización crea una nueva versión
    hija de la que se modificó. Las versiones forman un **árbol**."
  - **Persistencia confluente** — páginas 18-20 (diapositiva 9). "Además de actualizar,
    se puede **combinar (mezclar)** dos versiones distintas en una nueva. Las versiones
    forman un **DAG**, no un árbol."
  - **Persistencia funcional** — páginas 18-20 (diapositiva 9). "Una **técnica de
    implementación** (no un nivel más): la estructura nunca modifica un nodo existente,
    solo crea nodos nuevos. Cualquier nivel de persistencia se puede lograr así,
    típicamente al costo de un poco más de espacio."
- complejidades que da el profesor: ninguna en esta sección (las complejidades vienen
  con las técnicas: nodos gordos y path copying). Lo que da es la **forma del grafo de
  versiones** por nivel:

  | nivel | qué se puede actualizar | qué se puede consultar | forma de las versiones |
  | --- | --- | --- | --- |
  | parcial | sólo la más reciente | cualquiera | línea (orden lineal) |
  | total (full) | cualquiera | cualquiera | árbol |
  | confluente | cualquiera, y además se combinan dos | cualquiera | DAG |
  | funcional | (técnica, no nivel) nunca se muta nada | cualquiera | cualquiera de las anteriores |

- estilo de análisis del profesor: **otro — taxonomía / definición por niveles**.
  Por qué: no hay costos ni recurrencias; hay cuatro definiciones ordenadas por poder
  expresivo, cada una caracterizada por la forma del grafo de versiones. El profesor
  cierra fijando el alcance de la clase (página 20): "Hoy nos enfocamos en **parcial y
  total** (las más usadas en la práctica), y usamos la idea funcional como base de la
  última sección." Esa frase delimita qué es contenido desarrollado y qué es mención.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **DAG** (grafo dirigido acíclico) — usado sin definir (página 18).
  - Árbol enraizado, hijo, ancestro — usados sin definir.
  - "Estructura efímera" — el profesor sí la glosa ("lo normal, actualizar destruye el
    estado anterior").
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `usedBy: fat-nodes` (parcial y total) y `usedBy: path-copying` (funcional).
    Declarado en la página 20.
  - **Relación cruzada con el otro mazo de semana 3**: `CS3014_..._2s2026 (2).pdf`
    (Retroactividad) dedica una diapositiva entera (páginas 11-13, diapositiva 5) a
    contrastar persistencia con retroactividad: "Son ideas 'duales': persistencia
    **ramifica el futuro**; retroactividad **reescribe el pasado** y propaga el efecto
    hacia el presente." Ese mazo **depende** de éste.
  - La persistencia parcial del **Segment Tree** conecta con el Segment Tree que el mazo
    de Retroactividad usa sobre el eje del tiempo (ver Huecos: el Segment Tree nunca se
    enseña en ninguno de los dos mazos).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **No hay ninguno en esta sección.** Los cuatro niveles se definen sólo en prosa.
    Es una carencia clara: "línea vs. árbol vs. DAG" es exactamente lo que un diagrama
    de tres paneles resolvería en un segundo. El único grafo de versiones que el mazo
    dibuja aparece mucho después (páginas 38-39, en persistencia total).
- pseudocódigo presente: ninguno.
- ejemplos concretos que usa el profesor (valores, árboles, secuencias): ninguno en
  esta sección. Las definiciones son abstractas.
- casos límite que menciona:
  - La aclaración de que **funcional no es un nivel** sino una técnica, y que "cualquier
    nivel de persistencia se puede lograr así, típicamente al costo de un poco más de
    espacio" (página 19). Es la distinción conceptual más importante de la sección.

### fat-nodes
- título como lo llama el profesor: "La técnica: **nodos gordos** (*fat nodes*)"
- tipo: algorithm (técnica de transformación de estructuras)
- diapositivas: #21-33 (páginas PDF) para persistencia parcial — diapositivas lógicas
  10-15 — más #36-45 (diapositivas 17-21) para persistencia total
- qué problema resuelve (según el material, no según yo): volver **parcialmente
  persistente** cualquier estructura de la máquina de punteros con `O(1)` overhead
  amortizado, y luego **totalmente persistente** con el mismo orden. Es la
  implementación del teorema DSST.
- operaciones cubiertas:
  - **Leer un campo en la versión t** — páginas 23-24 (diapositiva 11).
    "Se revisa el registro de modificaciones de más reciente a más antigua, y se toma
    la primera con tiempo ≤ t; si no hay ninguna, se usa el valor original del nodo.
    O(1), pues el registro tiene tamaño acotado."
  - **Escribir un campo (caso con espacio)** — páginas 29-30 (diapositiva 14).
  - **Escribir un campo (caso lleno) / split** — páginas 25-26 (diapositiva 12, la
    idea) y páginas 31-33 (diapositiva 15, el análisis).
  - **Nodos gordos bidireccionales** (para persistencia total) — páginas 42-43
    (diapositiva 20): dos registros por nodo y un split más delicado.
  - **Linearización del árbol de versiones (recorrido de Euler)** — páginas 38-39
    (diapositiva 18) y páginas 40-41 (diapositiva 19).
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | leer campo en versión t | — | — | `O(1)` (registro de tamaño acotado, página 24) | — |
  | escribir campo, hay espacio | — | — | `cᵢ = O(1)` real; **`ĉᵢ = O(1)` amortizado** (páginas 29-30) | `+1` entrada |
  | escribir campo, con split | — | — | `cᵢ = O(p)` real; **`ĉᵢ = O(1)` amortizado** (página 33) | `O(1)` nodo nuevo |
  | **overhead global (teorema DSST)** | — | — | **`O(1)` multiplicativo amortizado en tiempo** | **`O(1)` extra por cada cambio** |
  | persistencia total (nodos gordos bidireccionales) | — | — | **`O(1)` amortizado por operación** (páginas 44-45) | no lo da |
  | comparar / insertar tiempos (order maintenance) | — | — | `O(1)` ambas (página 41) | no lo da |

  Parámetros: `p` = número máximo de punteros entrantes a un nodo, con `p = O(1)` por
  hipótesis. Tamaño del registro de modificaciones: hasta `2p` entradas.

  **El profesor nunca distingue mejor/promedio/peor.** Da costo real y amortizado.
- estilo de análisis del profesor: **potential-method**, explícitamente heredado de la
  semana 2.
  Por qué lo clasifico así: la diapositiva 13 (páginas 27-28) se titula "Análisis
  amortizado: **repaso del método del potencial**" y arranca con "**Recordando de clases
  anteriores**: `ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)`, donde cᵢ es el costo real de la operación
  i, y Φ es una función de potencial que nunca cae por debajo de su valor inicial."
  Acto seguido define el potencial concreto
  `Φ = Σ_{nodos v} (entradas usadas en el registro de v)` y hace el análisis en dos casos
  (páginas 29-33), calculando `ΔΦ` en cada uno. Es la misma receta de semana 2, aplicada
  a otra estructura. Referencia cruzada dura week-03 → week-02 (`potential-method`).
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Menciona explícitamente**: el método del potencial, "recordando de clases
    anteriores" (página 27). Definido en `CS3014_..._(1)-1.pdf` (semana 2), páginas 32-33.
  - **Menciona explícitamente**: la máquina de punteros, en el enunciado del teorema.
  - Asume (no explica): **estructura de mantenimiento de orden** (*order-maintenance
    data structure*). El profesor la nombra y da su interfaz — "soporta comparar dos
    tiempos e insertar un tiempo nuevo entre otros dos, ambos en `O(1)`" (página 41) —
    pero **no la implementa ni la explica**. Es una caja negra crítica para la
    persistencia total.
  - Asume (no explica): **recorrido de Euler** de un árbol. Lo usa como técnica conocida
    ("Recorremos el árbol de versiones con un recorrido de Euler"), aunque sí explica
    la convención de paréntesis `(ᵢ` / `)ᵢ`.
  - Asume (no explica): secuencias balanceadas de paréntesis y la lectura
    "ancestros = paréntesis abiertos no cerrados".
  - Asume: notación asintótica, `Θ`/`O`, sumas.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: pointer-machine` — explícito en el teorema (página 34).
  - `buildsOn: potential-method` (semana 2) — explícito ("Recordando de clases
    anteriores", página 27).
  - `usedBy: BST parcialmente persistente` — el ejercicio de las páginas 34-35
    (diapositiva 16) lo pide, con la pista de que en un BST `p = 1`.
  - Contraste declarado con `path-copying`: en la página 49 (diapositiva 23) el profesor
    dice que la persistencia funcional da persistencia "gratis" porque "**no hace falta
    ningún registro de modificaciones ni ningún split**" — o sea, path copying es la
    alternativa a los nodos gordos, no su complemento.
  - Límite declarado hacia la persistencia confluente: los nodos gordos "pensadas para
    un único 'historial lineal o de árbol', **ya no bastan en general**" (página 47).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - Páginas 38-39 (diapositiva 18): **árbol de versiones** de 7 nodos. Verificado
    visualmente: raíz `1`; hijos `2` y `3`; `2` tiene hijos `4` y `5`; `3` tiene hijos
    `6` y `7` — un árbol binario completo de 3 niveles. Acompañado del ejemplo de
    linearización. Visualización pedida: el **recorrido de Euler** generando la
    secuencia de paréntesis, nodo por nodo.
  - **Ausencias graves**: el mazo **nunca dibuja un nodo gordo** (campos originales +
    registro de modificaciones como lista de tuplas `(campo, valor nuevo, tiempo)`), ni
    dibuja el **split** (nodo lleno → nodo nuevo limpio + redirección de los p punteros
    entrantes). Son los dos diagramas que el tema realmente exige, y no están. El
    diagrama de la máquina de punteros (páginas 9-12) es la base natural sobre la cual
    construirlos. Reconstruibles desde la prosa (derivación, no invención), pero
    conviene que el usuario lo autorice.
- pseudocódigo presente: **ninguno** en toda la sección de nodos gordos. Todo es prosa
  y fórmulas. Lo que sí hay, y transcribo, son las fórmulas del análisis:

```
Método del potencial (repaso, página 27):
ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)

Potencial para nodos gordos (página 28):
Φ = Σ_{nodos v} (entradas usadas en el registro de v)

Caso 1 — hay espacio en el registro (páginas 29-30):
cᵢ = O(1) ; ΔΦ = +1
ĉᵢ = O(1) + 1 = O(1)

Caso 2 — el registro está lleno, se hace split (páginas 31-33):
cᵢ = O(1) (nodo nuevo) + O(p) (redirigir los p punteros entrantes)
ΔΦ_split = −2p       (el nodo viejo pasa de 2p entradas usadas a 0)
ΔΦ_redirect ≤ +p     (cada redirección agrega a lo mucho 1 entrada en su predecesor)
ĉᵢ = O(p) + (−2p + p) = O(p) − p = O(1) ,  pues p = O(1) por hipótesis
```

Y la convención de linearización (páginas 38-39):

```
Recorrido de Euler sobre el árbol de versiones:
al entrar a la versión i marcamos el tiempo (ᵢ   ("se hace el cambio i")
al salir marcamos                          )ᵢ   ("se deshace el cambio i")

Ejemplo (subárbol de 1):  (₁ (₂ (₄ )₄ (₅ )₅ )₂ (₃ ···
```

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - El **árbol de versiones de 7 nodos** (páginas 38-39), numerado 1..7, con la
    linearización parcial `(₁ (₂ (₄ )₄ (₅ )₅ )₂ (₃ ···` — truncada con puntos
    suspensivos, el profesor no la completa.
  - El **ejercicio "¡Hazlo tú mismo!"** (páginas 34-35, diapositiva 16):
    "Implementa un árbol binario de búsqueda (BST) con persistencia parcial, usando la
    técnica de nodos gordos." Con pista: "en un BST, cada nodo tiene a lo mucho `p = 1`
    padre apuntándolo (más, quizás, un puntero externo a la raíz de cada versión) — el
    caso más simple posible de aplicar el teorema."
    Este es material directo para `exercises.md`.
  - **No hay** ninguna traza de un nodo gordo con tuplas concretas, ni un split trazado.
- casos límite que menciona:
  - **El registro lleno** (`2p` modificaciones): es el caso límite central y el motor de
    todo el análisis (páginas 25-26, diapositiva 12).
  - **Leer sin ninguna modificación registrada**: "si no hay ninguna, se usa el valor
    original del nodo" (página 24).
  - **`p = 1` en un BST** (páginas 34-35): el caso mínimo del teorema.
  - **Por qué los nodos gordos se rompen con persistencia total**: "Los nodos gordos
    guardaban modificaciones ordenadas **solo hacia adelante** en el tiempo. Si se puede
    actualizar una versión 'vieja', necesitamos poder navegar en **ambas direcciones**
    del árbol de versiones" (páginas 36-37, diapositiva 17).
  - **Por qué la confluente rompe todo**: "una misma versión puede depender de `u`
    actualizaciones distintas acumuladas por caminos diferentes del DAG… En el peor
    caso, hay hasta `2^u` formas distintas en que las actualizaciones pueden haberse
    combinado" (páginas 46-47, diapositiva 22).
  - **No menciona**: qué pasa si `p` no es `O(1)` (el teorema simplemente no aplica,
    pero no discute el costo); ni cómo se elige el `2p` exacto del registro.

### path-copying
- título como lo llama el profesor: "**Path Copying**: la técnica central", y la sección
  "Path Copying en la Práctica"
- tipo: algorithm (técnica de implementación de persistencia funcional)
- diapositivas: #48-70 (páginas PDF), es decir las diapositivas lógicas 23-24
  (persistencia funcional y la técnica), la diapositiva de sección (página 52), y las
  diapositivas 26-33 (los tres ejemplos y la comparación)
- qué problema resuelve (según el material, no según yo): actualizar una estructura
  funcional (que nunca muta nodos) **sin copiarla entera**. Textual (páginas 50-51,
  diapositiva 24): "La pregunta: Si nunca modificamos nodos, ¿cómo actualizamos algo
  sin copiar toda la estructura en cada operación? La respuesta: Path Copying. Solo se
  copian los nodos que están **en el camino desde la raíz hasta el punto que cambia**;
  todo lo demás (los subárboles que no cambian) se **comparte** entre la versión vieja y
  la nueva, vía punteros."
- operaciones cubiertas:
  - **Push (Stack persistente)** — páginas 55-56 (diapositiva 27). Pseudocódigo.
  - **Update (Segment Tree persistente)** — página 58 (diapositiva 29). Pseudocódigo.
    Estructura ilustrada en página 57 (diapositiva 28). Complejidad en páginas 59-61
    (diapositiva 30).
  - **Consultar una versión vieja (Segment Tree)** — páginas 59-61 (diapositiva 30).
    Sin pseudocódigo: "Basta guardar el puntero a la raíz de esa versión (devuelto por
    Update en su momento) y hacer la consulta normal desde ahí."
  - **Insert (Trie persistente)** — página 62 (diapositiva 31). Pseudocódigo.
    Complejidad en páginas 63-65 (diapositiva 32).
  - **Pop (Stack)**: **no aparece**. Sólo Push.
  - **Query (Segment Tree)**: no tiene pseudocódigo propio; se dice que es "la consulta
    normal".
- complejidades que da el profesor:

  | op | mejor | prom | peor | espacio |
  | --- | --- | --- | --- | --- |
  | path copying genérico (altura h) | — | — | `O(h)` tiempo (páginas 53-54) | `O(h)` espacio extra |
  | Push (Stack persistente) | — | — | `O(1)` (página 56) | `O(1)` |
  | Update (Segment Tree persistente) | — | — | `O(lg n)` (páginas 59-61) | `O(lg n)` espacio nuevo |
  | Query versión vieja (Segment Tree) | — | — | `O(lg n)`, "sin ningún costo adicional por ser una versión 'del pasado'" (páginas 59-61) | — |
  | Insert (Trie persistente) | — | — | `O(L)` con `L = |s|` (páginas 63-65) | `O(L)` espacio nuevo |
  | Trie persistente, espacio total tras n inserciones | — | — | — | `O(Σ Lᵢ)` "el mismo orden que un Trie efímero normal" (página 65) |

  Y la **tabla comparativa** que el profesor construye en 3 overlays
  (páginas 66-70, diapositiva 33):

  | | Stack | Segment Tree | Trie |
  | --- | --- | --- | --- |
  | Altura relevante | `1` | `O(lg n)` | `O(L)` |
  | Nodos copiados por operación | `1` | `O(lg n)` | `O(L)` |
  | Espacio nuevo por operación | `O(1)` | `O(lg n)` | `O(L)` |

  Moraleja que cierra la tabla (página 70): "En los tres casos: path copying cuesta
  **exactamente el largo del camino que cambia**, sin importar qué tan grande sea el
  resto de la estructura."

  **El profesor nunca distingue mejor/promedio/peor.** Aquí sí da espacio explícitamente
  (a diferencia del resto del curso), y es el único tema del mazo donde el espacio es
  un dato de primera clase.
- estilo de análisis del profesor: **otro — conteo directo del camino (análisis
  estructural, no amortizado)**.
  Por qué lo clasifico así: no hay recurrencia ni potencial. El argumento es literal y
  se repite tres veces: "Update copia **exactamente un nodo por nivel**, así que cada
  actualización cuesta O(lg n) tiempo y O(lg n) espacio nuevo" (páginas 59-61);
  "Insert copia **exactamente un nodo por carácter** de s: O(L)" (páginas 63-65). Es
  conteo directo de la longitud del camino modificado. Contrasta deliberadamente con la
  sección de nodos gordos, que sí es `potential-method`: el mazo enseña **dos estilos de
  análisis distintos para el mismo problema** (persistencia), y esa contraposición es
  probablemente su mejor aporte pedagógico.
- prerrequisitos que el profesor asume o menciona explícitamente:
  - **Segment Tree**: asumido por completo. El profesor lo usa como ejemplo 2, con
    `combinar(izq.valor, der.valor)`, rangos `[l, r]`, punto medio `m = ⌊(l+r)/2⌋` — y
    **nunca explica qué es un segment tree ni qué es `combinar`**. Ver Huecos: es el
    prerrequisito más pesado del mazo.
  - **Trie**: asumido por completo. Usa `nodo.hijos[c]` y `nodo.esFinal` sin definir la
    estructura.
  - **Stack como lista enlazada**: el profesor sí lo glosa ("Un stack (pila)
    implementado como lista enlazada ya es un 'camino' de un solo nodo de largo").
  - Asume: recursión sobre árboles, altura de un árbol, `lg`.
  - **Menciona explícitamente** un contexto externo: "muy usada en **programación
    competitiva** para responder consultas sobre prefijos o versiones históricas de un
    arreglo" (página 61). Única mención de aplicación práctica en todo el mazo.
- relación con otras estructuras del curso (buildsOn / usedBy), si el material lo dice:
  - `buildsOn: persistence-levels` (la noción de persistencia funcional) — explícito:
    "Path Copying implementa persistencia funcional" (resumen, página 71).
  - Contraste declarado con `fat-nodes`: "no hace falta ningún registro de
    modificaciones ni ningún split" (página 49).
  - Sobre el Stack: "Push es O(1) tiempo y espacio, en **cualquier nivel de
    persistencia** — ¡ni siquiera necesitamos llamarlo path copying, es persistencia
    funcional en su forma más pura!" (página 56).
  - **Relación cruzada con el otro mazo de semana 3**: `CS3014_..._(2).pdf`
    (Retroactividad), páginas 34-37 (diapositivas 15-16), construye un Segment Tree
    **sobre el eje del tiempo** y lo llama "la conexión con la clase pasada". Ese mazo
    trata al Segment Tree como ya visto — pero aquí también se asume como ya visto.
    Ver Huecos.
  - El profesor identifica el resultado con un nombre estándar: "Esta es exactamente la
    estructura conocida como **persistent segment tree**" (página 61).
- ¿tiene diagramas que pidan visualización paso a paso? cuáles y de qué operación:
  - **Página 57 (diapositiva 28): el mejor diagrama de todo el mazo.** Verificado
    visualmente. Segment Tree de 4 hojas: raíz `[1,4]`; hijos `[1,2]` y `[3,4]`; hojas
    `[1,1]`, `[2,2]`, `[3,3]`, `[4,4]`. La arista `[1,4] → [3,4]` está dibujada **en
    naranja** y la hoja `[4,4]` está **sombreada en naranja**. Leyenda: "Actualizar la
    posición 4 — Solo los nodos en naranja (el camino raíz → [3,4] → [4,4]) se copian;
    [1,2], [1,1], [2,2], [3,3] se comparten con la versión anterior sin tocarlos."
    Visualización pedida: **Update del Segment Tree persistente**, con el camino
    copiado y las aristas de compartición hacia la versión vieja.
    (Detalle menor: el texto nombra tres nodos del camino — raíz, `[3,4]`, `[4,4]` —
    pero en la figura el resaltado naranja es la arista y la hoja; el nodo `[3,4]` no
    aparece sombreado como tal. Ver Huecos.)
  - **Ausencias**: no hay diagrama del Stack persistente (compartición de la cola de la
    lista entre versiones), ni del Trie persistente (la rama copiada vs. el resto
    compartido). Ambos reconstruibles desde el pseudocódigo.
- pseudocódigo presente: transcrito íntegro (numeración "Algoritmo N" del último
  overlay de cada diapositiva).

```
Algoritmo 2: Push(S, x) — persistente
nuevo ← nodo con valor x y siguiente ← S ;
devolver nuevo ;        // S (la versión vieja) sigue intacta
```
(páginas 55-56, diapositiva 27)

```
Algoritmo 3: Update(nodo, l, r, pos, val)
nuevo ← copia de nodo ;
si l = r entonces
     nuevo.valor ← val ;
en otro caso
     m ← ⌊(l + r)/2⌋ ;
     si pos ≤ m entonces
         nuevo.izq ← Update(nodo.izq, l, m, pos, val) ;
     en otro caso
         nuevo.der ← Update(nodo.der, m+1, r, pos, val) ;
     nuevo.valor ← combinar(nuevo.izq.valor, nuevo.der.valor) ;
devolver nuevo ;
```
(página 58, diapositiva 29)

```
Algoritmo 4: Insert(nodo, s, i)
nuevo ← copia de nodo ;
si i = |s| entonces
     nuevo.esFinal ← verdadero ;
c ← s[i] ;
hijoViejo ← nodo.hijos[c] (o un Trie vacío si no existe) ;
nuevo.hijos[c] ← Insert(hijoViejo, s, i+1) ;
devolver nuevo ;
```
(página 62, diapositiva 31)

- ejemplos concretos que usa el profesor (valores, árboles, secuencias):
  - **Segment Tree de 4 posiciones** con la actualización de la posición 4
    (página 57): rangos `[1,4]`, `[1,2]`, `[3,4]`, `[1,1]`, `[2,2]`, `[3,3]`, `[4,4]`.
    Es el único ejemplo trabajado con valores concretos (de índices) del mazo.
  - **Pregunta "¡Piénsalo!"** (páginas 63-65, diapositiva 32), con su respuesta:
    "Si insertas n cadenas de largo total `Σ Lᵢ`, ¿cuánto espacio total usa el Trie
    persistente, comparado con guardar n copias completas del Trie?" →
    "`O(Σ Lᵢ)` en total — el mismo orden que un Trie efímero normal, porque cada
    carácter insertado crea a lo mucho un nodo nuevo, sin importar cuántas versiones
    acumules." Material directo para `exercises.md`.
  - **No hay** valores de llaves ni cadenas concretas: el Trie nunca se instancia con
    strings reales, el Stack nunca con elementos reales.
- casos límite que menciona:
  - **Stack: el caso degenerado del path copying** — "ya es un 'camino' de un solo nodo
    de largo: no hay nada que copiar aparte del nodo nuevo" (página 55). El profesor lo
    presenta explícitamente como el extremo inferior de la técnica.
  - **Trie: hijo inexistente** — "hijoViejo ← nodo.hijos[c] (**o un Trie vacío si no
    existe**)" (página 62). Único caso límite codificado en el pseudocódigo del mazo.
  - **Segment Tree: la hoja** — `si l = r entonces nuevo.valor ← val`.
  - **El espacio no explota con las versiones** (página 65): la respuesta al "¡Piénsalo!".
  - **No menciona**: qué pasa con `Pop` en el Stack persistente; recolección de basura /
    liberación de versiones muertas (relevante en C++ y totalmente ausente); qué pasa al
    insertar en un Trie una cadena que es prefijo de otra ya presente; el caso `n = 0`
    o el segment tree vacío.

## Conceptos de apoyo candidatos

Cosas necesarias para entender lo anterior que las diapositivas NO explican.
Ninguna es un tema del curso; son andamios.

1. **Segment Tree.** El más urgente, con diferencia. El mazo lo usa como ejemplo
   central de path copying (pseudocódigo `Update` completo, diagrama, complejidad,
   nombre propio "persistent segment tree") y **jamás define qué es**: ni la
   descomposición del arreglo en rangos, ni qué hace `combinar`, ni cómo se consulta un
   rango, ni por qué la altura es `O(lg n)`. Además el mazo hermano (Retroactividad) lo
   usa **otra vez** sobre el eje del tiempo. Sin este andamio, la mitad de la semana 3
   es incomprensible. Ver también Huecos #1.
2. **Trie.** Usado como ejemplo 3 con pseudocódigo (`nodo.hijos[c]`, `nodo.esFinal`) y
   nunca definido: ni la idea de árbol de prefijos, ni el alfabeto, ni por qué el
   camino tiene largo `L`.
3. **Estructura de mantenimiento de orden (*order-maintenance data structure*).**
   El profesor da sólo su interfaz (`comparar` e `insertar entre dos`, ambos `O(1)`) y
   la usa como caja negra en el corazón de la persistencia total. Sin ella, la
   linearización del árbol de versiones no cierra.
4. **Recorrido de Euler de un árbol.** Usado por nombre para linearizar el árbol de
   versiones; el profesor explica la convención de paréntesis pero no el recorrido.
5. **Secuencias balanceadas de paréntesis** y la lectura "los ancestros de i son los
   paréntesis abiertos y no cerrados antes de `(ᵢ`". El profesor enuncia esa
   correspondencia (páginas 40-41) como un hecho, sin justificarla.
6. **DAG (grafo dirigido acíclico).** Usado para caracterizar la persistencia
   confluente, sin definir.
7. **Método del potencial.** No es andamio externo: es **contenido del curso de la
   semana 2** (`CS3014_..._(1)-1.pdf`, páginas 32-33), y el profesor lo señala como
   repaso. Lo anoto aquí sólo para que el knowledge map lo resuelva como referencia
   cruzada week-03 → week-02, no como concepto nuevo.
8. **Estructura efímera vs. persistente en C++ (gestión de memoria).** El path copying
   crea nodos sin parar y el mazo nunca habla de quién los libera. Para la parte de
   implementación se usan punteros normales, vector de nodos, o simplemente no se libera (típico de programación competitiva).
   El material no dice nada.
9. **Layout del nodo gordo**: campos originales + registro de modificaciones como lista
   acotada de tuplas `(campo, valor nuevo, tiempo)`, más los punteros entrantes que
   habrá que redirigir en el split. Descrito en prosa, nunca como estructura de datos.
10. **BST (árbol binario de búsqueda).** El ejercicio de las páginas 34-35 lo pide
    implementar; el mazo lo asume conocido. Probablemente sí lo es a esta altura del
    curso, pero conviene registrarlo.

## Huecos y ambigüedades

1. **El Segment Tree se usa dos veces en la semana 3 y no se enseña en ninguna parte.**
   Este mazo lo usa como ejemplo central de path copying. El mazo de Retroactividad
   (`CS3014_..._(2).pdf`, páginas 34-37) lo usa sobre el eje del tiempo y lo introduce
   con el título **"La conexión con la clase pasada: Segment Tree"** y la frase
   "¡el mismo Update que ya conocemos!". Pero:
   - la "clase pasada" respecto a Retroactividad (28 de agosto) es Persistencia
     (25 de agosto), que tampoco lo enseña — sólo lo usa;
   - las semanas 1 y 2 son íntegramente montículos, sin rastro de Segment Tree.
   **Conclusión: falta material.** O hay un mazo de Segment Tree que no está en
   `raw-materials/`, o el profesor lo dio en otra sesión, o lo asume de un curso previo.
   **El usuario tiene que resolver esto antes de que se genere nada de semana 3**:
   determina si `segment-tree` es una estructura del curso (con su propia carpeta en
   `content/structures/`) o un `supportConcept: true`. Es la ambigüedad más importante
   de las tres semanas que revisé.
2. **Orden interno de la semana 3.** Los dos mazos tienen fechas distintas
   (Persistencia = 25 de agosto, Retroactividad = 28 de agosto) y el de Retroactividad
   referencia conceptos de éste. El knowledge map debería reflejar ese orden:
   Persistencia primero. Si `content/weeks/week-03.md` asume un solo mazo por semana,
   hay que ajustarlo.
3. **Desajuste menor entre el texto y la figura del Segment Tree (página 57).**
   El texto dice "el camino raíz → [3,4] → [4,4]" (tres nodos), pero en la figura sólo
   `[4,4]` aparece sombreado en naranja, junto con la **arista** `[1,4] → [3,4]`.
   El texto es el correcto (path copying copia los tres nodos del camino, incluida la
   raíz); el sombreado de la figura es incompleto. Al reconstruir la visualización hay
   que seguir el **texto**, no el sombreado.
4. **El pseudocódigo de `Insert` del Trie tiene un problema en el caso base.**
   Cuando `i = |s|`, el algoritmo marca `nuevo.esFinal ← verdadero` pero **no retorna**:
   sigue a `c ← s[i]`, que indexa fuera de la cadena, y recurre. Tal como está escrito,
   el algoritmo no termina correctamente. Falta un `devolver nuevo` dentro del `si`
   (o un `en otro caso`). Puede ser errata de las diapositivas o simplificación
   deliberada, pero **hay que corregirlo al implementar en C++** y conviene confirmarlo
   con el usuario, porque el archivo de la operación debe transcribir el pseudocódigo
   del profesor y a la vez producir código que funcione.
5. **Pop del Stack persistente no existe.** Sólo hay `Push`. La tabla comparativa
   (páginas 66-70) habla de "operación" en singular para el Stack. Si la plataforma
   genera `operations/pop.md`, no hay material fuente.
6. **`Query` del Segment Tree persistente no tiene pseudocódigo.** El profesor dice
   "hacer la consulta normal desde ahí" — pero la consulta normal nunca se mostró
   (ver Hueco #1).
7. **Cero ejemplos con valores reales.** Igual que en semanas 1 y 2: el Stack nunca
   tiene elementos, el Trie nunca tiene cadenas, el Segment Tree nunca tiene valores en
   las hojas (sólo rangos de índices), el nodo gordo nunca tiene tuplas concretas. Para
   `examples.md` (mínimo / normal / límite) de las cuatro entradas de este mazo **no hay
   material fuente directo**. Derivarlos del pseudocódigo es posible pero requiere
   autorización.
8. **La demostración de persistencia total se delega.** Página 45: "la demostración
   completa es más delicada (hay que contabilizar ambas direcciones y la estructura de
   orden), pero sigue el mismo patrón. Ver Driscoll–Sarnak–Sleator–Tarjan (1989) para
   el detalle completo." O sea, para `full-persistence` el `reasoning` disponible es un
   esbozo, no una prueba. Hay que ser honesto en la plataforma y no inflarlo.
9. **La persistencia confluente se menciona y se abandona.** Dos diapositivas
   (páginas 18-20 y 46-47) que explican qué es y por qué es difícil (`2^u`
   combinaciones), sin ninguna técnica. No da para una estructura; da para una sección
   conceptual.
10. **El teorema DSST no se demuestra en su generalidad.** El análisis de las
    páginas 27-33 demuestra el caso de los nodos gordos con registro `2p`, que es la
    técnica, pero el profesor no explicita que eso *es* la demostración del teorema.
    La conexión "teorema (página 34) ← análisis (páginas 27-33)" está invertida en el
    orden de exposición: el teorema se enuncia en la diapositiva 10 (páginas 21-22) y
    la técnica que lo prueba viene después. Conviene ordenarlo en la plataforma.
    *(Corrección de referencia: el teorema está en las páginas 21-22, diapositiva 10;
    el ejercicio del BST está en las páginas 34-35, diapositiva 16.)*
11. **Gestión de memoria ausente.** Ni una palabra sobre liberar versiones. En C++ es
    una decisión de diseño ineludible.
12. **Las diapositivas 3, 6 y 25 no existen** como páginas con pie numerado: las
    páginas 6, 13 y 52 son diapositivas de sección ("Máquina de Punteros",
    "Persistencia", "Path Copying en la Práctica"), con sólo el título y sin pie. Por
    eso el mapa salta 2→4, 5→7 y 24→26. No es un error.

## Cobertura

- Leí **las 74 páginas PDF**, rango 1-74, completo y sin saltos.
- Método: extracción de texto con `pdftotext -layout` página por página (con mapeo
  página→diapositiva verificado uno a uno vía el pie `N / 37`), más lectura visual
  directa de las páginas con contenido gráfico que el texto no captura.
- Páginas leídas visualmente (imagen):
  - **12** (máquina de punteros) — confirmado el layout de nodo en dos celdas
    (dato arriba, puntero abajo), la etiqueta "raíz" con su flecha, los valores
    `7, 2, 7, 42` y la topología de las flechas (el `42` cuelga del tercer nodo).
  - **39** (árbol de versiones para el recorrido de Euler) — confirmado que es un árbol
    binario completo de 7 nodos numerados 1..7 (raíz 1; hijos 2 y 3; 4 y 5 bajo el 2;
    6 y 7 bajo el 3), y la secuencia `(₁ (₂ (₄ )₄ (₅ )₅ )₂ (₃ ···`.
  - **57** (Segment Tree persistente) — confirmado el resaltado **en naranja** de la
    arista `[1,4] → [3,4]` y el sombreado naranja de la hoja `[4,4]`, detalle de color
    que la extracción de texto pierde por completo y que es el punto de la figura
    (además del desajuste texto/figura que anoto en Huecos #3).
- Páginas sin contenido útil:
  - Página 1: portada.
  - Páginas 2-5: agenda (tres viñetas, construidas en overlay).
  - Páginas 6, 13 y 52: diapositivas de sección (sólo título, sin pie numerado).
  - Página 72 (diapositiva 35): "Gracias".
  - Página 73 (diapositiva 36): Referencias — Driscoll, J. R., Sarnak, N., Sleator,
    D. D., & Tarjan, R. E. (1989), *Making data structures persistent*, Journal of
    Computer and System Sciences, 38(1); Cormen et al. (2022), *Introduction to
    Algorithms*, 4.ª ed., MIT Press; Demaine, Erik (2021), *6.851: Advanced Data
    Structures (Spring'21)*, https://courses.csail.mit.edu/6.851/spring21/.
  - Página 74 (diapositiva 37): agradecimientos y créditos (Luciano A. Romero Calla —
    "a su vez basadas en las clases de Erik Demaine, MIT 6.851" —, Erik Demaine,
    Keith Schwarz).
  - Página 71 (diapositiva 34) **sí** tiene contenido: es el resumen de la sesión, con
    cuatro viñetas que consolidan todo el mazo; lo usé para validar mis clasificaciones.
- **Ninguna página resultó ilegible.** Las páginas con fórmulas (28, 33) salen de
  `pdftotext` con el layout de LaTeX desarmado (la sumatoria `Σ_{nodos v}` queda partida
  en tres líneas); las reconstruí a mano y quedan transcritas arriba. Los subíndices de
  paréntesis del recorrido de Euler (`(₁`, `)₄`) se pierden como texto plano y los
  confirmé leyendo la página 39 como imagen.
