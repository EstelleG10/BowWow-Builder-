import csv
import psycopg

# Connect to PostgreSQL using psycopg 
# https://wiki.postgresql.org/wiki/Using_psycopg2_with_PostgreSQL
# i left user and pass blank for now bc we do not have users db 
conn = psycopg.connect(
    dbname="itemsdb",
    user="postgres",
    password="1235",
    host="localhost",
    port="5432"

)

cur = conn.cursor()

# make our table w id name price for each item 
cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL
    );
""")

# make our users table 
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
""")
conn.commit()

# read our item csv 

with open("item.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['Item']
        price = row['Price']
        # get the item name and price from csv 
        # i am keeping -1 for now but we will wanna check that later 
        cur.execute("INSERT INTO items (name, price) VALUES (%s, %s);", (name, price))

conn.commit()
cur.close()
conn.close()
