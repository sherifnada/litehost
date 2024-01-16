document.addEventListener('DOMContentLoaded', function () {
    var fileUpload = document.getElementById('fileUpload');
    var fileUploadButton = document.getElementById('FileUploadButton');
    var launchButton = document.getElementById('LaunchButton');
    var uploadForm = document.getElementById('uploadForm');
    var infoWrapper = document.getElementById('infoWrapper');
    var urlWrapper = document.getElementById('urlWrapper');

    // Listen for changes in the file input
    fileUpload.addEventListener('change', function() {
        if(fileUpload.files.length > 0) {
            // Hide the FileUploadButton and show the LaunchButton
            fileUploadButton.style.display = 'none';
            launchButton.style.display = 'flex';
            uploadForm.style.backgroundColor = '#f87697';
            infoWrapper.style.display = 'none';
            urlWrapper.style.backgroundColor = 'white';
        }
    });

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

    
/* this code is not working with the above JS. I think something about the fileUpload ID being two variables is the problem?
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
*/