from enum import Enum
import time
import os

import cv2 as cv

from services.bucket_service import Bucket

file_name = f"record_{time.strftime('%Y_%m_%d_%H_%M_%S')}.mp4"

class Signal(Enum):
    START = 1
    STOP = 2

class Record:
    def __init__(self):
        self.camera = cv.VideoCapture(0)
        self.out = cv.VideoWriter(os.path.join('../../videos', file_name), cv.VideoWriter_fourcc(*'mp4v'),
                                self.camera.get(cv.CAP_PROP_FPS), 
                                (640, 480)
                                )
        self.recording: bool = False
        self.timeout = 30
        self.service = Bucket()
    
    def signal_handler(self, signal: Signal):
        if signal == Signal.START:
            self.recording = True
            self.get_record()
        
        if signal == Signal.STOP:
            self.release_all()
            self.service.get_file_path(file_name)
            self.service.upload_transaction_record()

    def get_record(self):
        while self.recording:
            ret, frame = self.camera.read()
            if ret:
                self.out.write(frame)

    def release_all(self):
        self.recording = False
        self.camera.release()
        self.out.release()
        # self.record.release()
        cv.destroyAllWindows()
