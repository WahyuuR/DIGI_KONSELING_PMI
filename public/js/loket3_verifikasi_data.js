const questionsAndAnswers = {
  "Layanan Informasi Penempatan/Job's Info melalui SISKOP2MI (Skema G to G, dan P to P)":
    "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik lowongan <br>3. klik job's yang diinginkan",
  "Pendaftaran PMI Skema Perseorangan melalui SISKOP2MI":
    "Tata Cara :<br>1. buka website www.siskop2mi.bp2mi.go.id <br>2. klik pada kolom Mendaftar sebagai PMI Perseorangan <br>3. Pilih penempatan program (Regular, SSW/Specified Skill Worker, Re- entry/Perpanjangan perjanjian Kerja, PTM/Pekerja Teknis Menengah) <br>4. Ketik No. NIK <br>5. Persyaratan Dokumen akan otomatis muncul, baca dan persiapkan dokumen sesuai yang tertera pada halaman tersebut. <br>6. Unduh dokumen Persyaratan berupa Surat Keterangan status perkawinan, surat izin suami/istri/orang tua atau wali dan suket pernyataan bertanggung jawab yang ditandatangani oleh para pihak disertai materai RP. 10.000,-. <br>7. Lanjutkan proses pendaftaran dan isi seluruh identitas serta upload dokumen yang dipersyaratkan. <br>8. Pada halaman akhir pilih BPMI atau P4MI terdekat sesuai domisili untuk melakukan proses verifikasi. <br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Persyaratan dokumen Perseorangan Regular":
    "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah ((link format surat); <br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat); <br>3. surat keterangan sehat. <br>4. kartu kepesertaan jaminan kesehatan nasional. <br>5. salinan surat panggilan kerja dari Pemberi Kerja berbadan hukum. <br>6. profil Pemberi Kerja berbadan hukum. <br>7. Perjanjian Kerja. <br>8. Paspor. <br>9. Visa Kerja. <br>10. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami (link format surat); <br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Persyaratan dokumen Perseorangan Specified Skill Worker":
    "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah ((link format surat) <br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat) <br>3. surat keterangan sehat <br>4. kartu kepesertaan jaminan kesehatan nasional<br>5. Paspor<br>6. Perjanjian Kerja<br>7. Certificate of Eligibility (CoE)/Resident Card <br>8. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami. <br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Persyaratan dokumen Perseorangan Perpanjangan perjanjian Kerja":
    "1. Paspor.<br>2. Perjanjian Kerja Baru.<br>3. Visa kerja/izin kerja/permanent resident(sesuai ketentuan yang berlaku di negara penempatan).<br>4. Memiliki jaminan sosial ketenagakerjaan, dan/atau asuransi sesuai dengan jangka waktu perpanjangan Perjanjian Kerja atau pembaharuan Perjanjian Kerja.<br>5. Surat cuti dari Pemberi Kerja. <br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini.",
  "Persyaratan dokumen Perseorangan Pekerja Teknis Menengah":
    "1. surat keterangan status perkawinan, bagi yang telah menikah melampirkan fotokopi buku nikah (link format surat).<br>2. surat keterangan izin suami atau istri, izin orang tua, atau izin wali yang diketahui oleh kepala desa atau lurah atau sebutan lainnya (link format surat).<br>3. Surat keterangan sehat.<br>4. Kartu kepesertaan jaminan kesehatan nasional (BPJS Kesehatan).<br>5. Surat Izin Kerja dari Ministry of Labor Taiwan.<br>6. Surat Pernyataan Mematuhi Peraturan di Taiwan dari Ministry of Labor Taiwan; 7. Perjanjian Kerja yang telah dilegalisasi oleh KDEI Taipei.<br>8. Paspor.<br>9. Visa Kerja.<br>10. Surat pernyataan bertanggung jawab terhadap segala risiko ketenagakerjaan yang dialami (link format surat).<br>Apabila masih ada yang saudara kurang pahami bisa menghubungi kontak yang ada dibawah ini",
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
