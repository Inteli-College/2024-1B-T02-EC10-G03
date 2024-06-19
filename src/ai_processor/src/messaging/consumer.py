# consumer.py

from confluent_kafka import Consumer, KafkaException
from common import ConfigVault
import sys

TOPIC = ["test-topic"]

def on_consumer_subscription_callback(consumer, partitions):
    print("Assignment:", partitions)

consumer = Consumer(ConfigVault.consumer_config())

consumer.subscribe(TOPIC, on_assign=on_consumer_subscription_callback)

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            raise KafkaException(msg.error())
        else:
            sys.stderr.write('%% %s [%d] at offset %d with key %s:\n' %
                                 (msg.topic(), msg.partition(), msg.offset(),
                                  str(msg.key())))
            print(msg.value())

            consumer.store_offsets(msg)

except KeyboardInterrupt:
    sys.stderr.write('%% Aborted by user\n')
finally:
    consumer.close()
