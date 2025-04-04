from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
