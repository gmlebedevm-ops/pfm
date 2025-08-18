const express = require('express');
const app = express();
const port = 3002;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug App</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
            .loading { background-color: #fff3cd; color: #856404; }
            iframe { width: 100%; height: 600px; border: 1px solid #ccc; }
        </style>
    </head>
    <body>
        <h1>Application Debugging</h1>
        
        <div id="status" class="status loading">Checking application status...</div>
        
        <h2>Application Preview</h2>
        <iframe id="appFrame" src="http://localhost:3001"></iframe>
        
        <h2>API Tests</h2>
        <button onclick="testPasswords()">Test Passwords API</button>
        <button onclick="testFolders()">Test Folders API</button>
        <button onclick="testInit()">Test Init API</button>
        <div id="apiResults"></div>
        
        <script>
            let checkCount = 0;
            const maxChecks = 10;
            
            function checkAppStatus() {
                checkCount++;
                const iframe = document.getElementById('appFrame');
                const statusDiv = document.getElementById('status');
                
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const loadingElements = iframeDoc.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="ring"]');
                    const skeletonElements = iframeDoc.querySelectorAll('[class*="skeleton"]');
                    
                        if (loadingElements.length > 0 || skeletonElements.length > 0) {
                            statusDiv.textContent = `App is loading... (check ${checkCount}/${maxChecks})`;
                            statusDiv.className = 'status loading';
                            
                            if (checkCount < maxChecks) {
                                setTimeout(checkAppStatus, 2000);
                            } else {
                                statusDiv.textContent = 'App seems to be stuck in loading state';
                                statusDiv.className = 'status error';
                            }
                        } else {
                            statusDiv.textContent = 'App loaded successfully!';
                            statusDiv.className = 'status success';
                        }
                } catch (e) {
                    statusDiv.textContent = 'Cannot access iframe content (CORS)';
                    statusDiv.className = 'status error';
                }
            }
            
            function testPasswords() {
                fetch('http://localhost:3001/api/passwords')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status success">Passwords API: ' + JSON.stringify(data) + '</div>';
                    })
                    .catch(error => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status error">Passwords API Error: ' + error.message + '</div>';
                    });
            }
            
            function testFolders() {
                fetch('http://localhost:3001/api/folders')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status success">Folders API: ' + JSON.stringify(data) + '</div>';
                    })
                    .catch(error => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status error">Folders API Error: ' + error.message + '</div>';
                    });
            }
            
            function testInit() {
                fetch('http://localhost:3001/api/init', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status success">Init API: ' + JSON.stringify(data) + '</div>';
                    })
                    .catch(error => {
                        document.getElementById('apiResults').innerHTML += 
                            '<div class="status error">Init API Error: ' + error.message + '</div>';
                    });
            }
            
            // Start checking after iframe loads
            setTimeout(checkAppStatus, 3000);
        </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Debug server running at http://localhost:${port}`);
});