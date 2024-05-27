import time
import signal
import cv2 as cv
from ultralytics import YOLO

model = YOLO("config/prod.pt")
file_name = f"record_{time.strftime('%Y_%m_%d_%H_%M_%S')}.mp4"

class CameraService:
    def __init__(self):
        self.camera = cv.VideoCapture(0)
        self.out = cv.VideoWriter(file_name, cv.VideoWriter_fourcc(*'mp4v'), 60.0, (640, 480))
        self.recording = True

    def signal_handler(self, signal, frame):
        self.release_all()

    def get_record(self):
        while self.recording:
            ret, frame = self.camera.read()
            if ret:
                predicted = model.predict(frame, conf=0.5)
                self.out.write(predicted[0].plot())
            else:
                print("Failed to capture frame")
                break

    def release_all(self):
        self.recording = False
        self.camera.release()
        self.out.release()
        cv.destroyAllWindows()
    
    def upload_file_to_bucket(self):
        pass
