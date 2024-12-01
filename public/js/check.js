function checkNumber(input) {
    const value = input.value;
  
    // Check if the value is empty or contains non-numeric characters
    if (value === "" || !/^\d+$/.test(value)) {
      // Show the invalid feedback message
      const invalidFeedback = input.parentElement.querySelector(".invalid-feedback");
      invalidFeedback.textContent = "Please enter a number";
      input.classList.add("is-invalid");
    } else {
      // Hide the invalid feedback message
      const invalidFeedback = input.parentElement.querySelector(".invalid-feedback");
      invalidFeedback.textContent = "";
      input.classList.remove("is-invalid");
    }
  }
  
  // Get the input element by its ID
  const priceInput = document.getElementById("floatingPrice");
  
  // Attach the checkNumber function to the input's 'input' event
  priceInput.addEventListener("input", () => checkNumber(priceInput));