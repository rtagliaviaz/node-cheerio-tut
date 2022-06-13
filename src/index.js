const express = require('express')

//routes
const main = require('./routes/index')

const app = express()

//middlwares
app.use(express.json())

//routes
app.use(main)


app.listen(3000, () => {
  console.log('Server running on port 3000')
})

