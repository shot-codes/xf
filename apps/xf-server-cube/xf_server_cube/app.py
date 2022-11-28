import logging
from dataclasses import dataclass, asdict
from json import dumps
from flask import Flask, request, json
from flask_socketio import SocketIO

logging.basicConfig(level=logging.WARN)

app = Flask(__name__)
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "somesecret"
socketio = SocketIO(app, async_mode="eventlet", cors_allowed_origins="*")


@dataclass
class Packet:
    quaternion_w: float
    quaternion_x: float
    quaternion_y: float
    quaternion_z: float
    acceleration_x: float
    acceleration_y: float
    acceleration_z: float

    @property
    def __dict__(self):
        return asdict(self)

    @property
    def json(self):
        return dumps(self.__dict__)


@app.route("/data", methods=["POST"])
def data():
    data = json.loads(request.data)
    frame = Packet(
        quaternion_w=data["motionQuaternionW"],
        quaternion_x=data["motionQuaternionX"],
        quaternion_y=data["motionQuaternionY"],
        quaternion_z=data["motionQuaternionZ"],
        acceleration_x=data["motionUserAccelerationX"],
        acceleration_y=data["motionUserAccelerationY"],
        acceleration_z=data["motionUserAccelerationZ"],
    )
    logging.debug(frame)
    socketio.emit("data", frame.json)

    return ""


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
