"use strict";

const text = document.getElementsByClassName('texto');


function connect_button(text) {
    const buttons = text.querySelectorAll('.show-more-button');

    if (buttons.length > 0) {
        buttons[0].addEventListener('click', function () {
            // If text is shown less, then show complete
            if (this.getAttribute('data-more') === "0") {
                this.setAttribute('data-more', 1);
                this.style.display = 'block';
                this.innerHTML = 'Ocultar';
    
                this.previousElementSibling.previousElementSibling.previousElementSibling.style.display = 'none';
                this.previousElementSibling.previousElementSibling.style.display = 'inline';
            }
            // If text is shown complete, then show less
            else if (this.getAttribute('data-more') === "1") {
                this.setAttribute('data-more', 0);
                this.style.display = 'inline';
                this.innerHTML = 'Mostrar';
    
                this.previousElementSibling.previousElementSibling.previousElementSibling.style.display = 'inline';
                this.previousElementSibling.previousElementSibling.style.display = 'none';
            }
        });
    }
    
}


function get_message(text) {
    return `<div>
        <span class="short-text">Este mensaje puede ser ofensivo</span>
        <span class="long-text" style="display: none">` + text + `</span>
        <br><button class="show-more-button" data-more="0">Mostrar</span><br></div>`;
}

function censor_text(settings, data, text) {

    const options = text.lastElementChild;
    text.removeChild(options); // Removed

    if (data['hatespeech']) {
        text.innerHTML = get_message(text.innerHTML)
    }

    else if (!settings["setting-censor-hate"] && data['incivility']) {
        text.innerHTML = get_message(text.innerHTML)
    }

    text.append(options);
}


/**
* Function that call the hate-api
*/
async function api_query(settings, text) {

    const msg_text = text.getElementsByTagName("span")[0].innerHTML;

    fetch('https://hateapi.fadiaz.cl:8634/predict', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "text": msg_text })
        }, 60000)
        .then(response => response.json())
        .then(data => {

            censor_text(settings, data, text);

            connect_button(text)

            if (settings["setting-show-logs"]) {
                console.log({text: msg_text, response: data})
            }
        })
}


chrome.storage.local.get("settings", function (data) {
    const settings = data.settings ?? {};

    if (!settings["setting-censor-text"]) {
        return;
    }
    
    for (let i = 0; i < text.length; i++) {
        api_query(settings, text[i])
    }

});