let keys = {}
let selectedKeyName = null
let toBeEncrypted = null
let result = null

const newKeySentinel = '__newKey__'

const init = () => {
  registerInteractions()
  reloadKeys()
}

const reloadKeys = () => {
  chrome.runtime.sendMessage({
    message: "getAllKeys"
  }, response => {
    if (response.message === 'success') {
      // if there are keys
      if (response.payload && Object.keys(response.payload).length) {
        keys = response.payload
        if (selectedKeyName === null) {
          selectedKeyName = Object.keys(keys)[0]
        }
      }
      renderSelectOrNewKeyForm()
      encrypt()
    }
  });
}

const encrypt = () => {
  if (toBeEncrypted && toBeEncrypted.length && selectedKeyName && selectedKeyName.length) {
    const key = keys[selectedKeyName]
    const decrypted = CryptoJS.AES.encrypt(toBeEncrypted, key).toString()
    result = `🔒${selectedKeyName}🔑${decrypted}🔓`;
    renderResult()
  }
}

const saveNewKey = (keyName, key) => {
  chrome.runtime.sendMessage({
    message: "setKeys",
    payload: {[keyName]: key}
  }, response => {
    if (response && response.message === 'success') {
      reloadKeys()
    }
  });
}

const copyResultToClipboard = (value) => {
  const el = document.querySelector('#result')
  el.select()
  document.execCommand('copy')

  tinyToast.show('Encryption Copied 😘').hide(2000)
}

// fill the select with the last options being "New Key", select the choosen option or show "New Key" for if there is no key
const renderSelectOrNewKeyForm = () => {
  const selectKeyHolderEl = document.querySelector('#selectKeyHolder')
  const selectKeyEl = document.querySelector('#selectKey')
  const newKeyFormEl = document.querySelector('#newKeyForm')
  const keyNames = Object.keys(keys)

  if (!keyNames.length || selectedKeyName === newKeySentinel) {
    selectKeyHolderEl.style.display = 'none'
    newKeyFormEl.style.display = 'flex'
  } else {
    selectKeyHolderEl.style.display = 'flex'
    newKeyFormEl.style.display = 'none'

    selectKeyEl.innerHTML = ''

    for (let name of keyNames)
    {
      const opt = document.createElement("option");
      opt.value = name;
      opt.innerHTML = name;
      selectKeyEl.appendChild(opt);
    }

    const opt = document.createElement("option");
    opt.value = newKeySentinel;
    opt.innerHTML = "Add New Key +";
    selectKeyEl.appendChild(opt);

    if (selectedKeyName && selectedKeyName.length) {
      selectKeyEl.value = selectedKeyName
    }
  }
}

const renderResult = () => {
  document.querySelector('#result').innerHTML = result
}

const registerInteractions = () => {
  // register input change event
  document.querySelector("#toBeEncrypted").addEventListener("keyup", e => {
    toBeEncrypted = e.target.value
    encrypt()
  })

  // register select change event
  document.querySelector("#selectKey").addEventListener("change", e => {
    selectedKeyName = e.target.value
    // if selected "New Key"
    if (selectedKeyName === newKeySentinel) {
      // show the "New Key" form
      renderSelectOrNewKeyForm()
      // else if there is a text
    } else {
      // encrypt and render it
      encrypt()
    }
  })

  // register button click
  document.querySelector("#newKeyForm").addEventListener("submit", e => {
    e.preventDefault()

    const newKeyNameEl = document.querySelector("#newKeyName")
    const newKeyInputEl = document.querySelector("#newKeyInput")

    if (newKeyNameEl.value.length && newKeyInputEl.value.length) {
      selectedKeyName = newKeyNameEl.value
      saveNewKey(newKeyNameEl.value, newKeyInputEl.value)
      newKeyNameEl.value = ''
      newKeyInputEl.value = ''
    }
  })

  document.querySelector("#result").addEventListener("focus", e => {
    copyResultToClipboard()
  })
}

init();
