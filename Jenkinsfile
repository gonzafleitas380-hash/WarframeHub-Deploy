pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Verificar Docker') {
            steps {
                sh 'docker --version'
                sh 'docker compose version || docker-compose --version'
            }
        }

        stage('Preparar entorno') {
            steps {
                // El .env real nunca está en el repo. Para construir las imágenes
                // alcanza con un archivo vacío (compose exige que exista).
                sh 'touch backend/.env'
            }
        }

        stage('Build imágenes') {
            steps {
                sh 'docker compose -p warframehub build'
            }
        }

        stage('Listar imágenes') {
            steps {
                sh 'docker images | grep -i warframehub || true'
            }
        }
    }

    post {
        success { echo 'Build OK: imágenes de WarframeHub construidas.' }
        failure { echo 'Build FALLÓ: revisá el log de la etapa que falló.' }
    }
}
