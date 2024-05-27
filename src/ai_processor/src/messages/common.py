import os

class ConfigVault:
    BOOTSTRAP_SERVER = os.getenv('BOOTSTRAP_SERVER')
    CLIENT_ID = os.getenv('CLIENT_ID')

    @staticmethod
    def producer_config():
        return {
            'bootstrap.servers': ConfigVault.BOOTSTRAP_SERVER,
            'client.id': ConfigVault.CLIENT_ID
        }