from gpiozero import LED
import gradio as gr
import threading
import json
import os
import sys
from dotenv import load_dotenv
import requests

ai_processor_src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai_processor/src'))
producer_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
sys.path.append(ai_processor_src_path)
sys.path.append(producer_path)

from messaging.producer import TopicProducer
from messaging.producer import ConfigVault
from models.transaction import TransactionRequestBuilder, TransactionType
from services.record_service import Record, Signal

load_dotenv('../../../../.env')

relay = LED(17)
relay.on()
record_service = Record()
builder = TransactionRequestBuilder()
producer = TopicProducer()
TOPIC = os.getenv("TOPIC")

def get_medicines():
    url = os.getenv("BACKEND_URL")
    try:
        response = requests.get(url + "medicine/")
        response.raise_for_status()
        data = response.json()
        data = data[0]["MedicineNames"]
        return [name["name"] for name in data]
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

names_list = get_medicines()

def start_recording_thread():
    record_service.signal_handler(Signal.START)

def stop_recording():
    record_service.signal_handler(Signal.STOP)

def open_pyxis(medicines, user, patient):

    transaction_request = (
        builder.with_type(TransactionType.OUT)
            .with_employee_uuid(user)
            .with_patient_uuid(patient)
            .with_pyxis_uuid("pyxis_789")
            .with_medicine_id(medicines)
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
            threading.Thread(target=producer.produce, args=(TOPIC, "teste", transaction_request.to_json())).start()
            threading.Thread(target=producer.flush).start()
            return f"Transaction completed! \n {json.dumps(transaction_request.__dict__, indent=4, default=str)}"
        else:
            return None


interface = gr.Interface(
    open_pyxis,
    [
        gr.Dropdown(
            names_list, value=[], multiselect=True, label="Medicamentos", info="Quais os medicamentos que você quer solicitar?"
        ),
        gr.Dropdown(
            ["Caio Martins de Abreu", "Filipi Enzo Siqueira Kikuchi", "Gabriela Barretto Dias", "Gabriela Rodrigues Matias", "Luca Sarhan Giberti", "Pablo Ruan Lana Viana", "Vinicios Venâncio Lugli"], multiselect=False, label="Colaborador", info="Quem está fazendo a requisição?"
        ),
        gr.Radio(
            ["Paciente 1", "Paciente 2", "Paciente 3"], label="Paciente", info="Quem é o paciente solicitante?"
        )
    ],
    "text",
)

interface.launch()