document.addEventListener("DOMContentLoaded", function () {
  const loadingScreen = document.querySelector(".loading-screen");
  const weddingLanding = document.querySelector(".wedding-landing");
  const musicToggle = document.getElementById("music-toggle");
  const musicControl = document.querySelector(".music-control");
  const weddingMusic = document.getElementById("wedding-music");

  gsap.registerPlugin(ScrollTrigger);

  // This function now directly loads the main landing page.
  function startWebsite() {
    gsap.to(loadingScreen, {
      duration: 1.5, // A little fade time
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
            // Browser prevented autoplay, user must click to start.
            musicToggle.innerHTML = '<i class="fas fa-music"></i> Putar Musik';
          });
      }
    } else {
      weddingMusic.pause();
      musicToggle.innerHTML = '<i class="fas fa-music"></i> Putar Musik';
    }
  }

  function setupMusicPlayer() {
    // Attempt to play music as soon as the user interacts (by opening the page)
    toggleMusicPlayback();
    musicToggle.addEventListener("click", toggleMusicPlayback);
  }

  function guestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get("p");
    const n = urlParams.get("n");
    let guestName = "Anda";
    if (p && n) {
      guestName = `${p} ${n}`;
    } else if (n) {
      guestName = n;
    }
    // Update the guest name in the (now hidden) envelope section
    const guestNameSpan = document.getElementById("guest-name");
    if (guestNameSpan) {
      guestNameSpan.textContent = guestName;
    }
  }

  function showLandingPage() {
    weddingLanding.style.display = "block";
    musicControl.style.display = "block"; // Make music control visible

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
        document.getElementById("countdown-timer").innerHTML =
          "<div class='timer-box' style='width:100%;'><h3>Acara Telah Dimulai</h3></div>";
        return;
      }
      document.getElementById("countdown-days").innerText = format(days);
      document.getElementById("countdown-hours").innerText = format(hours);
      document.getElementById("countdown-minutes").innerText = format(minutes);
      document.getElementById("countdown-seconds").innerText = format(seconds);
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

    btnYes.addEventListener("click", () => showForm(formYes));
    btnNo.addEventListener("click", () => showForm(formNo));

    const showSuccess = () => {
      formYes.style.display = "none";
      formNo.style.display = "none";
      successMessage.style.display = "block";
      gsap.fromTo(
        successMessage,
        { autoAlpha: 0, scale: 0.8 },
        { duration: 0.7, autoAlpha: 1, scale: 1, ease: "back.out(1.7)" }
      );
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

    formYes.addEventListener("submit", (e) => handleFormSubmit(formYes, e));
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

  // Initial call to start the website flow
  startWebsite();
});
