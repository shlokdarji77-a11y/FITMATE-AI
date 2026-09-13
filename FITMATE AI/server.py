import http.server
import socketserver
import os

PORT = 3000

class FitmateHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching for live development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')

        # Guarantee exact download filename via Content-Disposition header
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            filename = os.path.basename(path)
            if filename.endswith(('.exe', '.apk', '.txt')):
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Type', 'application/octet-stream')

        super().end_headers()

if __name__ == '__main__':
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), FitmateHTTPRequestHandler) as httpd:
        print(f"FITMATE AI Production Portal serving on http://localhost:{PORT}")
        httpd.serve_forever()
