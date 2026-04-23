#CI/CD Pipeline — Containerized Node.js Application
A fully automated CI/CD pipeline that builds, tests, and deploys a containerized Node.js application to AWS EC2 or Kubernetes whenever code is pushed to the repository.

Overview
This project demonstrates a production-ready CI/CD pipeline using industry-standard DevOps tools. Every git push to the main branch automatically triggers the full pipeline — from code checkout through containerization to live deployment.


Project Structure:

├── app/
│   ├── app.js              # Main Express application
│   ├── package.json        # Node.js dependencies
│   └── .env.example        # Environment variable template
├── k8s/
│   └── deployment.yaml     # Kubernetes Deployment + Service
├── monitoring/
│   ├── docker-compose.monitoring.yml
│   └── prometheus.yml      # Prometheus scrape config
├── Dockerfile              # Container build instructions
├── Jenkinsfile             # Jenkins pipeline definition
└── README.md

Prerequisites
Before you begin, ensure you have the following installed and configured:
1.Git (v2.x+)
2.Docker (v20.x+)
3.Jenkins (v2.400+ with the following plugins)
    - Git Plugin
    - Docker Pipeline Plugin
    - SSH Agent Plugin
    - Credentials Binding Plugin
4.AWS CLI (configured with appropriate IAM permissions)
5.kubectl (if deploying to Kubernetes)
