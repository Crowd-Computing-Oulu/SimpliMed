// Signup Form Submission
// document
//   .getElementById("signup-form")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     const username = document.getElementById("signup-username").value;
//     const password = document.getElementById("signup-password").value;

// const { exists } = require("../Server-Side/models/abstract");

//     //  signup AJAX request
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "Signup-endpoint-url", true);
//     xhr.setRequestHeader("content-type", "application/x-www-form-urlendcoded");
//     xhr.onreadystatechange = function () {
//       if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//           // signup is successful
//         } else {
//           // signup failed
//           var errorMessage = document.createElement("div");
//           errorMessage.className = "error-message";
//           errorMessage.textContent = "Signup failed" + xhr.statusText;
//           document
//             .getElementById("signup-form")
//             .insertBefore(
//               errorMessage,
//               document.getElementById("signup-form").firstChild
//             );
//         }
//       }
//     };
//     xhr.send(
//       "username=" +
//         encodeURIComponent(username) +
//         "password" +
//         encodeURIComponent(password)
//     );
//   });

// //   Login Form Submission
// document
//   .getElementById("login-form")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     const username = document.getElementById("login-username").value;
//     const password = document.getElementById("login-password").value;

//     // Perform login AJAX request here
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "login-endpoint-url", true);
//     xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//     xhr.onreadystatechange = function () {
//       if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//           // Login successful
//         } else {
//           // Login failed
//           var errorMessage = document.createElement("div");
//           errorMessage.className = "error-message";
//           errorMessage.textContent = "Login failed: " + xhr.statusText;
//           document
//             .getElementById("login-form")
//             .insertBefore(
//               errorMessage,
//               document.getElementById("login-form").firstChild
//             );
//         }
//       }
//     };
//     xhr.send(
//       "username=" +
//         encodeURIComponent(username) +
//         "&password=" +
//         encodeURIComponent(password)
//     );
//   });

//     $.ajax({
//       // ...
//       error: function (xhr, status, error) {
//         // Handle error response and display error message
//         $("#signup-form .error-message").remove(); // Remove any existing error messages
//         var errorMessage = $("<div>", {
//           class: "error-message",
//           text: "Signup failed: " + error,
//         });
//         $("#signup-form").prepend(errorMessage);
//       },
//     });
//   });

// Login Form Submission
chrome.storage.local.get("accessToken", function (data) {
  console.log("access token retreived from the chrome storage");
  // If the token already exist hide the login-in page
  if (data.accessToken) {
    // the token should be validated (how?) and deleted if it is wrong to generate another one
    // chrome.storage.local.remove("accessToken", function() {
    //   console.log("accessToken removed from storage");
    // });
    // console.log("type of access toekn is", typeof data.accessToken);
    document.getElementById("login-container").classList.add("hidden");
  } else {
    // If token doesnt exists, user need to log in
    console.log("access token doesnt exist");
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;
        console.log("user submited");
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        };
        try {
          var response = await fetch(
            "http://localhost:8080/users/login",
            options
          );
          response = await response.json();
          response = response.choices[0].message.content.trim();
        } catch (error) {
          console.log(error);
        }
        chrome.storage.local.set(
          { accessToken: response.accessToken },
          function () {
            console.log("access token saved successfully!");
          }
        );

        console.log("this is the access token", response.accessToken);
        console.log(response);
      });
  }
});

// $("#login-form").submit(function (event) {
//   event.preventDefault();
//   const username = document.getElementById("login-username").value;
//   const password = document.getElementById("login-username").value;

//   // Perform login AJAX request here
//   $.ajax({
//     // ...
//     error: function (xhr, status, error) {
//       // Handle error response and display error message
//       $("#login-form .error-message").remove(); // Remove any existing error messages
//       var errorMessage = $("<div>", {
//         class: "error-message",
//         text: "Login failed: " + error,
//       });
//       $("#login-form").prepend(errorMessage);
//     },
//   });
// });

var ratingPilotForm = document.getElementById("ratingPilotForm");

// Function to handle form submission
function handleSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Get the slider values for each section
  var section1Value = document.querySelector("input[name=section1Value]").value;
  // var section2Value = document.querySelector("input[name=section2Value]").value;
  // var section3Value = document.querySelector("input[name=section3Value]").value;

  // Display the selected values
  console.log("Section 1 value: " + section1Value);
  // console.log("Section 2 value: " + section2Value);
  // console.log("Section 3 value: " + section3Value);

  // You can perform further actions with the selected values here

  // Reset the form
  // ratingPilotForm.reset();
}

// Add form submit event listener
ratingPilotForm.addEventListener("submit", handleSubmit);
