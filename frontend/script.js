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

//Two things with this drap and drop functionality. (1) I'm not sure it's actually sending the file to the form. (2) The background goes away when you drag the file over the Dropzone text
var dropZone = document.getElementById('dropzone');
var fileInput = document.getElementById('fileUpload');

function showDropZone() {
	dropZone.style.display = "flex";
}
function hideDropZone() {
    dropZone.style.display = "none";
}

function allowDrag(e) {
    if (true) {  // Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
}

function handleDrop(e) {
    e.preventDefault();
    hideDropZone();
    var dt = e.dataTransfer;
    var files = dt.files;
    fileInput.files = files;
}

window.addEventListener('dragenter', function(e) {
    showDropZone();
});

dropZone.addEventListener('dragenter', allowDrag);
dropZone.addEventListener('dragover', allowDrag);

dropZone.addEventListener('dragleave', function(e) {
    hideDropZone();
});

dropZone.addEventListener('drop', handleDrop);
