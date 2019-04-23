module.exports = {
  apps: [
    {
      name: 'Whack-A-Mole',
      script: './server/index.js',
      cwd: '/home/nextstepguru/www/whack-a-mole.nextstep.guru/',
      watch: false,
      instances: 1,
      listen_timeout: 5000,
      env: {
        PORT: 6000,
        NODE_ENV: 'production'
      }
    }
  ]
}
