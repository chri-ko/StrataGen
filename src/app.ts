/*
    Copyright 2020 Rick Weyrauch,
    Copyright 2021 Christian Koch

    Permission to use, copy, modify, and/or distribute this software for any purpose 
    with or without fee is hereby granted, provided that the above copyright notice
    and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH 
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND 
    FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, 
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS 
    OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER 
    TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE 
    OF THIS SOFTWARE.
*/

import { Card, CardType } from "./card";
import { serialize, deserialize } from "typescript-json-serializer";
import { parse } from 'papaparse';
import { jsPDF } from "jspdf";

let activeCards: Card[] = [];
let currentCard = 0;

function updatePreview() {
    let canvas = document.getElementById('preview') as HTMLCanvasElement;
    if (canvas && activeCards[currentCard]) {
        activeCards[currentCard].draw(canvas, 0);
    }
}

function onCardTypeChanged(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    if (selectElem && activeCards[currentCard]) {
        activeCards[currentCard]._heading = selectElem.selectedOptions[0].text;

        // Update the text in the Header input to match.
        $('#cardheader').val(activeCards[currentCard]._heading);

        if (selectElem.selectedOptions[0].text == 'Stratagem') {
            activeCards[currentCard]._type = CardType.Stratagem;
        }
        else if (selectElem.selectedOptions[0].text == 'Psychic Power') {
            activeCards[currentCard]._type = CardType.PsychicPower;
        }
        else if (selectElem.selectedOptions[0].text == 'Secondary Objective') {
            activeCards[currentCard]._type = CardType.SecondaryObjective;
        }
        else if (selectElem.selectedOptions[0].text == 'Prayer') {
            activeCards[currentCard]._type = CardType.Prayer;
        }

        updateCardUI();
        updatePreview();
    }
}

function onCardStyleChanged(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    if (selectElem && activeCards[currentCard]) {
        // TODO: implement style
    }
}

function onHeaderChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._heading = inputElem.value;
        updatePreview();
    }
}

function onTitleChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._title = inputElem.value;
        updatePreview();
    }
}

function onRuleChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._rule = inputElem.value;
        updatePreview();
    }
}

function onFluffChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._fluff = inputElem.value;
        updatePreview();
    }
}

function onValueChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._value = inputElem.value;
        updatePreview();
    }
}

function onSourceChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._source = inputElem.value;
        updatePreview();
    }
}

function onTimingChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && activeCards[currentCard]) {
        activeCards[currentCard]._timing = inputElem.value;
        updatePreview();
    }
}

function onPreviousCard() {
    currentCard = Math.max(currentCard - 1, 0);
    updateCardUI();
    updatePreview();
}

function onNextCard() {
    currentCard = Math.min(currentCard + 1, activeCards.length - 1);
    updateCardUI();
    updatePreview();
}

function mmToInches(mm: number): number {
    return mm / 25.4;
}

function handleCreate() {
    if (activeCards[currentCard]) {
        const cardSizeMm = [63, 88];

        let dpi = 300;
        let marginMm = 0;

        // Round margin up to that is always at least the requested size.
        let marginPx = Math.ceil(mmToInches(marginMm) * dpi);

        const doc = new jsPDF();
        let width = 63.5;
        let height = 88.9;
        let position = 0;

        for (let i = 0; i < activeCards.length; i++) {
            const card = activeCards[i];
            let canvas = document.createElement('canvas') as HTMLCanvasElement;
            canvas.width = Math.round(mmToInches(cardSizeMm[0]) * dpi) + 2 * marginPx;
            canvas.height = Math.round(mmToInches(cardSizeMm[1]) * dpi) + 2 * marginPx;
            card.draw(canvas, marginPx);
        
            if(i % 9 == 0 && Math.floor(i/9) > 0 ){
                doc.addPage();
                position = 0;
            }

            doc.addImage(canvas.toDataURL("image/png"), 'PNG', 3+ position % 3 * width, 3+ Math.floor(position/3) * height, width, height);
            position++;
        }


        let link = document.createElement('a');
        link.download = 'stratagem.pdf';
        link.href = doc.output('dataurlstring');
        link.click();

        console.log("Current card: " + currentCard + " Num active cards: " + activeCards.length);
        // Refresh the previewed card.
        updateCardUI();
        updatePreview();
    }
}

function getFileExtension(filename: string): string {
    const substrings = filename.split('.');
    if (substrings.length > 1) {
        return substrings[substrings.length - 1].toLowerCase();
    }
    return "";
}

