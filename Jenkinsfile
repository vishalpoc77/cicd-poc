pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO = 'yourdockerhubuser/sample-app'
        DOCKER_CREDENTIALS = credentials('docker-hub-creds')
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-org/your-repo.git'
                echo "Code checked out at commit: ${GIT_COMMIT}"
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                sh "docker tag ${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_REPO}:latest"
            }
        }

        stage('Test') {
            steps {
                sh """
                  docker run --rm ${DOCKER_HUB_REPO}:${IMAGE_TAG} \
                    sh -c 'npm test'
                """
            }
        }

        stage('Push Image') {
            steps {
                sh "echo ${DOCKER_CREDENTIALS_PSW} | docker login -u ${DOCKER_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_HUB_REPO}:latest"
            }
        }

        stage('Deploy') {
            steps {
                // Option A: EC2
                sshagent(['ec2-ssh-key']) {
                    sh """
                      ssh -o StrictHostKeyChecking=no ec2-user@YOUR_EC2_IP \
                        'docker pull ${DOCKER_HUB_REPO}:latest && \
                         docker stop sample-app || true && \
                         docker rm sample-app || true && \
                         docker run -d --name sample-app -p 80:3000 ${DOCKER_HUB_REPO}:latest'
                    """
                }
            }
        }
    }

    post {
        success { echo "Pipeline succeeded — build #${BUILD_NUMBER} deployed!" }
        failure { echo "Pipeline failed — check logs above." }
        always  { sh "docker logout" }
    }
}
