from services.camera_service import CameraService

try: 
   camera_service = CameraService()
   camera_service.get_record()
except Exception as e:
   print(f"An error occurred: {e}")

