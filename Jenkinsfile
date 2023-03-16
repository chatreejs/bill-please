pipeline {
  agent any

  environment {
    VERSION = "0.1.0-alpha.1"
    IMAGE_URL = "chatreejs/bill-please"
    BASE_HREF = "/billplease/"
  }

  stages {
    stage('Environment Setup') {
      steps {
        script {
          if (env.BRANCH_NAME == 'main') {
            env.IMAGE_URL_WITH_TAG = "${IMAGE_URL}:${VERSION}"
          } else {
            def now = new Date()
            BUILD_DATE = now.format("yyyyMMdd", TimeZone.getTimeZone('UTC'))
            env.IMAGE_URL_WITH_TAG = "${IMAGE_URL}:${VERSION}-${BUILD_DATE}"
          }
        }
      }
    }

    stage('Unit Test') {
      steps {
        sh 'echo "Test"'
      }
    }

    stage('Static Code Scan') {
      steps {
        docker.image('sonarsource/sonar-scanner-cli:latest').inside {
          withCredentials([
            string(credentialsId: 'sonarqube-host', variable: 'SONAR_HOST_URL'),
            string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')
          ]) {
            sh 'sonar-scanner -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_TOKEN'
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build --build-arg BASE_HREF=${BASE_HREF} -f Dockerfile . -t ${IMAGE_URL_WITH_TAG}'
      }
    }

    stage('Image Vulnerability Scan') {
      steps {
        sh 'trivy image --severity HIGH,CRITICAL --no-progress ${IMAGE_URL_WITH_TAG}'
      }
    }

    stage('Push to registry') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-credential', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          sh 'docker login -u $USERNAME -p $PASSWORD'
          sh 'docker push $IMAGE_URL_WITH_TAG'
        }
        sh 'docker container prune -a && docker image prune -a'
      }
    }
  }

  post {
    success {
      discordSend description: "Duration: ${currentBuild.durationString}", link: env.BUILD_URL, result: currentBuild.currentResult, title: "${JOB_NAME} - # ${BUILD_NUMBER}", footer: "${currentBuild.getBuildCauses()[0].shortDescription}",webhookURL: 'https://discord.com/api/webhooks/1038846192844541973/zWWNg0uc-FZYGf3ffwo9kc-gtYHRjjCiZIz6U_DNhxcOcShnx5AyyKtKfhH08uUj9f3r'
    }
    failure {
      discordSend description: "Duration: ${currentBuild.durationString}", link: env.BUILD_URL, result: currentBuild.currentResult, title: "${JOB_NAME} - # ${BUILD_NUMBER}", footer: "${currentBuild.getBuildCauses()[0].shortDescription}",webhookURL: 'https://discord.com/api/webhooks/1038846192844541973/zWWNg0uc-FZYGf3ffwo9kc-gtYHRjjCiZIz6U_DNhxcOcShnx5AyyKtKfhH08uUj9f3r'
    }
  }

}
