pipeline {
    agent {
        docker { image 'node:22' }
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install backend dependencies') {
            steps {
                dir('backend') {
                    sh 'rm -f package-lock.json'
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }
        stage('Install frontend dependencies') {
            steps {
                dir('frontend') {
                    sh 'rm -f package-lock.json'
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }
        stage('Test backend') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        stage('Test frontend') {
            steps {
                dir('frontend') {
                    sh 'npm test'
                }
            }
        }
        stage('Build frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
        stage('Package') {
            steps {
                dir('frontend') {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true
                }
            }
        }
    }
    post {
        success {
            echo 'Build y tests OK. Artefacto listo para testear.'
        }
        failure {
            echo 'El pipeline falló. Revisar el log de la etapa correspondiente.'
        }
        always {
            cleanWs()
        }
    }
}
