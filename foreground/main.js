document.body.addEventListener('mouseup', (e) => {
    const selection = window.getSelection().toString()
    if (!selection || !selection.length || !selection.includes('🔒')) {
        return
    }

    let targetText = ''
    if (selection.includes('🔓')) {
        targetText = selection
    } else {
        const elementContent = e.target.innerHTML

        if (!elementContent || !elementContent.length || !elementContent.includes('🔒') || !elementContent.includes('🔓')) {
            return
        }

        targetText = elementContent
    }

    const startIndex = targetText.indexOf('🔒') + 2 //to exclude the emoji
    const endIndex = targetText.indexOf('🔓')
    targetText = targetText.substring(startIndex, endIndex)
    const [role, encrypted] = targetText.split('🔑')

    chrome.runtime.sendMessage({
        message: "getKey",
        payload: role
    }, response => {
        if (response.message === 'success') {

            const key = response.payload
            const code = CryptoJS.AES.decrypt(encrypted, key)
            const decrypted = code.toString(CryptoJS.enc.Utf8)

            copyToClipboard(decrypted)
            showDialog(decrypted)
        }
    })
}, false)

const copyToClipboard = (content) => {
    const el = document.createElement('textarea')
    el.value = content
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
}

const showDialog = (content) => {
    // create the dialog
    var modal = document.createElement('div')
    modal.className = "simpli-s-modal"
    modal.innerHTML = "" +
      "<div class=\"simpli-s-modal-bg simpli-s-modal-exit\"></div>" +
      "<div class=\"simpli-s-modal-container\">" +
      "<h2>The content was decrypted and copied to your clipboard</h2>" +
      "<p class='simpli-s-modal-content'><a class='simpli-s-modal-show-decrypted'>SHOW THE DECRYPTED CONTENT</a></p>" +
      "<a class=\"simpli-s-modal-close simpli-s-modal-exit\">&times;</a>" +
      "</div>"

    // the dialog will auto-close unless the user clicks to read the content
    const autoCloseAfterOpen = setTimeout(() => {
        removeDialog(modal)
    }, 3*1000)

    // close behaviour
    modal.querySelectorAll('.simpli-s-modal-exit').forEach((exit) => {
        exit.addEventListener('click', (event) => {
            event.preventDefault()
            removeDialog(modal)
        })
    })

    // show decrypted content behaviour
    var show = modal.querySelector('.simpli-s-modal-show-decrypted')
    show.addEventListener('click', (event) => {
        event.preventDefault()
        var modalContent = modal.querySelector('.simpli-s-modal-content')
        modalContent.innerHTML = content

        clearTimeout(autoCloseAfterOpen)

        // the dialog will auto-close but waiting more
        setTimeout(() => {
            removeDialog(modal)
        }, 5 * 60 * 1000)
    })

    // show the dialog
    document.body.appendChild(modal)
}

const removeDialog = (modal) => {
    document.body.removeChild(modal)
}
