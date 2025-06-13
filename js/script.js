document.addEventListener("DOMContentLoaded", function () {
  const loadingScreen = document.querySelector(".loading-screen");
  const weddingLanding = document.querySelector(".wedding-landing");
  const musicToggle = document.getElementById("music-toggle");
  const musicControl = document.querySelector(".music-control");
  const weddingMusic = document.getElementById("wedding-music");

  gsap.registerPlugin(ScrollTrigger);

  function startWebsite() {
    gsap.to(loadingScreen, {
      duration: 1.5,
      opacity: 0,
      onComplete: () => {
        loadingScreen.style.display = "none";
        showLandingPage();
      },
    });
  }

  function toggleMusicPlayback() {
    if (weddingMusic.paused) {
      const playPromise = weddingMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            musicToggle.innerHTML =
              '<i class="fas fa-music"></i> Hentikan Musik';
          })
          .catch((error) => {
            console.error("Autoplay was prevented:", error);
            musicToggle.innerHTML = '<i class="fas fa-music"></i> Putar Musik';
          });
      }
    } else {
      weddingMusic.pause();
      musicToggle.innerHTML = '<i class="fas fa-music"></i> Putar Musik';
    }
  }

  function setupMusicPlayer() {
    toggleMusicPlayback();
    musicToggle.addEventListener("click", toggleMusicPlayback);
  }

  function guestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get("p");
    const n = urlParams.get("n");
    let guest = "Bapak/Ibu/Saudara/i"; // Teks default

    if (p && n) {
      guest = `${p} ${n}`; // Jika ada parameter p dan n
    } else if (n) {
      guest = n; // Jika hanya ada parameter n
    }

    const guestNameSpan = document.getElementById("guest-name-span");
    if (guestNameSpan) {
      guestNameSpan.textContent = guest;
    }
  }

  function showLandingPage() {
    weddingLanding.style.display = "block";
    musicControl.style.display = "block";

    gsap.fromTo(
      weddingLanding,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5,
        ease: "sine.out",
        onComplete: animateLandingContent,
      }
    );
  }

  function startCountdown() {
    const weddingDate = new Date("2025-06-26T09:00:00").getTime();
    const countdown = setInterval(function () {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const format = (num) => (num < 10 ? "0" + num : num);

      if (distance < 0) {
        clearInterval(countdown);
        const timerElement = document.getElementById("countdown-timer");
        const dateElements = document.querySelectorAll(".wedding-date");
        if (timerElement) {
          timerElement.innerHTML =
            "<div class='timer-box' style='width:100%;'><h3>Acara Telah Berlangsung</h3></div>";
        }
        dateElements.forEach((el) => {
          if (el.textContent.includes("Menuju Hari Bahagia")) {
            el.style.display = "none";
          }
        });
        return;
      }

      const elDays = document.getElementById("countdown-days");
      const elHours = document.getElementById("countdown-hours");
      const elMinutes = document.getElementById("countdown-minutes");
      const elSeconds = document.getElementById("countdown-seconds");

      if (elDays) elDays.innerText = format(days);
      if (elHours) elHours.innerText = format(hours);
      if (elMinutes) elMinutes.innerText = format(minutes);
      if (elSeconds) elSeconds.innerText = format(seconds);
    }, 1000);
  }

  function setupRSVPForm() {
    const btnYes = document.getElementById("btn-attend-yes");
    const btnNo = document.getElementById("btn-attend-no");
    const initialChoice = document.getElementById("rsvp-initial-choice");
    const formYes = document.getElementById("rsvp-form-yes");
    const formNo = document.getElementById("rsvp-form-no");
    const successMessage = document.getElementById("rsvp-success-message");
    const SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbxEDjOaP4T43O9yMfcRBIlNAdxEktzMXU7vNGMHcbhwoZIuHAJk8JSTrTSgnWbEKG0/exec";

    const showForm = (elementToShow) => {
      gsap.to(initialChoice, {
        duration: 0.5,
        autoAlpha: 0,
        onComplete: () => (initialChoice.style.display = "none"),
      });
      elementToShow.style.display = "block";
      gsap.fromTo(
        elementToShow,
        { autoAlpha: 0, y: 20 },
        { duration: 0.5, autoAlpha: 1, y: 0, delay: 0.5 }
      );
    };

    if (btnYes) btnYes.addEventListener("click", () => showForm(formYes));
    if (btnNo) btnNo.addEventListener("click", () => showForm(formNo));

    const showSuccess = () => {
      if (formYes) formYes.style.display = "none";
      if (formNo) formNo.style.display = "none";
      if (successMessage) {
        successMessage.style.display = "block";
        gsap.fromTo(
          successMessage,
          { autoAlpha: 0, scale: 0.8 },
          { duration: 0.7, autoAlpha: 1, scale: 1, ease: "back.out(1.7)" }
        );
      }
    };

    const handleFormSubmit = (form, e) => {
      e.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      const formData = new FormData(form);
      formData.append(
        "formType",
        form.id === "rsvp-form-yes" ? "kehadiran" : "ucapan"
      );
      fetch(SCRIPT_URL, { method: "POST", body: formData })
        .then((response) => response.json())
        .then((data) => {
          if (data.result === "success") showSuccess();
          else throw new Error(data.error);
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Terjadi kesalahan.");
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.classList.remove("is-loading");
        });
    };

    if (formYes)
      formYes.addEventListener("submit", (e) => handleFormSubmit(formYes, e));
    if (formNo)
      formNo.addEventListener("submit", (e) => handleFormSubmit(formNo, e));

    document.querySelectorAll(".copy-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const textToCopy = button.getAttribute("data-copy-text");
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            const originalContent = button.innerHTML;
            button.innerHTML = "Tersalin!";
            setTimeout(() => {
              button.innerHTML = originalContent;
            }, 2000);
          })
          .catch((err) => console.error("Gagal menyalin: ", err));
      });
    });
  }

  function animateLandingContent() {
    guestName();
    setupMusicPlayer();
    startCountdown();
    setupRSVPForm();

    setTimeout(() => {
      AOS.init({ duration: 1000, once: true });
    }, 100);
  }

  startWebsite();
});
