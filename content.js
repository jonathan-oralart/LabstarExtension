function replaceWithLink1() {
    const matches = document.querySelectorAll(".App-header-row .col-1 span strong")
    if (matches.length === 0) {
        return
    }

    const match = [...matches].filter(x => {
        // length 8 and is all numbers using a regex
        return x.innerText.length === 8 && /^\d+$/.test(x.innerText)
    })?.[0]
    if (match === undefined) {
        return
    }

    if (match.children.length == 2) {
        return
    }
    const e = document.createElement("a")
    e.target = "_blank"
    e.href = `https://scan-park.netlify.app/?search=${match.innerText}`
    e.innerText = "📍 "
    match.prepend(e)
}

function replaceWithLink2() {
    const listPatientNames = [...document.querySelectorAll("#tabpanel tbody tr td:nth-child(4) p")]
    listPatientNames.forEach(x => {
        if (x.children.length !== 0) return
        const text = x.parentElement.previousElementSibling.children[0].innerText
        const e = document.createElement("a")
        e.target = "_blank"
        e.href = `https://scan-park.netlify.app/?search=${text}`
        e.innerText = "📍 "
        x.prepend(e)
    })
}


setInterval(replaceWithLink1, 1000)
setInterval(replaceWithLink2, 250)

