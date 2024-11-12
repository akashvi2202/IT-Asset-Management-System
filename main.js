
document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(event.target);
    const category = formData.get('category');

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displaySearchResults(data);
    } catch (error) {
        console.error('Error:', error);
    }
});

function displaySearchResults(data) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Example: Display data in a simple list format
    data.forEach(item => {
        const listItem = document.createElement('div');
        listItem.textContent = JSON.stringify(item); // Adjust based on your data structure
        resultsContainer.appendChild(listItem);
    });
}
