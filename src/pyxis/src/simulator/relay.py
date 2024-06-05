from gpiozero import LED
from time import sleep

def main():
    relay = LED(17)
    while True:
        relay.on()
        sleep(1)
        relay.off()
        sleep(1)

if __name__ == '__main__':
    main()