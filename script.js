const messagesContainer = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const typingIndicator = document.getElementById("typing-indicator");
const chips = document.querySelectorAll(".chip");

const state = {
    mode: "idle",      // 'idle' or 'mock'
    category: null,    // 'behavioral', 'tech', 'customer', 'retail'
    index: 0
};

const questionSets = {
    behavioral: [
        {
            question: "Tell me about a time you had to learn something new quickly for work.",
            tip: "Use STAR: Situation, Task, Action, Result. Emphasize how fast you learned and how it helped the team or customer."
        },
        {
            question: "Describe a time you made a mistake and how you handled it.",
            tip: "Show ownership, what you learned, and what you changed so it doesn’t happen again."
        },
        {
            question: "Tell me about a time you handled a difficult coworker or teammate.",
            tip: "Focus on staying professional, communicating clearly, and keeping the work on track."
        }
    ],
    tech: [
        {
            question: "Walk me through how you would help a user who says their computer can’t connect to the internet.",
            tip: "Think step-by-step: check basics (Wi-Fi on, cables), test other sites/devices, restart, check network settings, and explain clearly in simple terms."
        },
        {
            question: "Explain a technical problem you solved that you’re proud of.",
            tip: "Describe the issue, what you tried, how you diagnosed it, and the final fix. Keep it understandable for a non-technical manager."
        },
        {
            question: "How do you handle a ticket queue when multiple users are waiting for help?",
            tip: "Talk about prioritizing by impact/urgency, communicating wait times, and staying calm and organized."
        }
    ],
    customer: [
        {
            question: "Tell me about a time you turned an upset customer into a satisfied one.",
            tip: "Show empathy, listening, staying calm, and making it right while respecting company policies."
        },
        {
            question: "How do you handle a situation where you don’t know the answer to a customer’s question?",
            tip: "Admit you don’t know, but show how you would find the answer and follow up quickly."
        },
        {
            question: "Describe a time you went above and beyond for a customer.",
            tip: "Tiny extra effort stories are great: follow-up calls, extra explanation, staying a bit late, etc."
        }
    ],
    retail: [
        {
            question: "If the store is very busy and multiple customers need help at once, what do you do?",
            tip: "Talk about triaging, acknowledging everyone, staying friendly, and communicating clearly about waits."
        },
        {
            question: "Tell me about a time you recommended a product that really helped the customer.",
            tip: "Connect needs to features. Show that you ask questions first instead of just pushing a sale."
        },
        {
            question: "How would you handle a customer who wants a refund but is outside the return policy?",
            tip: "Balance empathy with policy. Offer options: store credit, alternative solutions, or involving a supervisor."
        }
    ]
};

// ===== utilities =====
function addMessage(text, sender = "bot") {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message", sender);

    const meta = document.createElement("div");
    meta.classList.add("meta");

    const avatar = document.createElement("span");
    avatar.classList.add("avatar-circle");
    avatar.textContent = sender === "bot" ? "🤖" : "🧑";

    const name = document.createElement("span");
    name.classList.add("name");
    name.textContent = sender === "bot" ? "GioTech Bot" : "You";

    meta.appendChild(avatar);
    meta.appendChild(name);

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.innerHTML = text;

    wrapper.appendChild(meta);
    wrapper.appendChild(bubble);

    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    typingIndicator.classList.remove("hidden");
}

function hideTyping() {
    typingIndicator.classList.add("hidden");
}

// ===== mock interview helpers =====
function startMockInterview(categoryKey) {
    const set = questionSets[categoryKey];
    if (!set) return;

    state.mode = "mock";
    state.category = categoryKey;
    state.index = 0;

    const labelMap = {
        behavioral: "Behavioral",
        tech: "Tech / Help Desk",
        customer: "Customer Service",
        retail: "Retail / Store"
    };

    addMessage(
        `Great, let’s run a <b>${labelMap[categoryKey]}</b> mock interview. 🎤<br><br>` +
        `I’ll ask you a question. Answer in your own words, then I’ll give you feedback and the next question.<br>` +
        `You can type <b>“exit”</b> anytime to stop.`,
        "bot"
    );

    askCurrentQuestion();
}

function askCurrentQuestion() {
    const set = questionSets[state.category];
    if (!set || state.index >= set.length) {
        state.mode = "idle";
        state.category = null;
        state.index = 0;
        addMessage(
            "Nice work — you finished this mock set. 💪<br>" +
            "You can start another category with the buttons above, or ask me to help polish a specific answer.",
            "bot"
        );
        return;
    }

    const current = set[state.index];
    addMessage(`<b>Question ${state.index + 1}:</b> ${current.question}`, "bot");
}

