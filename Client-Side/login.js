// Signup Form Submission
document
  .getElementById("signup-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    //  signup AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "Signup-endpoint-url", true);
    xhr.setRequestHeader("content-type", "application/x-www-form-urlendcoded");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // signup is successful
        } else {
          // signup failed
          var errorMessage = document.createElement("div");
          errorMessage.className = "error-message";
          errorMessage.textContent = "Signup failed" + xhr.statusText;
          document
            .getElementById("signup-form")
            .insertBefore(
              errorMessage,
              document.getElementById("signup-form").firstChild
            );
        }
      }
    };
    xhr.send(
      "username=" +
        encodeURIComponent(username) +
        "password" +
        encodeURIComponent(password)
    );
  });

//   Login Form Submission
document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Perform login AJAX request here
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "login-endpoint-url", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Login successful
        } else {
          // Login failed
          var errorMessage = document.createElement("div");
          errorMessage.className = "error-message";
          errorMessage.textContent = "Login failed: " + xhr.statusText;
          document
            .getElementById("login-form")
            .insertBefore(
              errorMessage,
              document.getElementById("login-form").firstChild
            );
        }
      }
    };
    xhr.send(
      "username=" +
        encodeURIComponent(username) +
        "&password=" +
        encodeURIComponent(password)
    );
  });

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

// // Login Form Submission
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
