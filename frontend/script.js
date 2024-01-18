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
            document.querySelector("#uploadForm > .contentRootWrapper").style.display = 'none';

        }
    });

    function hideFormInputs(){
        document.getElementById("LaunchButton").style.display = 'none';
        document.getElementById("urlWrapper").style.display = 'none';
        document.querySelector("#uploadForm > .contentRootWrapper").style.display = 'none';
    }

    function displaySuccessMessage(websiteUrl){
        var websiteUrlDisplay = document.getElementById('websiteUrlDisplay');
        websiteUrlDisplay.innerHTML = '';
        var anchor = document.createElement('a');
        anchor.setAttribute('href', websiteUrl);
        anchor.setAttribute('target', '_blank');
        anchor.innerText = websiteUrl;
        websiteUrlDisplay.appendChild(anchor);
        document.querySelector("#response > div.successMessage").style.display = "flex";
    }

    function displayFailureMessage(failureMessage){
        document.querySelector("#response > div.failureMessage").style.display = "flex";
        document.getElementById("errorResponseMessage").innerText = failureMessage
    }

    function hideLoadingScreen(){
        document.querySelector("#response > div.formLoading").style.display = 'none';
    }

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        // document.getElementById("response").innerText = "request submitted..";
        e.preventDefault();
        var formData = new FormData(this);
        launchButton.style.display = 'none';
        urlWrapper.style.display = 'none';
        document.querySelector("#uploadForm > .contentRootWrapper").style.display = 'none';
        document.querySelector("#response > div.formLoading").style.display = 'flex';
        


        // COMMENT THIS BLOCK IN TO ACTUALLY INTERACT WITH THE SERVER
        fetch('http://localhost:3000/create_site', {
            method: 'POST',
            body: formData
        }).then(async response => {
            hideLoadingScreen();
            const data = await response.json();
            hideFormInputs();

            if (response.status >= 200 && response.status < 300){
                displaySuccessMessage(data.websiteUrl);
            } else if (response.status >= 400 < 500) {
                displayFailureMessage(data.message);
            } else {
                displayFailureMessage("An Unknown error happened");
            }
        }).catch(error => {
            console.error('Error:', error)
            displayFailureMessage("An unknown error occurred");
        });
        // =========================================================
        

        // Comment this block in to mock interactions with the server
        // setTimeout(() => {
        //     document.querySelector("#response > div.formLoading").style.display = 'none';

        //     const isRequestSuccessful = true;
        //     if (isRequestSuccessful){
        //         const response = {"status": 200, "websiteUrl": "https://pipeweave.litehost.io"};
            
        //         // hides stuff from the form
        //         hideFormInputs();
        //         displaySuccessMessage(response.websiteUrl);
        //     } else {
        //         const response = {"status": 400, error: "bucket_creation_failure", message: "Failed to create S3 bucket! (this is a sample error message)"};
    
        //         // hides stuff from the form
        //         hideFormInputs();
        //         displayFailureMessage(response.message);
        //     }
        // }, 500); 
        // =========================================================
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
});