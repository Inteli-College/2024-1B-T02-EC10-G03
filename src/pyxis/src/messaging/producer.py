from confluent_kafka import Producer, KafkaError, Message
from .common import ConfigVault
import json


class TopicProducer:
    producer: Producer

    def __init__(self, override_config: dict = None):
        self.producer = Producer(override_config or ConfigVault.producer_config())

    def delivery_callback(self, err: KafkaError, msg: Message):
        if err:
            print(f"\t\tMessage delivery failed: {err}")
        else:
            print(f'\t\tMessage delivered to topic "{msg.topic()}"')

    def produce(self, topic: str, key: str, message: str | dict):
        if isinstance(message, dict):
            message = json.dumps(message)

        self.producer.produce(
            topic, key, message.encode("utf-8"), callback=self.delivery_callback
        )

    def flush(self):
        self.producer.flush()
