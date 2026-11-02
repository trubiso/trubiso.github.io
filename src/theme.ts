export type Color = string;

export interface LinkTheme {
  base: Color;
  hover: Color;
}

export interface SectionTheme {
  bg: Color;
  fg: Color;
  link: LinkTheme;
}

export interface CodeBlockTheme {
  border: Color;
  theme: "ayu-dark";
}

export interface NavTheme {
  bg: Color;
  fg: Color;
  item: LinkTheme;
  selected: LinkTheme;
}

export interface ThemeColors {
  base: SectionTheme;
  quote: SectionTheme & { line: Color };
  card: SectionTheme;
  nav: NavTheme;
  code: Omit<SectionTheme, "link">;
  codeBlock: CodeBlockTheme;
  anchorLink: LinkTheme;
  hr: Color;
}

const dark = {
  base: {
    bg: "#111",
    fg: "#eee",
    link: { base: "#aaa", hover: "#ffc600" },
  },
  quote: {
    bg: "#111",
    fg: "#ccc",
    link: { base: "#aaa", hover: "#ffc600" },
    line: "#666",
  },
  card: {
    bg: "#222",
    fg: "#aaa",
    link: { base: "#aaa", hover: "#eee" },
  },
  nav: {
    bg: "#222",
    fg: "#eee",
    item: { base: "#222", hover: "#aaa" },
    selected: { base: "#333", hover: "#eee" },
  },
  code: {
    bg: "#333",
    fg: "#eee",
  },
  codeBlock: {
    border: "#7ea1e6",
    theme: "ayu-dark",
  },
  anchorLink: { base: "#666", hover: "#ffc600" },
  hr: "#eee",
} satisfies ThemeColors;

const light = {
  base: {
    bg: "#eee",
    fg: "#111",
    link: { base: "#555", hover: "#6000ba" },
  },
  quote: {
    bg: "#eee",
    fg: "#333",
    link: { base: "#555", hover: "#6000ba" },
    line: "#bbb",
  },
  card: {
    bg: "#ddd",
    fg: "#333",
    link: { base: "#555", hover: "#111" },
  },
  nav: {
    bg: "#ddd",
    fg: "#111",
    item: { base: "#ddd", hover: "#555" },
    selected: { base: "#ccc", hover: "#111" },
  },
  code: {
    bg: "#ddd",
    fg: "#111",
  },
  codeBlock: {
    border: "#5575b5",
    theme: "ayu-dark",
  },
  anchorLink: { base: "#777", hover: "#6000ba" },
  hr: "#bbb",
} satisfies ThemeColors;

export const themes = {
  dark,
  light,
} satisfies Record<string, ThemeColors>;

export type ThemeName = keyof typeof themes;

function flattenObject(
  obj: Record<string, any>,
  prefix = "",
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const name = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "object" && value !== null) {
        Object.assign(acc, flattenObject(value, name));
      } else {
        acc[`--${name}`] = String(value);
      }

      return acc;
    },
    {} as Record<string, string>,
  );
}

export function generateThemeCSS() {
  return Object.entries(themes)
    .map(([theme, colors]) => {
      const variables = flattenObject(colors);

      const declarations = Object.entries(variables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n");

      return `[data-theme="${theme}"] { ${declarations} }`;
    })
    .join("\n");
}
