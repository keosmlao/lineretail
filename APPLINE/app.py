from flask import Flask, request, render_template, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/liff-login", methods=["POST"])
def liff_login():
    data = request.get_json()
    print("✅ Received:", data)
    return jsonify({"success": True, "message": "Login OK"})
@app.route("/home")
def home():
    return render_template("home.html")
if __name__ == "__main__":
    app.run(debug=True, port=5000)