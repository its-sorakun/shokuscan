document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality - FIXED VERSION
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);
    themeIcon.textContent = initialTheme === 'dark' ? 'light_mode' : 'dark_mode';
    
    // Toggle function
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    });
    
    // Scanner functionality
    const codeReader = new ZXing.BrowserMultiFormatReader();
    let scanning = false;
    const elements = {
        scanner: document.getElementById('scanner'),
        result: document.getElementById('result'),
        output: document.getElementById('output-container'),
        button: document.getElementById('start-camera'),
        status: document.querySelector('.status'),
        icon: document.querySelector('#start-camera .icon')
    };

    function stopScanner() {
        codeReader.reset();
        elements.scanner.style.display = 'none';
        elements.button.innerHTML = '<span class="material-icons icon">photo_camera</span><span>Scan Barcode</span>';
        document.body.classList.remove('scanner-active');
        scanning = false;
        elements.status.textContent = "Ready to scan";
    }

    function sendBarcode(barcode) {
        document.body.classList.add('processing');
        elements.button.innerHTML = '<span class="material-icons icon">hourglass_top</span><span>Processing...</span>';
        elements.status.textContent = "Checking product...";
        
        // Try the new API endpoint first
        console.log('Sending barcode to API:', barcode);
        
        // Function to handle the API response
        const handleResponse = (data) => {
            console.log('API response:', data);
            elements.output.innerText = data.output || "No product information available";
            elements.output.style.display = 'block';
            elements.status.textContent = "Scan complete";
        };
        
        // First try the new API endpoint
        fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: barcode })
        })
        .then(response => {
            console.log('API response status:', response.status);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(handleResponse)
        .catch(error => {
            console.error('Error with new API endpoint:', error);
            
            // Fall back to the original endpoint
            console.log('Trying legacy endpoint...');
            elements.status.textContent = "Retrying...";
            
            // Try the legacy endpoint as fallback
            return fetch('/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode: barcode })
            })
            .then(response => {
                console.log('Legacy response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Legacy API error: ${response.status}`);
                }
                return response.json();
            })
            .then(handleResponse)
            .catch(fallbackError => {
                console.error('Error with legacy endpoint:', fallbackError);
                elements.result.textContent = "Scan failed";
                elements.status.textContent = "Error: Could not process barcode";
                elements.output.innerText = "Could not retrieve product information. Please try again.";
                elements.output.style.display = 'block';
            });
        })
        .finally(() => {
            document.body.classList.remove('processing');
            stopScanner();
        });
    }

    elements.button.addEventListener('click', () => {
        if (scanning) {
            stopScanner();
            return;
        }
        
        codeReader.decodeFromVideoDevice(undefined, 'scanner', (result, err) => {
            if (result) {
                elements.result.textContent = result.text;
                sendBarcode(result.text);
                codeReader.reset(); // Stop camera immediately after scan
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                elements.result.textContent = "Scan error";
                elements.status.textContent = "Please try again";
            }
        }).then(() => {
            elements.scanner.style.display = 'block';
            elements.button.innerHTML = '<span class="material-icons icon">cancel</span><span>Stop Scanning</span>';
            document.body.classList.add('scanner-active');
            elements.status.textContent = "Align barcode with camera";
            scanning = true;
        }).catch(err => {
            elements.result.textContent = "Camera error";
            elements.status.textContent = "Please enable camera access";
        });
    });
});