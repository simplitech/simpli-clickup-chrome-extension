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
            const code = CryptoJS.AES.decrypt(encrypted, key);
            const decrypted = code.toString(CryptoJS.enc.Utf8);

            const el = document.createElement('textarea')
            el.value = decrypted
            el.setAttribute('readonly', '')
            el.style.position = 'absolute'
            el.style.left = '-9999px'
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)

            tinyToast.show('Decrypted and Copied 😘').hide(2000)
        }
    });
}, false);
