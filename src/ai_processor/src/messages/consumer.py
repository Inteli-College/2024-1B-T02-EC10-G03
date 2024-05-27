from confluent_kafka import Consumer, KafkaError, Message

from .common import ConfigVault

class TopicConsumer:
    consumer: Consumer

    def __init__(self, topics: list[str], override_config: dict = None):
        self.consumer = Consumer(override_config or ConfigVault.consumer_config())
        self.consumer.subscribe(topics)

    @staticmethod
    def delivery_callback(err: KafkaError, msg: Message):
        if err:
            print(f"\t\tMessage delivery failed: {err}")
        else:
            print(f'\t\tMessage delivered to topic "{msg.topic()}"')
    
    def close(self):
        self.consumer.close()