document.getElementById('uploadForm').addEventListener('submit', function(e) {
    document.getElementById("response").innerText = "request submitted..";
    e.preventDefault();
    var formData = new FormData(this);
    fetch('http://localhost:3000/create_site', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => document.getElementById("response").innerText = JSON.stringify(data))
      .catch(error => console.error('Error:', error));
});
