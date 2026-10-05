pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    // Se dispara cuando GitHub avisa por webhook (push a la rama configurada en el job)
    triggers {
        githubPush()
    }

    stages {
        // 1. Checkout: Jenkins clona el repo automaticamente ("Declarative: Checkout SCM")
        stage('Checkout') {
            steps {
                sh 'git log -1 --pretty=format:"%h %s (%an)"'
                sh 'docker --version && docker compose version'
            }
        }

        // 2. Install: las dependencias (npm install) se instalan dentro de las imagenes,
        //    en la etapa "builder" de cada Dockerfile. Se construye solo esa etapa.
        stage('Install') {
            steps {
                sh 'touch backend/.env'   // compose exige que exista; el real nunca esta en el repo
                sh 'docker build --target builder -t warframehub-backend:builder -f backend/Dockerfile.backend backend'
                sh 'docker build --target builder -t warframehub-frontend:builder -f frontend/Dockerfile.frontend frontend'
            }
        }

        // 3. Build: construye las imagenes finales (minificadas / bytecode, sin codigo fuente)
        stage('Build') {
            steps {
                sh 'docker compose -p warframehub build'
            }
        }

        // 4. Test: corre "npm test" dentro de cada imagen builder.
        //    --if-present: si el proyecto no define script "test", la etapa no falla.
        stage('Test') {
            steps {
                sh 'docker run --rm warframehub-backend:builder npm test --if-present'
                sh 'docker run --rm warframehub-frontend:builder npm test --if-present'
            }
        }

        // 5. Package: exporta las imagenes a .tar.gz y las deja como artefacto del build
        stage('Package') {
            steps {
                sh 'docker save warframehub-backend:latest | gzip > warframehub-backend.tar.gz'
                sh 'docker save warframehub-frontend:latest | gzip > warframehub-frontend.tar.gz'
                archiveArtifacts artifacts: '*.tar.gz', fingerprint: true
            }
        }
    }

    post {
        success { echo 'Pipeline OK: artefactos listos para el ambiente de testing.' }
        failure { echo 'Pipeline FALLO: revisar la etapa marcada en rojo.' }
        always  { sh 'rm -f *.tar.gz || true' }
    }
}