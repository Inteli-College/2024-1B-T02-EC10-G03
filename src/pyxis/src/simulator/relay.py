from gpiozero import LED
import gradio as gr
import threading
import json
import os
import sys

ai_processor_src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai_processor/src'))
sys.path.append(ai_processor_src_path)

from services.record_service import Record, Signal

def start_recording_thread():
    record_service.signal_handler(Signal.START)

def stop_recording():
    record_service.signal_handler(Signal.STOP)

relay = LED(17)
relay.on()
record_service = Record()

def greet(input):
    relay.toggle()

    if not relay.is_lit:
        print("Pyxis opened! Start recording...")
        threading.Thread(target=start_recording_thread).start()
    else:
        print("Stop Recording...")
        stop_recording()
    
    return "Relay toggled"

interface = gr.Interface(
    fn=greet,
    title="Greeting",
    inputs=[gr.Button("Open Pyxis")],
    outputs=["text"],
)

interface.launch()
