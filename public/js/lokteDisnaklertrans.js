const questionsAndAnswers = {
  "Pembuatan Paspor":
    "Dokumen yang Diperlukan:<br>1. Kartu Tanda Penduduk (KTP) <br>2. Kartu Keluarga (KK) <br>3. Akte Kelahiran atau dokumen pengganti yang sah <br>4. Pas foto berwarna terbaru ukuran 4x6 cm  <br>5. Bukti pembayaran biaya pembuatan paspor",
  "Layanan Edit Data PMI":
    "Prosedur dan Berkas yang Diperlukan:<br>1. Mengisi formulir permohonan perubahan data.<br>2. Menyertakan fotokopi KTP.<br>3. Menyertakan fotokopi paspor.<br>4. Dokumen pendukung lainnya yang relevan (misalnya akte kelahiran baru, surat nikah baru, dll).<br>5. Konfirmasi perubahan data melalui email atau telepon ke kantor layanan.",
  "Pengaduan dan Informasi Kerja ke Luar Negeri":
    "Prosedur dan Berkas yang Diperlukan:<br>1. Mengisi formulir pengaduan atau permintaan informasi.<br>2. Menyertakan fotokopi KTP.<br>3. Menyertakan bukti pengalaman kerja atau surat rekomendasi kerja.<br>4. Menyertakan CV atau resume terbaru.<br>5. Menghubungi kantor layanan melalui telepon atau email untuk mendapatkan informasi lebih lanjut.",
};

const questionsContainer = document.getElementById("questions");
const answersContainer = document.getElementById("answers");

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
  whatsappButton.href =
    "https://wa.me/+628973199492?text=Halo, saya membutuhkan informasi lebih lanjut.";
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
