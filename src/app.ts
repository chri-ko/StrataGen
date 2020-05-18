import { Card, CardType } from "./card";

let myCard: Card | null = null;

function updatePreview() {
    let canvas = document.getElementById('preview') as HTMLCanvasElement;
    if (canvas && myCard) {
        myCard.draw(canvas);      
    }
}

function onCardTypeChanged(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    if (selectElem && myCard) {
        myCard._heading = selectElem.selectedOptions[0].text;

        // TODO: update the text in the Header input to match.

        if (selectElem.selectedOptions[0].text == 'Stratagem') {
            myCard._type = CardType.Stratagem;
        }
        else if (selectElem.selectedOptions[0].text == 'Psychic Power') {
            myCard._type = CardType.PsychicPower;
        }
        else if (selectElem.selectedOptions[0].text == 'Tactical Objective') {
            myCard._type = CardType.TacticalObjective;
        }
    
        updatePreview();
    }
}

function onCardStyleChanged(event: Event) {
    const selectElem = event.target as HTMLSelectElement;
    if (selectElem && myCard) {
        // TODO: implement style
    }
}

function onHeaderChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && myCard) {
        myCard._heading = inputElem.value;
        updatePreview();
    }
}

function onTitleChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && myCard) {
        myCard._title = inputElem.value;
        updatePreview();
    }
}

function onRuleChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && myCard) {
        myCard._rule = inputElem.value;
        updatePreview();
    }
}

function onFluffChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && myCard) {
        myCard._fluff = inputElem.value;
        updatePreview();
    }
}

function onCPChanged(event: Event) {
    const inputElem = event.target as HTMLInputElement;
    if (inputElem && myCard) {
        myCard._value = inputElem.value;
        updatePreview();
    }
}

function mmToInches(mm: number): number {
    return mm / 25.4; 
}

function handleCreate() {
    if (myCard) {
        const cardSizeMm = [63, 88];
        const dpi = 300;
        let canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.style.width = 400 + 'px';
        canvas.style.height = 560 + 'px';        
        canvas.width = mmToInches(cardSizeMm[0]) * dpi;
        canvas.height = mmToInches(cardSizeMm[1]) * dpi;

        console.log("Saved cavas size: " + canvas.width + ", " + canvas.height);

        myCard.draw(canvas);

        let link = document.createElement('a');
        link.download = 'stratagem.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
}

function plumbCallbacks() {

    const cardTypeSelect = document.getElementById('cardtype');
    if (cardTypeSelect) cardTypeSelect.addEventListener('change', onCardTypeChanged);
    const cardStyleSelect = document.getElementById('cardstyle');
    if (cardStyleSelect) cardStyleSelect.addEventListener('change', onCardStyleChanged);

    const cardHeaderInput = document.getElementById('cardheader');
    if (cardHeaderInput) cardHeaderInput.addEventListener('input', onHeaderChanged);
    const cardTitleInput = document.getElementById('cardtitle');
    if (cardTitleInput) cardTitleInput.addEventListener('input', onTitleChanged);
    const cardRuleInput = document.getElementById('cardrule');
    if (cardRuleInput) cardRuleInput.addEventListener('input', onRuleChanged);
    const cardFluffInput = document.getElementById('cardfluff');
    if (cardFluffInput) cardFluffInput.addEventListener('input', onFluffChanged);

    const cardCPInput = document.getElementById('commandpoints');
    if (cardCPInput) cardCPInput.addEventListener('input', onCPChanged);

    const createCard = document.getElementById('createcard');
    if (createCard) createCard.addEventListener('click', handleCreate);
}

let canvas = document.getElementById('preview') as HTMLCanvasElement;
if (canvas) {
    let ctx = canvas.getContext('2d');
    if (ctx) {
        myCard = new Card();
    }
}

plumbCallbacks();

updatePreview();

