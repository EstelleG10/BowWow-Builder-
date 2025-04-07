from flask import Flask, request, jsonify
import psycopg2

print("I am in the right file ")
app = Flask(__name__)

# db connect info need to change to local host 
DB_NAME = "itemsdb"
DB_USER = "estellegerber"
DB_PASSWORD = "mysecretpassword"
DB_HOST = "localhost"
DB_PORT = "5432"

# get our db connected
def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )

# 
@app.route("/items", methods=["GET"])
def get_items():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT i.id, i.name, i.price, c.name AS category
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
            "category": row[3]  # may be None if no category
        }
        for row in rows
    ])

    
@app.route("/api/meals", methods=["GET"])
def get_meals():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT m.id, m.name, i.name, i.price
        FROM meals m
        JOIN meal_items mi ON m.id = mi.meal_id
        JOIN items i ON i.id = mi.item_id
        ORDER BY m.id;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Reformat into meal bundles
    meals = {}
    for meal_id, meal_name, item_name, item_price in rows:
        if meal_id not in meals:
            meals[meal_id] = {
                "id": meal_id,
                "name": meal_name,
                "items": []
            }
        meals[meal_id]["items"].append({
            "name": item_name,
            "price": float(item_price)
        })

    return jsonify(list(meals.values()))

@app.route("/api/ratings", methods=["POST"])
def post_rating():
    data = request.get_json()
    user_id = data["user_id"]
    meal_id = data["meal_id"]
    rating = data["rating"]

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

    return jsonify({"message": "Comment added!"}), 201

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


@app.route("/api/meals", methods=["POST"])
def create_meal():
    data = request.get_json()

    user_id = data.get("user_id")
    meal_name = data.get("name")
    item_ids = data.get("items", [])

    if not user_id or not meal_name or not item_ids:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Calculate total price of the meal
        cur.execute("SELECT SUM(price) FROM items WHERE id = ANY(%s);", (item_ids,))
        total_price = cur.fetchone()[0] or 0

        # Insert the new meal
        cur.execute(
            "INSERT INTO meals (name, user_id, total_price) VALUES (%s, %s, %s) RETURNING id;",
            (meal_name, user_id, total_price)
        )
        meal_id = cur.fetchone()[0]

        # Insert meal items
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
