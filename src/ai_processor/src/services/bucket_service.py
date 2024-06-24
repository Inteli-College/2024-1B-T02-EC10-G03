import os
from dotenv import load_dotenv

from boto3 import client

load_dotenv(os.path.normpath(os.path.join(os.path.dirname(__file__), '../../../../', '.env')))

class Bucket:
    def __init__(self):
        self.bucket_name = os.getenv('AWS_BUCKET_NAME')
        self.s3 = client('s3', 
                        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                        aws_session_token=os.getenv('AWS_SESSION_TOKEN')
                        )
        self.file_path: str = None

    def get_file_path(self, file_name):
        self.file_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '../../../pyxis/videos', file_name))
    
    def upload_transaction_record(self):
        self.s3.upload_file(self.file_path, self.bucket_name, os.path.basename(self.file_path))
        print(f'File {self.file_path} uploaded to bucket {self.bucket_name}')
