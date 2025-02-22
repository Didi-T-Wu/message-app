from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from flask_migrate import Migrate  # Import Flask-Migrate
from config import Config
from models import User, Message, connect_db, db
from uuid import uuid4
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
app.config.from_object(Config)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
connect_db(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate
bcrypt = Bcrypt(app)

# Later ### TODO: handle guest users
#### TODO: later  in 'disconnect' ##
#### TODO: handle guest users(in guest_users)

@app.route('/')
def index():
    return "Flask Backend Running"

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return  {'msg':"Missing username or password"}, 400

    user = User.query.filter_by(username =username).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return  {'msg':"Invalid Credentials"}, 401

    # Generate JWT token
    access_token = create_access_token(identity=user.id)

    return {"msg": "Login successful", "token": access_token, "user_id": user.id}


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"msg":"Missing username or password"}, 400

    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        return {"msg":"Username already taken"}, 400

    user_uuid = str(uuid4())
    hashed_password = bcrypt.generate_password_hash(password).decode('utf8')
    new_user = User(id=user_uuid, username=username, password=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()

        # Generate JWT token
        access_token = create_access_token(identity=new_user.id)

        return {
            "msg": "User registered successfully",
            "token": access_token,
            "user_id": new_user.id
            }, 201

    except Exception as e:
        db.session.rollback()
        return {"msg": f"Error registering user: {str(e)}"}, 500




# TODO: work with database( Message)
@socketio.on('message')
def handle_message(data):

    user_id_from_frontend = data.get('user_id','')
    msg = data.get('msg',"").strip()

    if not user_id_from_frontend or not msg:
        emit('error', {'msg': 'Invalid user or empty message'}, to=request.sid)
        return


    cur_user = User.query.filter_by(id =  user_id_from_frontend).one_or_none()

    if not cur_user:
        emit('error', {'msg': 'User not found'}, to=request.sid)
        return


    new_msg= Message(user_id = cur_user.id, text=msg)

    try:
        db.session.add(new_msg)
        db.session.commit()
    except Exception as e:
        print(f"Database error: {e}")
        db.session.rollback() # Undo the changes made during this session
        emit('error', {'msg': 'Failed to store message'}, to=request.sid)
        return

    print(f"Message from {cur_user.username}: {msg}")
    send({'system': False, 'username':cur_user.username, 'msg':msg}, broadcast=True)


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