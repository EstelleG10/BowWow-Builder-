from flask import Flask, jsonify, request
from flask_cors import CORS  
import psycopg2

app = Flask(__name__)
CORS(app)  

# connect the db 
def get_db_connection():
    try:
        # may need to change user name after i push it to ur created user 
        conn = psycopg2.connect(
            dbname="itemsdb",
            user="postgres",     
            password="", 
            host="localhost",
            port="5432"
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None

# route to get items from db 
@app.route('/api/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error w db"}), 500
    
    cur = conn.cursor()
    # get all our tiems 
    cur.execute("SELECT * FROM items")
    items = cur.fetchall()
    cur.close()
    conn.close()
     
    # display price 
    item_list = [{'item': item[1], 'price': float(item[2])} for item in items]
    return jsonify(item_list)

# route for sign up
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    # WE NEED TO FIX THIS RN IT IS JUST TEXT NOT ENCYPTED OR ANYTHING
    password = data.get('password')  

    conn = get_db_connection()
    if not conn:
        return jsonify({"error w db"}), 500

    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s);",
            (username, password)
        )
        conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# login route 
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cur = conn.cursor()
    cur.execute(
        # see if we have user in db 
        "SELECT * FROM users WHERE username = %s AND password_hash = %s;",
        (username, password)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user:
        return jsonify({
            "message": "Login successful!",
            "user_id": user[0],
            "username": user[1]
        }), 200
    else:
        return jsonify({"error -  wrong info entered"}), 401

if __name__ == '__main__':
    app.run(debug=True)