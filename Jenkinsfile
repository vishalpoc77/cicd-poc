pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO    = 'vishaldocker77/sample-app'
        DOCKER_CREDENTIALS = credentials('docker-hub-creds')
        IMAGE_TAG          = "${BUILD_NUMBER}"
        K8S_DEPLOYMENT     = 'sample-app'
        K8S_CONTAINER      = 'sample-app'
        K8S_NAMESPACE      = 'default'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vishalpoc77/cicd-poc.git'
                echo "Code checked out at commit: ${GIT_COMMIT}"
            }
        }

        stage('Build') {
            steps {
                bat "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                bat "docker tag ${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_REPO}:latest"
                echo "Docker image built: ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Test') {
            steps {
                bat "docker run --rm ${DOCKER_HUB_REPO}:${IMAGE_TAG} sh -c \"npm test\""
                echo "Tests passed"
            }
        }

        stage('Push Image') {
            steps {
                bat "docker login -u %DOCKER_CREDENTIALS_USR% -p %DOCKER_CREDENTIALS_PSW%"
                bat "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                bat "docker push ${DOCKER_HUB_REPO}:latest"
                echo "Image pushed to Docker Hub"
            }
        }

        stage('Deploy to EKS') {
    steps {
        withCredentials([
            file(credentialsId: 'kubeconfig',              variable: 'KUBECONFIG'),
            string(credentialsId: 'aws-access-key-id',     variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: 'dockerhub-password',    variable: 'DOCKERHUB_PASSWORD')
        ]) {
            withEnv([
                "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}",
                "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}",
                "AWS_DEFAULT_REGION=ap-south-1"
            ]) {
                // Verify AWS identity
                bat "aws sts get-caller-identity"

                // Create/update Docker Hub pull secret
                bat "kubectl create secret docker-registry dockerhub-secret --docker-server=https://index.docker.io/v1/ --docker-username=vishaldocker77 --docker-password=%DOCKERHUB_PASSWORD% --namespace=default --kubeconfig=%KUBECONFIG% --dry-run=client -o yaml | kubectl apply -f - --kubeconfig=%KUBECONFIG%"

                // Apply deployment
                bat "kubectl apply -f k8s/deployment.yaml --kubeconfig=%KUBECONFIG%"

                // Update image
                bat "kubectl set image deployment/%K8S_DEPLOYMENT% %K8S_CONTAINER%=${DOCKER_HUB_REPO}:${IMAGE_TAG} --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG%"

                // Wait for old pods to terminate first
                bat "kubectl wait --for=delete pod -l app=sample-app --timeout=120s --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG% || echo Pods cleared"

                // Then check rollout status
                bat "kubectl rollout status deployment/%K8S_DEPLOYMENT% --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG% --timeout=300s"

                // Print service info
                bat "kubectl get service sample-app-service --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG%"
            }
        }
        echo "Deployed to AWS EKS: ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
    }
}