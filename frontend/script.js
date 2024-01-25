const firebaseConfig = {
  apiKey: "AIzaSyDX0tTmeX5iCWILENwfZKT-SU1lfBn9P0M",
  authDomain: "litehost-io-e7bdd.firebaseapp.com",
  projectId: "litehost-io-e7bdd",
  storageBucket: "litehost-io-e7bdd.appspot.com",
  messagingSenderId: "994834323379",
  appId: "1:994834323379:web:c34a969c3a25cb77149dc6",
  measurementId: "G-HNLDD4X11K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function toggleLoginLogoutButtons(user) {
  if (firebase.auth().currentUser) {
    // show logout
    document.getElementById("topright-login-button").classList.replace("flex", "hidden");
    document.getElementById("logout-button").classList.replace("hidden", "flex");
  } else {
    // show login
    document.getElementById("logout-button").classList.replace("flex", "hidden");
    document.getElementById("topright-login-button").classList.replace("hidden", "flex");
  }
}

firebase.auth().onAuthStateChanged(toggleLoginLogoutButtons);

document.addEventListener('DOMContentLoaded', async function() {

  const nameYourSub = document.getElementById('nameYourSub');
  const uploadStep = document.querySelectorAll('.uploadStep');
  const fileUpload = document.getElementById('fileUpload');
  const launchStep = document.querySelectorAll('.launchStep');
  const createAccountStep = document.querySelectorAll('.createAccountStep');
  const uploadingStep = document.querySelectorAll('.uploadingStep');
  const successStep = document.querySelectorAll('.successStep');
  const failStep = document.querySelectorAll('.failStep');

  function replaceHiddenWithFlex(el) {
    el.classList.replace("hidden", "flex");
  }

  function replaceFlexWithHidden(el) {
    el.classList.replace("flex", "hidden");
  }

  // Listen for changes in the file input
  fileUpload.addEventListener('change', function() {
    if (fileUpload.files.length === 1) {
      uploadStep.forEach(replaceFlexWithHidden);
      launchStep.forEach(replaceHiddenWithFlex);
    }
  });

  document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    // document.getElementById("response").innerText = "request submitted..";
    e.preventDefault();

    if (!await validateSubdomain() || !validateFileInput()) {
      return;
    }

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

        setTimeout(() => {
          uploadingStep.forEach(el => el.classList.add("hidden"));
          const isRequestSuccessful = true;
          if (isRequestSuccessful) {
            successStep.forEach(el => el.classList.remove("hidden"));
            const response = { "status": 200, "websiteUrl": "https://pipeweave.litehost.io" };
            const successUrlElement = document.getElementById("success-url");
            successUrlElement.innerHTML = '';
            const link = document.createElement('a');
            link.href = response.websiteUrl;
            link.target = '_blank';
            link.textContent = response.websiteUrl;

            successUrlElement.appendChild(link);
          } else {
            failStep.forEach(el => el.classList.remove("hidden"));
            const response = { "status": 400, error: "bucket_creation_failure", message: "Failed to create S3 bucket! (this is a sample error message)" };

            // hides stuff from the form
          }
        }, 4000);
      }, 2000)
    } else {
      // Normal mode actions here
      // TODO show createAccountStep if not logged in
      const loggedIn = firebase.auth().currentUser;
      if (!loggedIn) {
        createAccountStep.forEach(el => el.classList.remove("hidden"));
        await waitForUserLogin();
        createAccountStep.forEach(el => el.classList.add("hidden"));
      }

      uploadingStep.forEach(el => el.classList.remove("hidden"));
      fetch('/create_site', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await firebase.auth().currentUser.getIdToken(true)}` },
        body: formData
      }).then(async response => {
        uploadingStep.forEach(el => el.classList.add("hidden"));
        const data = await response.json();
        if (response.status >= 200 && response.status < 300) {
          successStep.forEach(el => el.classList.remove("hidden"));
          const successAnchor = document.getElementById("success-url");
          successAnchor.innerText = data.websiteUrl;
          successAnchor.href = data.websiteUrl;
        } else if (response.status >= 400 < 500) {
          failStep.forEach(el => el.classList.remove("hidden"));
          document.getElementById("serverside-failure-message").innerText = data.message;
        } else {
          failStep.forEach(el => el.classList.remove("hidden"));
          document.getElementById("serverside-failure-message").innerText = "It looks like something broke unexpectedly."
        }
      }).catch(error => {
        throw error;
      });
    }
  });

  // ================ FIREBASE ====================



  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      // TODO Handle Errors here https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopupf
      throw error;
    }
  }

  async function waitForUserLogin() {
    return new Promise((resolve, reject) => {
      // if already logged in then exit
      if (firebase.auth().currentUser) {
        resolve(firebase.auth().currentUser);
        return;
      }

      // Otherwise wait for authentication state changes
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        if (user) {
          // If a user is logged in, resolve the promise with the user information
          unsubscribe();
          resolve(user);
          return;
        }
      });
    });
  }

  function logoutUser() {
    firebase.auth().signOut();
    location.reload();
  }

  document.querySelectorAll(".login-with-google").forEach(el => el.addEventListener("click", signInWithGoogle));
  document.getElementById("logout-button").addEventListener("click", logoutUser);

  // ================ END FIREBASE ====================

  // ================ FORM VALIDATION ====================
  async function validateSubdomain() {
    const subDomainInput = document.getElementById('subDomain-text');
    const subDomain = subDomainInput.value;
    const validationErrorElement = document.getElementById('subdomain-input-validation-error-message');
    const subdomainInputContainer = document.getElementById('subdomain-input-container');
    const litehostIoPlaceholder = subdomainInputContainer.children[1];

    // Validate the length and character constraints
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subDomain)) {
      validationErrorElement.innerText = 'Subdomain must be 1-63 characters long, alphanumeric, and cannot start or end with a dash.';
      validationErrorElement.classList.remove('hidden');
      updateInputStyles(subDomainInput, false);
      updateInputStyles(litehostIoPlaceholder, false)
      return false;
    }

    // Check if the subdomain is available
    const isAvailable = await checkSubdomainAvailability(subDomain);
    if (!isAvailable) {
      validationErrorElement.innerText = 'Subdomain is already taken :( Please try another one.';
      validationErrorElement.classList.remove('hidden');
      updateInputStyles(subDomainInput, false);
      updateInputStyles(litehostIoPlaceholder, false)
      return false;
    }

    // If everything is valid
    updateInputStyles(subDomainInput, true);
    updateInputStyles(litehostIoPlaceholder, true)
    validationErrorElement.classList.add('hidden');
    return true;
  }

  function updateInputStyles(container, isValid) {
    if (isValid) {
      container.classList.replace('border-pink-100', 'border-blue-100');
      container.classList.replace('text-pink-100', 'text-blue-100');
    } else {
      container.classList.replace('border-blue-100', 'border-pink-100');
      container.classList.replace('text-blue-100', 'text-pink-100');
    }
  }

  async function checkSubdomainAvailability(subdomain) {
    try {
      const response = await fetch('/is_site_available', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subdomain })
      });
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      return false;
    }
  }

  function validateFileInput() {
    const fileInput = document.getElementById('fileUpload');
    const files = fileInput.files;
    const validationErrorElement = document.getElementById('subdomain-input-validation-error-message');
    // Check if any file is selected
    if (files.length === 1) {
      validationErrorElement.classList.add('hidden');
      return true;
    } else {
      validationErrorElement.classList.remove('hidden');
      validationErrorElement.innerText = "Please upload a file.";
      return false;
    }
  }

  document.getElementById('fileUpload').addEventListener('change', validateFileInput);
  document.getElementById('subDomain-text').addEventListener('change', validateSubdomain)



  // ================ END FORM VALIDATION ====================




  // /* this code is not working with the above JS. I think something about the fileUpload ID being two variables is the problem?
  // //Two things with this drap and drop functionality. (1) I'm not sure it's actually sending the file to the form. (2) The background goes away when you drag the file over the dropZone text
  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileUpload');

  document.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.classList.remove('hidden');
  });

  document.addEventListener('dragleave', function(e) {
    e.preventDefault();
    if (e.pageX === 0 || e.pageY === 0) {
      dropZone.classList.add('hidden');
    }
  });

  dropZone.addEventListener('drop', function(event) {
    event.preventDefault();
    dropZone.classList.add('hidden');

    if (event.dataTransfer.files.length > 0) {
      const dt = new DataTransfer();
      dt.items.add(event.dataTransfer.files[0]);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // ================ END DRAG AND DROP ====================
});
