from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
import os
from datetime import timedelta, datetime, timezone
## from constants import DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, INVALID_SALT

print("I am in the right file ")
app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-change-this-more-secret-later'
CORS(app)
bcrypt = Bcrypt(app)


# Database connection
def get_db_connection():
    return psycopg2.connect(
        dbname="itemsdb",
        user="postgres",
        password="1235",
        host= "localhost",
        port= "5432"
    )

def get_current_user_id():
    auth = request.headers.get("Authorization", "")
    print("Authorization header received:", repr(auth))  # new debugging line
    if not auth.startswith("Bearer "):
        print("Token not found or malformed")
        return None
    token = auth.replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        print("Decoded token:", decoded)  # debugging line lol
        return decoded.get("user_id")
    except jwt.InvalidTokenError as e:
        print("Invalid token:", e)
        return None



# Serve images from /assets
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('assets', filename)

# @app.route('/assets/<path:filename>')
# def serve_image(filename):
#     root_dir = os.path.join(os.path.dirname(__file__), 'assets')
#     return send_from_directory(root_dir, filename)


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

    # Get meal + item info
    cur.execute("""
        SELECT m.id, m.name, i.name, i.price, i.img_route
        FROM meals m
        JOIN meal_items mi ON m.id = mi.meal_id
        JOIN items i ON i.id = mi.item_id
        ORDER BY m.id;
    """)
    rows = cur.fetchall()

    # Get average ratings
    cur.execute("""
        SELECT meal_id, ROUND(AVG(rating), 1) as avg_rating
        FROM ratings
        GROUP BY meal_id;
    """)
    rating_rows = cur.fetchall()
    ratings_dict = {row[0]: row[1] for row in rating_rows}

    # Get comments (now with comment ID for deleting of commentes)
    cur.execute("""
        SELECT c.id, c.meal_id, users.username, c.text, c.created_at
        FROM comments c
        JOIN users ON c.user_id = users.id
        ORDER BY c.created_at DESC;
    """)
    comment_rows = cur.fetchall()
    cur.close()
    conn.close()

    comments_dict = {}
    for comment_id, meal_id, username, text, created_at in comment_rows:
        if meal_id not in comments_dict:
            comments_dict[meal_id] = []
        comments_dict[meal_id].append({
            "id": comment_id,
            "user": username,
            "text": text,
            "created_at": created_at.isoformat()
        })

    # Build final meals response
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
@app.route("/api/ratings", methods=["POST"])
def post_rating():
    data = request.get_json()
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    meal_id = data["meal_id"]
    rating = data["rating"]

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 🛑 Check if the user already rated this meal
    cur.execute(
        "SELECT id FROM ratings WHERE user_id = %s AND meal_id = %s;",
        (user_id, meal_id)
    )
    existing = cur.fetchone()

    if existing:
        # If they already rated, block them
        cur.close()
        conn.close()
        return jsonify({"error": "You have already rated this meal!"}), 400

    # ✅ Otherwise, insert the new rating
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
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

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
        SELECT c.id, users.username, c.text, c.created_at
        FROM comments c
        JOIN users ON c.user_id = users.id
        WHERE c.meal_id = %s
        ORDER BY c.created_at DESC;
    """, (meal_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        { "id": row[0], "user": row[1], "text": row[2], "created_at": row[3].isoformat()}
        for row in rows
    ])

# Delete a comment by ID
@app.route("/api/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(comment_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM comments WHERE id = %s;", (comment_id,))
        conn.commit()
        return jsonify({"message": "Comment deleted successfully"}), 200
    except Exception as e:
        print("Error deleting comment:", e)
        conn.rollback()
        return jsonify({"error": "Failed to delete comment"}), 500
    finally:
        cur.close()
        conn.close()

# Create a new meal
@app.route("/api/meals", methods=["POST"])
def create_meal():
    print("here in POST meals")
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    meal_name = data.get("name")
    item_ids = data.get("items", [])

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

@app.route("/api/profile", methods=["GET"])
def get_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur  = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM meals WHERE user_id = %s;", (user_id,))
    bundle_count = cur.fetchone()[0] or 0

    cur.execute("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM ratings r
        JOIN meals m ON r.meal_id = m.id
        WHERE m.user_id = %s;
    """, (user_id,))
    avg_rating = float(cur.fetchone()[0] or 0)

    cur.execute("""
        SELECT
          m.id,
          m.name,
          m.created_at,
          array_agg(i.name ORDER BY i.name) AS items
        FROM meals AS m
        LEFT JOIN meal_items AS mi ON mi.meal_id = m.id
        LEFT JOIN items      AS i  ON i.id      = mi.item_id
        WHERE m.user_id = %s
        GROUP BY m.id, m.name, m.created_at
        ORDER BY m.created_at DESC;
    """, (user_id,))
    rows = cur.fetchall()

    bundles = [
      {
        "id":          r[0],
        "name":        r[1],
        "created_at":  r[2].isoformat(),
        "items":       r[3] or []
      }
      for r in rows
    ]

    cur.close()
    conn.close()

    return jsonify({
      "username":    "",  # FIX LATER ESTELLE
      "email":       "",  # FIX LATER ESTELLE
      "bundleCount": bundle_count,
      "avgRating":   round(avg_rating, 1),
      "bundles":     bundles
    })


