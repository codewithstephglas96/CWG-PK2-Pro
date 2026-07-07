// ====================================================================================
// MERGED PICK 2 WIDGET
// 1) PREVIOUS 6 WEEKS ("What Are We Coming Under In Pick 2")
// 2) ALL 4 DRAWS (LIVE FEED) - 2x2 GRID
// ====================================================================================

let widget = new ListWidget()
widget.backgroundColor = new Color("#040505")
widget.setPadding(12, 12, 12, 12)

async function makeWatermark(text = "FSP SAGi") {
  let w = 800, h = 800 // safe resolution for widgets
  let dc = new DrawContext()
  dc.size = new Size(w, h)
  dc.opaque = false

  dc.setTextColor(new Color("#ffffff", 0.08)) // 8% opacity = watermark fade
  dc.setFont(Font.boldSystemFont(120))
  dc.setTextAlignedCenter()

  dc.drawTextInRect(
    text,
    new Rect(0, h/2 - 60, w, 200)
  )

  return dc.getImage()
}

widget.backgroundImage = await makeWatermark("FSP SAGi")

// ---------------------------------------
// TOP RIGHT DONATE TAG
// ---------------------------------------
let topBar = widget.addStack()
topBar.layoutHorizontally()

// Push everything to the right
topBar.addSpacer()

// Tag container
let tag = topBar.addStack()
tag.backgroundColor = new Color("#ff9d00")   // tag color
tag.cornerRadius = 8
tag.setPadding(3, 8, 3, 8)
tag.url = "https://tt.wipayfinancial.com/scan2pay/MichaelGlasgow"   // tap to donate

let label = tag.addText("Support 🇹🇹 TTD $10")
label.textColor = new Color("#000000")
label.font = Font.boldSystemFont(10)

// =========================================
// SECTION 1 — PICK 2 • PREVIOUS 6 WEEKS
// =========================================

const urlPrev = "https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar&game=PIKII&weeks=7"

// fetch safely
let jsonPrev

try {
  let req = new Request(urlPrev)
  req.timeoutInterval = 10
  jsonPrev = await req.loadJSON()
  Keychain.set("cache_p2_prev", JSON.stringify(jsonPrev))
} catch (e) {
  jsonPrev = JSON.parse(Keychain.get("cache_p2_prev") || "null")
}

// show warning ONLY if no live data AND no cache
if (!jsonPrev) {
  let t = widget.addText(
    "FSP SAGi System Currently Experiencing Server Connectivity Issues Please Wait......."
  )
  t.textColor = Color.orange()
  t.font = Font.mediumSystemFont(12)
}

