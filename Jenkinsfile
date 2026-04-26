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

        stage('Deploy to Kubernetes') {
            steps {
                // Inject kubeconfig from Jenkins credentials
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {

                    // Apply the deployment manifest
                    bat "kubectl apply -f k8s/deployment.yaml --kubeconfig=%KUBECONFIG%"

                    // Update the image to the exact build tag (not just 'latest')
                    bat "kubectl set image deployment/%K8S_DEPLOYMENT% %K8S_CONTAINER%=${DOCKER_HUB_REPO}:${IMAGE_TAG} --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG%"

                    // Wait for rollout to complete
                    bat "kubectl rollout status deployment/%K8S_DEPLOYMENT% --namespace=%K8S_NAMESPACE% --kubeconfig=%KUBECONFIG% --timeout=120s"
                }
                echo "Deployed to Kubernetes: ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
            }
        }
    }

    post {
        success { echo "Pipeline succeeded — build #${BUILD_NUMBER} deployed to Kubernetes!" }
        failure { echo "Pipeline failed — check logs above." }
        always  { bat "docker logout" }
    }
}