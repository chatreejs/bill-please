pipeline {
  agent any

  environment {
    IMAGE_URL = "chatreejs/bill-please"
    BASE_HREF = "/billplease/"
  }

  stages {
    stage('Prepare Env') {
      steps {
        if (env.BRANCH_NAME == 'main') {
          env.BUILD_VERSION = "latest"
        } else {
        env.BUILD_VERSION = "build-" + new Date().format('yyyMMdd', TimeZone.getTimeZone('UTC')) + "-" + env.BUILD_NUMBER
        }
      }
    }

    stage('Static Code Scan') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      agent {
        docker {
          image 'sonarsource/sonar-scanner-cli:latest'
          args '-v $PWD:/workspace -w /workspace'
        }
      }
      steps {
        withSonarQubeEnv('SonarQube Server') {
          sh 'sonar-scanner'
        }
      }
    }

    stage('Build Docker Image') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      steps {
        sh 'docker build --build-arg BASE_HREF=${BASE_HREF} -f Dockerfile . -t ${IMAGE_URL}:${BUILD_VERSION}'
      }
    }

    stage('Image Vulnerability Scan') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      agent {
        docker {
          image 'aquasec/trivy:latest'
          args '-v /var/run/docker.sock:/var/run/docker.sock -v trivy_cache:/.cache --entrypoint="" -u root --privileged'
        }
      }
      steps {
        sh 'trivy image --format template --template \"@/contrib/html.tpl\" --output report.html --severity HIGH,CRITICAL --no-progress ${IMAGE_URL}:${BUILD_VERSION}'

        publishHTML target : [
          allowMissing: true,
          alwaysLinkToLastBuild: false,
          keepAll: true,
          reportDir: '.',
          reportFiles: 'report.html',
          reportName: 'Trivy Scan Report',
        ]
      }
    }

    stage('Push to registry') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-credential', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          sh 'docker login -u $USERNAME -p $PASSWORD'
          sh 'docker push $IMAGE_URL_WITH_TAG'
        }
        sh 'docker container prune -f && docker image prune -a'
      }
    }

    stage('Clear Image') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      steps {
        sh 'docker rmi $IMAGE_URL_WITH_TAG'
      }
    }

    stage('Deploy to Kubernetes') {
      when {
        expression { env.BRANCH_NAME in ['develop'] }
      }
      steps {
        build job: 'chatreejs/GitOps/bill-please-manifest-dev', parameters: [string(name: 'IMAGE_TAG', value: "${IMAGE_URL}:${BUILD_VERSION}")]
      }
    }

  }

  post {
    success {
      discordSend description: "Duration: ${currentBuild.durationString}", link: env.BUILD_URL, result: currentBuild.currentResult, title: "${JOB_NAME} - # ${BUILD_VERSION}", footer: "${currentBuild.getBuildCauses()[0].shortDescription}",webhookURL: "https://discord.com/api/webhooks/${DISCORD_WEBHOOK_ID}/${DISCORD_WEBHOOK_TOKEN}"
    }
    failure {
      discordSend description: "Duration: ${currentBuild.durationString}", link: env.BUILD_URL, result: currentBuild.currentResult, title: "${JOB_NAME} - # ${BUILD_VERSION}", footer: "${currentBuild.getBuildCauses()[0].shortDescription}",webhookURL: "https://discord.com/api/webhooks/${DISCORD_WEBHOOK_ID}/${DISCORD_WEBHOOK_TOKEN}"
    }
  }

}
