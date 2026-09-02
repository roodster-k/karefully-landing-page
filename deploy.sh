#!/usr/bin/env bash
# Déploie le site sur Cloudflare Pages (projet karefully-landing-page).
#
# Le dépôt contient des fichiers de travail qui ne doivent pas être publiés :
# on assemble donc une copie propre dans dist/ plutôt que d'envoyer la racine.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="karefully-landing-page"
OUT="dist"

rm -rf "$OUT"
mkdir -p "$OUT"

# Pages et ressources publiques uniquement
cp index.html guide.html mentions-legales.html conditions-generales.html \
   politique-confidentialite.html style.css script.js favicon.svg \
   robots.txt sitemap.xml _headers _redirects "$OUT/"
cp -R blog assets fonts logo functions "$OUT/"

# Aucun fichier parasite
find "$OUT" -name '.DS_Store' -delete

echo "Contenu déployé :"
du -sh "$OUT"
echo

npx wrangler pages deploy "$OUT" --project-name "$PROJECT" --branch main --commit-dirty=true
