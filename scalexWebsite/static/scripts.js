// Function to show loading spinner
function showLoadingSpinner() {
    document.getElementById('loading-overlay').style.display = 'block';
}

// Function to hide loading spinner
function hideLoadingSpinner() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Show the spinner when any form is submitted
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function () {
        showLoadingSpinner();
    });
});

// Check if the period form exists and add submit listener
const periodForm = document.getElementById('periodForm');
if (periodForm) {
    periodForm.addEventListener('submit', function () {
        showLoadingSpinner();
    });
}

// Check if a flash message exists, display it in an alert
document.addEventListener('DOMContentLoaded', function() {
    if (flashMessage) {
        alert(flashMessage);
    }
});

// Validate password confirmation before submitting (for registration form)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            e.preventDefault();  // Prevent form submission if passwords don't match
        } else {
            showLoadingSpinner();  // Show loading spinner
        }
    });
}

// Show the loading spinner on page refresh or navigation away
window.addEventListener('beforeunload', function () {
    showLoadingSpinner();
});

// Show the spinner as soon as the DOM starts loading and hide it when it's fully loaded
document.addEventListener('DOMContentLoaded', showLoadingSpinner);


// Ensure the spinner is hidden and page scrolls to top once the page and iframe content is fully loaded
window.onload = function () {
    hideLoadingSpinner();
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Ensure scrolling to top after iframe content is loaded
    const iframe = document.querySelectorAll('iframe');
    iframe.forEach(frame => {
        frame.onload = function () {
            document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    });
};


// Toggle the sidebar between collapsed and expanded state
function expandSidebar() {
    const sidePanel = document.getElementById('side-panel');
    sidePanel.classList.add('expanded');
}

function collapseSidebar() {
    const sidePanel = document.getElementById('side-panel');
    sidePanel.classList.remove('expanded');
}


function toggleSubAnalysis(sectionId) {
    const allSubAnalyses = document.querySelectorAll('.sub-analysis-collapsible');
    const allArrows = document.querySelectorAll('.collapsible-header .arrow');

    // Get the current sub-analysis and arrow for the clicked section
    const subAnalysis = document.getElementById(`sub-${sectionId}`);
    const arrow = document.querySelector(`#sub-${sectionId}`).previousElementSibling.querySelector('.arrow');

    // Prevent further actions if the section is currently being animated
    if (subAnalysis.isAnimating) return;

    // If the clicked section is already expanded, collapse it and reset arrow
    if (subAnalysis.classList.contains('show')) {
        collapseSection(subAnalysis, arrow);
        return;  // No need to expand anything else
    }

    // Collapse all sections first before expanding the new one
    allSubAnalyses.forEach(sub => {
        if (sub.classList.contains('show')) {
            collapseSection(sub, sub.previousElementSibling.querySelector('.arrow'));
        }
    });

    // Expand the clicked section
    expandSection(subAnalysis, arrow);
}

// Function to expand a section
function expandSection(section, arrow) {
    section.isAnimating = true; // Set animating state
    section.style.display = 'block'; // Make it visible
    section.classList.add('show');

    // Set consistent spacing during animation
    section.style.marginBottom = '10px';
    section.style.padding = '10px 0 10px 20px'; // Adjust padding

    // Use setTimeout to allow display: block to take effect before expanding
    setTimeout(() => {
        section.style.maxHeight = section.scrollHeight + 'px'; // Expand to fit content
        section.style.opacity = '1';  // Show content smoothly
    }, 10); 

    // Rotate arrow to indicate expansion
    arrow.style.transform = 'rotate(90deg)';  // Rotate arrow

    // Remove animating state after animation completes
    setTimeout(() => {
        section.isAnimating = false;
    }, 500);  // The delay should match the CSS transition time
}   

// Function to collapse a section
function collapseSection(section, arrow) {
    section.isAnimating = true; // Set animating state
    section.style.maxHeight = '0px';  // Collapse the section
    section.style.opacity = '0';      // Hide content smoothly
    section.style.padding = '0 0 0 5px'; // Adjust padding to collapse state
    section.style.marginBottom = '10px'; // Remove margin during collapse
    arrow.style.transform = 'rotate(0deg)';  // Reset arrow to right-facing

    // Remove 'show' class and hide after the collapse animation completes
    setTimeout(() => {
        section.classList.remove('show');
        section.style.display = 'none'; // Hide it after animation
        section.style.marginBottom = '10px'; // Reset margin after collapse
        section.isAnimating = false; // Reset animating state
    }, 500);  // The delay should match the CSS transition time
}


// Handle the submit button click event
function handleSubmit() {
    // Collect all checked analysis options
    const checkedAnalysis = [];
    const allCheckboxes = document.querySelectorAll('.sub-analysis-collapsible input[type="checkbox"]:checked:not(#business-overview-all, #digital-diagnostics-insights-all, #campaign-performance-all, #behavioural-segmentation-all, #digital-spend-optimization-all)');
    allCheckboxes.forEach(checkbox => {
        checkedAnalysis.push(checkbox.id);
    });

    // Display a confirmation popup with selected analyses
    if (checkedAnalysis.length > 0) {
        showConfirmationPopup(checkedAnalysis);
    } else {
        alert('No analysis selected. Please select at least one analysis.');
    }
}


// Mapping of sections and their corresponding analysis checkboxes (assuming these are consistent)
const parentDivToSectionMap = {
    'sub-business-overview': 'Business Overview',
    'sub-digital-diagnostics-insights': 'Digital Diagnostics & Insights',
    'sub-campaign-performance': 'Campaign Performance',
    'sub-behavioural-segmentation': 'Behavioural Segmentation',
    'sub-digital-spend-optimization': 'Digital Spend Optimization'
};


// // Show a confirmation popup with selected analyses and options to proceed or cancel
// function showConfirmationPopup(analysisList) {
//     // Create popup structure
//     const popup = document.createElement('div');
//     popup.classList.add('popup-overlay');

//     const popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Add popup heading
//     const popupHeading = document.createElement('h3');
//     popupHeading.innerText = 'Selected Analyses';
//     popupContent.appendChild(popupHeading);

//     // Create an object to hold analyses grouped by section
//     const groupedAnalyses = {};

//     // Group analyses by their parent div section using parentDivToSectionMap
//     analysisList.forEach(analysis => {
//         const parentDivId = getParentDivId(analysis); // Get the parent div ID of the checkbox
//         const sectionName = parentDivToSectionMap[parentDivId] || 'Unknown Section'; // Map to section name

//         if (!groupedAnalyses[sectionName]) {
//             groupedAnalyses[sectionName] = [];
//         }
//         groupedAnalyses[sectionName].push(analysis.replace(/-/g, ' ').toUpperCase()); // Convert to uppercase
//     });

//     // Display grouped analyses in the popup
//     for (const section in groupedAnalyses) {
//         // Add section name as a heading
//         const sectionHeading = document.createElement('h4');
//         sectionHeading.innerText = section;
//         sectionHeading.style.marginTop = '10px'; // Add some spacing above the section
//         popupContent.appendChild(sectionHeading);

//         // Add list of analyses under the section
//         const analysisListElement = document.createElement('ul');
//         groupedAnalyses[section].forEach(analysis => {
//             const listItem = document.createElement('li');
//             listItem.innerText = analysis;
//             analysisListElement.appendChild(listItem);
//         });
//         popupContent.appendChild(analysisListElement);
//     }

//     // Add "Proceed" and "Cancel" buttons
//     const proceedButton = document.createElement('button');
//     proceedButton.innerText = 'Proceed';
//     proceedButton.onclick = () => {
//         processSelectedAnalyses(analysisList);
//         document.body.removeChild(popup);
//     };

//     const cancelButton = document.createElement('button');
//     cancelButton.innerText = 'Cancel';
//     cancelButton.onclick = () => {
//         document.body.removeChild(popup); // Remove the popup if cancelled
//     };

//     // Add buttons to popup content
//     const buttonContainer = document.createElement('div');
//     buttonContainer.classList.add('button-container');
//     buttonContainer.appendChild(proceedButton);
//     buttonContainer.appendChild(cancelButton);

//     popupContent.appendChild(buttonContainer);
//     popup.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popup);
// }




// // Show a confirmation popup with selected analyses and options to proceed or cancel
// function showConfirmationPopup(analysisList) {
//     // Create popup structure
//     const popup = document.createElement('div');
//     popup.classList.add('popup-overlay');

//     const popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Add popup heading
//     const popupHeading = document.createElement('h3');
//     popupHeading.innerText = 'Selected Analyses';
//     popupContent.appendChild(popupHeading);

//     // Create an object to hold analyses grouped by section
//     const groupedAnalyses = {};

//     // Group analyses by their parent div section using parentDivToSectionMap
//     analysisList.forEach(analysis => {
//         const parentDivId = getParentDivId(analysis); // Get the parent div ID of the checkbox
//         const sectionName = parentDivToSectionMap[parentDivId] || 'Unknown Section'; // Map to section name

//         if (!groupedAnalyses[sectionName]) {
//             groupedAnalyses[sectionName] = [];
//         }
//         groupedAnalyses[sectionName].push(analysis.replace(/-/g, ' ').toUpperCase()); // Convert to uppercase
//     });

//     // Display grouped analyses in the popup
//     for (const section in groupedAnalyses) {
//         // Add section name as a heading
//         const sectionHeading = document.createElement('h4');
//         sectionHeading.innerText = section;
//         sectionHeading.style.marginTop = '10px'; // Add some spacing above the section
//         popupContent.appendChild(sectionHeading);

//         // Create a scrollable container for the list of analyses under the section
//         const analysisListContainer = document.createElement('div');
//         analysisListContainer.classList.add('popup-list-container');
//         analysisListContainer.style.maxHeight = '100px'; // Set a maximum height for each section's list
//         analysisListContainer.style.overflowY = 'auto'; // Enable vertical scrolling

//         // Add list of analyses under the section
//         const analysisListElement = document.createElement('ul');
//         groupedAnalyses[section].forEach(analysis => {
//             const listItem = document.createElement('li');
//             listItem.innerText = analysis;
//             analysisListElement.appendChild(listItem);
//         });
//         analysisListContainer.appendChild(analysisListElement);

//         // Append the scrollable container to the popup content
//         popupContent.appendChild(analysisListContainer);
//     }

//     // Add "Proceed" and "Cancel" buttons
//     const proceedButton = document.createElement('button');
//     proceedButton.innerText = 'Proceed';
//     proceedButton.onclick = () => {
//         processSelectedAnalyses(analysisList);
//         document.body.removeChild(popup);
//     };

//     const cancelButton = document.createElement('button');
//     cancelButton.innerText = 'Cancel';
//     cancelButton.onclick = () => {
//         document.body.removeChild(popup); // Remove the popup if cancelled
//     };

//     // Add buttons to a container to ensure they are always at the bottom
//     const buttonContainer = document.createElement('div');
//     buttonContainer.classList.add('button-container');
//     buttonContainer.style.display = 'flex';
//     buttonContainer.style.justifyContent = 'space-between';
//     buttonContainer.style.marginTop = '20px'; // Spacing between content and buttons

//     buttonContainer.appendChild(proceedButton);
//     buttonContainer.appendChild(cancelButton);

//     // Append the button container to the popup content
//     popupContent.appendChild(buttonContainer);
//     popup.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popup);
// }




// // Show a confirmation popup with selected analyses and options to proceed or cancel
// function showConfirmationPopup(analysisList) {
//     // Create popup structure
//     const popup = document.createElement('div');
//     popup.classList.add('popup-overlay');

//     const popupContent = document.createElement('div');
//     popupContent.classList.add('popup-content');

//     // Add popup heading
//     const popupHeading = document.createElement('h3');
//     popupHeading.innerText = 'Selected Analyses';
//     popupContent.appendChild(popupHeading);

//     // Create a scrollable container for all analyses
//     const analysisListContainer = document.createElement('div');
//     analysisListContainer.classList.add('popup-analysis-container');  // New container for all analyses
//     analysisListContainer.style.maxHeight = '300px'; // Limit the height of the analysis container
//     analysisListContainer.style.overflowY = 'auto'; // Enable scrolling for the container

//     // Create an object to hold analyses grouped by section
//     const groupedAnalyses = {};

//     // Group analyses by their parent div section using parentDivToSectionMap
//     analysisList.forEach(analysis => {
//         const parentDivId = getParentDivId(analysis); // Get the parent div ID of the checkbox
//         const sectionName = parentDivToSectionMap[parentDivId] || 'Unknown Section'; // Map to section name

//         if (!groupedAnalyses[sectionName]) {
//             groupedAnalyses[sectionName] = [];
//         }
//         groupedAnalyses[sectionName].push(analysis.replace(/-/g, ' ').toUpperCase()); // Convert to uppercase
//     });

//     // Display grouped analyses in the scrollable container
//     for (const section in groupedAnalyses) {
//         // Add section name as a heading
//         const sectionHeading = document.createElement('h4');
//         sectionHeading.innerText = section;
//         sectionHeading.style.marginTop = '10px'; // Add some spacing above the section
//         analysisListContainer.appendChild(sectionHeading);

//         // Add list of analyses under the section
//         const analysisListElement = document.createElement('ul');
//         groupedAnalyses[section].forEach(analysis => {
//             const listItem = document.createElement('li');
//             listItem.innerText = analysis;
//             analysisListElement.appendChild(listItem);
//         });
//         analysisListContainer.appendChild(analysisListElement);
//     }

//     // Add the scrollable container to the popup content
//     popupContent.appendChild(analysisListContainer);

//     // Add "Proceed" and "Cancel" buttons
//     const proceedButton = document.createElement('button');
//     proceedButton.innerText = 'Proceed';
//     proceedButton.onclick = () => {
//         processSelectedAnalyses(analysisList);
//         document.body.removeChild(popup);
//     };

//     const cancelButton = document.createElement('button');
//     cancelButton.innerText = 'Cancel';
//     cancelButton.onclick = () => {
//         document.body.removeChild(popup); // Remove the popup if cancelled
//     };

//     // Add buttons to a container to ensure they are always visible
//     const buttonContainer = document.createElement('div');
//     buttonContainer.classList.add('button-container');
//     buttonContainer.style.display = 'flex';
//     buttonContainer.style.justifyContent = 'space-between';
//     buttonContainer.style.position = 'relative'; // Position relative to ensure alignment
//     buttonContainer.style.padding = '10px 0'; // Add some padding to the button container

//     buttonContainer.appendChild(proceedButton);
//     buttonContainer.appendChild(cancelButton);

//     // Append the button container to the popup content
//     popupContent.appendChild(buttonContainer);

//     // Set the maximum height for the popup and allow overflow scrolling for the content area
//     popupContent.style.maxHeight = '500px'; // Set a maximum height for the popup content
//     popupContent.style.overflowY = 'auto'; // Allow scrolling within the popup content area

//     popup.appendChild(popupContent);

//     // Append the popup to the body
//     document.body.appendChild(popup);
// }




// // Utility function to convert a string to title case
// function toTitleCase(str) {
//     return str.replace(/\w\S*/g, function(txt) {
//         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//     });
// }


// Helper function to convert a string to Title Case and handle abbreviations
function toTitleCaseWithAbbreviations(str) {
    // List of known abbreviations to be fully capitalized
    const abbreviations = ["RF", "FM", "KPIS"];

    // Split the string into words, check if each word is an abbreviation, and convert accordingly
    return str.split(' ').map(word => {
        // Convert known abbreviations to uppercase
        if (abbreviations.includes(word.toUpperCase())) {
            return word.toUpperCase();
        }
        // Capitalize the first letter and convert the rest to lowercase (Title Case)
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}


// Show a confirmation popup with selected analyses and options to proceed or cancel
function showConfirmationPopup(analysisList) {
    // Create popup structure
    const popup = document.createElement('div');
    popup.classList.add('popup-overlay');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    // // Add close button ('x')
    // const closeButton = document.createElement('button');
    // closeButton.innerHTML = '&times;'; // HTML entity for 'x'
    // closeButton.classList.add('popup-close-button');
    // closeButton.onclick = () => document.body.removeChild(popup); // Remove the popup when clicked

    // // Add the close button to popup content
    // popupContent.appendChild(closeButton);

    // Add popup heading
    const popupHeading = document.createElement('h3');
    popupHeading.innerText = 'Selected Analyses';
    popupContent.appendChild(popupHeading);

    // Create an object to hold analyses grouped by section
    const groupedAnalyses = {};

    // Group analyses by their parent div section using parentDivToSectionMap
    analysisList.forEach(analysis => {
        const parentDivId = getParentDivId(analysis); // Get the parent div ID of the checkbox
        const sectionName = parentDivToSectionMap[parentDivId] || 'Unknown Section'; // Map to section name

        if (!groupedAnalyses[sectionName]) {
            groupedAnalyses[sectionName] = [];
        }
        // Use toTitleCaseWithAbbreviations function to format analysis names
        groupedAnalyses[sectionName].push(toTitleCaseWithAbbreviations(analysis.replace(/-/g, ' ')));
    });

    // Display grouped analyses in the popup
    for (const section in groupedAnalyses) {
        // Add section name as a heading
        const sectionHeading = document.createElement('h4');
        sectionHeading.innerText = section;
        sectionHeading.style.marginTop = '10px'; // Add some spacing above the section
        popupContent.appendChild(sectionHeading);

        // Add list of analyses under the section
        const analysisListElement = document.createElement('ul');
        groupedAnalyses[section].forEach(analysis => {
            const listItem = document.createElement('li');
            listItem.innerText = analysis;
            analysisListElement.appendChild(listItem);
        });
        popupContent.appendChild(analysisListElement);
    }

    // Add "Proceed" and "Cancel" buttons
    const proceedButton = document.createElement('button');
    proceedButton.innerText = 'Proceed';
    proceedButton.onclick = () => {
        processSelectedAnalyses(analysisList);
        document.body.removeChild(popup);
    };

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.onclick = () => {
        document.body.removeChild(popup); // Remove the popup if cancelled
    };

    // Add buttons to popup content
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    buttonContainer.appendChild(proceedButton);
    buttonContainer.appendChild(cancelButton);

    popupContent.appendChild(buttonContainer);
    popup.appendChild(popupContent);

    // Append the popup to the body
    document.body.appendChild(popup);
}


// Process the selected analyses
function processSelectedAnalyses(selectedAnalyses) {
    // Loop through each selected analysis and trigger the chart display
    selectedAnalyses.forEach(analysisId => {
        toggleChartNew(analysisId);
    });
}


// Helper function to determine the section name from the analysis ID
function getParentDivId(analysisId) {
    // Find the checkbox element by its ID
    const checkbox = document.getElementById(analysisId);
    if (checkbox) {
        // Traverse up the DOM to find the parent with class 'sub-analysis-collapsible'
        const parentDiv = checkbox.closest('.sub-analysis-collapsible');
        if (parentDiv) {
            return parentDiv.id; // Return the ID of the parent div (e.g., 'sub-business-overview')
        }
    }
    return 'Unknown Section'; // Fallback if parent div is not found
}


// Function to hide a chart
function hideChart(chartId) {
    const chartElement = document.getElementById(`chart-${chartId}`);
    if (chartElement) {
        chartElement.remove();  // Remove the chart element if it exists
    }

    // Ensure the checkbox is unchecked (useful if called separately)
    const checkbox = document.getElementById(chartId);
    if (checkbox) {
        checkbox.checked = false;  // Uncheck the checkbox in the DOM
    }
}


// Update the toggleAllNew function to only change checkbox states
function toggleAllNew(section) {
    const checkboxes = document.querySelectorAll(`#sub-${section} input[type="checkbox"]:not(#${section}-all)`);
    const allChecked = document.getElementById(`${section}-all`).checked;

    // Update checkbox states without displaying charts
    checkboxes.forEach(checkbox => {
        checkbox.checked = allChecked;

        // If "All" is unchecked, hide all related charts
        if (!allChecked) {
            // Call hideChart() for each checkbox to remove the charts
            hideChart(checkbox.id);
        }
    });
}


// Modify the toggleChartNew function to not show the charts on checkbox clicks
function toggleChartNew(chartId) {
    const chartContainer = document.getElementById('chart-container-new');
    const chartElement = document.getElementById(`chart-${chartId}`);

    // Display chart only if it's called through processSelectedAnalyses
    if (!chartElement) {
        // Show the spinner while the chart is loading
        showLoadingSpinner();
        // Create a new iframe for the chart if it doesn't exist
        const newChart = document.createElement('iframe');
        newChart.id = `chart-${chartId}`;
        newChart.src = `/get_chart/${chartId}`;
        newChart.style.width = "100%";
        newChart.style.border = "none";
        chartContainer.appendChild(newChart);
        // Adjust the iframe height dynamically
        adjustIframeHeight(newChart);
    }
}

// Modify the event listeners for individual checkboxes to not call toggleChartNew directly
const individualCheckboxes = document.querySelectorAll('.sub-analysis-collapsible input[type="checkbox"]:not(#business-overview-all, #digital-diagnostics-insights-all, #campaign-performance-all, #behavioural-segmentation-all, #digital-spend-optimization-all)');
individualCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        // Update the state of the checkbox without showing the chart
        const chartId = checkbox.id;
        const chartElement = document.getElementById(`chart-${chartId}`);
        if (chartElement && !checkbox.checked) {
            // Remove the chart if checkbox is unchecked and the chart is displayed
            chartElement.remove();
        }
    });
});

// Adjust iframe Height
function adjustIframeHeight(iframe) {
    // Get the content of the iframe and adjust its height dynamically
    iframe.onload = function () {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const body = iframeDocument.body;
        iframe.style.height = body.scrollHeight + 'px';  // Adjust height based on content
        iframe.style.overflow = 'hidden';
        // Hide spinner once the iframe content is fully loaded
        hideLoadingSpinner();
    };
}
