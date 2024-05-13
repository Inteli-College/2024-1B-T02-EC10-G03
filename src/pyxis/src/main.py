from dotenv import load_dotenv
from messaging.producer import TopicProducer
from models.transaction import TransactionRequestBuilder, TransactionType
import time, random, os


class App:
    topic: str

    def __init__(self):
        load_dotenv()

        self.topic = os.getenv("TOPIC")

    def generate_mock_transaction(self):
        builder = TransactionRequestBuilder()

        transaction_request = (
            builder.with_type(TransactionType.OUT)
            .with_employee_uuid("employee_123")
            .with_patient_uuid("patient_456")
            .with_pyxis_uuid("pyxis_789")
            .with_medicine_id("med_789")
            .with_quantity(5)
            .build()
        )

        transaction_request.open()
        time.sleep(random.randint(1, 3))
        transaction_request.finish()

        transaction_request.set_validation_video_path("s3/path/to/video")

        print(f"transaction_request.is_valid(): {transaction_request.is_valid()}")

        if transaction_request.is_valid():
            return transaction_request
        else:
            return None

    def run(self):
        producer = TopicProducer()

        transaction_request = self.generate_mock_transaction()

        if transaction_request:
            producer.produce(self.topic, transaction_request.to_json())
            producer.flush()


if __name__ == "__main__":
    App().run()
