import cv2 as cv 
from ultralytics import YOLO

model = YOLO("config/prod.pt")
cam = cv.VideoCapture(0)

if not cam.isOpened():
    print("Câmera não encontrada")
    exit()

fourcc = cv.VideoWriter_fourcc(*'mp4v')
out = cv.VideoWriter('output.mp4', fourcc, 30.0, (640, 400))

while True:
   ret, frame = cam.read()

   result = model.predict(frame, conf=0.5) 

   if ret:
      frame_resultados = result[0].plot()
      cv.imshow("Resultados", frame_resultados)

      out.write(frame_resultados)

      if cv.waitKey(1) == ord('q'):
         break

cam.release()
out.release()
cv.destroyAllWindows()