@app.route("/api/my-meals", methods=["GET"])
def get_my_meals():
    print("here in get my meals")
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    # Get username and email
    cur.execute("SELECT username, email FROM users WHERE id = %s;", (user_id,))
    user_row = cur.fetchone()
    username = user_row[0] if user_row else ""
    email = user_row[1] if user_row else ""

    # Get bundle count
    cur.execute("SELECT COUNT(*) FROM meals WHERE user_id = %s;", (user_id,))
    bundle_count = cur.fetchone()[0] or 0

    # Get avg rating
    cur.execute("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM ratings r
        JOIN meals m ON r.meal_id = m.id
        WHERE m.user_id = %s;
    """, (user_id,))
    avg_rating = float(cur.fetchone()[0] or 0)

    # Get meals made by this user
    cur.execute("""
        SELECT m.id, m.name, i.name, i.price, i.img_route
        FROM meals m
        JOIN meal_items mi ON m.id = mi.meal_id
        JOIN items i ON i.id = mi.item_id
        WHERE m.user_id = %s
        ORDER BY m.id;
    """, (user_id,))
    rows = cur.fetchall()

    # Get ratings (all)
    cur.execute("""
        SELECT meal_id, ROUND(AVG(rating), 1) as avg_rating
        FROM ratings
        GROUP BY meal_id;
    """)
    rating_rows = cur.fetchall()
    ratings_dict = {row[0]: row[1] for row in rating_rows}

    # Get comments (all)
    cur.execute("""
        SELECT c.id, c.meal_id, users.username, c.text, c.created_at
        FROM comments c
        JOIN users ON c.user_id = users.id
        ORDER BY c.created_at DESC;
    """)
    comment_rows = cur.fetchall()

    comments_dict = {}
    for comment_id, meal_id, username, text, created_at in comment_rows:
        if meal_id not in comments_dict:
            comments_dict[meal_id] = []
        comments_dict[meal_id].append({
            "id": comment_id,
            "user": username,
            "text": text,
            "created_at": created_at.isoformat()
        })

    # Group meals together
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

    cur.close()
    conn.close()

    # FINAL RESPONSE
    return jsonify({
        "username": username,
        "email": email,
        "bundleCount": bundle_count,
        "avgRating": round(avg_rating, 1),
        "bundles": list(meals.values())
    })


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
        if exists_user and bcrypt.check_password_hash(exists_user[3], password):
            token = jwt.encode({
                'user_id': exists_user[0],
                'username': exists_user[1],
                'exp': datetime.now(timezone.utc)  + timedelta(hours=3) 
            }, app.config['SECRET_KEY'], algorithm='HS256')
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