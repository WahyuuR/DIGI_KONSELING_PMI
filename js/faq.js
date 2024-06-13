
      const questionsAndAnswers = {
        "Pembuatan Paspor":
          "Dokumen yang Diperlukan:<br>1. Kartu Tanda Penduduk (KTP) <br>2. Kartu Keluarga (KK) <br>3. Akte Kelahiran atau dokumen pengganti yang sah <br>4. Pas foto berwarna terbaru ukuran 4x6 cm  <br>5. Bukti pembayaran biaya pembuatan paspor",
        "Layanan Edit Data PMI":
          "Prosedur dan Berkas yang Diperlukan:<br>1. Mengisi formulir permohonan perubahan data.<br>2. Menyertakan fotokopi KTP.<br>3. Menyertakan fotokopi paspor.<br>4. Dokumen pendukung lainnya yang relevan (misalnya akte kelahiran baru, surat nikah baru, dll).<br>5. Konfirmasi perubahan data melalui email atau telepon ke kantor layanan.",
        "Pengaduan dan Informasi Kerja ke Luar Negeri":
          "Prosedur dan Berkas yang Diperlukan:<br>1. Mengisi formulir pengaduan atau permintaan informasi.<br>2. Menyertakan fotokopi KTP.<br>3. Menyertakan bukti pengalaman kerja atau surat rekomendasi kerja.<br>4. Menyertakan CV atau resume terbaru.<br>5. Menghubungi kantor layanan melalui telepon atau email untuk mendapatkan informasi lebih lanjut.",
      };

      const chatbox = document.getElementById("chatbox");
      const questionSelect = document.getElementById("questionSelect");

      Object.keys(questionsAndAnswers).forEach((question) => {
        const option = document.createElement("option");
        option.value = question;
        option.textContent = question;
        questionSelect.appendChild(option);
      });

      function sendQuestion() {
        const selectedQuestion = questionSelect.value;
        if (selectedQuestion !== "Pilih pertanyaan...") {
          appendMessage(selectedQuestion, "user-message");
          setTimeout(() => {
            const answer = questionsAndAnswers[selectedQuestion];
            appendMessage(answer, "bot-message");
          }, 35); // Delay untuk simulasi jawaban
        }
      }

      function appendMessage(message, className) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-entry ${className}`;
        messageDiv.innerHTML = message; // Gunakan innerHTML bukan textContent
        chatbox.appendChild(messageDiv);
        chatbox.scrollTop = chatbox.scrollHeight; // Scroll ke pesan terbaru
      }
