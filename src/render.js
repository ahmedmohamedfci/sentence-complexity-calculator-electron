// reference elements
const calculateButton = document.getElementById("calculateButton");
const inputTextArea = document.getElementById("inputTextArea");
const $ = require( "jquery" );
const resultP = document.getElementById("resultPar");
const axios = require('axios');
var querystring = require('querystring');
const { match } = require('assert');
let verbSet = new Set(['_VBZ','_VBG', '_VBD', '_VBN', '_VBP', '_MD', '_VB']);
// nouns set should add these criteria: '[^as]_IN' and (such_JJ as_IN)
let nounSet = new Set(['_NN', '_NNP', '_CC', '_PRP', '_DT', '_TO', '_JJ', '_EX', '_RB', '_UH', '_NNS', '_IN']);

let whSet = new Set(
    ["what", "whatever", "when", "where", "whereas", "whether", "which", "while", "who"]);
// now and now that?
let subSet = new Set(
    ["for", "as", "since", "therefore", "hence", "consequently", "though", "because", "unless", "once", "while", "when", "whenever", "where", "wherever", "before"]);
let multiWordSub = 
    ["and after", ,"due to", "provided that"];
multiWordSub.map(sub => subSet.add(sub.replace(/ /g,'Q')));
let ambigious = new Set(["that", "whom", "whichever", "whoever", "whomever", "whose", "why"]);
// set event handler
calculateButton.onclick = calculate;
$('#inputTextArea').focus();
async function calculate() {
    let texts = inputTextArea.value.split('\n');
    for (let i = 0; i < texts.length; i++) {
        //let textLower = texts[i].toLowerCase();
        let formatterText = texts[i];
        // tokenize words with spaces
        multiWordSub.map(word => {
            // convert multi word subs to _ like: as soon as => as_soon_as
            formatterText = texts[i].replace(new RegExp(word,'g'), word.replace(/Q/g,'q').replace(/ /g,'Q'));
        });

        getPartsOfSpeech(formatterText, (code, res, err) => {
            if (err) {
                alert(err);
                return;
            }
            callBack(code, res, texts[i]);
        });
    }

}

function callBack(code, res, original){
    let words = res.data.taggedText.split(' ');
    let devs = [];
    let sub = 0, wh = 0, noun = 0, verb = 0, ambig = 0;
    let newDiv = document.createElement('p');
    for (let j = 0; j < words.length; j++) {
        let wordSpan = document.createElement('span');
        devs.push(wordSpan);
        let trimmedWord = words[j].replace(/_[A-Z;'".,:]+/g,'').toLowerCase();
        let categorization = words[j].replace(/[A-Za-z]*_/g,'_');
        wordSpan.innerText = trimmedWord.replace(/Q/g,' ');
        if(subSet.has(trimmedWord)){
            wordSpan.classList.add('nsub');
            sub++;
        }
        else if(whSet.has(trimmedWord)){
            wordSpan.classList.add('wh');
            wh++;
        }
        else if(nounSet.has(categorization)){
            wordSpan.classList.add('noun');
            noun++;
        }
        else if(verbSet.has(categorization)){
            wordSpan.classList.add('verb');
            verb++;
        }
        else if(ambigious.has(trimmedWord)){
            wordSpan.classList.add('ambigious');
            ambig++;
        }
        else{
            wordSpan.classList.add('none');
        }
        newDiv.appendChild(wordSpan);
    }
    
    let calculatedP = document.createElement('p');
    let result = (2 * wh ) + ( 2 * sub) + (2 * ambig) + noun + verb;
    calculatedP.innerHTML = 
    `<span class="noun">Noun = ${noun}</span>
    <span class="verb">Verb = ${verb}</span>
    <span class="wh">WH = ${wh}</span>
    <span class="nsub">nSub = ${sub}</span>
    <span class = "ambigious">ambigious = ${ambig} </span>
    <span> result = ${result}</span>`;
    
    newDiv.appendChild(calculatedP);
    
    resultP.appendChild(newDiv);
    
}

function discardNonSubs(text) {
    // sometimes something like "that" comes as a noun and sometimes as a sub, this function detects if it came as a noun and removes it from the list of subs
    let nonSubs = text.toLowerCase().match(/(( that_dt [^\?])|( that_in [^\?]))/g);
    return nonSubs ? nonSubs.length : 0;
}


function getPartsOfSpeech(text, cb) {
    axios.post('https://parts-of-speech.info/tagger/tagger', querystring.stringify({
        text: text,
        language: 'en'
    }))
        .then((res) => {
            cb(res.statusCode, res, null);
        })
        .catch((error) => {
            cb(null, null, error);
        })
}


function countSubAndWh(text) {
    text = " " + text;
    let subList = ["after[.,; ]", " although[.,; ]", "[^such] as[.,; ]", " as if[.,; ]", " as long as[.,; ]", " as much as[.,; ]", " as soon as[.,; ]", " as though[.,; ]", " assuming that[.,; ]", " because[.,; ]", " before[.,; ]", " by the time [.,; ]", " consequently[.,; ]", " due to[.,; ]", " even if[.,; ]", " even though [.,; ]", " for[.,; ]", " hence[.,; ]", " how[.,; ?]", " if[.,; ]", " in case [.,; ]", " in order that[.,; ]", " in order to[.,; ]", " lest [.,; ]", " now[.,; ]", " now that[.,; ]", " once[.,; ]", " only if [.,; ]", " provided that[.,; ]", " rather than[.,; ]", " since[.,; ]", " so that[.,; ]", " than[.,; ]", " that[.,; ]", " therefore[.,; ]", " though[.,; ]", " till [.,; ]", " unless[.,; ]", " until[.,; ]", " what[,; ']", " whatever [.,; ']", " when[.,; \?']", " whenever[.,; ]", " where[.,; \?']", " whereas[.,; ]", " wherever[.,; ]", " whether[.,; ]", " which[.,; \?']", " whichever[.,; ]", " while[.,; ]", " whoever [.,; ]", " whom[.,; ]", " whomever[.,; ]", " whosever[.,; ]", " who[.,; \?']", "why[.,; \?']", "whose[.,; \?']"];
    let ret = 0;
    for (let i = 0; i < subList.length; i++) {
        var re = new RegExp(subList[i], 'g');
        let matcher = text.match(re);
        ret += matcher ? matcher.length : 0;
    }
    return ret;
}


function countUvf(text) {

    let matcher = text.match(/(_VBZ|_VBD|_VBN|_VBP|_MD|_VB)/g);
    return matcher ? matcher.length : 0;
}


function countUNp(text) {
    let matcher = text.match(/(_NN|_CC|_PRP|_DT|_TO|_JJ|_EX|_RB|_UH|[^as]_IN)/g);
    let size = matcher ? matcher.length : 0;
    let matcherSuchAs = text.match(/(such_JJ as_IN)/g);
    size += matcherSuchAs ? matcherSuchAs.length : 0;
    return size;
}