// ================ FIREBASE ====================

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
  // TODO don't save any state on the client side
firebase.initializeApp(firebaseConfig);

async function signInWithGoogle(callback){
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        callback(await firebase.auth().signInWithPopup(provider)); 
    } catch(error){
        // TODO Handle Errors here https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopupf
        console.log("auth error");
        throw error;
    }
}

async function finishAuth(result){
    try{
        const idToken = await result.user.getIdToken(true);
        const authResult = await fetch('/session_login', {
            method: 'POST', // or 'POST'
            headers: {
              'Authorization': `Bearer ${idToken}`,
            }
          });
        
        // TODO hide stuff
    } catch(error) {
        throw error;
    }
}

document.getElementById("login-with-google").addEventListener("click", async () => signInWithGoogle(finishAuth));

// ================ END FIREBASE ====================

