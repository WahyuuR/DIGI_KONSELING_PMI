const questionsAndAnswers = {
  "Verifikasi data kependudukan":
    "Berkas yang diperlukan: <br>1. Ektp <br>2. kk<br>3. id siap kerja<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
};

const questionsContainer = document.getElementById("questions");
const answersContainer = document.getElementById("answers");

// WhatsApp number is controlled by admin (file-based) via /wa-config.
const WA_KEY = "loket3_verifikasi_data";
const WA_DEFAULT_PHONE = "+6282141040084";
let waPhone = WA_DEFAULT_PHONE;
let waMessage = "Halo, saya membutuhkan informasi lebih lanjut.";

fetch("/wa-config")
  .then((r) => r.json())
  .then((cfg) => {
    if (cfg && cfg[WA_KEY]) waPhone = cfg[WA_KEY];
    if (cfg && cfg.waMessage) waMessage = cfg.waMessage;
  })
  .catch(() => {});

function buildWaHref(phone) {
  const msg = encodeURIComponent(waMessage || "Halo, saya membutuhkan informasi lebih lanjut.");
  return `https://wa.me/${String(phone || "").trim()}?text=${msg}`;
}

Object.keys(questionsAndAnswers).forEach((question) => {
  const questionDiv = document.createElement("div");
  questionDiv.className = "chat-entry";
  questionDiv.textContent = question;
  questionDiv.onclick = function () {
    displayAnswer(question);
  };
  questionsContainer.appendChild(questionDiv);
});

function displayAnswer(question) {
  answersContainer.innerHTML = ""; // Bersihkan jawaban sebelumnya
  const answerDiv = document.createElement("div");
  answerDiv.className = "chat-entry";
  answerDiv.style.position = "relative"; // Menetapkan posisi relatif pada container jawaban
  answerDiv.style.paddingBottom = "55px"; // Menambahkan padding di bagian bawah untuk tombol

  // Menambahkan jawaban ke dalam answerDiv
  const answerText = document.createElement("div");
  answerText.innerHTML = questionsAndAnswers[question]; // Menggunakan innerHTML untuk memformat teks sebagai HTML
  answerDiv.appendChild(answerText);

  // Membuat tombol WhatsApp
  const whatsappButton = document.createElement("a");
  whatsappButton.href = buildWaHref(waPhone);
  whatsappButton.className = "whatsapp-button";
  whatsappButton.target = "_blank";
  whatsappButton.textContent = "Hubungi via WhatsApp";
  whatsappButton.style.textDecoration = "none";
  whatsappButton.style.color = "white";
  whatsappButton.style.backgroundColor = "#25D366";
  whatsappButton.style.padding = "10px 20px";
  whatsappButton.style.borderRadius = "5px";
  whatsappButton.style.position = "absolute"; // Menetapkan posisi absolut pada tombol
  whatsappButton.style.bottom = "10px"; // 10px dari bawah container
  whatsappButton.style.right = "10px"; // 10px dari kanan container

  answerDiv.appendChild(whatsappButton);
  answersContainer.appendChild(answerDiv);
}
