import csv
import psycopg

# Connect to PostgreSQL using psycopg 
# https://wiki.postgresql.org/wiki/Using_psycopg2_with_PostgreSQL
# i left user and pass blank for now bc we do not have users db 
conn = psycopg.connect(
    dbname="itemsdb",
    user="estellegerber",     
    password="------", 
    host="bowwow-db.cneo2g2w2qei.us-east-2.rds.amazonaws.com",
    port="5432"
)
cur = conn.cursor()
# clear existing data so nums start from 1 

cur.execute("DELETE FROM item_categories;")
cur.execute("DELETE FROM items;")
cur.execute("DELETE FROM categories;")
cur.execute("DELETE FROM users;")
conn.commit()

# make all of our db tables 
# item table w id, name, and price 
cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL
    );
""")
# cat table with id and name for num of cat and name of cat 
cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
    );
""")
# we connect based on item id and cat id using our catitems csv NEEDS REORDERED
cur.execute("""
    CREATE TABLE IF NOT EXISTS item_categories (
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, category_id)
    );
""")
# users is empty for now but when users sign we store their info 
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
""")
conn.commit()

#read in each csv 
# cat csb i for each category and its num assignment 
with open("cat.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # read in the num and cat 
        category_id = int(row["number"])
        category_name = row["Category"].strip()
        cur.execute(
            # on conflict bc we will same same cat maybe
            "INSERT INTO categories (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING;",
            (category_id, category_name)
        )

# read our items 
item_id_tracker = {}  # row number to real item_id mapping (MAYBE RESET HERE??)
with open("items.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for i, row in enumerate(reader, start=1):
        # add in our item and price 
        name = row["Item"].strip()
        price = row["Price"]
        cur.execute(
            "INSERT INTO items (name, price) VALUES (%s, %s) RETURNING id;",
            (name, price)
        )
        real_id = cur.fetchone()[0]
        item_id_tracker[i] = real_id

#get cat ids 
valid_category_ids = set()
cur.execute("SELECT id FROM categories;")
for row in cur.fetchall():
    valid_category_ids.add(row[0])

#import item w their cat 
with open("catitems1.csv", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    # LOTSSS OF DEBUGGING FOR NOW
    for row in reader:
        try:
            raw_item_id = int(row["item_id"])
            category_id = int(row["category_id"])
        except ValueError:
            print(f"FAILED")
            continue

        item_id = item_id_tracker.get(raw_item_id)

        if not item_id:
            print(f"FAILED")
        elif category_id not in valid_category_ids:
            print(f"FAILED")
        else:
            cur.execute(
                "INSERT INTO item_categories (item_id, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
                (item_id, category_id)
            )
            print(f"WORKED")

conn.commit()
cur.close()
conn.close()