function getFeedbackForAnswer(answer, tip) {
    const length = answer.trim().split(/\s+/).length;
    const hasStarPieces =
        /situation|task|action|result/i.test(answer) ||
        /first/i.test(answer) ||
        /then/i.test(answer) ||
        /finally|eventually|in the end/i.test(answer);

    let feedback = "";

    if (length < 25) {
        feedback +=
            "Good start, but your answer is a bit short. Try to give more detail so the interviewer can really picture the situation.<br><br>";
    } else {
        feedback +=
            "Nice — you gave a solid amount of detail. 👍<br><br>";
    }

    if (!hasStarPieces) {
        feedback +=
            "To make this answer even stronger, try using the <b>STAR method</b>:<br>" +
            "• <b>Situation</b> – set the scene.<br>" +
            "• <b>Task</b> – what you needed to do.<br>" +
            "• <b>Action</b> – what you actually did.<br>" +
            "• <b>Result</b> – what happened, with numbers if you can.<br><br>";
    }

    feedback += `<b>Tip for this specific question:</b> ${tip}`;

    return feedback;
}

// ===== free-form helper: example answers =====
function handleFreeForm(text) {
    const lower = text.toLowerCase();

    if (lower.includes("tell me about yourself")) {
        return `
<b>Example structure for “Tell me about yourself” (for tech / help-desk / IT + customer service):</b><br><br>
1) <b>Present</b> – who you are now:<br>
“Right now I’m working in customer service/tech support where I help people with troubleshooting and explaining technology in simple terms.”<br><br>
2) <b>Past</b> – relevant experience:<br>
“Before that, I built hands-on experience working with hardware, Windows devices, and reset/installation work, which gave me a strong comfort level with computers and devices.”<br><br>
3) <b>Future</b> – why this job:<br>
“Now I’m looking for a role where I can combine my technical skills with my people skills — helping customers, solving problems, and continuing to grow in IT.”<br><br>
You can type your version and I’ll help you polish it.
        `;
    }

    if (lower.includes("why should we hire you")) {
        return `
<b>Example structure for “Why should we hire you?”:</b><br><br>
1) Match their needs: “From what I understand, you’re looking for someone who can provide great customer support, stay calm under pressure, and pick up new technology quickly.”<br>
2) Connect your skills: “That fits me well because I have experience helping people with tech issues, I’m patient with customers, and I enjoy learning new systems.”<br>
3) Finish strong: “You’d be getting someone who not only solves problems, but also makes customers feel heard and taken care of.”<br><br>
If you share your draft, I can rewrite it in a stronger, interview-ready version.
        `;
    }

    if (lower.includes("strengths")) {
        return `
<b>Answering “What are your strengths?”:</b><br>
Pick 2–3 strengths that fit support/IT roles, like:<br>
• Patience with frustrated customers<br>
• Clear communication in simple language<br>
• Fast learner with new software/systems<br>
• Staying organized when it’s busy<br><br>
Give a short example for each strength using the STAR style.
        `;
    }

    if (lower.includes("weakness")) {
        return `
<b>Answering “What is your weakness?” (without hurting yourself):</b><br>
1) Pick a real, safe weakness (not “I’m lazy”). Example: “Sometimes I take on too much myself before asking for help.”<br>
2) Show awareness: “I realized that can slow things down.”<br>
3) Show improvement: “Now I communicate earlier with my team and ask for help sooner when needed.”<br><br>
If you type your weakness version, I can help you phrase it professionally.
        `;
    }

    return `
I can help you with:<br>
• Example answers (Tell me about yourself, strengths/weaknesses, etc.)<br>
• Rewriting your answer in a stronger way<br>
• Running another mock interview set<br><br>
Try something like:<br>
<i>“Here’s my answer for ‘Tell me about yourself’, can you improve it?”</i>
    `;
}

// ===== main flow =====
function handleUserMessage(text) {
    const raw = text;
    const trimmed = raw.trim();
    if (!trimmed) return;

    addMessage(trimmed, "user");
    userInput.value = "";

    // exit command
    if (state.mode === "mock" && trimmed.toLowerCase() === "exit") {
        state.mode = "idle";
        state.category = null;
        state.index = 0;
        addMessage("No problem — we’ve exited mock interview mode. You can start another set any time. ✅", "bot");
        return;
    }

    showTyping();

    setTimeout(() => {
        let reply;

        if (state.mode === "mock" && state.category) {
            const set = questionSets[state.category];
            const current = set[state.index];
            reply = getFeedbackForAnswer(trimmed, current.tip);
            state.index += 1;
            addMessage(reply, "bot");
            askCurrentQuestion();
            hideTyping();
            return;
        }

        // free mode
        reply = handleFreeForm(trimmed);
        hideTyping();
        addMessage(reply, "bot");
    }, 550);
}

function handleSend() {
    handleUserMessage(userInput.value);
}

// ===== event listeners =====
sendBtn.addEventListener("click", handleSend);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
    }
});

// quick chips for mock interview categories
chips.forEach(chip => {
    chip.addEventListener("click", () => {
        const mode = chip.getAttribute("data-mode");
        if (mode === "reset") {
            state.mode = "idle";
            state.category = null;
            state.index = 0;
            addMessage("Mock interview mode has been reset. You’re back in normal chat mode. 🙌", "bot");
            return;
        }
        startMockInterview(mode);
    });
});

// ===== Voice input (Web Speech API) =====
let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleSend();
    });

    recognition.addEventListener("error", () => {
        // optional: handle error UI
    });
} else {
    micBtn.style.opacity = "0.4";
    micBtn.style.cursor = "not-allowed";
}

micBtn.addEventListener("click", () => {
    if (!recognition) return;
    recognition.start();
});
