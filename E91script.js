/*
Author: Gina Philipose
HTML File: E91.script
Last Update: December 1st, 2025
*/


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const qubits = document.getElementById('qubits');
const qubitnum = document.getElementById('qubitnum');
const eve = document.getElementById('eve');
const run = document.getElementById('run');

const sift = document.getElementById('sift');
const error = document.getElementById('error')



// photon slider
qubits.oninput = () => {
    qubitnum.textContent = qubits.value;
}

// Getting an array of n random bits symbolizing the bits (0 or 1), simulating either:
// 1) the quantum bits (qubits) Alice wants to send
// 2) the choice of measurment bases (0 --> + basis (rectilinear) and 1 --> x basis (diagonal)) for Alice, Bob, or Eve
// In a real BB84 protocol, these would come from a quantum random number source
function randomBits(n) {
    return Array.from({length: n}, () => Math.round(Math.random()))
}

// Simulating the measurement rule where if both bases match,
// the bit is correct. If not, Bob has a 50/50 chance of gettin 0 or 1.
// This models the collapse of the quantum state when measured in the wrong basis.
function measure(bit, fromBase, toBase) {
    // if the bases match, returning the same bit
    if (fromBase === toBase){return bit;}
    // if the bases don't match, returning 50/50 0 or 1
    else {return Math.round(Math.random());}
}

// Simulating BB84
function BB84(n, includeEve) {
    // generating random bits on Alice's side (proto-key bits)
    const aliceBits = randomBits(n);
    // generating Alice's bases (polarization)
    const aliceBases = randomBits(n);

    // generating Bob's bases
    const bobBases = randomBits(n);
    
    // if Eve is present, generate her bases
    let eveBases = null;
    if(includeEve) {eveBases = randomBits(n);}

    // where the bits Bob received will go
    const bobResults = [];

    // If Eve is present, any bases she incorrectly measure alters the state, creating errors for Bob.
    // This simulates intercept-resend eavesdroping which introduces detectable errors.

    for (let i=0; i < n; i++) {
        // bit encoded as a photon with a specific polarization
        let bit = aliceBits[i];

        // if Eve is present, takes the bit and check's if eve's base
        // is the same as Alice's to get the bit without causing an error
        if(includeEve){
            const eveBit = measure(bit, aliceBases[i], eveBases[i]);
            // changes the photon state (bit) depending on if Eve's base matched or not
            // matching --> nothing; not matching --> causes errors that can be seen later
            bit = eveBit
        }

        // Storing the bit recieved by Bob (either affected or not affected by Eve and
        // changed by Bob's own bases if they matched Alice's or not).
        // If Eve measures in the wrong basis, it may flip the photon's state, causing
        // errors for Bob
        bobResults.push(measure(bit, aliceBases[i], bobBases[i]))
    }
    return {aliceBits, aliceBases, eveBases, bobBases, bobResults};
}

