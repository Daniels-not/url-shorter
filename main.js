const shortURLsWrapper = document.querySelector(".url-shorten-results");
const shortUrlForm = document.querySelector("#url-shorten-form");
const submitButton = shortUrlForm.querySelector("button");
const input = shortUrlForm.querySelector(".url-input");
const alertMessage = shortUrlForm.querySelector(".alert");

// Build Short URL HTML Structure
function generatedShortUrlHtml(id, originalURL, shortUrl) {
  const newUrlElement = document.createElement("div");
  newUrlElement.classList.add("url-shorten-result");
  newUrlElement.id = id;

  newUrlElement.innerHTML = `
    <div class="old-url">
      <p><a href="${originalURL}" target="_blank">${originalURL}</a></p>
    </div>
    <div class="new-url">
      <p><a href="${shortUrl}" target="_blank">${shortUrl}</a></p>
      <div class="options">
        <button type="button" class="copy-new-url btn btn-sm scale-effect">
          copy
        </button>
        <button type="button" class="delete-url scale-effect">
          <i class="fa-regular fa-trash-can icon"></i>
        </button>
      </div>
    </div>
  `;

  newUrlElement.querySelector(".delete-url").addEventListener("click", () => {
    removeURL(id);
  });

  newUrlElement.querySelector(".copy-new-url").addEventListener("click", () => {
    copyURL(newUrlElement.querySelector(".new-url p").textContent);
  });

  shortURLsWrapper.appendChild(newUrlElement);
  removeAllGeneratedURLs();
}

// Add Delete Button at the End of the Generated Links
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

// Add Remove All Generated URLs
function addRemoveAllGeneratedURLs() {
  if (shortURLsWrapper.querySelectorAll(".url-shorten-result").length >= 2) {
    const deleteAllButton = document.createElement("button");
    deleteAllButton.type = "button";
    deleteAllButton.classList.add("btn", "btn-sm", "delete-all-urls", "scale-effect");
    deleteAllButton.textContent = "delete all";
    deleteAllButton.addEventListener("click", () => {
      removeAllGeneratedURLs();
    });

    if (shortURLsWrapper.querySelector(".delete-all-urls")) {
      shortURLsWrapper.replaceChild(deleteAllButton, shortURLsWrapper.querySelector(".delete-all-urls"));
    } else {
      insertAfter(deleteAllButton, shortURLsWrapper.lastElementChild);
    }
  } else {
    const deleteAllButton = shortURLsWrapper.querySelector(".delete-all-urls");
    if (deleteAllButton) {
      deleteAllButton.remove();
    }
  }
}

// Remove Single URL
function removeURL(id) {
  const urlElement = document.getElementById(id);
  urlElement.remove();
  savedURLs = savedURLs.filter((url) => url.id !== id);
  localStorage.setItem("saved", JSON.stringify(savedURLs));
  addRemoveAllGeneratedURLs();
}

// Copy URL
function copyURL(urlText) {
  const tempTextArea = document.createElement("textarea");
  document.body.appendChild(tempTextArea);
  tempTextArea.value = urlText;
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

// Generate Random IDs
function randomIds() {
  const currentTime = Date.now();
  const currentTimeString = currentTime.toString(32).slice(0, 8);
  const randomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString().slice(0, 4);
  return `${currentTimeString}-${randomNumber}`;
}

// shrtcode API
async function makeShortURL(userUrl) {
  const apiBaseURL = "https://api.shrtco.de/v2/";
  const shortenQuery = `shorten?url=`;
  const fetchLink = `${apiBaseURL}${shortenQuery}${userUrl}`;

  try {
    const response = await fetch(fetchLink);
    const data = await response.json();
    const status = data.ok;

    if (status) {
      const originalURL = data.result.original_link;
      const shortUrl = data.result.full_short_link;
      const generatedURL = {
        id: randomIds(),
        originalURL: originalURL,
        shortUrl: shortUrl
      };
      shortUrlForm.classList.add("success");
      submitButton.innerHTML = `<i class="fa-solid fa-check icon"></i> shortened!`;
      setTimeout(() => {
        shortUrlForm.classList.remove("success");
        submitButton.innerHTML = "shorten it!";
      }, 1700);
      generatedShortUrlHtml(generatedURL.id, generatedURL.originalURL, generatedURL.shortUrl);
      savedURLs.push(generatedURL);
      localStorage.setItem("saved", JSON.stringify(savedURLs));
    } else {
      submitButton.innerHTML = "shorten it!";
      const errorCode = data.error_code;
      switch (errorCode) {
        case 1:
          alerts("Please add a link first");
          break;
        case 2:
          alerts(`${data.error.split(",")[0]}, Please check your link again.`);
          break;
        case 10:
          alerts("The link you entered is not allowed to be shortened.");
          break;
        default:
          alerts(data.error);
      }
    }
  } catch (error) {
    alerts("Sorry, an unknown error occurred. Please try again later.");
  }
}

shortUrlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = input.value.trim().replace(/\s+/g, "");
  submitButton.innerHTML = `<i class="fa-solid fa-spinner icon fa-spin"></i> Generating...`;
  makeShortURL(inputValue);
  shortUrlForm.reset();
});

// Show Alerts
function alerts(message) {
  shortUrlForm.classList.add("empty");
  alertMessage.textContent = message;

  setTimeout(() => {
    shortUrlForm.classList.remove("empty");
  }, 5000);
}

// Expand Header Navigation Function
function expandNavigation() {
  const navigation = document.querySelector(".header .main-navigation");
  const toggleMenu = document.querySelector(".header .burger-menu");
  const icon = toggleMenu.querySelector(".icon");
  let closed = true;

  toggleMenu.addEventListener("click", () => {
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
    navigation.style.height = closed ? `${navigation.scrollHeight}px` : "";
    closed = !closed;
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
      navigation.style.height = "";
      closed = true;
    }
  });
}

expandNavigation();
