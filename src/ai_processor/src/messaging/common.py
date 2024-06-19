import os
import dotenv

dotenv.load_dotenv()

class ConfigVault:
    BOOTSTRAP_SERVER = os.getenv('BOOTSTRAP_SERVER')
    CLIENT_ID = os.getenv('CLIENT_ID')

    @staticmethod
    def consumer_config():
        return {
            'bootstrap.servers': ConfigVault.BOOTSTRAP_SERVER,
            'group.id': ConfigVault.CLIENT_ID,
            'auto.offset.reset': 'earliest'
        }
