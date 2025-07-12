/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - OpenAI API integration */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Get the user's message directly from the input element */
  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  /* Check if message is empty */
  if (!userMessage || userMessage === "") {
    chatWindow.innerHTML = "Please enter a message.";
    return;
  }

  /* Show loading message while waiting for API response */
  chatWindow.innerHTML = "Getting AI response...";

  try {
    /* Make request to OpenAI API endpoint */
    /*   const response = await fetch(
      "https://floral-leaf-ef4f.rneha2729.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful L'Oréal beauty and skincare advisor. Help users with product recommendations and routine building.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );
*/
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    /* Check if the response is ok */
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    /* Parse the JSON response from the API */
    const data = await response.json();

    /* Check if we got a valid response structure */
    if (data.choices && data.choices[0] && data.choices[0].message) {
      /* Display the AI's response in the chat window */
      chatWindow.innerHTML = `
        <div class="chat-message user-message">
          <strong>You:</strong> ${userMessage}
        </div>
        <div class="chat-message ai-message">
          <strong>AI Assistant:</strong> ${data.choices[0].message.content}
        </div>
      `;
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    /* Show detailed error message for debugging */
    console.error("Full error details:", error);
    chatWindow.innerHTML = `
      <div class="error-message">
        Sorry, there was an error getting a response. Please try again.
        <br><small>Error: ${error.message}</small>
      </div>
    `;
  }

  /* Clear the form input after submission */
  userInput.value = "";
});