// only proceed if valid
if (jsonPrev && jsonPrev.success && jsonPrev.data?.weeks) {

  // format helper
  function fmtPrev(draw) {
    if (!draw || draw === "-" || draw === "PENDING") return "–"
    let parts = String(draw).replace(/\s+/g,"").split(",")
    if (parts.length === 1) parts = String(draw).split("/")
    let a = (parts[0] || "").padStart(2,"0")
    let b = parts[1] ? "/" + parts[1].padStart(2,"0") : ""
    return a + b
  }

  // treat Sunday as Monday
  function mapSundayToMonday(dayName) {
    return dayName === "Sunday" ? "Monday" : dayName
  }

  const now = new Date()
  let todayName = now.toLocaleString("en-US", { 
    weekday:"long", 
    timeZone:"America/Barbados" 
  })

  // remap Sunday → Monday
  todayName = mapSundayToMonday(todayName)

  let daysToShow = []
  const pastWeeks = jsonPrev.data.weeks.slice(1)

  for (let week of pastWeeks) {
    const day = week.days.find(d => d.dayName === todayName && d.status === "completed")
    if (day) {
      const dateStr = week.startDate.replace(/ \d{4}/,"").trim()
      daysToShow.push({ date: dateStr.slice(0,6), draws: day.draws })
      if (daysToShow.length === 5) break
    }
  }

  // cell helper
  function addCellPrev(row, text, width, font, color="#ffffff", align="center"){
    let s=row.addStack(); s.size=new Size(width,22)
    let t=s.addText(String(text)); t.font=font; t.textColor=new Color(color)
    if(align==="left") t.leftAlignText()
    else t.centerAlignText()
  }

  // circle helper
  function circleImagePrev(text,bgHex,textHex){
    let size=36
    let dc=new DrawContext()
    dc.size=new Size(size,size)
    dc.opaque=false
    dc.respectScreenScale=true
    dc.setFillColor(new Color(bgHex))
    dc.fillEllipse(new Rect(0,0,size,size))
    dc.setTextColor(new Color(textHex))
    dc.setFont(Font.boldSystemFont(18))
    dc.setTextAlignedCenter()
    dc.drawTextInRect(text,new Rect(0,7,size,size))
    return dc.getImage()
  }

  // draw cell
  function addDrawCellPrev(row, draw, width){
    let s=row.addStack()
    s.size=new Size(width,22)
    s.centerAlignContent()

    let f = fmtPrev(draw)
    if(f==="–"){
      let t=s.addText("–")
      t.textColor=Color.white()
      t.font=Font.mediumSystemFont(10)
      return
    }

    let [n1,n2] = f.split("/")

    s.addImage(circleImagePrev(n1,"#054517","#ffff00"))
    s.addSpacer(4)
    s.addImage(circleImagePrev(n2,"#ffff00","#000000"))
  }

  // Title
  let titlePrev = widget.addText("What Are We Coming Under In Pick 2")
  titlePrev.font = Font.boldSystemFont(12)
  titlePrev.textColor = new Color("#58a6ff")
  titlePrev.centerAlignText()
  widget.addSpacer(3)

  // Header
  let headPrev = widget.addStack()
  headPrev.layoutHorizontally()
  addCellPrev(headPrev,"Date",60,Font.mediumSystemFont(9),"#58a6ff","left")
  addCellPrev(headPrev,"Morning",76,Font.mediumSystemFont(9),"#58a6ff")
  addCellPrev(headPrev,"Midday",76,Font.mediumSystemFont(9),"#58a6ff")
  addCellPrev(headPrev,"Afternoon",76,Font.mediumSystemFont(9),"#58a6ff")
  addCellPrev(headPrev,"Evening",76,Font.mediumSystemFont(9),"#58a6ff")
  widget.addSpacer(2)

  // rows
  for (let day of daysToShow){
    let row = widget.addStack()
    row.layoutHorizontally()

    addCellPrev(row,day.date,60,Font.mediumSystemFont(10),"#58a6ff","left")
    addDrawCellPrev(row,day.draws.MOR,76)
    addDrawCellPrev(row,day.draws.MID,76)
    addDrawCellPrev(row,day.draws.NON,76)
    addDrawCellPrev(row,day.draws.EVE,76)

    widget.addSpacer(2)
  }

  // footer
  widget.addSpacer(3)
  let footPrev = widget.addText(`${todayName} • Previous 6 Weeks • Live • FSP SAGi SYSTEMS`)
  footPrev.font = Font.mediumSystemFont(10)
  footPrev.textColor = new Color("#8b949e")
  footPrev.centerAlignText()
}

// ============================================================================
// SECTION 2 — PICK 2 • ALL FOUR DRAWS (LIVE FEED) - 2x2 GRID
// ============================================================================

widget.addSpacer(18)

const urlAll = "https://script.google.com/macros/s/AKfycbymSUZ3cuBP7wZSKkxs8QmjMkKP6q3j-LOW_CVpY3n6Sw1EzsdwPu6yTEkpOmiAJz95/exec"

let reqAll = new Request(urlAll)
reqAll.timeoutInterval = 10

let jsonAll
try {
  jsonAll = await reqAll.loadJSON()
  Keychain.set("cache_p2_all", JSON.stringify(jsonAll))
} catch {
  jsonAll = JSON.parse(Keychain.get("cache_p2_all") || "{}")
}

let drawsAll = jsonAll.games?.PICK2 || []
let updatedAll = jsonAll.lastUpdated || "N/A"

// header
let hAll = widget.addText(`PICK 2 DRAWS • LIVE • ⏰ ${updatedAll}`)
hAll.font = Font.mediumSystemFont(10)
hAll.textColor = new Color("#999999")
hAll.centerAlignText()
widget.addSpacer(7)

// Create 2×2 grid container
let grid = widget.addStack()
grid.layoutVertically()
grid.spacing = 6

