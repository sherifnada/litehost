document.addEventListener('DOMContentLoaded', function () {
    const nameYourSub = document.getElementById('nameYourSub');
    const uploadStep = document.querySelectorAll('.uploadStep');
    const fileUpload = document.getElementById('fileUpload');
    const launchStep = document.querySelectorAll('.launchStep');
    const createAccountStep = document.querySelectorAll('.createAccountStep');
    const uploadingStep = document.querySelectorAll('.uploadingStep');
    const successStep = document.querySelectorAll('.successStep');
    const failStep = document.querySelectorAll('.failStep');
    const dropZone = document.getElementById('dropZone')

    function replaceHiddenWithFlex(el){
        el.classList.replace("hidden", "flex");
    }

    function replaceFlexWithHidden(el){
        el.classList.replace("flex", "hidden");
    }

    // Listen for changes in the file input
    fileUpload.addEventListener('change', function() {
        if(fileUpload.files.length === 1) {
            uploadStep.forEach(replaceFlexWithHidden);
            launchStep.forEach(replaceHiddenWithFlex);
        }
    });

    // LaunchStep completed – flex on CreateAccountStep
    // 
    
    
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

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        // document.getElementById("response").innerText = "request submitted..";
        e.preventDefault();
        var formData = new FormData(this);
        // TODO only do this if they're not logged in
        launchStep.forEach(el => el.classList.add("hidden"));
        nameYourSub.classList.add("hidden");
        
        createAccountStep.forEach(el => el.classList.remove("hidden"));

        // TODO remove after adding check for being logged in
        setTimeout(() => {
            createAccountStep.forEach(el => el.classList.add("hidden"));
            uploadingStep.forEach(el => el.classList.remove("hidden"));
            setTimeout(() => {
                uploadingStep.forEach(el => el.classList.add("hidden"));
                const isRequestSuccessful = true;
                if (isRequestSuccessful){
                    successStep.forEach(el => el.classList.remove("hidden"));
                    const response = {"status": 200, "websiteUrl": "https://pipeweave.litehost.io"};
                    document.getElementById("success-url").innerText = response.websiteUrl;
                } else {
                    failStep.forEach(el => el.classList.remove("hidden"));
                    const response = {"status": 400, error: "bucket_creation_failure", message: "Failed to create S3 bucket! (this is a sample error message)"};
       
                    // hides stuff from the form
                }
            }, 4000); 
        }, 2000)
        


        // // COMMENT THIS BLOCK IN TO ACTUALLY INTERACT WITH THE SERVER
        // fetch('http://localhost:3000/create_site', {
        //     method: 'POST',
        //     body: formData
        // }).then(async response => {
        //     const data = await response.json();
        //     if (response.status >= 200 && response.status < 300){
        //         displaySuccessMessage(data.websiteUrl);
        //     } else if (response.status >= 400 < 500) {
        //         displayFailureMessage(data.message);
        //     } else {
        //         displayFailureMessage("An Unknown error happened");
        //     }
        // }).catch(error => {
        //     displayFailureMessage("An unknown error occurred");
        // });
        // =========================================================
        

        // Comment this block in to mock interactions with the server
        
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