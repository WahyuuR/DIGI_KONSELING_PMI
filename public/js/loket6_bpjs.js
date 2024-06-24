const questionsAndAnswers = {
  "PERSYARATAN PENDAFTARAN BPJS KETENAGAKERJAAN PMI":
    "(DIPASTIKAN SUDAH VERIFIKASI DATA DI BP2MI)<br>1. KTP.<br>2.PASPOR.<br>3.PERJANJIAN KERJA.<br>4. NOMOR WA<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "PERSYARATAN KLAIM JAMINAN KECELAKAAN KERJA BPJS KETENAGAKERJAAN PMI":
  "1. Kartu Peserta BPJS Ketenagakerjaan.<br>2. Paspor.<br>3. Surat Keterangan dari Pemberi Kerja, Perwakilan Republik Indonesia, KDEI, atau instansi pemerintah di bidang ketenagakerjaan.<br>4. Resume medis dari rumah sakit atau fasilitas kesehatan di negara tujuan penempatan; 5. Bukti pembayaran biaya transportasi di negara tujuan penempatan.<br>6. Rekening tabungan atas nama PMI atau rekening tabungan dari pihak lain yang membayar terlebih dahulu.<br>7. Bukti pembayaran atau dokumen lainnya yang terkait dengan Kecelakaan Kerja.<br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini."
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
    "https://wa.me/+6282141040084?text=Halo, saya membutuhkan informasi lebih lanjut.";
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
