#!/usr/bin/env bash
# Copia o pacote de metadados da origem, num commit fixado, para origem/ (D03).
#
# Uso:
#   scripts/copiar_pacote.sh <tag-ou-commit>   copia e registra a procedência
#   scripts/copiar_pacote.sh --verificar       confere os SHA-256 da cópia versionada
#
# A origem é lida só por `git show` e `git log` (AGENTS.md; Consumidores §2 da origem).
# Caminho da origem: variável ORIGEM, padrão ../mvp_eng_dados_2 a partir da raiz do gdados.
# A validação contra o esquema é outro passo, cuja ferramenta acompanha a D01.
set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
destino="$raiz/origem"
procedencia="$destino/procedencia.json"
arquivos=(pacote_de_metadados.json pacote_de_metadados.schema.json pacote_de_metadados.exemplo.json)

falha() { echo "copiar_pacote: $*" >&2; exit 1; }

verificar() {
  [[ -f "$procedencia" ]] || falha "não há $procedencia"
  python3 -I - "$procedencia" "$destino" <<'EOF'
import hashlib, json, pathlib, sys
proc, base = json.load(open(sys.argv[1], encoding="utf-8")), pathlib.Path(sys.argv[2])
erros = 0
for f in proc["files"]:
    atual = hashlib.sha256((base / f["path"]).read_bytes()).hexdigest()
    ok = atual == f["sha256"]
    erros += not ok
    print(("ok    " if ok else "DIFERE"), f["path"])
print(f"commit {proc['commit']} ({proc['ref']})")
sys.exit(1 if erros else 0)
EOF
}

if [[ "${1:-}" == "--verificar" ]]; then verificar; exit; fi
[[ $# -eq 1 ]] || falha "informe a tag ou o commit da origem (ou --verificar)"
ref="$1"
origem="${ORIGEM:-$raiz/../mvp_eng_dados_2}"
[[ -d "$origem" ]] || falha "origem não encontrada: $origem"
g() { git -C "$origem" --no-optional-locks "$@"; }

commit="$(g log -1 --format=%H "$ref")" || falha "ref desconhecida na origem: $ref"
data_commit="$(g log -1 --format=%cI "$commit")"
g log --format=%H origin/main | grep -x "$commit" > /dev/null \
  || falha "$commit não está em origin/main da origem; só se fixa commit publicado"

tmp="$raiz/.cache/copia_pacote.$$"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp"
for f in "${arquivos[@]}"; do
  g show "$commit:docs/$f" > "$tmp/$f" || falha "docs/$f não existe em $commit"
done

python3 -I - "$tmp" "$ref" "$commit" "$data_commit" "${arquivos[@]}" <<'EOF'
import datetime, hashlib, json, pathlib, sys
tmp, ref, commit, data_commit, *nomes = sys.argv[1:]
tmp = pathlib.Path(tmp)
for nome in ("pacote_de_metadados.json", "pacote_de_metadados.exemplo.json"):
    fmt = json.loads((tmp / nome).read_text(encoding="utf-8")).get("format")
    if fmt != 1:
        sys.exit(f"copiar_pacote: {nome} tem format {fmt!r}; o portal só lê o formato 1")
files = []
for nome in nomes:
    dados = (tmp / nome).read_bytes()
    files.append({"path": nome, "source_path": f"docs/{nome}",
                  "sha256": hashlib.sha256(dados).hexdigest(), "bytes": len(dados)})
proc = {
    "repository": "mvp_eng_dados_2",
    "ref": ref,
    "commit": commit,
    "commit_date": data_commit,
    "copied_at": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
    "decision": "D03 em docs/decisoes.md",
    "files": files,
}
(tmp / "procedencia.json").write_text(json.dumps(proc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
EOF

mkdir -p "$destino"
for f in "${arquivos[@]}" procedencia.json; do mv "$tmp/$f" "$destino/$f"; done
echo "copiado $ref ($commit) para origem/"
verificar