function drawingQubits(aliceBits, aliceBases, eveBases, bobResults, bobBases, includeEve) {
    // clearing the canvas for each simulation
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // setting font and font size for labels
    ctx.font = '20px Arial'

    // total number of qubits
    const n = aliceBits.length;
    // spacing out the qubits over the canvas
    const quibitSpacing = canvas.width / (n+1);

    // drawing Alice's bits
    for (let i=0; i<n; i++){
        // moving to that corrdinate
        const x = quibitSpacing * (i+1);
        const y = 80;
        // begin drawing
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        // coloring based off of bit: 0 = blue; 1 = red
        if (aliceBits[i] === 0) {ctx.fillStyle = "blue";}
        else {ctx.fillStyle = "red";}

        // lowering opacity when bases don't match so sifted key is easier to see
        if(aliceBases[i] === bobBases[i]){
            ctx.globalAlpha = 1;
        }
        else{
            ctx.globalAlpha = 0.3;
        }

        ctx.fill();
        // indicating each base (also colored)
        if(aliceBases[i]===0){ctx.fillText('+', x-5, y+25);}
        else{ctx.fillText('x', x-5, y+25);}
    }

    // drawing Eve's bits
    if(includeEve){
        for (let i=0; i<n; i++){
            // moving to that corrdinate
            const x = quibitSpacing * (i+1);
            const y = 200;
            // begin drawing
            ctx.beginPath()
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            // coloring based off of bit: 0 = blue; 1 = red
            if (bobResults[i] === 0) {ctx.fillStyle = "blue";}
            else {ctx.fillStyle = "red";}

            // lowering opacity when bases don't match so sifted key is easier to see
            if(aliceBases[i] === bobBases[i]){
                ctx.globalAlpha = 1;
            }
            else{
                ctx.globalAlpha = 0.3;
            }
            
            ctx.fill();
            // indicating each base (also colored)
            if(eveBases[i]===0){ctx.fillText('+', x-5, y+25);}
            else{ctx.fillText('x', x-5, y+25);}
        }
    }

    // drawing Bob's bits
    for (let i=0; i<n; i++){
        // moving to that corrdinate
        const x = quibitSpacing * (i+1);
        const y = 320;
        // begin drawing
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        // coloring based off of bit: 0 = blue; 1 = red
        if (bobResults[i] === 0) {ctx.fillStyle = "blue";}
        else {ctx.fillStyle = "red";}

        // lowering opacity when bases don't match so sifted key is easier to see
        if(aliceBases[i] === bobBases[i]){
            ctx.globalAlpha = 1;
        }
        else{
            ctx.globalAlpha = 0.3;
        }

        ctx.fill();
        // indicating each base (also colored)
        if(bobBases[i]===0){ctx.fillText('+', x-5, y+25);}
        else{ctx.fillText('x', x-5, y+25);}
    }

    // Name Labels
    // resetting opacity
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    ctx.fillText("Alice", 20, 80);
    if (includeEve) {ctx.fillText('Eve', 20, 200)}
    ctx.fillText('Bob', 20, 320)
    
}

// getting the sifted key --> the bits where Bob and Alice have the same bases
function getSiftedKey(aliceBits, aliceBases, bobResults, bobBases){
    // to store the sifted key
    const sifted= [];

    for(let i=0; i<aliceBits.length; i++){
        if(aliceBases[i] === bobBases[i]) {
            sifted.push(bobResults[i]);
        }
    }
    return sifted;
}

// calculating the error rate between Bob and Alice's sifted key
function getErrorRate(aliceBits, aliceBases, bobResults, bobBases){
    let matches = 0;
    let errors = 0;

    for(let i=0; i < aliceBits.length; i++){
        // only looking at the bits of the base pairs that are the same
        if(aliceBases[i] === bobBases[i]) {
            matches++;
            // if sifted key bits don't match
            if (aliceBits[i] !== bobResults[i]) {
                errors++;
            }
        }
    }
    // if there are no matching bases
    if (matches === 0){ return 0;}

    // returning the error rate
    else{return (errors / matches) * 100;}
}

// actual button function
run.onclick = () => {
    // getting the number of qubits as an int
    const n = parseInt(qubits.value)
    // sets 'includeEve' as a bool (true if checked, false if not)
    const includeEve = eve.checked;
    // getting the consts from BB84
    const { aliceBits, aliceBases, eveBases, bobBases, bobResults} = BB84(n, includeEve);

    // drawing on the canvas
    drawingQubits(aliceBits, aliceBases, eveBases, bobResults, bobBases, includeEve);

    // getting sifted key and error rate for display
    const sifted = getSiftedKey(aliceBits, aliceBases, bobResults, bobBases);
    const errorRate = getErrorRate(aliceBits, aliceBases, bobResults, bobBases);

    sift.textContent = sifted.join('');
    error.textContent = `${errorRate.toFixed(1)}%`;
}