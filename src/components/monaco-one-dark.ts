import type { Monaco } from '@monaco-editor/react';

// Réplica en Monaco del editor anterior: CodeMirror + @codemirror/lang-cpp +
// @codemirror/theme-one-dark. Los colores salen de medir el DOM de ese editor
// (color calculado de cada token), no de memoria.
const ONE_DARK = {
  bg: '#282c34',
  ivory: '#abb2bf', // texto base y puntuación
  stone: '#7d8799', // comentarios y números de línea
  violet: '#c678dd', // palabras clave
  coral: '#e06c75', // identificadores, y el nombre de una función al declararla
  malibu: '#61afef', // llamadas a función
  chalky: '#e5c07b', // tipos y números
  whiskey: '#d19a66', // true / false / nullptr
  sage: '#98c379', // cadenas y #include
  cyan: '#56b6c2', // operadores y <cabecera>
  gutterActive: '#2c313a',
  selection: '#3e4451',
  cursor: '#528bff',
};

export const THEME = 'eda-one-dark';
export const LANGUAGE = 'eda-cpp';

/** Fondo del editor, para el contenedor mientras Monaco carga. */
export const EDITOR_BG = ONE_DARK.bg;

const TYPES =
  'void|bool|char|short|int|long|float|double|signed|unsigned|auto|size_t|wchar_t|' +
  'int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|' +
  'string|vector|pair|tuple|array|map|set|multiset|multimap|unordered_map|unordered_set|' +
  'queue|priority_queue|stack|deque|list|optional|function|shared_ptr|unique_ptr';
// Nombre de tipo: uno conocido, o un identificador en PascalCase (MaxHeap,
// Node…). Una sola mayúscula suelta (`A[i]`, `N`) NO: suele ser una variable.
const TYPE = `(?:\\b(?:${TYPES})\\b|[A-Z][a-z]\\w*)`;

/**
 * lang-cpp distingue tipo / declaración / llamada; el tokenizer Monarch de
 * C++ que trae Monaco no (todo es `keyword` o `identifier`, y los operadores
 * son `delimiter` igual que `;`). Se parte de ESE tokenizer y se le anteponen
 * reglas para recuperar esas distinciones.
 */
