from flask import Flask, request
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from flask_migrate import Migrate  # Import Flask-Migrate
from config import Config
from models import User, Message, connect_db, db
from uuid import uuid4, UUID
from random import randint
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, decode_token, JWTManager
from jwt import ExpiredSignatureError

app = Flask(__name__)
app.config.from_object(Config)

socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
connect_db(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

active_users = {} # Tracks authenticated users

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
    # FIXME: send username back instead of user_id
    return {
        "msg": "Login successful",
        "token": access_token
        }


@app.route('/api/signup', methods=['POST'])
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
        print('new_user from /api/signup', new_user)
        db.session.flush()  # Ensure the new user is flushed to the DB
        db.session.commit()
        print('new_user.id from /api/signup', new_user.id)
        # Generate JWT token
        access_token = create_access_token(identity=new_user.id)
        print('access_token from /api/signup',access_token )

        return {
            "msg": "User registered successfully",
            "token": access_token,
            }, 201

    except Exception as e:
        print("Exception occurred from /api/signup", str(e))
        # Rollback if there's any error
        db.session.rollback()
        # Log error and return an appropriate message
        app.logger.error(f"Error registering user: {str(e)}")
        return {"msg": f"Error registering user: {str(e)}"}, 500


@socketio.on('message')
def handle_message(data):

    username_from_frontend = data.get('username','')
    msg = data.get('msg',"").strip()

    if not username_from_frontend or not msg:
        emit('error', {'msg': 'Invalid user or empty message'}, to=request.sid)
        return

    if not username_from_frontend.startswith('Guest'):
        # registered user, verify it and save the msg in the db
        cur_user = User.query.filter_by(username = username_from_frontend).one_or_none()

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

    print(f"Message from {username_from_frontend}: {msg}")
    emit('new_message',{'system': False, 'username':username_from_frontend, 'msg':msg}, broadcast=True)


@socketio.on('connect')
def handle_connect():
    print("A user connected!")
    user_id = request.sid # Unique session ID for the client

    token = request.args.get('token') # Get the JWT token from the query params
    if not token:
        print('token received from request.args.get("token")', token)

    username = None

    if token:
        try:
            decoded_token = decode_token(token) # Manually decode JWT
            user_uuid = decoded_token.get("sub")  # Extract user ID
            # user_uuid = UUID(identity)  ###### NO Convert back to UUID !!!!!!!
            user = User.query.filter_by(id = user_uuid).one_or_none()

            if user:
                username = user.username
                active_users[user_id] = {"username": username, 'user_id': user.id }
                print(f"Authenticated user {username} connected with session {user_id}")
            else:
                emit('auth_error', {'msg': 'Invalid token, user not found'}, to=user_id)
                return
        except ExpiredSignatureError:
            emit('auth_error', {'msg': 'Token expired, please log in again'}, to=user_id)
            return
        except Exception as e:
            print('error from handle_connection  except Exception as e')
            print(f"JWT verification failed: {e}")
            emit('auth_error', {'msg': 'Invalid token'}, to=user_id)
            return

    emit('user_joined', {'system': True, 'username':username, 'msg': f"{username} joined the chat"}, broadcast=True)



@socketio.on('disconnect')
def handle_disconnect():
    print('A user disconnected')
    user_id = request.sid
    if user_id in active_users:
        username = active_users.pop(user_id)['username']
        emit('user_left', {'system': True, 'msg': f"{username} left the chat"}, broadcast=True)
        print(f"User {username} ({user_id}) disconnected from active users!")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="localhost", port=5001)