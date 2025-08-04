from datetime import datetime, date
from flask import Flask, render_template, request, url_for,redirect,session
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
# dbConnection = "dbname='odg' user='postgres' host='10.0.40.107' port='5432' password='od@2022'"
dbConnection = "dbname='odg_test' user='postgres' host='183.182.125.245' port='5432' password='od@2022'"
from psycopg2.extras import RealDictCursor
    # pool define with 10 live connections
connectionpool = SimpleConnectionPool(1,50,dsn=dbConnection)

@contextmanager
def getcursor():
    con = connectionpool.getconn()
    con.autocommit = True
    try:
        yield con.cursor(cursor_factory=RealDictCursor)
    finally:
        connectionpool.putconn(con)
