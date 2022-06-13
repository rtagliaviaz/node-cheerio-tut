const {Router} = require('express')
const cheerio = require("cheerio");
const axios = require("axios");
const router = Router()

router.get('/', (req, res) => {
  res.send('Hello World!')
})

const url = "https://www.pricecharting.com/search-products?q="
let videoGames = []

const system = [
  "Nintendo DS",
  "Nintendo 64",
  "Nintendo NES",
  "Nintendo Switch",
  "Super Nintendo",
  "Gamecube",
  "Wii",
  "Wii U",
  "Switch",
  "GameBoy",
  "GameBoy Color",
  "GameBoy Advance",
  "Nintendo 3DS",
  "Playstation",
  "Playstation 2",
  "Playstation 3",
  "Playstation 4",
  "Playstation 5",
  "PSP",
  "Playstation Vita",
  "PC Games",
]


router.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const response = await axios.get(url + game)
      const html = response.data;
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
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const gameSystem = $(el)
          .find("br")
          .get(0)
          .nextSibling.nodeValue.replace(/\n/g, "")
          .trim();
        
        if (!system.includes(gameSystem)) return;
        videoGames.push({
          id,
          gameTitle,
          coverImage,
          gameSystem,
          backlog: false
        });
        
      })

   
      res.json(videoGames)
 
    } catch (error) {
      console.log(error)
    }

    
})

module.exports = router