import os
from threading import Thread

from boto3 import client

class BucketService(Thread):
    def __init__(self):
        self.bucket_name = os.getenv('AWS_BUCKET_NAME')
        self.s3 = client('s3', 
                        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
                        )
        self.file_path: str = None

    @classmethod
    def get_bucket(self):
        return self.s3.get_bucket(Bucket=self.bucket_name)
    
    def get_file_path(self, file_name):
        self.file_path = os.path.join(os.path.dirname(__file__), file_name)
    
    def upload_transaction_record(self):
        self.s3.upload_file(self.file_path, self.bucket_name, os.path.basename(self.file_path))
        print(f'File {self.file_path} uploaded to bucket {self.bucket_name}')
