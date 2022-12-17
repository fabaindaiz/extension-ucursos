"use strict";

const paragraph_limit = 1;
const text = document.getElementsByClassName('texto');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function connect_button(button) {
    button.addEventListener('click', function () {
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

AbortSignal.timeout ??= function timeout(ms) {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.close(), ms)
    return ctrl.signal
  }


/**
* Function that call the hate-api
*/
async function api_query(settings, text) {

    let msg_text = text.getElementsByTagName("span")[0].innerHTML;

    fetch('https://ia-api.dev.fadiaz.cl/predict', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "text": msg_text })
        }, 60000)
        .then(response => response.json())
        .then(data => {

            const options = text.lastElementChild;
            text.removeChild(options); // Removed

            const long_text = text.innerHTML;
            const paragraphs = text.innerHTML.split("<br>");

            console.log({text: msg_text, response: data})


            if (settings["setting-censor-hate"]) {
                if (data['hatespeech']) {
                    text.innerHTML = '<div><span class="short-text">' + "Este mensaje puede ser ofensivo" +
                        '</span><span class="long-text" style="display: none">' + long_text +
                        '</span><br><button class="show-more-button" data-more="0">Mostrar</span></div>';
                }
            }
            else {
                if (data['incivility'] || data['hatespeech']) {
                    text.innerHTML = '<div><span class="short-text">' + "Este mensaje puede ser ofensivo" +
                        '</span><span class="long-text" style="display: none">' + long_text +
                        '</span><br><button class="show-more-button" data-more="0">Mostrar</span></div>';
                }
            }

            text.append(options);

            const buttons = text.querySelectorAll('.show-more-button');

            if (buttons.length > 0) {
                connect_button(buttons[0])
            }

        })
}


chrome.storage.local.get("settings", function (data) {
    const settings = data.settings ?? {};

    if (!settings["setting-censor-text"]) {
        return;
    }

    /**
    * Iterate over the divs with class "texto", first we remove the last children for formatting purposes
    * then we count the ammount of paragraphs, check if it's greater than the addmited threshold. If it's
    * over the threshhold we generate a cut version of the text and the original text, then we change the
    * innerHTML, displaying the short version and adding a button to toggle between the short text and the
    * complete text. Finally we readd the children we had removed.
    */
    for (let i = 0; i < text.length; i++) {

        /*const options = text[i].lastElementChild;
        text[i].removeChild(options); // Removed

        const long_text = text[i].innerHTML;
        const paragraphs = text[i].innerHTML.split("<br>");

        text[i].innerHTML = '<div><span class="short-text">' + "" + '</span><span class="long-text" style="display: none">' + long_text + '</span><br><button class="show-more-button" data-more="0">Mostrar hate speech</span></div>';
        
        text[i].append(options); // Added
        */

        api_query(settings, text[i])
        
        /*
        const text_length = countLines(text[i]);
        if (text_length > paragraph_limit) {
            const paragraphs = text[i].innerHTML.split("<br>");
            let short_text = paragraphs[0];
            for (let j = 1; j <= paragraph_limit; j++) {
                if (paragraphs[j] === "") {
                    short_text = short_text + "<br>";
                } else {
                    short_text = short_text + "<br>" + paragraphs[j];
                }
            }
            const long_text = text[i].innerHTML;
            text[i].innerHTML = '<div><span class="short-text">' + short_text + '</span><span class="long-text" style="display: none">' + long_text + '</span><br><button class="show-more-button" data-more="0">Ver más</span></div>';
        }
        text[i].append(options); // Added
        */
    }

});