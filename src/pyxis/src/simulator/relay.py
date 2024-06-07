from gpiozero import LED
import gradio as gr
import time

relay = LED(17)

def greet(input):

    relay.toggle()

    return

interface = gr.Interface(
    fn=greet,
    title="Greeting",
    inputs=[gr.Button("Open Pyxis")],
    outputs=["image"],
)

interface.launch()