from flask import Flask, jsonify

from fetch_room_data import fetch_room_data

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = fetch_room_data(123)
    print(data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
