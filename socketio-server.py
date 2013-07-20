import os
from socketio import socketio_manage
from socketio.server import SocketIOServer

from socketio.namespace import BaseNamespace

webapp = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        'webapp'))

text = ""

class CollabEditNamespace(BaseNamespace):
    users = {}    
    name = None

    def disconnect(self, *args, **kwargs):
        if self.name:
            self.broadcast('exit', self.name)
        del self.users[id(self)]
        super(CollabEditNamespace, self).disconnect(*args, **kwargs)

    def on_login(self, name):
        global text
        if self.name:
            self.broadcast('exit', self.name)
        self.users[id(self)] = self
        self.name = name
        self.broadcast('users', [ns.name for ns in self.users.values()])
        self.emit('edit', text)

    def on_edit(self, message):
        global text
        if self.name:
            text = message
            self.broadcast('edit', message)

    def broadcast(self, event, message):
        for s in self.users.values():
            s.emit(event, message)


def serve_file(environ, start_response):
    path = os.path.normpath(
        os.path.join(webapp, environ['PATH_INFO'].lstrip('/')))
    assert path.startswith(webapp), path
    if os.path.exists(path):
        start_response('200 OK', [('Content-Type', 'text/html')])
        with open(path) as fp:
            while True:
                chunk = fp.read(4096)
                if not chunk: break
                yield chunk
    else:
        start_response('404 NOT FOUND', [])
        yield 'File not found'

def collabEdit(environ, start_response):
    if environ['PATH_INFO'].startswith('/socket.io'):
        return socketio_manage(environ, { '/collabedit': CollabEditNamespace })
    else:
        return serve_file(environ, start_response)

server = SocketIOServer(('', 1234), collabEdit, policy_server=False)
server.serve_forever()
