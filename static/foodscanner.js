const codeReader = new ZXing.BrowserMultiFormatReader();
const resultElement = document.getElementById('result');
const videoElement = document.getElementById('scanner');
const display_output = document.getElementById('output-container');

// Start scanning
let startcamera = () => {

    codeReader.decodeFromVideoDevice(null, videoElement, (result, err) => {
    if (result) {
        resultElement.textContent = `Scanned barcode UAN: ${result.text}`;
        display_output.innerText = "loading information, please wait...";
        sendBarcode(result.text);
        codeReader.reset()
    }
    if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error(err);
        resultElement.textContent = 'Error scanning barcode';
    }
});
}

// Send barcode to the Flask server
function sendBarcode(barcode) {
    fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: barcode }),
    })
    .then(response => response.json())
    .then(data => {
        // resultElement.textContent('Success:', data);
        // display_output.textContent = data["output"];
        display_output.innerText = data["output"];
    })
    .catch((error) => {
        // resultElement.textContent('Error:', error);
        resultElement.innerText = error;
    });
}

document.getElementById("start-camera").addEventListener("click", startcamera)