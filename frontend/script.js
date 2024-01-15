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
	console.log('dragleave');
    hideDropZone();
});

dropZone.addEventListener('drop', handleDrop);

/*
//This JS makes the FloatingIcons follow the mouse. I cant get it to work while dragging a file over the dropzone
document.addEventListener('mousemove', (event) => {
    if (window.innerWidth >= 768) { // Only apply effect on screens wider than 768px
        const followElements = document.querySelectorAll('.floatingIcon');

        followElements.forEach(el => {
            const speed = 5; // Adjust this value to control the movement speed

            const x = (event.pageX - window.innerWidth / 2) / speed;
            const y = (event.pageY - window.innerHeight / 2) / speed;

            el.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});
*/