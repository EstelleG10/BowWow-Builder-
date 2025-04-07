import psycopg

conn = psycopg.connect("dbname=itemsdb user='' password='' host=localhost")
cur = conn.cursor()
cur.execute("SELECT * FROM items;")
rows = cur.fetchall()
print(rows)
cur.close()
conn.close()
