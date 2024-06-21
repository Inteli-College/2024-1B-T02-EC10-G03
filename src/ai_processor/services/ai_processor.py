import cv2 as cv
from ultralytics import YOLO
from pathlib import Path





class AIProcessor:
    def __init__(self, file_path, filename):
        self.model = YOLO("../config/main_model.pt")
        self.cap = cv.VideoCapture(file_path)
        self.out = cv.VideoWriter(
            filename=filename,
            fourcc=cv.VideoWriter_fourcc(*'mp4v'),
            fps=60.0,
            frameSize=(640, 480)
        )
        self.validating = False
        self.path_to_save_validation = Path(__file__).parent.parent / "data" / "validated"


    def process_image(self):
        while self.recording:
            ret, frame = self.cap.read()
            if ret:
                self.out.write(frame)



    def release_all_resources(self):
        self.validating = False
        self.camera.release()
        self.out.release()
        self.record.release()
        cv.destroyAllWindows()



