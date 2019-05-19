module.exports = {
  apps: [{
    name: 'aws-graphql',
    script: './app.js',
    node_args: '.env'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-3-14-224-126.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/aws-test.pem',
      ref: 'origin/master',
      repo: 'git@github.com:pixeltight/max-graphql.git',
      path: '/home/ubuntu/max-graphql',
      'post-deploy': 'pm2 startOrRestart ecosystem.config.js'
    }
  }
}
