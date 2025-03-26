import psycopg

# Connect to your local PostgreSQL DB
conn = psycopg.connect(
    dbname="itemsdb",
    user="",      # ← change this
    password="",  # ← or "" if not needed
    host="localhost",
    port="5432"
)

cur = conn.cursor()

# Get all items from the table
cur.execute("SELECT name, price FROM items;")
rows = cur.fetchall()

# Print them nicely
print("Items in the database:")
for name, price in rows:
    print(f"- {name}: ${price}")

cur.close()
conn.close()
