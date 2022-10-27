'use strict'

//======================================
// GLOBAL VARIABLES
//======================================

const El = {
    RawStats: document.getElementById('raw-stats'),
    DataInput: document.getElementById('input'),
    MetaStats1: document.getElementById('metastats1'),
    MetaStats2: document.getElementById('metastats2'),
    MetaStats3: document.getElementById('metastats3'),
    MetaStats4: document.getElementById('metastats4'),
    Table: document.getElementById('table0'),
    Wrapper: document.getElementById('wrapper'),
    Initialize: document.getElementById('initialize'),
    UpdateTables: document.getElementById('update-tables'),
}
let RawStats;           // cut & paste from Today's Hints
let Header = ['', '', '', ''];
let Spacer = ['', '', '', '',];
let LineBreak = ['-', '-', '-', '-'];

let Char1Obj = {
    char1: '',
    rowStart: 0,        // letter subtotals
    rowEnd: 0,          // last data row, not col totals
    count: [],
    total: 0,
    colSum() {
        for (let j = ColStart - 2; j <= ColEnd; j++) {
            let sum = 0;
            for (let i = this.rowStart + 1; i <= this.rowEnd; i++) {
                sum += Table[i][j];
            }
            Table[this.rowEnd + 1][j] = sum;
        }
        return;
        },
    rowSum() {
        for (let i = this.rowStart + 1; i <= this.rowEnd + 1; i++) {
            let sum = 0;
            for (let j = ColStart; j <= ColEnd; j++) {
                sum += Table[i][j];
            }
            Table[i][2] = sum;
        }
        return;   
    },    
};
let Char2Obj = {
    char2: '',
    count: 0,
    row: 0,
};
let Char1List = [];         // holds index pointers into Table
let Char2List = [];
let Cell = [];              // holds element references for Table
let Table = [];             // holds display data
let TableInitialized = false;
let TableCopy = 0;
const ColStart = 4;         // table dimensions
let ColEnd = 0;
let TableTotalRows = 0;
 
let WordsTotal = 0;         // metastats
let WordsFound = 0;
let Pangrams = 0;
let PangramsFound = 0;
let LetterList = "";

let DataInput = '';         // list of found words
let ProcessedWords = [];    // list of already tabulated words
let BadWords = [];          // invalid words in input list

//======================================
// MAIN PROGRAM
//======================================

El.Initialize.addEventListener('click', InitializeData);
El.UpdateTables.addEventListener('click', UpdateTables);

//======================================
// MAIN FUNCTIONS
//======================================

