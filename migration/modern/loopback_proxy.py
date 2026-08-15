#!/usr/bin/env python3
"""Minimal TCP forwarder from a host-published bridge to an internal service."""

import os
import socket
import socketserver
import threading


TARGET_HOST = os.environ['FORWARD_HOST']
TARGET_PORT = int(os.environ.get('FORWARD_PORT', '8000'))


class ForwardHandler(socketserver.BaseRequestHandler):
    @staticmethod
    def copy(source, destination):
        try:
            while True:
                data = source.recv(65536)
                if not data:
                    break
                destination.sendall(data)
        except OSError:
            pass
        finally:
            try:
                destination.shutdown(socket.SHUT_WR)
            except OSError:
                pass

    def handle(self):
        with socket.create_connection((TARGET_HOST, TARGET_PORT), timeout=10) as upstream:
            request_copy = threading.Thread(
                target=self.copy, args=(self.request, upstream), daemon=True)
            request_copy.start()
            self.copy(upstream, self.request)
            request_copy.join(timeout=5)


class ForwardServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with ForwardServer(('0.0.0.0', 8000), ForwardHandler) as server:
        server.serve_forever()
