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

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        // document.getElementById("response").innerText = "request submitted..";
        e.preventDefault();
        var formData = new FormData(this);
        // TODO only do this if they're not logged in
        launchStep.forEach(el => el.classList.add("hidden"));
        nameYourSub.classList.add("hidden");
        const urlParams = new URLSearchParams(window.location.search);
        const debug = urlParams.get('debug');

        if (debug === 'true') {
            // Debug mode actions here
            // TODO remove after adding check for being logged in
            createAccountStep.forEach(el => el.classList.remove("hidden"));
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
        } else {
            // Normal mode actions here
            // TODO show createAccountStep if not logged in
            const loggedIn = true; // TODO
            if (!loggedIn){
                // TODO remove after adding check for being logged in
                createAccountStep.forEach(el => el.classList.remove("hidden"));
            } 
            uploadingStep.forEach(el => el.classList.remove("hidden"));
            fetch('http://localhost:3000/create_site', {
                method: 'POST',
                headers: {Authorization: `Bearer ${'h'}`},
                body: formData
            }).then(async response => {
                uploadingStep.forEach(el => el.classList.add("hidden"));
                const data = await response.json();
                if (response.status >= 200 && response.status < 300){
                    successStep.forEach(el => el.classList.remove("hidden"));
                    document.getElementById("success-url").innerText = data.websiteUrl;
                } else if (response.status >= 400 < 500) {
                    failStep.forEach(el => el.classList.remove("hidden"));
                    // TODO show actual error message
                } else {
                    failStep.forEach(el => el.classList.remove("hidden"));
                    // TODO show generic error message
                }
            }).catch(error => {

            });
        }
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