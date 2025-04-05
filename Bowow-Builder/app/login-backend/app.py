from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2
import os
import jwt
from datetime import timedelta, datetime

# unsure how eactly jwt works but should create a secrret key to authenticate the api requests
app = Flask(__name__)
app.config['KEY'] = 'value'

CORS(app)
bcrypt = Bcrypt(app)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="itemsdb",
            user="postgres",     
            password="1235",
            host="localhost",
            port="5432"
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None
    
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    pass_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    conn = get_db_connection()
    if not conn: 
        return jsonify({"failed to connect"}), 500
    curr = conn.cursor()
    try:
        curr.execute("SELECT * FROM users WHERE username = %s OR email = %s;", (username, email))
        exists_user = curr.fetchone()
        if exists_user:
            return jsonify({"error": "Username or Email already exists. Please try and login"}), 400
        curr.execute("INSERT INTO users (email, username, pass_hash) VALUES (%s, %s, %s);", (email, username, pass_hash))
        conn.commit()
        return jsonify({"message": "user registered successfully!"}), 201
    except psycopg2.Error as e:
        return jsonify({"error": "database error"}), 400
    curr.close()
    conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = get_db_connection()
    if not conn: 
        return jsonify({"failed to connect"}), 500
    curr = conn.cursor()
    try:
        curr.execute("SELECT * FROM users WHERE username = %s;", (username))
        exists_user = curr.fetchone()
        curr.close()
        conn.close()

        if exists_user and bcrypt.check_password_hash(exists_user[3], password):
            token = jwt.encode({'user_id': exists_user[0], 'username': exists_user[1],'exp': datetime.utcnow() + timedelta(hours=3) 
            }, app.config['key'], algorithm='HS256')
            return jsonify({"message": "login successful!"}), 200
    except Exception as error:
        return jsonify({"error": "Username does not exist. Please try and sign"}), 400
