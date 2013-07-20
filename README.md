collabedit-socketio
===================

Very basic realtime document collaboration tool using socket.io. The server is a simple Python WSGI server using gevent-socketio and the client is js. 

To run:
-------

You need to have gevent-socketio installed. Then just run the socketio-server.py inside the project root:

```python
python socketio-server.py
```

Then go to [http://localhost:1234/collabedit.html](http://localhost:1234/collabedit.py) on your preferred browser.


