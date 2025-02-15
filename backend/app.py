from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from flask_migrate import Migrate  # Import Flask-Migrate
from config import Config
from models import User, Message, connect_db, db
from uuid import uuid4


app = Flask(__name__)
app.config.from_object(Config)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
connect_db(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate

# Later ### TODO: handle guest users
# later in 'set-username' ##
#### TODO: allow guest users? to set their username
# later  in 'disconnect' ##
#### TODO: handle guest users(in guest_users)

@app.route('/')
def index():
    return "Flask Backend Running"

# TODO: work with database( Message)
@socketio.on('message')
def handle_message(data):
    user_id = request.sid
    username = users.get(user_id,"Anonymous")
    msg = data.get('msg',"")
    print(f"Message from {username}: {msg}")
    send({'system': False, 'username':username, 'msg':msg}, broadcast=True)


# TODO: handle users storing in database
@socketio.on('set_username')
def handle_username(data):

    username = data.get('username', 'Anonymous')
    if not username:
        # if no username provided, set it to Anonymous
        username = "Anonymous"
    print(f"Username set: {username}")

    user_id = request.sid #for later use for quest users
    # users[user_id] = username #########
    existing_user = User.query.filter_by(username=username).one_or_none()
    if existing_user:
        emit('username_has_taken', {'username_taken': username})
        return

    new_user = User(id=str(uuid4()), username=username)
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        print(f"Database error: {e}")
        db.session.rollback()
        emit('error', {'msg': 'Failed to set username'}, to=user_id)
        return

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
    username = guest_users.pop(user_id, None)
    if username:
        emit('user_left',{'system': True, 'msg':f"{username} left the chat"}, broadcast=True)
    print(f"User {username if username else 'Unknown'} ({user_id}) disconnected!")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="localhost", port=5001)