from confluent_kafka import Consumer, KafkaError, KafkaException
from common import ConfigVault
from dotenv import load_dotenv

import json

load_dotenv("../config/.env")

class TopicConsumer:
    def __init__(self):
        self.consumer = Consumer(ConfigVault.consumer_config())
        self.topic = os.getenv("TOPIC")
        self.timeout = 1.0

    async def consume(self):
        self.consumer.subscribe([self.topic])
        try:
            while True:
                message = self.consumer.poll(timeout=1.0)
                if message is None:
                    continue
                if message.error():
                    if message.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        continue
                
                message_body = (
                    json.loads(
                        message.value().decode("utf-8")
                        )
                ).get("validation_video_path")
        except KafkaException as e:
            raise e
        finally:
            self.consumer.close()


if __name__ == "__main__":
    consumer = TopicConsumer()
    consumer.consume()