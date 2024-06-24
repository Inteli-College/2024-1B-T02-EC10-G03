import os
from dotenv import load_dotenv

load_dotenv('../../../../.env')


class ConfigVault:
    BOOTSTRAP_SERVER = os.getenv('BOOTSTRAP_SERVERS')
    SASL_USERNAME = os.getenv('SASL_USERNAME')
    SASL_PASSWORD = os.getenv('SASL_PASSWORD')

    @staticmethod
    def producer_config():
        return {
            "bootstrap.servers": ConfigVault.BOOTSTRAP_SERVER,
            "sasl.username": ConfigVault.SASL_USERNAME,
            "sasl.password": ConfigVault.SASL_PASSWORD,
            "security.protocol": "SASL_SSL",
            "sasl.mechanisms": "PLAIN",
        }
