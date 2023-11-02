function $(query) {
    return document.querySelector(query)
}

const uploadBox = $('#uploadBox')
uploadBox.ondragover = () => false
uploadBox.ondrop = async (e) => {
    e.preventDefault()
    const { dataTransfer } = e
    if(!dataTransfer) return

    for(const file of dataTransfer.files) {
        await uploadFile(file)
    }
}

const uploadListBox = $('#uploadListBox')

const protocolSelect = $('#protocolSelect')

async function uploadFile(file) {
    const name = file.name
    const body = await file.arrayBuffer()

    const protocol = protocolSelect.value

    console.log('Uploading', {name, body, protocol})

    if(protocol === 'hyper'){
        const response = await fetch(`hyper://drag_and_drop/${name}`, {
            method: 'PUT',
            body
        })

        if(!response.ok) return addError(name, await response.text())

        await response.text()

        const url = await getPublicURL(name)

        addURL(url)
    } else {
        const response = await fetch(`ipfs://bafyaabakaieac/${name}`, {
            method: 'PUT',
            body
        })

        if(!response.ok) return addError(name, await response.text())

        const url = await response.text()

        const locationUrl = response.headers.get('Location');
        addURL(locationUrl);
    }
}

async function getPublicURL(name) {
    const request = await fetch('hyper://drag_and_drop/.well-known/dat')
    if(!request.ok) throw addError(name, await response.text())
    const record = await request.text()
    const base = record.split('\n')[0]
    const full = new URL(name, base)
    full.protocol = 'hyper:'
    return full.href
}

function addURL(url) {
    uploadListBox.innerHTML += `<li><a href="${url}">${url}</a></li>`
}

function addError(name, text) {
    uploadListBox.innerHTML += `<li class="log">Error in ${name}: ${text}</li>`
}