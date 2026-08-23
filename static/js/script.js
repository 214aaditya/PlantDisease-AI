/**
 * PlantDiseaseAI - Frontend Client Script
 * Handles Drag & Drop, Camera capture, API requests, Voice TTS, Translation, and Custom Modal Dialog alerts.
 */

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const themeToggle = document.getElementById("themeToggle");
    const langSelect = document.getElementById("langSelect");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const cameraBtn = document.getElementById("cameraBtn");
    const predictBtn = document.getElementById("predictBtn");
    const resetBtn = document.getElementById("resetBtn");
    
    const previewContainer = document.getElementById("previewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const previewFilename = document.getElementById("previewFilename");
    const previewFilesize = document.getElementById("previewFilesize");
    const heroSection = document.getElementById("heroSection");
    
    const loadingWrapper = document.getElementById("loadingWrapper");
    const loadingText = document.getElementById("loadingText");
    const dashboardGrid = document.getElementById("dashboardGrid");
    
    // Result UI Elements
    const resultImage = document.getElementById("resultImage");
    const predictedDiseaseName = document.getElementById("predictedDiseaseName");
    const healthBadge = document.getElementById("healthBadge");
    const severityBadge = document.getElementById("severityBadge");
    const confidenceCircle = document.getElementById("confidenceCircle");
    const confidenceValue = document.getElementById("confidenceValue");
    const topPredictionsList = document.getElementById("topPredictionsList");
    
    // Insights Card Elements
    const medicineCardText = document.getElementById("medicineCardText");
    const timelineCardText = document.getElementById("timelineCardText");
    
    // Voice Assistant Elements
    const voiceStatus = document.getElementById("voiceStatus");
    const voicePlayBtn = document.getElementById("voicePlayBtn");
    const voiceStopBtn = document.getElementById("voiceStopBtn");
    const voiceDownloadBtn = document.getElementById("voiceDownloadBtn");
    const audioPlayer = document.getElementById("audioPlayer");

    // Camera Modal Elements
    const cameraModal = document.getElementById("cameraModal");
    const webcamStream = document.getElementById("webcamStream");
    const photoCanvas = document.getElementById("photoCanvas");
    const snapPhotoBtn = document.getElementById("snapPhotoBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");

    // Custom Error Alert Modal Elements
    const errorModal = document.getElementById("errorModal");
    const errorModalText = document.getElementById("errorModalText");
    const errorModalOkBtn = document.getElementById("errorModalOkBtn");
    
    // State Variables
    let selectedFile = null;
    let currentPrediction = null;     // Stores basic prediction output
    let currentExplanation = null;    // Stores English explanation cards
    let translatedExplanation = null; // Stores current translated explanation cards
    let audioUrl = null;
    let cameraTrackStream = null;     // Webcam tracks reference
    let chatHistory = [];             // Stores current session chat history

    // ==========================================
    // 1. Custom Error Alert Modal Trigger
    // ==========================================
    const showError = (message) => {
        errorModalText.innerHTML = message;
        errorModal.style.display = "flex";
    };

    errorModalOkBtn.addEventListener("click", () => {
        errorModal.style.display = "none";
    });

    // ==========================================
    // 2. Dark Mode Toggle & Initialization
    // ==========================================
    const initTheme = () => {
        const isDark = localStorage.getItem("theme-dark") === "true";
        if (isDark) {
            document.body.classList.add("dark-mode");
            themeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: var(--warning-color);"></i>';
        } else {
            document.body.classList.remove("dark-mode");
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    };

    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme-dark", isDark);
        initTheme();
    });

    initTheme();

    // ==========================================
    // 3. Drag & Drop File Upload Interactions
    // ==========================================
    const handleFile = (file) => {
        if (!file) return;
        
        // Verify it is an image
        if (!file.type.startsWith("image/")) {
            showError("Please upload a valid image file format.<br><br>Allowed formats: <b>PNG, JPG, JPEG, WEBP</b>.");
            return;
        }

        selectedFile = file;
        previewFilename.textContent = file.name;
        previewFilesize.textContent = (file.size / 1024).toFixed(1) + " KB";
        
        // Render Image Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewContainer.style.display = "block";
            dropZone.style.display = "none";
        };
        reader.readAsDataURL(file);

        // Adjust UI Button States
        predictBtn.disabled = false;
        resetBtn.style.display = "inline-flex";
    };

    // Browse button triggers input file click
    browseBtn.addEventListener("click", () => fileInput.click());
    
    fileInput.addEventListener("change", (e) => {
        handleFile(e.target.files[0]);
    });

    // ==========================================
    // 4. Real Webcam Capture Modal Handler
    // ==========================================
    cameraBtn.addEventListener("click", async () => {
        cameraModal.style.display = "flex";
        
        // Check for media capture support
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                // Request environment facing camera (ideal for scanning plants outdoors)
                cameraTrackStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });
                webcamStream.srcObject = cameraTrackStream;
            } catch (err) {
                console.error("Camera access failed:", err);
                showError("Unable to access the camera device.<br><br>Please check camera connection / permissions, or select an image file instead.");
                closeWebcam();
            }
        } else {
            showError("Your web browser does not support webcam capture APIs. Please upload an image file instead.");
            closeWebcam();
        }
    });

    const closeWebcam = () => {
        cameraModal.style.display = "none";
        if (cameraTrackStream) {
            // Stop all stream tracks to release device camera resource
            cameraTrackStream.getTracks().forEach(track => track.stop());
            cameraTrackStream = null;
        }
        webcamStream.srcObject = null;
    };

    closeCameraBtn.addEventListener("click", closeWebcam);

    // Capture Canvas frame to File
    snapPhotoBtn.addEventListener("click", () => {
        if (!cameraTrackStream) return;

        const width = webcamStream.videoWidth || 640;
        const height = webcamStream.videoHeight || 480;
        
        photoCanvas.width = width;
        photoCanvas.height = height;
        
        const ctx = photoCanvas.getContext("2d");
        // Draw video frame directly onto hidden canvas
        ctx.drawImage(webcamStream, 0, 0, width, height);
        
        // Export Canvas to image blob
        photoCanvas.toBlob((blob) => {
            if (blob) {
                const capturedFile = new File([blob], `captured_leaf_${Date.now()}.jpg`, {
                    type: "image/jpeg"
                });
                handleFile(capturedFile);
            }
            closeWebcam();
        }, "image/jpeg", 0.95);
    });

    // Drag-over styling cues
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFile(files[0]);
    }, false);

    // Dropzone click triggers browse
    dropZone.addEventListener("click", (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // Reset Form Event
    const resetApp = () => {
        selectedFile = null;
        currentPrediction = null;
        currentExplanation = null;
        currentExplanation = null;
        translatedExplanation = null;
        audioUrl = null;
        chatHistory = [];
        const chatMsgs = document.getElementById("chatMessages");
        if(chatMsgs) {
            chatMsgs.innerHTML = '<div class="chat-bubble bot">Hello! I\'m your Agri-Assistant. Do you have any follow-up questions about this diagnosis?</div>';
        }
        
        fileInput.value = "";
        imagePreview.src = "#";
        previewContainer.style.display = "none";
        dropZone.style.display = "flex";
        heroSection.style.display = "flex";
        dashboardGrid.style.display = "none";
        
        predictBtn.disabled = true;
        resetBtn.style.display = "none";
        
        // Stop audio if playing
        stopAudio();
    };

    resetBtn.addEventListener("click", resetApp);

    // ==========================================
    // 5. API Submissions & Visual Renderers
    // ==========================================
    predictBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

        // Reset UI states
        dashboardGrid.style.display = "none";
        loadingWrapper.style.display = "flex";
        loadingText.textContent = "Analyzing leaf parameters...";
        predictBtn.disabled = true;
        
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // STEP 1: Upload and Predict Disease
            const predResponse = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            if (!predResponse.ok) {
                const errorData = await predResponse.json();
                throw new Error(errorData.detail || "Prediction failed.");
            }

            currentPrediction = await predResponse.json();
            
            // Set Loading text for Step 2
            loadingText.textContent = "Fetching LLM agricultural recommendations...";
            
            // STEP 2: Fetch detailed explanations
            const expResponse = await fetch("/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disease_name: currentPrediction.disease })
            });

            if (!expResponse.ok) {
                throw new Error("Explanation cards retrieval failed.");
            }

            currentExplanation = await expResponse.json();
            translatedExplanation = { ...currentExplanation }; // Default translated is English

            // Render details
            renderDashboard();
            
        } catch (error) {
            showError(`<b>Diagnostic Failed</b><br><br>${error.message}`);
            resetApp();
        } finally {
            loadingWrapper.style.display = "none";
            predictBtn.disabled = false;
        }
    });

    // Populate elements on the Dashboard
    const renderDashboard = () => {
        // Render Image and disease title
        resultImage.src = currentPrediction.image_url;
        predictedDiseaseName.textContent = currentPrediction.disease;

        // Health Status Badge setup
        if (currentPrediction.is_healthy) {
            healthBadge.textContent = "Healthy";
            healthBadge.className = "badge badge-healthy";
            
            severityBadge.textContent = "N/A (Healthy)";
            severityBadge.className = "badge badge-severity-low";
        } else {
            healthBadge.textContent = "Diseased";
            healthBadge.className = "badge badge-diseased";
            
            severityBadge.textContent = currentPrediction.severity + " Severity";
            // Map severity class
            const sev = currentPrediction.severity.toLowerCase();
            severityBadge.className = `badge badge-severity-${sev === 'critical' ? 'critical' : sev === 'high' ? 'high' : sev === 'moderate' ? 'moderate' : 'low'}`;
        }

        // Circular confidence meter rotation
        const confidenceVal = Math.round(currentPrediction.confidence * 100);
        confidenceValue.textContent = confidenceVal + "%";
        confidenceCircle.style.background = `conic-gradient(var(--primary-color) ${confidenceVal}%, var(--bg-primary) ${confidenceVal}%)`;

        // Render top 5 bar charts
        topPredictionsList.innerHTML = "";
        currentPrediction.top_5.forEach(item => {
            const itemConf = Math.round(item.confidence * 100);
            
            const barItem = document.createElement("div");
            barItem.className = "prediction-bar-item";
            barItem.innerHTML = `
                <div class="bar-label-group">
                    <span>${item.class}</span>
                    <span>${itemConf}%</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: 0%;"></div>
                </div>
            `;
            topPredictionsList.appendChild(barItem);
            
            // Trigger animation width
            setTimeout(() => {
                barItem.querySelector(".bar-fill").style.width = `${itemConf}%`;
            }, 100);
        });

        // Populate insight cards with English text base
        populateInsightCards(currentExplanation);

        // Show Dashboard, hide hero section, and scroll into view
        heroSection.style.display = "none";
        dashboardGrid.style.display = "grid";
        dashboardGrid.scrollIntoView({ behavior: "smooth" });

        // Reset voice controller buttons
        resetVoiceUI();
        
        // Re-apply translation if not English
        if (langSelect.value !== "English") {
            langSelect.dispatchEvent(new Event('change'));
        }
    };

    // Helper to generate <li> strings
    const createList = (items) => {
        if (!Array.isArray(items) || items.length === 0) return "<li>N/A</li>";
        return items.map(item => `<li>${item}</li>`).join("");
    };

    // Populates Cards (Comprehensive Report)
    const populateInsightCards = (data) => {
        const fallbackGrid = document.getElementById("insightsGrid");
        if(fallbackGrid) fallbackGrid.style.display = "none";
        
        const reportCard = document.getElementById("reportCard");
        if(reportCard) reportCard.style.display = "flex";

        document.getElementById("reportDescription").textContent = data.description || "No description available.";
        
        document.getElementById("reportSymptoms").innerHTML = createList(data.symptoms);
        document.getElementById("reportCauses").innerHTML = createList(data.causes);
        
        document.getElementById("reportChemical").innerHTML = createList(data.treatment?.chemical);
        document.getElementById("reportOrganic").innerHTML = createList(data.treatment?.organic);
        document.getElementById("reportAppNotes").textContent = data.treatment?.application_notes || "N/A";
        
        document.getElementById("reportDay1").textContent = data.timeline?.day_1_2 || "N/A";
        document.getElementById("reportDay5").textContent = data.timeline?.day_5_7 || "N/A";
        document.getElementById("reportOngoing").textContent = data.timeline?.ongoing || "N/A";
        
        document.getElementById("reportPrevention").innerHTML = createList(data.prevention);
    };

    // ==========================================
    // 6. Language Translation Endpoints
    // ==========================================
    const LANGUAGE_MARKERS = {
        "English": "en", "Hindi": "hi", "Bengali": "bn", "Tamil": "ta",
        "Telugu": "te", "Kannada": "kn", "Gujarati": "gu", "Marathi": "mr",
        "Punjabi": "pa", "Malayalam": "ml"
    };

    const triggerGoogleTranslate = (langCode) => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }
    };

    langSelect.addEventListener("change", async () => {
        const selectedLang = langSelect.value;
        const langCode = LANGUAGE_MARKERS[selectedLang] || 'en';
        
        // Trigger Full Page Translation via Google Widget
        triggerGoogleTranslate(langCode);
        
        if (!currentExplanation) return; // No predictions loaded yet

        // If target is English, load cache directly
        if (selectedLang === "English") {
            translatedExplanation = { ...currentExplanation };
            resetVoiceUI();
            return;
        }

        try {
            const transResponse = await fetch("/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    explanation: currentExplanation,
                    target_lang: selectedLang
                })
            });

            if (transResponse.ok) {
                translatedExplanation = await transResponse.json();
                // The visual UI is already translated by the Google Widget.
                // We store translatedExplanation purely for TTS generation. 
                resetVoiceUI();
            }
        } catch (error) {
            console.error("Backend translation for voice failed:", error);
        }
    });

    // ==========================================
    // 7. Voice Assistant Media Controller
    // ==========================================
    const resetVoiceUI = () => {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioUrl = null;
        voicePlayBtn.disabled = false;
        voicePlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        voiceStopBtn.disabled = true;
        voiceDownloadBtn.style.display = "none";
        voiceStatus.textContent = "Listen to Audio Advice";
    };

    const stopAudio = () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        voicePlayBtn.disabled = false;
        voicePlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        voiceStopBtn.disabled = true;
        voiceStatus.textContent = "Playback stopped";
    };

    voicePlayBtn.addEventListener("click", async () => {
        // If audio is already loaded and paused, resume playback
        if (audioUrl && audioPlayer.src) {
            audioPlayer.play();
            voicePlayBtn.disabled = true;
            voiceStopBtn.disabled = false;
            voiceStatus.textContent = "Playing advice...";
            return;
        }

        // Otherwise generate TTS file
        if (!translatedExplanation) return;

        voicePlayBtn.disabled = true;
        voiceStatus.textContent = "Synthesizing voice response...";

        try {
            // Get combined summary text for TTS (e.g. description + immediate timeline)
            const d = translatedExplanation;
            const textToSpeak = `The diagnosis is ${d.disease || 'unknown'}. ${d.description || ''} Immediate action required: ${d.timeline?.day_1_2 || ''}`;

            const response = await fetch("/speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textToSpeak })
            });

            if (!response.ok) {
                throw new Error("Voice synthesis request failed.");
            }

            const speechData = await response.json();
            audioUrl = speechData.audio_url;

            // Load and play audio
            audioPlayer.src = audioUrl;
            audioPlayer.play();

            voicePlayBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            voiceStopBtn.disabled = false;
            voiceDownloadBtn.href = audioUrl;
            voiceDownloadBtn.style.display = "inline-flex";
            voiceStatus.textContent = "Playing advice...";

        } catch (error) {
            showError(`<b>Voice Assistant Failed</b><br><br>${error.message}`);
            resetVoiceUI();
        }
    });

    voiceStopBtn.addEventListener("click", stopAudio);

    // Audio player event listeners
    audioPlayer.addEventListener("ended", () => {
        voicePlayBtn.disabled = false;
        voicePlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        voiceStopBtn.disabled = true;
        voiceStatus.textContent = "Audio completed";
    });

    audioPlayer.addEventListener("error", () => {
        voiceStatus.textContent = "Audio play error";
        resetVoiceUI();
    });

    // ==========================================
    // 8. Agri-Chat Features
    // ==========================================
    const chatInput = document.getElementById("chatInput");
    const chatSendBtn = document.getElementById("chatSendBtn");
    const chatMessages = document.getElementById("chatMessages");

    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-bubble ${sender}`;
        
        if (sender === "bot") {
            const contentDiv = document.createElement("div");
            contentDiv.className = "chat-bubble-content";
            
            const textSpan = document.createElement("span");
            if (typeof marked !== 'undefined') {
                textSpan.innerHTML = marked.parse(text);
            } else {
                textSpan.textContent = text;
            }
            
            const ttsBtn = document.createElement("button");
            ttsBtn.className = "chat-tts-btn";
            ttsBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            ttsBtn.title = "Listen to response";
            
            ttsBtn.addEventListener("click", async () => {
                const originalIcon = ttsBtn.innerHTML;
                ttsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                ttsBtn.disabled = true;
                
                try {
                    const response = await fetch("/speech", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: text })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const audio = new Audio(data.audio_url);
                        audio.play();
                    }
                } catch (error) {
                    console.error("TTS failed:", error);
                } finally {
                    ttsBtn.innerHTML = originalIcon;
                    ttsBtn.disabled = false;
                }
            });
            
            contentDiv.appendChild(textSpan);
            contentDiv.appendChild(ttsBtn);
            msgDiv.appendChild(contentDiv);
        } else {
            msgDiv.textContent = text;
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement("div");
        typingDiv.id = "typingIndicator";
        typingDiv.className = "chat-bubble bot typing";
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById("typingIndicator");
        if (indicator) indicator.remove();
    };

    const handleChatSend = async () => {
        const text = chatInput.value.trim();
        if (!text || !currentPrediction) return;

        // Render user message
        appendMessage(text, "user");
        chatInput.value = "";
        
        // Add to history
        chatHistory.push({ role: "user", text: text });
        
        // Render typing indicator
        showTypingIndicator();
        chatSendBtn.disabled = true;

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(0, -1), // send previous history
                    disease_name: currentPrediction.disease
                })
            });

            if (!response.ok) throw new Error("Chat failed");

            const data = await response.json();
            
            removeTypingIndicator();
            appendMessage(data.response, "bot");
            
            // Add bot to history
            chatHistory.push({ role: "bot", text: data.response });

        } catch (error) {
            removeTypingIndicator();
            appendMessage("Sorry, I encountered an error. Please try again.", "bot");
        } finally {
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    };

    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener("click", handleChatSend);
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleChatSend();
        });
    }

    // Fix the Home button in navigation bar to reset the UI and go back to upload screen
    const navLinks = document.querySelectorAll(".nav-links a");
    if (navLinks.length > 0) {
        navLinks[0].addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof resetApp === "function") {
                resetApp();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
