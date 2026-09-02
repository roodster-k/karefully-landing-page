#!/usr/bin/env python3
"""Serveur de prévisualisation local.

Reproduit le comportement de Cloudflare Pages : URL propres (« /guide » sert
« guide.html »), index de dossier, et redirection 308 des « .html » vers l'URL
propre. Sans cela, le site testé en local ne correspond pas à celui en ligne.
"""
import http.server
import os
import socketserver

PORT = int(os.environ.get("PORT", "8123"))
ROOT = os.path.dirname(os.path.abspath(__file__))


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):  # noqa: N802
        path = self.path.split("?")[0].split("#")[0]

        # /guide.html → 308 vers /guide, comme en production
        if path.endswith(".html") and not path.endswith("/index.html"):
            target = path[: -len(".html")]
            self.send_response(308)
            self.send_header("Location", target)
            self.end_headers()
            return

        local = os.path.join(ROOT, path.lstrip("/"))
        if not os.path.exists(local) or os.path.isdir(local):
            for candidate in (local + ".html", os.path.join(local, "index.html")):
                if os.path.isfile(candidate):
                    self.path = "/" + os.path.relpath(candidate, ROOT)
                    break

        return super().do_GET()

    def log_message(self, fmt, *args):
        pass  # sortie silencieuse


class Server(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with Server(("", PORT), PagesHandler) as httpd:
        print(f"Prévisualisation sur http://localhost:{PORT}")
        httpd.serve_forever()
