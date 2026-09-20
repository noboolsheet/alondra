import { Fragment, type ReactNode } from "react";

/**
 * Renderiza una cadena de traducción con marcadores `**negrita**` como nodos React.
 * El texto normal se conserva y cada tramo entre `**...**` se envuelve en <strong>
 * para resaltar las frases clave de las páginas. Uso: `{rich(t.hero.subtitle)}`.
 *
 * Las marcas viven en `src/i18n/translations.ts` (mismas frases resaltadas en los
 * tres idiomas). Un `**` suelto (sin pareja) se deja como texto literal.
 *
 * `boldClass` adapta el color del resalte: por defecto usa `text-primary`, que ya
 * se ajusta solo entre tema claro/oscuro. En secciones de fondo invertido (texto
 * claro sobre fondo de marca) pásale, p. ej.,
 * `rich(text, "font-semibold text-primary-foreground")`.
 */
export function rich(text: string, boldClass = "font-semibold text-primary"): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={boldClass}>
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
