from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import psycopg2
import os
import jwt
from datetime import timedelta, datetime


app = Flask(__name__)
app.config['KEY'] = 'value'
CORS(app)
bcrypt = Bcrypt(app)


# Database connection details
DB_NAME = "itemsdb"
DB_USER = "postgres"
DB_PASSWORD = "mysecretpassword"
DB_HOST = "172.17.0.2"  # or use 'postgres-container' if app.py is in Docker
DB_PORT = "5432"


def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )


@app.route('/login', methods=['POST'])
def login():
    print("log in ")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to the database"}), 500
    curr = conn.cursor()
    try:
        curr.execute("SELECT * FROM users WHERE username = %s;", (username,))
        exists_user = curr.fetchone()        
        if exists_user and bcrypt.check_password_hash(exists_user[3], password):
            token = jwt.encode({
                'user_id': exists_user[0],
                'username': exists_user[1],
                'exp': datetime.timezone.estnow() + timedelta(hours=3)
            }, app.config['key'], algorithm='HS256')
            return jsonify({"message": "Login successful!", "token": token}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as error:
        print(error)
        return jsonify({"error": "An error occurred during login"}), 500
    finally:
        curr.close()
        conn.close()




@app.route("/signup", methods=["POST"])
def signup():
    print("sign up")
    data = request.get_json()
    if not request.is_json:
        return jsonify({"error": "Content type must be JSON"}), 400
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    pass_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Failed to connect to the database"}), 500
    curr = conn.cursor()
    try:
        curr.execute("SELECT * FROM users WHERE username = %s OR email = %s;", (username, email))
        exists_user = curr.fetchone()
        if exists_user:
            return jsonify({"error": "Username or Email already exists. Please try and log in."}), 400
        curr.execute("INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s);", (email, username, pass_hash))
        conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        print("Error:", e) 
        return jsonify({"error": "Database error occurred"}), 500

    finally:
        curr.close()
        conn.close()


@app.route("/items", methods=["GET"])
def get_items():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, price FROM items;")
    items = cur.fetchall()
    cur.close()
    conn.close()


    return jsonify([
        {"id": row[0], "name": row[1], "price": float(row[2])}
        for row in items
    ])


def get_bundle():
    # need to use jwt token authentication to get user id

    data = request.get_json()

    total_price = data.get('total_price')
    name = data.get('name')

    if not total_price or not name:
        return jsonify({"error": "Missing required fields: total_price or name"}), 400

    conn = get_db_connection()
    curr = conn.cursor()

    try:
        # for now, the user id is just 1: hardcoded in
        # could not figure out the jwt token
        curr.execute("INSERT INTO meals (name, user_id, total_price) VALUES (%s, %s, %s);", (name, 1, total_price))
        bundle_id = curr.fetchone()[0]
        conn.commit()
        items = data.get('items', [])
        for item in items:
            item_id = item['item_id']
            curr.execute("INSERT INTO meal_items (bundle_id, item_id) VALUES (%s, %s);", (bundle_id, item_id))
        conn.commit()
        return jsonify({"message": "Bundle created!"}), 201

    except Exception as e:
        print("Error:", e) 
        return jsonify({"error": "Database error occurred"}), 500

    finally:
        curr.close()
        conn.close()




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
