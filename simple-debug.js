const express = require('express');
const app = express();
const port = 3002;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple Debug</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
            .loading { background-color: #fff3cd; color: #856404; }
            iframe { width: 100%; height: 400px; border: 1px solid #ccc; }
        </style>
    </head>
    <body>
        <h1>Simple Application Debug</h1>
        <div id="status" class="status loading">Checking application...</div>
        <iframe src="http://localhost:3001"></iframe>
        
        <script>
            setTimeout(() => {
                document.getElementById('status').textContent = 'App loaded in iframe - check manually';
                document.getElementById('status').className = 'status success';
            }, 5000);
        </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('Simple debug server running at http://localhost:' + port);
});