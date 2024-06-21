from boto3 import client
from dotenv import load_dotenv

import os
from pathlib import Path
from threading import Thread

load_dotenv("../config/.env")


class FileHandler(Thread):
    def __init__(self, s3_object_names: list):
        super().__init__()
        self.bucket_name = os.getenv("AWS_BUCKET_NAME")
        self.s3 = client('s3', 
                        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                        aws_session_token=os.getenv("AWS_SESSION_TOKEN"))
        self.s3_object_names = s3_object_names
        self.path_to_save_file = Path(__file__).parent.parent / "data" / "to_validate"

    def download_file_from_s3(self, s3_object_name):
        new_file_name = f"to_be_processed_{s3_object_name}"
        print(f"Downloading file {s3_object_name} from S3")
        self.s3.download_file(self.bucket_name, s3_object_name, self.path_to_save_file / new_file_name)
        print(f"File {s3_object_name} downloaded from S3")

    def run(self):
        for s3_object_name in self.s3_object_names:
            self.download_file_from_s3(s3_object_name)

# s3_object_names = ["record_2024_06_07_09_58_26.mp4", "record_2024_06_13_14_33_13.mp4", "record_2024_06_13_14_39_17.mp4", "record_2024_06_13_14_41_40.mp4"]

# file_handler = FileHandler(s3_object_names)

# file_handler.start()
# file_handler.join()
