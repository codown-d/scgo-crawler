from flask import Flask, jsonify

from fetch_room_data import fetch_room_data

app = Flask(__name__)

@app.route('/api/room/<room_id>', methods=['GET'])
def get_data(room_id):
    print(room_id)
    data = fetch_room_data(room_id)
    print(data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