// -------------------------------------
function InitializeData() {
// -------------------------------------

    // Validity checks
    if (TableInitialized) {     // if DATA GRID has changed, reset stats and start over
        if (RawStats != El.RawStats.value) DeleteHTMLTable()
        else return;
    }
    RawStats = El.RawStats.value;
    if (RawStats === '') {
        alert("Cut and paste TODAY'S HINTS from the words SPELLING BEE GRID to FURTHER READING into the SPELLING BEE DATA box.");
        return;
    }

    // Index points in RawStats
    let indexbold = RawStats.indexOf("bold.");
    let indexWOR = RawStats.indexOf("WORDS", indexbold);
    let indexPAN = RawStats.indexOf("PANGRAMS", indexWOR);
    let index4 = RawStats.indexOf('4', (indexPAN + 13));
    let indexS1 = RawStats.indexOf('Σ', index4);
    let indexS2 = RawStats.indexOf('Σ', indexS1 + 1);
    let indexlist = RawStats.indexOf("list:", indexS2);
    let indexFur = RawStats.indexOf("Further", indexlist);
        if (indexFur < 0) {indexFur = RawStats.length};
    if ((indexbold <0) || (indexWOR < 0) || (indexPAN < 0) || (index4 < 0) ||         // validity check
        (indexS1 < 0) || (indexS2 < 0) || (indexlist < 0) || (indexFur < 0)) {
        alert('Cut and paste the Spelling Bee grid into the SPELLING BEE DATA box. There has been an error in the text.');
        return;
    }

    // MetaStats
    let temp = RawStats.slice(indexbold + 5, indexWOR).match(/[\w]/g);

//HELP: IS THERE A MORE EFFICIENT WAY TO CREATE THIS STRING?  LINE ABOVE RETURNS AN ARRAY.

    temp.forEach(item => LetterList += item);
    WordsTotal = Number(RawStats.slice(indexWOR + 6, indexWOR + 10).match(/[\d]+/g));   // total words
    Pangrams = Number(RawStats.slice(indexPAN + 9, indexPAN + 12).match(/[\d]/));       // total pangrams
    UpdateMetaStats();

    // Linebreak, Spacer, Header row templates
    let colLabel = RawStats.slice(index4, indexS1).split(/[^0-9]+/).filter(x => x);
    for (let i = 0; i < colLabel.length; i++) {
        Header[colLabel[i]] = Number(colLabel[i]);
    }
    ColEnd = Number(Header[Header.length-1]);
    for (let i = ColStart; i <= ColEnd; i++) {
        LineBreak[i] = '-';
        Spacer[i] = '';
        if (Header[i] === undefined) Header[i] = '';
    }

    // Table
    temp = RawStats.slice(indexS1 + 2, indexS2);
    let char1Raw = temp.replace(/-/g, "0").split(/[^A-Z0-9]+/).filter(x => x);
    let char2Raw = RawStats.slice(indexlist + 6, indexFur).split(/[^A-Z0-9]+/).filter(x => x);
    TableTotalRows = (temp.match(/:/g).length * 5) + (char2Raw.length / 2);
    let row = 0;
    let indexRaw1 = 0;
    let indexRaw2 = 0;
    let indexList1 = 0;
    let indexList2 = 0;
    while (row < TableTotalRows) {
        Table.push(LineBreak);                        // Header lines
        Table.push(Spacer);
        Table.push(Header);
        row += 3;
        Char1List[indexList1] = Object.assign({}, Char1Obj); // Char1 line
        Char1List[indexList1].char1 = char1Raw[indexRaw1];
        Char1List[indexList1].rowStart = row;
        temp = [];
        temp = ['Letter','Σ', '#', 'Σ>'];
        let j =0;
        indexRaw1++;
        for (let i = ColStart; i < ColStart + colLabel.length; i++) {
            let subTotal = Number(char1Raw[indexRaw1]);
            temp[colLabel[j]] = subTotal;
            Char1List[indexList1].count[j] = subTotal;
            // if (subTotal == 0) Table[row - 1][colLabel[j]] = '';
// HELP: THIS IS SUPPOSED TO REMOVE UNNECESSARY LENGTH LABELS, WHICH APPEARS
// TO WORK WHEN I STEP THROUGH THE BUILDING OF THE TABLE, BUT ERASES THE ENTIRE
// LINE WHEN THE TABLE IS RENDERED.
            j++; indexRaw1++;
        }
        for (let i = ColStart; i <= ColEnd; i++) {
            if (temp[i] === undefined) temp[i] = 0;
        }    
        Char1List[indexList1].total = Number(char1Raw[indexRaw1]);
        Table.push(temp);

        indexRaw1++;                                // Char2 lines
        let char = char2Raw[indexRaw2][0];
        while ((indexRaw2 < char2Raw.length) && (char === char2Raw[indexRaw2][0])) {
            row++;
            Char2List[indexList2] = Object.assign({}, Char2Obj);
            Char2List[indexList2].char2 = char2Raw[indexRaw2];
            indexRaw2++;
            Char2List[indexList2].row = row;
            Char2List[indexList2].count = Number(char2Raw[indexRaw2]);
            temp = [char2Raw[indexRaw2 - 1], Number(char2Raw[indexRaw2]), 0, ''];
            for (let i = ColStart; i <= ColEnd; i++) temp[i] = 0;
            Table.push(temp);
            indexRaw2++;
            indexList2++;
        }
        Char1List[indexList1].rowEnd = row;

        row++;                          // summate the columns
        temp = ['Σ', Char1List[indexList1].total, 0, ' '];
        for (let i = ColStart; i <= ColEnd; i++) temp[i] = 0;
        Table.push(temp);
        row++;
        indexList1++;
    }

    CreateHTMLTable();
    DisplayTable();
    TableInitialized = true;
    return;
}

// -------------------------------------
function UpdateTables() { 
// -------------------------------------

    if (WordsTotal === 0) {
        alert("Please enter the Spelling Bee Grid from Todays Hints and press INITIALIZE TABLES.");
        return;
    }
    DataInput = El.DataInput.value.toUpperCase().split(/[^A-Z]+/).filter(x => x);
    if (!ValidateDataInput()) {
        alert(`Invalid words in FOUND WORDS. Please correct.\n` + BadWords.join(",z"));
        return;
    }
    let ProcessList = CullList();
    for (let i = 0; i < ProcessList.length; i++) {      // Tally input words
        Table[Char2ToRow(ProcessList[i])][ProcessList[i].length]++;
        WordsFound++;
        let pangram = true;                             // check for Pangram
        for (let j = 0; j < LetterList.length; j++) {
            if (!ProcessList[i].includes(LetterList[j])) {
                pangram = false;
                break;
            }
        }
        if (pangram) PangramsFound++;
    }
    UpdateMetaStats();
    Char1List.forEach(item => {item.colSum(); item.rowSum();});
    DisplayTable();
    DoneIsGray();
    return;
}

//======================================
// SUB-FUNCTIONS
//======================================

