In this post we will learn how to scrap a website using `cheerio`, and then create an api with the scraped data with `node.js`.

For this example we're going to build a video games backlog API, the website that we will be using for this example is https://www.pricecharting.com **this example is only for learning porpuses**


Whats [cheerio]() ?



## Creating our Project
1. open your terminal and type following
2. mkdir node-cheerio-tut
3. cd node-cheerio-tut
4. npm init --y
5. code .

## dependencies
- axios
- cheerio
- cors
- express
- mongoose
- nodemon

to install dependencies go to your project folder open a terminal and type the following:

```console
npm i axios cheerio express mongoose
```

and for dev dependencies type

```console
npm i -D nodemon
```

## Project file structure:

node-cheerio-tut/
├── node_modules/
├── public/
├── src/
│   ├── 
│   ├── 
│   ├── 
│   └── i
│   └── index.js
└── package.json

## Table of contents

1. Setup the project structure
2. scrape the data from the website
3. Conclusion

---

First go to your `package.json` and add this line

```json
  "scripts": {
    "start": "node ./src index.js",
    "dev": "nodemon ./src index.js"
  },
```

Let's code

lets go to **index.js** inside the **src** folder and set up or basic server with express

```js
const expres = require('express')

const app = express()

//server
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

now let's run this command `npm run dev` and we should get this message:

```console
listening on port 3000
```

Now in our **index.js** lets import **axios** and **cheerio**, then ill explain the code below

1. we're going to add a const url with the url value, in this case `https://www.pricecharting.com/search-products?q=`. (when you do a search in this web, you will be redirected to a new page, with a new route and a parameter with the value of the name you searched for.)

imagen 1

imagen 2

so  we are going to use that url, also the website has two types of search, one by price and another by market, if we dont specify the type in the url it will set market type by default. I leave it like this because in market returns the cover of the game and the system (we will use them later)

2. we will add this middlware `app.use(express.json())` because we dont want to get `undefined` when we do the post request.

3. we will create a route with the post method to send a body to our server, (i'm going to use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) vscode extension to test the api, but you can use postman or whatever you want) 

`test.http`
```json
POST http://localhost:3000
Content-Type: application/json

{
  "game": "final fantasy"
}
```

```console
final fantasy
```

As you can see we are getting the response, in this case i named the property game

```js
const axios = require("axios");
const cheerio = require("cheerio");
const express = require('express')

//initializations
const app = express()

const url = "https://www.pricecharting.com/search-products?q="

//middlwares
app.use(express.json())

app.post('/', async (req, res) => {
  // console.log(req.body.game)
  const game = req.body.game.trim().replace(/\s+/g, '+')
})

//server
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

4. Now we are going to create a constant named game that will store the value from `req.body.game` the we will use some methods to get the result like this `final+fantasy`, 

- first we're going to use `trim()` to remove the whitespace characters from the start and end of the string.

- then we will replace the whitespaces between the words with a `+` symbol with `replace(/\s+/g, '+')` .

## 3. using cheerio

Finally we're going to use **cheerio**, 

1. now that we have our game constant we're going to use **axios** to make a request to our url + the game title

2. we are going to use a `try catch block`, if we get a response then we will store it in a constant named `html` then we will use **cherrio** to load that data

3. we're going to create a constant named games that will store this value `$(".offer", html)`.

- if you opem your developer tools and go to the elements tab you will that **.offer** class belongs to a table like the image below

imagen 3

if you take a look to this image you will easily understand whats going on in the code

4. now we are going to loop trough that table to get each title, and we cand do that using `.find(".product_name")`, then `.find(".a")`, then we want the `text()` from the a tag

```js
.
.
.

app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const res = await axios.get(url + game)
      const html = res.data;
      const $ = cheerio.load(html)
      
      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        console.log(gameTitle)
      })

 
    } catch (error) {
      console.log(error)
    }
})

.
.
.
```

If you try this with console.log(title) you will get a message like this 

```console
Final Fantasy VII
Final Fantasy III
Final Fantasy
Final Fantasy VIII
Final Fantasy II
.
.
.
```

- Now let's add more fields, for this example i want an **id**, a **cover image** and a **system**

```js
.
.
.

app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const res = await axios.get(url + game)
      const html = res.data;
      const $ = cheerio.load(html)

      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        const id = $(el).attr('id').slice(8);

        //cover image
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const system = $(el)
        .find("br")
        .get(0)
        .nextSibling.nodeValue.replace(/\n/g, "")
        .trim();
      })

 
    } catch (error) {
      console.log(error)
    }
})

.
.
.
```

## another title

Let's store this data in an array, so in order to do this, lets create an array named videoGames

```js
.
.
.

const url = "https://www.pricecharting.com/search-products?q=";
let videoGames = []


app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const res = await axios.get(url + game)
      const html = res.data;
      const $ = cheerio.load(html)

      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        const id = $(el).attr('id').slice(8);

        //cover image
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const gameSystem = $(el)
        .find("br")
        .get(0)
        .nextSibling.nodeValue.replace(/\n/g, "")
        .trim();
      })

      videoGames.push({
        id,
        gameTitle,
        coverImage,
        gameSystem
      })

      console.log(videoGames)

    } catch (error) {
      console.log(error)
    }
    
})
.
.
.
```