// Top row: Morning + Midday
let topRow = grid.addStack()
topRow.layoutHorizontally()
topRow.centerAlignContent()

// Bottom row: Afternoon + Evening
let bottomRow = grid.addStack()
bottomRow.layoutHorizontally()
bottomRow.centerAlignContent()

// Function to build individual draw cards
function buildDrawCard(parentStack, draw) {
  // Main card
  let card = parentStack.addStack()
  card.layoutVertically()
  card.centerAlignContent()
  card.setPadding(10, 14, 10, 14)
  card.backgroundColor = new Color("#111111", 0.6)
  card.cornerRadius = 10
  card.size = new Size(160, 0)

  // Time + Name
  let timeName = card.addText(`${draw.time} ${draw.name}`)
  timeName.textColor = new Color("#ffa500")
  timeName.font = Font.boldSystemFont(11)
  timeName.centerAlignText()

  card.addSpacer(3)

  // Parse draw data
  let clean = draw.numbers.trim()
  let [pair, multiplier=""] = clean.split(" ")
  let [n1, n2] = pair.split("/")

  // Create horizontal stack for numbers
  let numbersRow = card.addStack()
  numbersRow.layoutHorizontally()
  numbersRow.spacing = 7
  numbersRow.centerAlignContent()

  // First number (green background, yellow text)
  let ball1 = numbersRow.addStack()
  ball1.backgroundColor = new Color("#054517")
  ball1.cornerRadius = 12
  ball1.size = new Size(24, 24)
  ball1.centerAlignContent()
  
  let num1Text = ball1.addText(n1)
  num1Text.font = Font.boldSystemFont(14)
  num1Text.textColor = new Color("#ffff00")

  // Second number (yellow background, black text)
  let ball2 = numbersRow.addStack()
  ball2.backgroundColor = new Color("#ffff00")
  ball2.cornerRadius = 12
  ball2.size = new Size(24, 24)
  ball2.centerAlignContent()
  
  let num2Text = ball2.addText(n2)
  num2Text.font = Font.boldSystemFont(14)
  num2Text.textColor = new Color("#000000")

  // Add multiplier if exists
  if (multiplier) {
    numbersRow.addSpacer(6)
    
    let multBall = numbersRow.addStack()
    multBall.backgroundColor = new Color(multiplier === "WB" ? "#ffffff" : "#ff0000")
    multBall.cornerRadius = 10
    multBall.size = new Size(22, 22)
    multBall.centerAlignContent()
    
    let multText = multBall.addText(multiplier)
    multText.font = Font.boldSystemFont(10)
    multText.textColor = new Color(multiplier === "WB" ? "#000000" : "#ffffff")
  }

  // Add spacing below numbers
  card.addSpacer(2)
}

// Map draws with fallbacks
let drawMap = {}
drawsAll.forEach(d => { 
  if (d && d.name) {
    drawMap[d.name] = d 
  }
})

// Get or create default draw objects
let morning   = drawMap["Morning"]   || {time:"10:30 AM", name:"Morning",   numbers:"-/-"}
let midday    = drawMap["Midday"]    || {time:"1:00 PM",  name:"Midday",    numbers:"-/-"}
let afternoon = drawMap["Afternoon"] || {time:"4:00 PM",  name:"Afternoon", numbers:"-/-"}
let evening   = drawMap["Evening"]   || {time:"7:00 PM",  name:"Evening",   numbers:"-/-"}

// Build the 2x2 grid
buildDrawCard(topRow, morning)
topRow.addSpacer(21)  // Space between cards
buildDrawCard(topRow, midday)

buildDrawCard(bottomRow, afternoon)
bottomRow.addSpacer(21)  // Space between cards
buildDrawCard(bottomRow, evening)

// footer
widget.addSpacer(4)
let footAll = widget.addText("FSP SAGi SYSTEMS")
footAll.font = Font.mediumSystemFont(9)
footAll.textColor = new Color("#555555")
footAll.centerAlignText()

// =========================================

// -----------------------------------------
// AUTO-REFRESH (Silent, iOS-approved)
// ----------------------------------------
widget.refreshAfterDate = new Date(Date.now() + 4 * 60 * 1000) // every 4 minutes

Script.setWidget(widget)
Script.complete()