function ValidateDataInput () {
// Validity tests
//  WORD contains letters outside the LETTERLIST
//  Char2 has no match
    BadWords = [];
    for (let i = 0; i < DataInput.length; i++) {
        for (let j = 0; j < DataInput[i].length; j++) {
            if (!LetterList.includes(DataInput[i][j])) BadWords.push(DataInput[i]);
        }
        if (Char2List.findIndex(item => item.char2 === DataInput[i].slice(0, 2)) < 0)
            BadWords.push(DataInput[i]);
    }
    if (BadWords.length == 0) return true
        else return false;
}

function CullList() {       // returns list of unprocessed words
    let list = [];
    for (let i = 0; i < DataInput.length; i++) {
        if (!ProcessedWords.includes(DataInput[i])) {
            ProcessedWords.push(DataInput[i]);
            list.push(DataInput[i]);
        }
    }
    return list;
}

function UpdateMetaStats () {
    El.MetaStats1.innerHTML = '\xa0\xa0\xa0Total pangrams:<br>Pangrams Found:';
    El.MetaStats2.innerHTML = Pangrams + `<br>` + PangramsFound;
    El.MetaStats3.innerHTML = '\xa0\xa0\xa0\xa0\xa0Total words:<br>\xa0\xa0Words Found:';
    El.MetaStats4.innerHTML = WordsTotal + `<br>` + WordsFound;
    return;
}

function CreateHTMLTable() {
    for (let y = 0; y < TableTotalRows; y++) {
        let rowObj = [];
        let rowEl = document.createElement('tr');
        for (let x = 0; x <= ColEnd; x++) {
            let cellEl = document.createElement('td');
            rowObj.push({element: cellEl});
            rowEl.appendChild(cellEl);
        }
        Cell.push(rowObj);
        El.Table.appendChild(rowEl);
    }
    for (let i = 0; i < Char1List.length; i++) {    // cell colors
        for (let j = ColStart; j <= ColEnd; j++) {
            let row = Char1List[i].rowStart;
            Cell[row][j].element.style.color = 'mediumvioletred';
            Cell[row][j].element.style.fontWeight = 'bold';
        }
        for (let j = ColStart; j <= ColEnd; j++) {
            Cell[Char1List[i].rowEnd + 1][j].element.style.fontWeight = 'bold';
        }
        for (let j = Char1List[i].rowStart + 1; j <= Char1List[i].rowEnd + 1; j++) {
            Cell[j][1].element.style.color = 'mediumvioletred';
            Cell[j][1].element.style.fontWeight = 'bold';
            Cell[j][2].element.style.fontWeight = 'bold';
        }
        for (let j = Char1List[i].rowStart + 1; j <= Char1List[i].rowEnd; j++) {
            for (let k = ColStart; k <= ColEnd; k++) {
                Cell[j][k].element.style.backgroundColor = "whitesmoke";
            }
        }
    }
    return;
}

function DeleteHTMLTable () {
// HELP: THIS DELETES THE TABLE, BUT HOW DO I GET IT BACK? I KLUDGED BY CREATING
// A LIST OF ANOTHER 10 TABLES TO KEEP IT WITHTN THE DOM.
// IS querySelector A BETTER OPTION?
    El.Wrapper.removeChild(El.Table);
    let table = "table" + ++TableCopy;
    El.Table = document.getElementById(table);
    Header = ['', '', '', ''];
    Spacer = ['', '', '', '',];
    LineBreak = ['-', '-', '-', '-'];
    Char1List = [];
    Char2List = [];
    LetterList = '';
    Table = [];
    Cell = [];
    ProcessedWords = [];
    WordsFound = 0;
    PangramsFound = 0;
    TableInitialized = false;
}

function DisplayTable () {
    for (let i = 0; i < TableTotalRows; i++) {
        for (let j = 0; j <= ColEnd; j++) {
            if (Table[i][j] != 0) Cell[i][j].element.innerHTML = (Table[i][j]);
        }
    }
    return;
}

function DoneIsGray () {
    for (let i = 0; i < Char1List.length; i++) {
        // check for completed rows
        for (let j = Char1List[i].rowStart + 1; j <= Char1List[i].rowEnd + 1; j++) {
            if (Table[j][1] === Table[j][2]) {
                RowColor(j, 0, ColEnd, "lightsteelblue")
            }
        }
        // check for completed columns
        for (let j = ColStart; j <= ColEnd; j++) {
            if (Table[Char1List[i].rowStart][j] === Table[Char1List[i].rowEnd + 1][j]) {
                ColColor(j, Char1List[i].rowStart - 1, Char1List[i].rowEnd + 1,"lightsteelblue");
            }
        }
    }
}

function Char2ToRow (word) {            // returns row of char2
    return Char2List[Char2List.findIndex(item => item.char2 === word.slice(0, 2))].row;
}

function RowColor (row, colStart, colEnd, color) {
    for (let i = colStart; i <= colEnd; i++) {
        Cell[row][i].element.style.color = color;
    }
}

function ColColor (col, rowStart, rowEnd, color) {
    for (let row = rowStart; row <= rowEnd; row++) {
        Cell[row][col].element.style.color = color;
    }
}
