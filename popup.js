// Function to accept up to 10 connection requests
function acceptLimitedConnections() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                const limit = 10;
                const connectButtons = document.querySelectorAll('button[aria-label^="Accept"]');
                let acceptedCount = 0;

                connectButtons.forEach(button => {
                    if (acceptedCount < limit) {
                        button.click();
                        acceptedCount++;
                        console.log(`Accepted connection #${acceptedCount}`);
                    }
                });
            }
        });
    });
}

// Function to move open messages to 'Others' and mark them as read, processing one card at a time
function moveOpenMessagesToOthers() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function() {
                // Helper function to process each message card
                function processMessageCard(card, index, totalCards) {
                    console.log(`Processing message card ${index + 1} of ${totalCards}`);
                    
                    // Check if the card is minimized and expand it if necessary
                    if (card.classList.contains('msg-overlay-conversation-bubble--is-minimized')) {
                        console.log(`Card ${index + 1} is minimized, expanding...`);
                        const header = card.querySelector('.msg-overlay-bubble-header');
                        if (header) {
                            header.click();  // Click the header to expand the card
                            console.log(`Clicked header to expand card ${index + 1}`);
                        } else {
                            console.log(`Header not found for card ${index + 1}`);
                            return;  // Exit if the header is not found
                        }
                    }
                
                    setTimeout(() => {
                        // Select the menu button within the opened message card
                        const menuButton = card.querySelector('button.msg-thread-actions__control');
                        if (menuButton) {
                            menuButton.click();
                            console.log(`Opened menu on message card ${index + 1}`);
                
                            setTimeout(() => {
                                // Find and click the "Move to Others" option
                                const moveToOthersButton = Array.from(document.querySelectorAll('.msg-thread-actions__dropdown-option')).find(el => el.textContent.includes("Move to Other"));
                                if (moveToOthersButton) {
                                    moveToOthersButton.click();
                                    console.log(`Moved message card ${index + 1} to Others`);
                                } else {
                                    console.log(`Move to Others option not found on message card ${index + 1}`);
                                }
                
                                setTimeout(() => {
                                    // Click the menu button again to reopen the menu
                                    menuButton.click();
                                    console.log(`Reopened menu on message card ${index + 1}`);

                                    setTimeout(() => {
                                        // Find and click the "Mark as read" option
                                        const markAsReadButton = Array.from(document.querySelectorAll('.msg-thread-actions__dropdown-option')).find(el => el.textContent.includes("Mark as read"));
                                        if (markAsReadButton) {
                                            markAsReadButton.click();
                                            console.log(`Marked message card ${index + 1} as read`);
                                        } else {
                                            console.log(`Mark as read option not found on message card ${index + 1}`);
                                        }
                        
                                        setTimeout(() => {
                                            const closeButton = card.querySelector('svg[data-test-icon="close-small"]').parentElement;
                                            if (closeButton) {
                                                closeButton.click();
                                                console.log(`Closed message card ${index + 1}`);
                                            } else {
                                                console.log(`Close button not found for message card ${index + 1}`);
                                            }
                                            setTimeout(() => {
                                                // Process the next message card
                                                if (index + 1 < totalCards) {
                                                    setTimeout(() => {
                                                        processMessageCard(messageCards[index + 1], index + 1, totalCards);
                                                    }, 1000); // Wait before executing the next card
                                                } else {
                                                    console.log("All message cards processed.");
                                                }
                                            }, 500); // Wait for the message card to close
                                        }, 500); // Wait for the "Mark as read" option to be clicked
                                    }, 500); // Wait for the "Move to Others" option to be clicked
                                }, 500); // Wait for the "Move to Others" option to be clicked
                            }, 500); // Wait for the menu to open
                        } else {
                            console.log(`Menu button not found on message card ${index + 1}`);
                            // Continue with the next card if the menu button is not found
                            if (index + 1 < totalCards) {
                                processMessageCard(messageCards[index + 1], index + 1, totalCards);
                            }
                        }
                    }, 500); // Wait for the message card to open
                }

                // Main execution for moving messages to Others
                const messageCards = document.querySelectorAll('div[data-view-name="message-overlay-conversation-bubble-item"], div[aria-label="Messaging"]');
                console.log(`Found ${messageCards.length} message cards`);

                if (messageCards.length > 0) {
                    processMessageCard(messageCards[0], 0, messageCards.length);
                } else {
                    console.log("No message cards found.");
                }
            }
        });
    });
}

// Event listeners for the buttons in the popup
document.getElementById('acceptConnections').addEventListener('click', () => {
    acceptLimitedConnections();
});

document.getElementById('moveMessages').addEventListener('click', () => {
    moveOpenMessagesToOthers();
});
