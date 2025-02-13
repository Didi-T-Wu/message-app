from flask import Flask
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
# TODO:   Add more users by
#           1. adding a function to handle new users
#               . use request.sid to get  and set the id of the user
#               . adding a function to handle user disconnection
#           2. Add a function to handle user messages
#           3. Add a function to handle users when user left the chat

@app.route('/')
def index():
    return "Flask Backend Running"

@socketio.on('message')
def handle_message(msg):
    username = "Anonymous"
    print(f"Message received: {msg}")
    send({'system': False, 'username':username, 'msg':msg}, broadcast=True)
    # TODO:  Change username when I have one

@socketio.on('request_welcome')
def handle_welcome(data):
    print(f"Request received: {data['msg']}")
    emit('welcome',{ 'msg' :"welcome from flask"}, broadcast=True)


@socketio.on('connect')
def handle_connect():
    print("A user connected!")

@socketio.on('disconnect')
def handle_disconnect():
    print("A user disconnected!")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="localhost", port=5001)