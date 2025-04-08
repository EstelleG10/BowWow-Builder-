from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
import os
from datetime import timedelta, datetime, timezone

print("I am in the right file ")
app = Flask(__name__)
app.config['key'] = 'value'
CORS(app)
bcrypt = Bcrypt(app)

# Database config
DB_NAME = "itemsdb"
DB_USER = "estellegerber"
DB_PASSWORD = ""
DB_HOST = "localhost"
DB_PORT = "5432"

# Database connection
def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,ƒ
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

# Serve images from /assets
@app.route('/assets/<path:filename>')
def serve_image(filename):
    root_dir = os.path.join(os.path.dirname(__file__), 'assets')
    return send_from_directory(root_dir, filename)

# Get items (now includes img_route!)
@app.route("/items", methods=["GET"])
def get_items():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT i.id, i.name, i.price, c.name AS category, i.img_route
        FROM items i
        LEFT JOIN item_categories ic ON i.id = ic.item_id
        LEFT JOIN categories c ON ic.category_id = c.id;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "category": row[3],
            "img_route": row[4]
        }
        for row in rows
    ])

# Get meals (has avg_rating, comments, and img_route for each item)
@app.route("/api/meals", methods=["GET"])
def get_meals():
    print("here in get meals")
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT m.id, m.name, i.name, i.price, i.img_route
        FROM meals m
        JOIN meal_items mi ON m.id = mi.meal_id
        JOIN items i ON i.id = mi.item_id
        ORDER BY m.id;
    """)
    rows = cur.fetchall()

    # Get average ratings for each meal
    cur.execute("""
        SELECT meal_id, ROUND(AVG(rating), 1) as avg_rating
        FROM ratings
        GROUP BY meal_id;
    """)
    rating_rows = cur.fetchall()
    ratings_dict = {row[0]: row[1] for row in rating_rows}

    # Get comments for each meal
    cur.execute("""
        SELECT meal_id, users.username, c.text, c.created_at
        FROM comments c
        JOIN users ON c.user_id = users.id
        ORDER BY c.created_at DESC;
    """)
    comment_rows = cur.fetchall()
    cur.close()
    conn.close()

    comments_dict = {}
    for meal_id, username, text, created_at in comment_rows:
        if meal_id not in comments_dict:
            comments_dict[meal_id] = []
        comments_dict[meal_id].append({
            "user": username,
            "text": text,
            "created_at": created_at.isoformat()
        })

    meals = {}
    for meal_id, meal_name, item_name, item_price, item_img in rows:
        if meal_id not in meals:
            meals[meal_id] = {
                "id": meal_id,
                "name": meal_name,
                "avg_rating": ratings_dict.get(meal_id),
                "comments": comments_dict.get(meal_id, []),
                "items": []
            }
        meals[meal_id]["items"].append({
            "name": item_name,
            "price": float(item_price),
            "img_route": item_img
        })

    return jsonify(list(meals.values()))

# Post a new rating
@app.route("/api/ratings", methods=["POST"])
def post_rating():
    data = request.get_json()
    user_id = data["user_id"]
    meal_id = data["meal_id"]
    rating = data["rating"]

     # BC FOR NOW WE WANNA MAKE SURE THEY BETWEEN 1 AND 5
    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO ratings (user_id, meal_id, rating) VALUES (%s, %s, %s);",
        (user_id, meal_id, rating)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Rating saved!"}), 201

# Post a comment
@app.route("/api/comments", methods=["POST"])
def post_comment():
    data = request.get_json()
    user_id = data["user_id"]
    meal_id = data["meal_id"]
    text = data["text"]

    if not text.strip():
        return jsonify({"error": "Comment cannot be empty"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO comments (user_id, meal_id, text) VALUES (%s, %s, %s);",
        (user_id, meal_id, text)
    )
    conn.commit()
    cur.close()
    conn.close()

    # debugging (can prob remove later )
    return jsonify({"message": "Comment added!"}), 201

# Get comments for a meal
@app.route("/api/meals/<int:meal_id>/comments", methods=["GET"])
def get_comments(meal_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT users.username, c.text, c.created_at
        FROM comments c
        JOIN users ON c.user_id = users.id
        WHERE c.meal_id = %s
        ORDER BY c.created_at DESC;
    """, (meal_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {"user": row[0], "text": row[1], "created_at": row[2].isoformat()}
        for row in rows
    ])

# Create a new meal
@app.route("/api/meals", methods=["POST"])
def create_meal():
    print("here in POST meals")
    print(token)

    data = request.get_json()
    decoded_data = jwt.decode(token, app.config['key'], algorithms=["HS256"])

    user_id = decoded_data.get("user_id")
    user_id = data.get("user_id")
    meal_name = data.get("name")
    item_ids = data.get("items", [])

    if not meal_name or not item_ids:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # add our total price 
        cur.execute("SELECT SUM(price) FROM items WHERE id = ANY(%s);", (item_ids,))
        total_price = cur.fetchone()[0] or 0

        cur.execute(
            "INSERT INTO meals (name, user_id, total_price) VALUES (%s, %s, %s) RETURNING id;",
            (meal_name, user_id, total_price)
        )
        meal_id = cur.fetchone()[0]

        for item_id in item_ids:
            cur.execute(
                "INSERT INTO meal_items (meal_id, item_id) VALUES (%s, %s);",
                (meal_id, item_id)
            )

        conn.commit()
        return jsonify({"message": "Meal created", "meal_id": meal_id}), 201

    except Exception as e:
        conn.rollback()
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cur.close()
        conn.close()

        
@app.route('/login', methods=['POST'])
def login():
    global token
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
        # MAKE SURE TO CHECK THIS W UR LOCAL DB EVERYONE!!!!!
        if exists_user and bcrypt.check_password_hash(exists_user[2], password):
            token = jwt.encode({
                'user_id': exists_user[0],
                'username': exists_user[1],
                'exp': datetime.now(timezone.utc)  + timedelta(hours=3) 
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
        
        
        ## CHANGE PORT IF UR ON DIF ONE

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)