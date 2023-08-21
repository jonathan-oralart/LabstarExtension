function replaceWithLink1() {
    const matches = document.querySelectorAll(".App-header-row .col-1 span strong")
    if (matches.length === 0) {
        console.log("can't find matches")
        return
    }

    const match = [...matches].filter(x=>x.innerText.startsWith("2300"))?.[0]
    if (match === undefined) {
        console.log("match undefined")
        return
    }
    const e = document.createElement("a")
    e.target = "_blank"
    e.href = `https://scan-park.netlify.app/?search=${match.innerText}`
    e.innerText = match.innerText
    match.childNodes.forEach(x => x.remove())
    match.appendChild(e)
}

function replaceWithLink2() {
    const listPatientNames = [...document.querySelectorAll("#tabpanel tbody tr td:nth-child(4) p")]
    listPatientNames.forEach(x => {
    if (x.children.length !== 0) return
    const text = x.parentElement.previousElementSibling.children[0].innerText
    const e = document.createElement("a")
    e.target = "_blank"
    e.href = `https://scan-park.netlify.app/?search=${text}`
    e.innerText = "SP - "
    x.prepend(e)
})
}


console.log("here")

setInterval(replaceWithLink1, 1000)
setInterval(replaceWithLink2, 250)

