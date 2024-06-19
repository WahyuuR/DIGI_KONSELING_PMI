document.addEventListener("DOMContentLoaded", function () {
  function loadComponent(componentId, file) {
    fetch(file)
      .then((response) => response.text())
      .then((data) => {
        document.getElementById(componentId).innerHTML = data;
      })
      .catch((error) => console.error("Error:", error));
  }
  loadComponent("nav", "/components/navbar.html");
  loadComponent("footer", "/components/footer.html");
});