function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files) {
        currentCard = 0;
        activeCards.length = 0;

        // files is a FileList of File objects. List some properties.
        for (let f of files) {
            const fileExt = getFileExtension(f.name);
            if (fileExt === "csv" || fileExt === 'tsv') {
                let config: any;
                parse(f, {complete: (result) => {
                    for (let data of result.data) {
                        let fields = data as Array<string>;
                        let cardType = CardType.Stratagem;
                        if (fields[0].toUpperCase() == "STRATAGEM") cardType = CardType.Stratagem;
                        else if (fields[0].toUpperCase() === "PSYCHIC POWER") cardType = CardType.PsychicPower;
                        else if (fields[0].toUpperCase() === "SECONDARY OBJECTIVE") cardType = CardType.SecondaryObjective;
                        else if (fields[0].toUpperCase() === "PRAYER") cardType = CardType.Prayer;
                        else {
                            continue;
                        }

                        let card = new Card();
                        if (fields.length < 6) {
                            //TODO: warning
                            continue;
                        }
                        card._type = cardType;
                        
                        card._title = fields[1];
                        card._heading = fields[2];
                        card._fluff = fields[3];
                        card._rule = fields[4];
                        card._source = fields[5];
                       
                        if (cardType == CardType.Stratagem || cardType == CardType.PsychicPower) {
                            //Intentional allows additional fields in the file 
                            if (fields.length < 7) {
                                //TODO: warning
                                continue;
                            }
                            card._value = fields[6];   
                        }else if (cardType == CardType.SecondaryObjective) {
                            //Intentional allows additional fields in the file 
                            if (fields.length < 7) {
                                //TODO: warning
                                continue;
                            } 
                            card._timing = fields[6]
                        }
                        
                        activeCards.push(card);
                        
                    }
                    currentCard = 0;
                    console.log("Num active cards: " + activeCards.length);
                    updateCardUI();
                    updatePreview();
                }});
            }
            else {
                $('#errorText').html('StrataGen only supports .csv files.  Selected file is a \'' + fileExt + "\' file.");
                $('#errorDialog').modal();
            }
        }
    }
}

function onSaveCard() {
    localStorage.setItem('lastCard', JSON.stringify(serialize(activeCards[currentCard])));
}

function onLoadCard() {
    let lastCardString = localStorage.getItem('lastCard');
    if (lastCardString) {
        activeCards[currentCard] = deserialize<Card>(JSON.parse(lastCardString), Card);
        updateCardUI();
        updatePreview();
    }
    else {
        console.log("Card not loaded.");
    }
}

function onBackgroundLoad(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files[0]) {
        //Jimp.read(files[0].name);
    }
}

function onBgOpacityChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem) {
        inputElem.value;
    }
}

function onBgSaturationChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem) {
        inputElem.value;
    }
}

function updateCardUI() {
    if (activeCards[currentCard]) {
        $('#cardtype').val(activeCards[currentCard]._type.toString());
        $('#cardheader').val(activeCards[currentCard]._heading);
        $('#cardtitle').val(activeCards[currentCard]._title);
        $('#cardrule').val(activeCards[currentCard]._rule);
        $('#cardfluff').val(activeCards[currentCard]._fluff);
        $('#cardsource').val(activeCards[currentCard]._source);

        if (activeCards[currentCard]._type === CardType.SecondaryObjective) {
            $('#cardtiming').val(activeCards[currentCard]._timing);
            $('#cardtimingcontrol').show();
        }else{
            $('#cardtimingcontrol').hide();
        }

        if (activeCards[currentCard]._type === CardType.Stratagem) {
            $('#cardvalue').attr({"min": 1, "max": 3});
            if (parseInt(activeCards[currentCard]._value) > 3) activeCards[currentCard]._value = "3";
            else if (parseInt(activeCards[currentCard]._value) < 1) activeCards[currentCard]._value = "1";

            $('#cardvaluelabel').html("Command Points");
            $('#cardvaluecontrol').show();
        }
        else if (activeCards[currentCard]._type === CardType.PsychicPower) {
            $('#cardvalue').attr({"min": 2, "max": 12});
            if (parseInt(activeCards[currentCard]._value) > 12) activeCards[currentCard]._value = "12";
            else if (parseInt(activeCards[currentCard]._value) < 2) activeCards[currentCard]._value = "2";

            $('#cardvaluelabel').html("Warp Charge");
            $('#cardvaluecontrol').show();
        }
        else if (activeCards[currentCard]._type === CardType.Prayer || activeCards[currentCard]._type === CardType.SecondaryObjective) {
            $('#cardvaluecontrol').hide();
        }

        $('#cardvalue').val(activeCards[currentCard]._value);
    }
}

function plumbCallbacks() {

    $('#previouscard').click(onPreviousCard);
    $('#nextcard').click(onNextCard);

    $('#cardtype').on('change', onCardTypeChanged);
    $('#cardstyle').on('change', onCardStyleChanged);
    $('#cardheader').on('input', onHeaderChanged);
    $('#cardtitle').on('input', onTitleChanged);
    $('#cardrule').on('input', onRuleChanged);
    $('#cardfluff').on('input', onFluffChanged);
    $('#cardvalue').on('input', onValueChanged);
    $('#cardsource').on('input', onSourceChanged);
    $('#cardtiming').on('input', onTimingChanged);
    $('#createcard').click(handleCreate);
    $('#datacardfile').on('change', handleFileSelect);

    $('#backgroundfile').on('change', onBackgroundLoad);
    $('#bgopacity').on('input', onBgOpacityChanged);
    $('#bgsaturation').on('input', onBgSaturationChanged);

    $('#savecard').click(onSaveCard);
    $('#loadcard').click(onLoadCard);
}

console.log("Reloading web page.");

let canvas = document.getElementById('preview') as HTMLCanvasElement;
if (canvas) {
    let ctx = canvas.getContext('2d');
    if (ctx) {
        if (activeCards.length == 0) {
            currentCard = 0;
            activeCards[currentCard] = new Card();
        }
    }
}

plumbCallbacks();

updatePreview();

