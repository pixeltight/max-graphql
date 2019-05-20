const express = require('express')
const test = 'test'
const app = express()
app.get('/', (req, res) => {
  res.send('HEY!')
})
app.listen(8000, () => console.log('Server running on port 8000 ', test))