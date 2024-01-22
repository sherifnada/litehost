document.addEventListener('DOMContentLoaded', function () {
    var nameYourSub = document.getElementById('nameYourSub');
    var uploadStep = document.querySelectorAll('.uploadStep');
    var fileUpload = document.getElementById('fileUpload');
    var launchStep = document.querySelectorAll('.launchStep');
    var createAccountStep = document.querySelectorAll('.createAccountStep');
    var uploadingStep = document.querySelectorAll('.uploadingStep');
    var successStep = document.querySelectorAll('.successStep');
    var failStep = document.querySelectorAll('.failStep');
    var dropZone = document.getElementById('dropZone')

    function replaceHiddenWithFlex(Loop){
        Loop.classList.replace("hidden", "flex");
    }

    function replaceFlexWithHidden(Loop){
        console.log(Loop)
        Loop.classList.replace("flex", "hidden");
    }

    // Listen for changes in the file input
    fileUpload.addEventListener('change', function() {
        if(fileUpload.files.length > 0) {
            uploadStep.forEach(replaceFlexWithHidden);
            launchStep.forEach(replaceHiddenWithFlex);
        }
    });

    // LaunchStep completed – flex on CreateAccountStep

    
    
    // CreateAccountStep completed - hide LaunchStep and flex on UploadingStep



    // UploadingStep finishes - hide UploadingStep and flex on successStep or failStep



    //Flex on ID=dropZone when file is dragged and dropped




//     function hideFormInputs(){
//         document.getElementById("LaunchButton").style.display = 'none';
//         document.getElementById("urlWrapper").style.display = 'none';
//         document.querySelector("#uploadForm > .contentRootWrapper").style.display = 'none';
//     }

//     function displaySuccessMessage(websiteUrl){
//         var websiteUrlDisplay = document.getElementById('websiteUrlDisplay');
//         websiteUrlDisplay.innerHTML = '';
//         var anchor = document.createElement('a');
//         anchor.setAttribute('href', websiteUrl);
//         anchor.setAttribute('target', '_blank');
//         anchor.innerText = websiteUrl;
//         websiteUrlDisplay.appendChild(anchor);
//         document.querySelector("#response > div.successMessage").style.display = "flex";
//     }

//     function displayFailureMessage(failureMessage){
//         document.querySelector("#response > div.failureMessage").style.display = "flex";
//         document.getElementById("errorResponseMessage").innerText = failureMessage
//     }

//     function hideLoadingScreen(){
//         document.querySelector("#response > div.formLoading").style.display = 'none';
//     }

//     document.getElementById('uploadForm').addEventListener('submit', function(e) {
//         // document.getElementById("response").innerText = "request submitted..";
//         e.preventDefault();
//         var formData = new FormData(this);
//         launchButton.style.display = 'none';
//         urlWrapper.style.display = 'none';
//         document.querySelector("#uploadForm > .contentRootWrapper").style.display = 'none';
//         document.querySelector("#response > div.formLoading").style.display = 'flex';
        


        // // COMMENT THIS BLOCK IN TO ACTUALLY INTERACT WITH THE SERVER
        // fetch('http://localhost:3000/create_site', {
        //     method: 'POST',
        //     body: formData
        // }).then(async response => {
        //     hideLoadingScreen();
        //     const data = await response.json();
        //     hideFormInputs();

        //     if (response.status >= 200 && response.status < 300){
        //         displaySuccessMessage(data.websiteUrl);
        //     } else if (response.status >= 400 < 500) {
        //         displayFailureMessage(data.message);
        //     } else {
        //         displayFailureMessage("An Unknown error happened");
        //     }
        // }).catch(error => {
        //     console.error('Error:', error)
        //     displayFailureMessage("An unknown error occurred");
        // });
        // =========================================================
        

        // Comment this block in to mock interactions with the server
        setTimeout(() => {
             document.querySelector("#response > div.formLoading").style.display = 'none';

             const isRequestSuccessful = true;
             if (isRequestSuccessful){
                 const response = {"status": 200, "websiteUrl": "https://pipeweave.litehost.io"};
            
                 // hides stuff from the form
                 hideFormInputs();
                 displaySuccessMessage(response.websiteUrl);
             } else {
                 const response = {"status": 400, error: "bucket_creation_failure", message: "Failed to create S3 bucket! (this is a sample error message)"};
    
                 // hides stuff from the form
                 hideFormInputs();
                 displayFailureMessage(response.message);
             }
         }, 5000); 
        // =========================================================
    });
        

    
// /* this code is not working with the above JS. I think something about the fileUpload ID being two variables is the problem?
// //Two things with this drap and drop functionality. (1) I'm not sure it's actually sending the file to the form. (2) The background goes away when you drag the file over the dropZone text
// var dropZone = document.getElementById('dropZone');
// var fileInput = document.getElementById('fileUpload');

// function showdropZone() {
// 	dropZone.style.display = "flex";
// }
// function hidedropZone() {
//     dropZone.style.display = "none";
// }

// function allowDrag(e) {
//     if (true) {  // Test that the item being dragged is a valid one
//         e.dataTransfer.dropEffect = 'copy';
//         e.preventDefault();
//     }
// }

// function handleDrop(e) {
//     e.preventDefault();
//     hidedropZone();
//     var dt = e.dataTransfer;
//     var files = dt.files;
//     fileInput.files = files;
// }

// window.addEventListener('dragenter', function(e) {
//     showdropZone();
// });

// dropZone.addEventListener('dragenter', allowDrag);
// dropZone.addEventListener('dragover', allowDrag);

// dropZone.addEventListener('dragleave', function(e) {
//     hidedropZone();
// });

// dropZone.addEventListener('drop', handleDrop);
// */
});