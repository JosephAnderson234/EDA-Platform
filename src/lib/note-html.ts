import katex from 'katex';

// El `note` de cada paso de una visualización llega al canvas como texto
// plano de React: un `$O(\log n)$` o un `**una**` salía literal debajo del
// diagrama. Se pre-renderiza aquí, en build (Visualization.astro), a HTML con
// KaTeX + el markdown en línea que usan las notas — así el cliente no carga
// KaTeX y el canvas sólo inyecta el HTML ya hecho.

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inlineMarkdown(text: string): string {
  // `código` primero y aparte, para que su contenido no se interprete.
  return text
    .split(/(`[^`]+`)/g)
    .map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${escape(part.slice(1, -1))}</code>`;
      return escape(part)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
    })
    .join('');
}

/** `$...$` / `$$...$$` → KaTeX; el resto → markdown en línea escapado. */
export function noteToHtml(note: string): string {
  const out: string[] = [];
  const re = /\$\$([\s\S]+?)\$\$|(?<!\\)\$([^$\n]+?)(?<!\\)\$/g;
  let last = 0;
  for (const m of note.matchAll(re)) {
    out.push(inlineMarkdown(note.slice(last, m.index)));
    const display = m[1] !== undefined;
    out.push(katex.renderToString(display ? m[1] : m[2], { displayMode: display, throwOnError: false }));
    last = m.index! + m[0].length;
  }
  out.push(inlineMarkdown(note.slice(last)));
  return out.join('');
}
