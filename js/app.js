async function translateText() {
  const translateBtn = document.getElementById("translateBtn");
  translateBtn.disabled = true;
  translateBtn.innerHTML = '<span class="spinner"></span> Translating...';

  try {
    const input = document.getElementById("inputText").value.trim();
    if (!input) {
      alert("Please enter some text first!");
      translateBtn.disabled = false;
      translateBtn.innerText = "⚡ Translate";
      return;
    }

    // TODO: Replace with real translation API
    const translatedText = "นี่คือข้อความที่แปลแล้ว (simulated)…";

    renderOutput(translatedText);
  } catch (err) {
    alert("❌ Translation failed: " + err.message);
  }

  translateBtn.disabled = false;
  translateBtn.innerText = "⚡ Translate";
}

function copyOutput() {
  const output = document.getElementById("outputText").innerText.trim();
  if (!output) return;
  navigator.clipboard.writeText(output).then(() => {
    alert("📋 Copied to clipboard!");
  });
}

function clearAll() {
  renderOutput("");
  document.getElementById("inputText").value = "";
  updateButtonStates();

  if (confirm("⚠️ Do you also want to reset tone, gender, and model preferences?")) {
    localStorage.removeItem("thaiTone");
    localStorage.removeItem("thaiGender");
    localStorage.removeItem("thaiModel");
    alert("✅ All cleared. Preferences reset to default.");
  } else {
    alert("✅ Input and output cleared. Preferences kept.");
  }
}

function renderOutput(text) {
  const out = document.getElementById("outputText");
  out.classList.remove("fade-in");
  void out.offsetWidth; // restart animation
  out.innerText = text;
  if (text) out.classList.add("fade-in");
  updateButtonStates();
}

function updateButtonStates() {
  const input = document.getElementById("inputText").value.trim();
  const output = document.getElementById("outputText").innerText.trim();
  document.getElementById("clearBtn").disabled = !(input || output);
  document.getElementById("copyBtn").disabled = !output;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputText").addEventListener("input", updateButtonStates);
  updateButtonStates();
});