function patch(language: any) {
  const lang = { ...language, tokenizer: { ...language.tokenizer } };
  const root = [...language.tokenizer.root];

  // Operadores (cian) separados de la puntuación (marfil).
  for (let k = 0; k < root.length; k++) {
    const rule = root[k];
    if (Array.isArray(rule) && rule[0] instanceof RegExp && rule[0].source === '@symbols') {
      root[k] = [rule[0], { cases: { '@operators': 'operator', '@default': '' } }];
    }
  }

  const NAME = '[a-zA-Z_]\\w*';
  lang.tokenizer.root = [
    [/\b(?:true|false)\b/, 'constant'],
    // Modificadores y `this`: en One Dark van del mismo color que un tipo.
    [/\b(?:const|volatile|mutable|constexpr|virtual|explicit|override|final|this)\b/, 'type'],
    // El tokenizer base parte `<=`/`>=` en `<` + `=`; los compuestos van primero.
    [/(?:<<=|>>=|<=|>=|==|!=|&&|\|\||\+\+|--|[+\-*/%&|^]=)/, 'operator'],
    // Puntuación en lang-cpp aunque el tokenizer base los trate de operador.
    [/->|::/, 'delimiter'],
    // Lista de inicialización de un constructor (`) : key(k), n(n) {`): los
    // `nombre(` de ahí son miembros (coral), no llamadas.
    [/(\))(\s*)(:)(?!:)/, ['@brackets', '', { token: 'delimiter', next: '@ctorinit' }]],
    [/^(\s*)(:)(?!:)/, ['', { token: 'delimiter', next: '@ctorinit' }]],
    [/:/, 'delimiter'],
    // `=` suelto es puntuación en lang-cpp.
    [/=/, 'delimiter'],
    // `x.size()` / `p->left`: un miembro es coral aunque sea una llamada.
    [new RegExp(`(\\.)(${NAME})`), ['delimiter', 'identifier']],
    // Declaración de función: a nivel superior (columna 0) el nombre es azul;
    // un método dentro de un struct (indentado) es coral, como en lang-cpp.
    [new RegExp(`^(${TYPE})([*&]*)(\\s+)(${NAME})(?=\\s*\\()`), ['type', 'delimiter', '', 'function']],
    [new RegExp(`(${TYPE})([*&]*)(\\s+)(${NAME})(?=\\s*\\()`), ['type', 'delimiter', '', 'identifier']],
    // Constructor (`Node(`, `explicit MaxHeap(`): azul, no color de tipo.
    [/[A-Z][a-z]\w*(?=\()/, 'function'],
    // `Node* p`: el `*`/`&` pegado al tipo es declarador, no multiplicación.
    [new RegExp(`(${TYPE})([*&]+)`), ['type', 'delimiter']],
    [new RegExp(TYPE), 'type'],
    // Cualquier otro `nombre(` es una llamada — salvo `if (`, `while (`…
    [new RegExp(`${NAME}(?=\\s*\\()`), { cases: { '@keywords': 'keyword', '@default': 'function' } }],
    // `a > b`, `cout << x` son operadores; `vector<int>` es plantilla (sin espacios).
    [/(\s)(<<|>>|[<>])(?=\s)/, ['', 'operator']],
    ...root,
  ];

  // Termina en la `{` del cuerpo (o en `;` si era otra cosa, p.ej. un ternario).
  lang.tokenizer.ctorinit = [
    [new RegExp(`${NAME}(?=\\s*[({])`), 'identifier'],
    [/\{/, { token: '@brackets', next: '@pop' }],
    [/;/, { token: 'delimiter', next: '@pop' }],
    { include: '@root' },
  ];

  // `#include "archivo"` es una cadena (verde); `#include <cabecera>`, cian.
  lang.tokenizer.include = language.tokenizer.include.map((rule: any) =>
    Array.isArray(rule) && rule[0] instanceof RegExp && rule[0].source.includes('"')
      ? [rule[0], ['', 'string', 'string', { ...rule[1][3], token: 'string' }]]
      : rule,
  );
  return lang;
}

let registered = false;

/** Registra tema + lenguaje una sola vez por página (va en `beforeMount`). */
export function setupOneDark(monaco: Monaco) {
  if (registered) return;
  registered = true;

  monaco.editor.defineTheme(THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: ONE_DARK.ivory },
      { token: 'comment', foreground: ONE_DARK.stone },
      { token: 'keyword', foreground: ONE_DARK.violet },
      { token: 'keyword.directive', foreground: ONE_DARK.sage },
      { token: 'keyword.directive.include.begin', foreground: ONE_DARK.cyan },
      { token: 'keyword.directive.include.end', foreground: ONE_DARK.cyan },
      { token: 'string.include.identifier', foreground: ONE_DARK.cyan },
      { token: 'string', foreground: ONE_DARK.sage },
      { token: 'string.escape', foreground: ONE_DARK.cyan },
      { token: 'number', foreground: ONE_DARK.chalky },
      { token: 'type', foreground: ONE_DARK.chalky },
      { token: 'constant', foreground: ONE_DARK.whiskey },
      { token: 'identifier', foreground: ONE_DARK.coral },
      { token: 'function', foreground: ONE_DARK.malibu },
      { token: 'operator', foreground: ONE_DARK.cyan },
      { token: 'delimiter', foreground: ONE_DARK.ivory },
      { token: 'annotation', foreground: ONE_DARK.stone },
    ],
    colors: {
      'editor.background': ONE_DARK.bg,
      'editor.foreground': ONE_DARK.ivory,
      'editorGutter.background': ONE_DARK.bg,
      'editorLineNumber.foreground': ONE_DARK.stone,
      'editorLineNumber.activeForeground': ONE_DARK.stone,
      // CodeMirror sólo resaltaba el número de la línea activa, no la línea.
      'editor.lineHighlightBackground': ONE_DARK.gutterActive,
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': ONE_DARK.selection,
      'editor.inactiveSelectionBackground': ONE_DARK.selection,
      'editorCursor.foreground': ONE_DARK.cursor,
      // Sin colores por nivel de anidación: las llaves van en marfil.
      ...Object.fromEntries(
        [1, 2, 3, 4, 5, 6].map((n) => [`editorBracketHighlight.foreground${n}`, ONE_DARK.ivory]),
      ),
      'editorBracketHighlight.unexpectedBracket.foreground': ONE_DARK.ivory,
      'editorBracketMatch.background': '#bad0f847',
      'editorBracketMatch.border': '#00000000',
      'editorWhitespace.foreground': '#3b4048',
      'scrollbarSlider.background': '#4b526080',
      'scrollbarSlider.hoverBackground': '#4b5260b0',
      'editorWidget.background': '#21252b',
      'editorSuggestWidget.background': '#21252b',
      'editorSuggestWidget.selectedBackground': ONE_DARK.gutterActive,
    },
  });

  monaco.languages.register({ id: LANGUAGE, extensions: ['.cpp'] });
  // El tokenizer base se carga perezoso desde el mismo CDN que Monaco;
  // setMonarchTokensProvider acepta la promesa, y el editor colorea al llegar.
  const cpp: any = monaco.languages.getLanguages().find((l) => l.id === 'cpp');
  const base: Promise<{ language: any; conf: any }> | undefined = cpp?.loader?.();
  if (base) {
    monaco.languages.setMonarchTokensProvider(LANGUAGE, base.then((m) => patch(m.language)));
    base.then((m) => monaco.languages.setLanguageConfiguration(LANGUAGE, m.conf));
  }
}
