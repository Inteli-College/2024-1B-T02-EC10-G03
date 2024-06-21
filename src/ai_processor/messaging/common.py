import os
from dotenv import load_dotenv

load_dotenv("../config/.env")


class ConfigVault:
    BOOTSTRAP_SERVER = os.getenv('BOOTSTRAP_SERVER')
    SASL_USERNAME = os.getenv('SASL_USERNAME')
    SASL_PASSWORD = os.getenv('SASL_PASSWORD')
    GROUP_ID = os.getenv('GROUP_ID')

    @staticmethod
    def consumer_config():
        return {
            "bootstrap.servers": ConfigVault.BOOTSTRAP_SERVER,
            "sasl.username": ConfigVault.SASL_USERNAME,
            "sasl.password": ConfigVault.SASL_PASSWORD,
            "group.id": ConfigVault.GROUP_ID,
            "security.protocol": "SASL_SSL",
            "sasl.mechanisms": "PLAIN",
            "auto.offset.reset": "earliest",
        }