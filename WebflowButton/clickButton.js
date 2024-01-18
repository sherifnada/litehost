var firstButton = document.querySelector('button[data-automation-id="top-bar-export-code-button"]');
if (firstButton) {
    firstButton.click();

    // Wait before clicking the second button
    setTimeout(function() {
        var secondButton = document.querySelector('button[data-automation-id="code-export-prepare-zip-button"]');
        if (secondButton) {
            secondButton.click();

            // Wait before clicking the third button
            setTimeout(function() {
                var downloadLink = document.querySelector('a[href^="blob:"][download$=".zip"]');
                var thirdButton = downloadLink ? downloadLink.querySelector('button') : null;
                if (thirdButton) {
                    thirdButton.click();
                } else {
                    console.error('Download button not found');
                }
            }, 5000); // Adjust this delay as needed for the third button

        } else {
            console.error('Prepare ZIP button not found');
        }
    }, 5000); // Adjust this delay as needed for the second button
} else {
    console.error('Export button not found');
}

