/**
 * Redirection www → domaine principal.
 *
 * Le fichier _redirects ne peut pas le faire : Cloudflare Pages n'y accepte
 * pas les redirections au niveau du domaine (« Domain-level redirects ❌ »
 * dans la documentation). Une règle dont la source est une URL complète est
 * ignorée sans avertissement. On la traite donc ici, où l'on a accès au
 * nom d'hôte de la requête.
 */
const APEX = 'karefully-app.com';

export async function onRequest({ request, next }) {
    const url = new URL(request.url);

    if (url.hostname === `www.${APEX}`) {
        url.hostname = APEX;
        // 301 : le canonical du site est déclaré sans www.
        return Response.redirect(url.toString(), 301);
    }

    return next();
}
