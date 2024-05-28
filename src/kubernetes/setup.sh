echo "\n---------------------------------"
echo "| Kubernetes deployment started |"
echo "---------------------------------\n"

sleep 1

echo "    GGGGGGGGGGGG        000000000           333333333333333   \n  GGG::::::::::::G     00:::::::::00        3:::::::::::::::33 \n GG:::::::::::::::G   00:::::::::::::00     3::::::33333::::::3\nG:::::GGGGGGGG::::G  0:::::::000:::::::0    3333333     3:::::3\nG:::::G       GGGGGG 0::::::0   0::::::0                3:::::3\nG:::::G              0:::::0     0:::::0                3:::::3\nG:::::G              0:::::0     0:::::0        33333333:::::3 \nG:::::G    GGGGGGGGGG0:::::0 000 0:::::0        3:::::::::::3  \nG:::::G    G::::::::G0:::::0 000 0:::::0        33333333:::::3 \nG:::::G    GGGGG::::G0:::::0     0:::::0                3:::::3\nG:::::G        G::::G0:::::0     0:::::0                3:::::3\n G:::::G       G::::G0::::::0   0::::::0                3:::::3\n  G:::::GGGGGGGG::::G0:::::::000:::::::0    3333333     3:::::3\n   GG:::::::::::::::G 00:::::::::::::00     3::::::33333::::::3\n     GGG::::::GGG:::G  00:::::::::00        3:::::::::::::::33 \n        GGGGGG   GGGG    000000000           333333333333333   "

echo "\n-----------------------------------"
echo "| Starting docker-desktop service |"
echo "-----------------------------------\n"
systemctl --user start docker-desktop

echo "Docker desktop service started"

sleep 5

echo "\n---------------------------------------"
echo "| Deleting existing minikube instance |"
echo "---------------------------------------\n"
minikube delete

sleep 1

echo "\n---------------------"
echo "| Starting minikube |"
echo "---------------------\n"
minikube start

echo "\n---------------------------"
echo "| Enabling metrics-server |"
echo "---------------------------\n"
minikube addons enable metrics-server

sleep 1

echo "\n--------------------------------------------"
echo "| Enabling docker environment for minikube |"
echo "--------------------------------------------\n"
eval $(minikube -p minikube docker-env)
echo "Docker environment enabled for minikube"

sleep 1

echo "\n---------------------------------"
echo "| Building backend docker image |"
echo "---------------------------------\n"
docker build -t backend -f ../backend/Dockerfile.prod ../backend

sleep 3

echo "\n--------------------------------"
echo "| Starting database deployment |"
echo "--------------------------------\n"

sleep 3
minikube kubectl -- apply -f postgres-deployment.yaml
minikube kubectl -- apply -f postgres-service.yaml
minikube kubectl -- apply -f postgres-pvc.yaml

echo "\n-----------------------------"
echo "| Starting cache deployment |"
echo "-----------------------------\n"

sleep 3
minikube kubectl -- apply -f redis-deployment.yaml
minikube kubectl -- apply -f redis-service.yaml
minikube kubectl -- apply -f redis-pvc.yaml

echo "\n-------------------------------"
echo "| Starting backend deployment |"
echo "-------------------------------\n"

sleep 3
minikube kubectl -- apply -f app-deployment.yaml
minikube kubectl -- apply -f app-service.yaml
minikube kubectl -- apply -f app-config.yaml
minikube kubectl -- apply -f app-pvc.yaml

sleep 5

echo "\n---------------------------------------------"
echo "| Port forwarding to access the application |"
echo "---------------------------------------------\n"
echo $(minikube service app-service --url) 

sleep 1

echo "\n---------------------"
echo "| Calling dashboard |"
echo "---------------------\n"
minikube dashboard