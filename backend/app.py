import os
from dotenv import load_dotenv

from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate  # Import Flask-Migrate

load_dotenv()

app = Flask(__name__)

# config TODO: Move to a separate file
DATABASE_URL = os.getenv('DATABASE_URL','postgresql:///chat_app')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Exiting...")
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set. Exiting...")
app.config['SECRET_KEY'] = SECRET_KEY

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate


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