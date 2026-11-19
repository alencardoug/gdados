#!/usr/bin/env bash
# Copia o pacote de metadados e as amostras de registros da origem, num commit fixado, para origem/
# (D03, D06), e os arquivos que o portal lê por commit, listados em scripts/arquivos_da_origem.txt,
# para origem/arquivos/.
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
lista="$raiz/scripts/arquivos_da_origem.txt"
# As amostras de registros (D06; ADR-0058 da origem) vêm do mesmo commit, ao lado do pacote.
pacote=(pacote_de_metadados.json pacote_de_metadados.schema.json pacote_de_metadados.exemplo.json
        amostras_de_registros.json amostras_de_registros.schema.json)

falha() { echo "copiar_pacote: $*" >&2; exit 1; }

verificar() {
  [[ -f "$procedencia" ]] || falha "não há $procedencia"
  python3 -I - "$procedencia" "$destino" <<'EOF'
import hashlib, json, pathlib, sys
proc, base = json.load(open(sys.argv[1], encoding="utf-8")), pathlib.Path(sys.argv[2])
registrados = {f["path"] for f in proc["files"]}
diferentes = []
for f in proc["files"]:
    alvo = base / f["path"]
    if not alvo.is_file() or hashlib.sha256(alvo.read_bytes()).hexdigest() != f["sha256"]:
        diferentes.append(f["path"])
sobra = sorted(str(p.relative_to(base)) for p in base.rglob("*")
               if p.is_file() and str(p.relative_to(base)) != "procedencia.json"
               and str(p.relative_to(base)) not in registrados)
for d in diferentes:
    print("DIFERE", d)
for s in sobra:
    print("SEM REGISTRO", s)
total = len(proc["files"])
print(f"{total - len(diferentes)} de {total} arquivos conferem; {len(sobra)} sem registro;"
      f" commit {proc['commit']} ({proc['ref']})")
sys.exit(1 if diferentes or sobra else 0)
EOF
}

if [[ "${1:-}" == "--verificar" ]]; then verificar; exit; fi
[[ $# -eq 1 ]] || falha "informe a tag ou o commit da origem (ou --verificar)"
ref="$1"
origem="${ORIGEM:-$raiz/../mvp_eng_dados_2}"
[[ -d "$origem" ]] || falha "origem não encontrada: $origem"
[[ -f "$lista" ]] || falha "lista não encontrada: $lista"
g() { git -C "$origem" --no-optional-locks "$@"; }

commit="$(g log -1 --format=%H "$ref")" || falha "ref desconhecida na origem: $ref"
data_commit="$(g log -1 --format=%cI "$commit")"
g log --format=%H origin/main | grep -x "$commit" > /dev/null \
  || falha "$commit não está em origin/main da origem; só se fixa commit publicado"

# Expande uma pasta da origem pelo `git show <commit>:<pasta>/`, que lista as entradas.
expandir() {
  local caminho="$1" nome
  if [[ "$caminho" != */ ]]; then echo "$caminho"; return; fi
  g show "$commit:$caminho" > /dev/null 2>&1 || falha "$caminho não existe em $commit"
  while IFS= read -r nome; do
    [[ -z "$nome" ]] && continue
    expandir "$caminho$nome"
  done < <(g show "$commit:$caminho" | tail -n +3)
}

tmp="$raiz/.cache/copia_pacote.$$"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/arquivos"

for f in "${pacote[@]}"; do
  g show "$commit:docs/$f" > "$tmp/$f" || falha "docs/$f não existe em $commit"
done
: > "$tmp/lista_expandida"
while IFS= read -r linha; do
  linha="${linha%%#*}"; linha="${linha%"${linha##*[![:space:]]}"}"
  [[ -z "$linha" ]] && continue
  expandir "$linha" >> "$tmp/lista_expandida"
done < "$lista"
while IFS= read -r f; do
  mkdir -p "$tmp/arquivos/$(dirname "$f")"
  g show "$commit:$f" > "$tmp/arquivos/$f" || falha "$f não existe em $commit"
done < "$tmp/lista_expandida"

python3 -I - "$tmp" "$ref" "$commit" "$data_commit" "${pacote[@]}" <<'EOF'
import datetime, fnmatch, hashlib, json, pathlib, re, sys
tmp, ref, commit, data_commit, *nomes = sys.argv[1:]
tmp = pathlib.Path(tmp)
for nome in ("pacote_de_metadados.json", "pacote_de_metadados.exemplo.json",
             "amostras_de_registros.json"):
    fmt = json.loads((tmp / nome).read_text(encoding="utf-8")).get("format")
    if fmt != 1:
        sys.exit(f"copiar_pacote: {nome} tem format {fmt!r}; o portal só lê o formato 1")

# Guarda (AGENTS.md): nada de .env, estado ou variáveis do Terraform, chaves ou credenciais.
proibidos = [".env", ".env.*", "*.tfstate", "*.tfstate.*", "terraform.tfvars", "*.key", "*.pem",
             "credentials*.json", "service-account*.json"]
permitidos = [".env.example"]
email = re.compile(rb"[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}")
# Domínios reservados para exemplo (RFC 2606) e o placeholder usado na origem.
dominios_de_exemplo = (b"@exemplo.com", b"@example.com", b"@example.org", b"@example.net",
                       b".invalid", b".example", b".test")
lista = (tmp / "lista_expandida").read_text(encoding="utf-8").split()
for caminho in lista:
    nome = pathlib.PurePosixPath(caminho).name
    if any(fnmatch.fnmatch(nome, p) for p in proibidos) and nome not in permitidos:
        sys.exit(f"copiar_pacote: {caminho} é arquivo proibido (segredo, estado ou credencial)")
    dados = (tmp / "arquivos" / caminho).read_bytes()
    if re.search(rb"BEGIN [A-Z ]*PRIVATE KEY", dados):
        sys.exit(f"copiar_pacote: {caminho} contém chave privada")
    for m in email.finditer(dados):
        if not m.group(0).endswith(dominios_de_exemplo):
            sys.exit(f"copiar_pacote: {caminho} contém endereço de e-mail; revise a lista")

def registro(rel, origem_rel):
    dados = (tmp / rel).read_bytes()
    return {"path": rel, "source_path": origem_rel,
            "sha256": hashlib.sha256(dados).hexdigest(), "bytes": len(dados)}

files = [registro(n, f"docs/{n}") for n in nomes]
files += [registro(f"arquivos/{c}", c) for c in sorted(lista)]
proc = {
    "repository": "mvp_eng_dados_2",
    "ref": ref,
    "commit": commit,
    "commit_date": data_commit,
    "copied_at": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
    "decision": "D03 em docs/decisoes.md",
    "list": "scripts/arquivos_da_origem.txt",
    "files": files,
}
(tmp / "procedencia.json").write_text(json.dumps(proc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
EOF

# Troca a cópia inteira: arquivo que saiu da lista não fica para trás.
rm -rf "$destino.novo"
mkdir -p "$destino.novo"
for f in "${pacote[@]}" procedencia.json; do mv "$tmp/$f" "$destino.novo/$f"; done
mv "$tmp/arquivos" "$destino.novo/arquivos"
rm -rf "$destino"
mv "$destino.novo" "$destino"
echo "copiado $ref ($commit) para origem/"
verificar
