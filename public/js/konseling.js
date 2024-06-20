const counselors = {
  "Konsultasi Kerja dan Pengaduan 1": {
    profileImage: "/images/profil_DEFRINA.jpg",
    info: "Nama : Ferdianto Wido Utomo, S.M <br> Umur : 30. <br> Bidang Konseling: Mayat Mati",
  },
  "Konsultasi Kerja dan Pengaduan 2": {
    profileImage: "/images/profil_Siti.jpg",
    info: "Jane memiliki latar belakang dalam psikologi dan telah bekerja sebagai konselor selama lebih dari 10 tahun.",
  },
  "Konsultasi Kerja dan Pengaduan 3": {
    profileImage: "/images/profil_suprayitna.jpg",
    info: "Jane memiliki latar belakang dalam psikologi dan telah bekerja sebagai konselor selama lebih dari 10 tahun.",
  },
  "Konsultasi Kerja": {
    profileImage: "/images/profil_Ferdianto.jpg",
    info: "Jane memiliki latar belakang dalam psikologi dan telah bekerja sebagai konselor selama lebih dari 10 tahun.",
  },
};

const counselorsContainer = document.getElementById("counselors");
const counselorInfoContainer = document.getElementById("counselorInfo");

// Add profile images with custom size and style
Object.keys(counselors).forEach((counselor) => {
  const counselorDiv = document.createElement("div");
  counselorDiv.className = "chat-entry";
  counselorDiv.textContent = counselor;

  // Add profile image to counselorDiv with custom size and style
  const profileImg = document.createElement("img");
  profileImg.src = counselors[counselor].profileImage;
  profileImg.alt = counselor;
  profileImg.style.width = "200px"; // Set custom width
  profileImg.style.height = "200px"; // Set custom height
  profileImg.style.borderRadius = "10%"; // Add rounded corners
  profileImg.style.display = "block"; // Set image display to block for center alignment
  profileImg.style.margin = "0 auto"; // Center the image horizontally
  counselorDiv.appendChild(profileImg);

  counselorDiv.onclick = function () {
    displayCounselorInfo(counselor);
  };
  counselorsContainer.appendChild(counselorDiv);
});

function displayCounselorInfo(counselor) {
  counselorInfoContainer.innerHTML = ""; // Bersihkan informasi sebelumnya
  const infoDiv = document.createElement("div");
  infoDiv.className = "chat-entry";
  infoDiv.innerHTML = counselors[counselor].info; // Tampilkan informasi konselor

  // Membuat tombol WhatsApp
  const whatsappButton = document.createElement("a");
  whatsappButton.href =
    "https://wa.me/+628973199492?text=Halo, saya membutuhkan bantuan konseling.";
  whatsappButton.className = "whatsapp-button";
  whatsappButton.target = "_blank";
  whatsappButton.textContent = "Hubungi via WhatsApp";
  whatsappButton.style =
    "text-decoration: none; color: white; background-color: #25D366; padding: 10px 20px; border-radius: 5px; display: block; margin-top: 10px;";

  infoDiv.appendChild(whatsappButton);
  counselorInfoContainer.appendChild(infoDiv); // Tambahkan infoDiv ke counselorInfoContainer
}

