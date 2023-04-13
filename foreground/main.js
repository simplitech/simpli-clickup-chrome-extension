(() => {
    const waitForElm = (selector) => {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

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

    const extractContentToCopy = () => {
        const [taskContainer] = document.body.getElementsByClassName("task-container")
        if (taskContainer) {
            const id = taskContainer.getAttribute("data-task-id")
            const title = taskContainer.querySelector("textarea.task-name").value
            return `CU-${id} - ${title}`
        }
        const rowsSelected = document.body.getElementsByClassName("cu-task-row_selected")
        if (rowsSelected.length) {
            const tasks = []
            for (let row of rowsSelected) {
                const id = row.getAttribute("data-id")
                const title = row.querySelector("span.cu-task-row-main__link-text-inner").innerHTML
                tasks.push(`CU-${id} - ${title}`)
            }
            return tasks.join("\n")
        }
        throw new Error("Could not extract content to copy 😢")
    }

    // create the tools
    const toolsDiv = document.createElement('div')
    toolsDiv.className = "simpli-cu-tools"
    toolsDiv.innerHTML = "<a class='simpli-cu-modal-copy'>" +
        "<svg class=\"ng-star-inserted\"><use xlink:href=\"https://app.clickup.com/map.fb7df99db3341b9c7d6c0c5c406c6ffe.svg#svg-sprite-copy-clipboard\"></use></svg>" +
        "</a>"

    const copyBtn = toolsDiv.querySelector('.simpli-cu-modal-copy')
    copyBtn.addEventListener('click', (event) => {
        event.preventDefault()
        try {
            const contentToCopy = extractContentToCopy()
            copyToClipboard(contentToCopy)
            tinyToast.show('Copied to clipboard 😘').hide(2000)
        } catch (e) {
            tinyToast.show(e.message).hide(2000)
            document.body.getElementsByClassName('tinyToast')[0].style.cssText = 'background: #f88 !important; border-color: #800 !important;'
        }
    })

    // show the tools
    waitForElm(".cu-float-button__toggle-simple").then((elm) => {
        const [prevTools] = document.body.getElementsByClassName("simpli-cu-tools")
        if (prevTools) {
            prevTools.remove()
        }

        elm.prepend(toolsDiv);
    });
})()
