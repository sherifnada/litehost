document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var formData = new FormData(this);
    fetch('http://localhost:3000/create_site', {
        method: 'POST',
        body: formData
    }).then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
});
