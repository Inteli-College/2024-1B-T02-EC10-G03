from gpiozero import LED
import gradio as gr
import threading
import json
import os
import sys

ai_processor_src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai_processor/src'))
producer_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(ai_processor_src_path)
sys.path.append(producer_path)

from messaging.producer import TopicProducer
from messaging.producer import ConfigVault
from models.transaction import TransactionRequestBuilder, TransactionType
from services.record_service import Record, Signal

relay = LED(17)
relay.on()
record_service = Record()
builder = TransactionRequestBuilder()
producer = TopicProducer()
TOPIC = "teste-topic"

def start_recording_thread():
    record_service.signal_handler(Signal.START)

def stop_recording():
    record_service.signal_handler(Signal.STOP)

def open_pyxis(input):

    transaction_request = (
        builder.with_type(TransactionType.OUT)
            .with_employee_uuid("employee_123")
            .with_patient_uuid("patient_456")
            .with_pyxis_uuid("pyxis_789")
            .with_medicine_id("med_789")
            .with_quantity(5)
            .build()
    )

    relay.toggle()

    if not relay.is_lit:
        transaction_request.open()
        print("Pyxis opened! Start recording...")
        threading.Thread(target=start_recording_thread).start()
    else:
        transaction_request.finish()
        print("Stop Recording...")
        stop_recording()

        file_path = record_service.service.file_path

        transaction_request.set_validation_video_path(os.path.basename(file_path))

        if transaction_request.is_valid():
            print(transaction_request)
            threading.Thread(target=producer.produce, args=(TOPIC, "teste", transaction_request.to_json())).start()
            threading.Thread(target=producer.flush).start()
            return "Transaction completed!"
        else:
            return None

interface = gr.Interface(
    fn=open_pyxis,
    title="Interface Pyxis",
    inputs=[gr.Button("Open Pyxis")],
    outputs=["text"],
)

interface.launch()