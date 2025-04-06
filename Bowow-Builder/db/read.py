import csv
import psycopg

# Connect to PostgreSQL using psycopg
conn = psycopg.connect(
    dbname="itemsdb",
    user="estellegerber",     
    password="megu$taDatab$$3s", 
    host="bowwow-db.cneo2g2w2qei.us-east-2.rds.amazonaws.com",
    port="5432"
)
cur = conn.cursor()

# Clear existing data
cur.execute("DELETE FROM item_categories;")
cur.execute("DELETE FROM items;")
cur.execute("DELETE FROM categories;")
cur.execute("DELETE FROM users;")
conn.commit()

# Reset our key idf 
cur.execute("ALTER SEQUENCE items_id_seq RESTART WITH 1;")
cur.execute("ALTER SEQUENCE users_id_seq RESTART WITH 1;")
conn.commit()

# Create tables
cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL
    );
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS item_categories (
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, category_id)
    );
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
""")
conn.commit()

# Insert categories from cat.csv
with open("cat.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        category_id = int(row["number"])
        category_name = row["Category"].strip()
        cur.execute(
            "INSERT INTO categories (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;",
            (category_id, category_name)
        )

# Insert items from items.csv
item_id_tracker = {}
with open("items.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for i, row in enumerate(reader, start=1):
        name = row["Item"].strip()
        price = row["Price"]
        cur.execute(
            "INSERT INTO items (name, price) VALUES (%s, %s) RETURNING id;",
            (name, price)
        )
        real_id = cur.fetchone()[0]
        item_id_tracker[i] = real_id

# Get valid category IDs
valid_category_ids = set()
cur.execute("SELECT id FROM categories;")
for row in cur.fetchall():
    valid_category_ids.add(row[0])

# Link items to categories from catitems1.csv
with open("catitems1.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        try:
            raw_item_id = int(row["item_id"])
            category_id = int(row["category_id"])
        except ValueError:
            print(f"FAILED: bad int conversion — {row}")
            continue

        item_id = item_id_tracker.get(raw_item_id)

        if not item_id:
            print(f"FAILED: item_id {raw_item_id} not found in tracker")
        elif category_id not in valid_category_ids:
            print(f"FAILED: category_id {category_id} is invalid")
        else:
            cur.execute(
                "INSERT INTO item_categories (item_id, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                (item_id, category_id)
            )
            print(f"WORKED: item_id {item_id} linked to category_id {category_id}")

conn.commit()
cur.close()
conn.close()
