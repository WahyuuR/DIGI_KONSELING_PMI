const counselors = {
  "John Doe": "John adalah konselor berpengalaman dengan spesialisasi dalam karir dan pengembangan pribadi.",
  "Jane Smith": "Jane memiliki latar belakang dalam psikologi dan telah bekerja sebagai konselor selama lebih dari 10 tahun."
};

const counselorsContainer = document.getElementById("counselors");
const counselorInfoContainer = document.getElementById("counselorInfo");

Object.keys(counselors).forEach((counselor) => {
  const counselorDiv = document.createElement("div");
  counselorDiv.className = "chat-entry";
  counselorDiv.textContent = counselor;
  counselorDiv.onclick = function () {
    displayCounselorInfo(counselor);
  };
  counselorsContainer.appendChild(counselorDiv);
});

function displayCounselorInfo(counselor) {
  counselorInfoContainer.innerHTML = ""; // Bersihkan informasi sebelumnya
  const infoDiv = document.createElement("div");
  infoDiv.className = "chat-entry";
  infoDiv.innerHTML = counselors[counselor]; // Tampilkan informasi konselor

  // Membuat tombol WhatsApp
  const whatsappButton = document.createElement("a");
  whatsappButton.href = "https://wa.me/+628973199492?text=Halo, saya membutuhkan bantuan konseling.";
  whatsappButton.className = "whatsapp-button";
  whatsappButton.target = "_blank";
  whatsappButton.textContent = "Hubungi via WhatsApp";
  whatsappButton.style = "text-decoration: none; color: white; background-color: #25D366; padding: 10px 20px; border-radius: 5px; display: block; margin-top: 10px;";

  infoDiv.appendChild(whatsappButton);
  counselorInfoContainer.appendChild(infoDiv); // Tambahkan infoDiv ke counselorInfoContainer
}
