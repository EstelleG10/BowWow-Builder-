from flask import Flask, jsonify
from flask_cors import CORS  
import psycopg2

app = Flask(__name__)
CORS(app)  

# database connection setup
def get_db_connection():
    try:
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

# endpoint to get items
@app.route('/api/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    cur.execute("SELECT * FROM items")
    items = cur.fetchall()
    conn.close()

    if not items:
        return jsonify({"message": "No items found"}), 404

    item_list = [{'item': item[1], 'price': float(item[2])} for item in items]
    return jsonify(item_list)

if __name__ == '__main__':
    app.run(debug=True)
