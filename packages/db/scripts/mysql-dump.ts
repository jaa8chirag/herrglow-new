import { readFileSync } from "node:fs";

export type Row = Record<string, string | number | null>;

const ESC: Record<string, string> = { n: "\n", r: "\r", t: "\t", "0": "\0", b: "\b", Z: "\x1a" };

/** Parse all `INSERT INTO \`table\` (cols) VALUES (...),(...);` statements of a mysqldump/phpMyAdmin file. */
export function parseDump(path: string, only?: Set<string>): Map<string, Row[]> {
  const sql = readFileSync(path, "utf8");
  const out = new Map<string, Row[]>();
  const re = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const table = m[1]!;
    const cols = m[2]!.split(",").map((c) => c.trim().replace(/`/g, ""));
    let i = re.lastIndex;
    if (only && !only.has(table)) continue;
    const rows = out.get(table) ?? [];
    for (;;) {
      while (/\s|,/.test(sql[i]!)) i++;
      if (sql[i] !== "(") break;
      i++;
      const vals: (string | number | null)[] = [];
      for (;;) {
        while (sql[i] === " ") i++;
        const c = sql[i]!;
        if (c === "'") {
          let s = "";
          i++;
          for (;;) {
            const ch = sql[i++]!;
            if (ch === "\\") {
              const n = sql[i++]!;
              s += ESC[n] ?? n;
            } else if (ch === "'") {
              if (sql[i] === "'") { s += "'"; i++; } else break;
            } else s += ch;
          }
          vals.push(s);
        } else {
          let j = i;
          while (sql[j] !== "," && sql[j] !== ")") j++;
          const tok = sql.slice(i, j).trim();
          vals.push(tok === "NULL" ? null : Number(tok));
          i = j;
        }
        if (sql[i] === ",") { i++; continue; }
        if (sql[i] === ")") { i++; break; }
      }
      const row: Row = {};
      cols.forEach((c, k) => (row[c] = vals[k] ?? null));
      rows.push(row);
    }
    out.set(table, rows);
    re.lastIndex = i;
  }
  return out;
}
