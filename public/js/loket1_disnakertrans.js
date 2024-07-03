const questionsAndAnswers = {
  "Pembuatan Paspor PMI":
    "Dokumen yang Diperlukan:<br>1. Surat Permohonan dari PPPMI. <br>2. Lampiran Surat Permohonan. <br>3. Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy KTP dan KK.<br>5. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>6. Menyertakan Foto Copy Surat Nikah / Akte Cerai. <br>7. Rekom dari Disnaker Kab/Kota. <br>8. Terregistrasi ID SISKOTKALN.<br>9. SIP (Surat ijin Pengerahan) Negara Tujuan. <br><br> Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Layanan Pengadaan Rekomendasi Paspor PMI Mandiri":
    "Berkas yang Diperlukan:<br>1. Surat Rekomendasi Paspor dari LTSA-PMI Jatim. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3.  Surat Ijin Kel. Diketahui Kepdes/Lurah. <br>4. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>5. Menyertakan Foto Copy Surat Nikah / Akte Cerai. <br>6. Draft Kontrak Kerja/Job Offer/Surat Panggilan Kerja dari Perusahaan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Layanan Pencabutan Status Sebagai PMI":
    "Prosedur dan Berkas yang Diperlukan:<br>1. Surat Permohonan. <br>2. Menyertakan Foto Copy KTP dan KK. <br>3. Menyertakan Foto Copy Akte Kelahiran/ljasah. <br>4. Menyertakan Foto Copy Paspor <br>5. Surat Pernyataan yang dibuat oleh yang bersangkutan. <br>6. Surat Pernyataan jaminan. <br><br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Panduan Pendaftaran Calon Pekerja Migran Indonesia ":
    "Untuk Pendaftaran sebagai Calon PMI saudara bisa melihat panduan dengan mendownload panduan dibawah ini<br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
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
    "https://wa.me/+6281358438471?text=Halo, saya membutuhkan informasi lebih lanjut.";
  whatsappButton.className = "whatsapp-button";
  whatsappButton.target = "_blank";
  whatsappButton.textContent = "Hubungi via WhatsApp";
  whatsappButton.style.textDecoration = "none";
  whatsappButton.style.color = "white";
  whatsappButton.style.backgroundColor = "#25D366";
  whatsappButton.style.padding = "10px 20px";
  whatsappButton.style.borderRadius = "5px";
  whatsappButton.style.position = "absolute";
  whatsappButton.style.bottom = "10px";
  whatsappButton.style.right = "10px";

  // Membuat tombol Download PDF hanya untuk pertanyaan "Panduan Calon Pekerja Migran Indonesia"
  if (question === "Panduan Pendaftaran Calon Pekerja Migran Indonesia ") {
    const pdfButton = document.createElement("a");
    pdfButton.href = "/file/Panduan CPMI.pdf"; // Ganti dengan URL file PDF Anda
    pdfButton.download = "Panduan CPMI.pdf"; // Ganti dengan nama file PDF yang ingin diunduh
    pdfButton.className = "pdf-button";
    pdfButton.target = "_blank";
    pdfButton.textContent = "Unduh PDF";
    pdfButton.style.textDecoration = "none";
    pdfButton.style.color = "white";
    pdfButton.style.backgroundColor = "#FFC107";
    pdfButton.style.padding = "10px 20px";
    pdfButton.style.borderRadius = "5px";
    pdfButton.style.position = "absolute";
    pdfButton.style.bottom = "-30px"; // Adjusted bottom position for small screens
    pdfButton.style.right = "14px";

    answerDiv.appendChild(pdfButton);
  }

  answerDiv.appendChild(whatsappButton);
  answersContainer.appendChild(answerDiv);
}
