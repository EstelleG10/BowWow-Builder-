import csv
import psycopg  # psycopg v3

# Connect to local PostgreSQL
conn = psycopg.connect(
    dbname="itemsdb",
    user="estellegerber",  # Replace with your macOS username if needed
    host="localhost",
    port="5432"
    # password="yourpassword"  # Only include if you've set a password
)
cur = conn.cursor()

# Create tables (must be done before trying to DELETE from them)
print("Creating tables")

# items tb 
cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL
        img_route TEXT
    );
""")
# cat tb
cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );
""")
# item cat 
cur.execute("""
    CREATE TABLE IF NOT EXISTS item_categories (
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, category_id)
    );
""")
# userrs 
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
""")
# meals 
cur.execute("""
    CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        total_price NUMERIC NOT NULL CHECK (total_price <= 12),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    );
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS meal_items (
        meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        PRIMARY KEY (meal_id, item_id)
    );
""")

# make ratings table
cur.execute("""
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    meal_id INTEGER REFERENCES meals(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
""")

# make comments table
cur.execute("""
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    meal_id INTEGER REFERENCES meals(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()

# clear existing data (now safe)
print("Clearing existing data")
cur.execute("DELETE FROM item_categories;")
cur.execute("DELETE FROM items;")
cur.execute("DELETE FROM categories;")
cur.execute("DELETE FROM users;")
conn.commit()

# rset auto-increment IDs
cur.execute("ALTER SEQUENCE items_id_seq RESTART WITH 1;")
cur.execute("ALTER SEQUENCE users_id_seq RESTART WITH 1;")
conn.commit()

# add categories from cat.csv
print("Inserting categories")
with open("cat.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        category_id = int(row["number"])
        category_name = row["Category"].strip()
        cur.execute(
            "INSERT INTO categories (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;",
            (category_id, category_name)
        )

print("Inserting items")
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

# get valid category IDs
valid_category_ids = set()
cur.execute("SELECT id FROM categories;")
for row in cur.fetchall():
    valid_category_ids.add(row[0])

# link items to categories from catitems1.csv
print("Linking items to categories")
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

print("Data inserted into local PostgreSQL database.")
