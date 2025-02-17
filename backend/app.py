from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

users={}

@app.route('/')
def index():
    return "Flask Backend Running"

@socketio.on('message')
def handle_message(data):
    user_id = request.sid
    username = users.get(user_id,"Anonymous")
    msg = data.get('msg',"")
    print(f"Message from {username}: {msg}")
    send({'system': False, 'username':username, 'msg':msg}, broadcast=True)



@socketio.on('set_username')
def handle_username(data):
    username = data.get('username', 'Anonymous')
    print(f"Username set: {username}")
    user_id = request.sid
    users[user_id] = username
    emit('user_joined',{'system': True, 'msg':f"{username} joined the chat"}, broadcast=True)
    emit('username_confirmed', {'username': username})  # Notify frontend


@socketio.on('request_welcome')
def handle_welcome(data):
    print(f"Request received: {data['msg']}")
    emit('welcome',{ 'msg' :"welcome from flask"}, broadcast=True)


@socketio.on('connect')
def handle_connect():
    print("A user connected!")

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.sid
    username = users.pop(user_id, None)
    if username:
        emit('user_left',{'system': True, 'msg':f"{username} left the chat"}, broadcast=True)
    print(f"User {username if username else 'Unknown'} ({user_id}) disconnected!")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="localhost", port=5001)