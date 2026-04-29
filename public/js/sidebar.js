let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

// Restore sidebar state from localStorage on page load
if (sidebar) {
  const sidebarState = localStorage.getItem("sidebarState");
  if (sidebarState === "open") {
    sidebar.classList.add("open");
  } else {
    sidebar.classList.remove("open");
  }
  menuBtnChange();
}

if (closeBtn && sidebar) {
  closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    // Save current state to localStorage
    if (sidebar.classList.contains("open")) {
      localStorage.setItem("sidebarState", "open");
    } else {
      localStorage.setItem("sidebarState", "closed");
    }
    menuBtnChange();
  });
}

if (searchBtn && sidebar) {
  searchBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (sidebar.classList.contains("open")) {
      localStorage.setItem("sidebarState", "open");
    } else {
      localStorage.setItem("sidebarState", "closed");
    }
    menuBtnChange();
  });
}

function menuBtnChange() {
  if (sidebar && closeBtn) {
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  }
}


