const text = "Humble Beginnings Legendary Endings";
const typingText = document.getElementById("typing-text");
const cursor = document.getElementById("cursor");
const enterBtn = document.getElementById("enter-btn");
let index = 0;

function typeWriter() {
  if (index < text.length) {
    typingText.textContent += text.charAt(index);
    index++;
    setTimeout(typeWriter, 100);
  } else {
    cursor.classList.add("hidden"); // ✅ hides cursor
    enterBtn.style.display = "inline-block";
    document.body.style.cursor = "default";
  }
}

window.onload = typeWriter;

enterBtn.addEventListener("click", function () {
  const music = document.getElementById("bg-music");

  // Force audio to unlock on some Android/iOS devices
  const playPromise = music.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log("✅ Music started");
        setTimeout(() => {
          document.getElementById("enter-screen").style.display = "none";
        }, 200); // slight delay for stability
      })
      .catch((err) => {
        console.warn("🚫 Music playback was blocked:", err);
      });
  }
});

  const enterScreen = document.getElementById("enter-screen");
  if (enterScreen) enterScreen.style.display = "none";
});