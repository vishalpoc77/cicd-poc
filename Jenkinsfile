pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'vishaldocker77/sample-app'
        DOCKER_CREDENTIALS = credentials('docker-hub-creds')
        IMAGE_TAG = "${BUILD_NUMBER}"
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

        stage('Deploy') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    bat "ssh -o StrictHostKeyChecking=no ec2-user@YOUR_EC2_IP \"docker pull ${DOCKER_HUB_REPO}:latest && docker stop sample-app || true && docker rm sample-app || true && docker run -d --name sample-app -p 80:3000 ${DOCKER_HUB_REPO}:latest\""
                }
                echo "Deployed to EC2"
            }
        }
    }

    post {
        success { echo "Pipeline succeeded — build #${BUILD_NUMBER} deployed!" }
        failure { echo "Pipeline failed — check logs above." }
        always  { bat "docker logout" }
    }
}