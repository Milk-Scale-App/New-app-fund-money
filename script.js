// Firebase Configuration - YOUR CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyD8w1L_Nxe5UiPhpAe1rbyDo4KYb-pH0VU",
    authDomain: "new-fund-money.firebaseapp.com",
    projectId: "new-fund-money",
    storageBucket: "new-fund-money.firebasestorage.app",
    messagingSenderId: "912524669808",
    appId: "1:912524669808:web:48f925b308a95832d495b5",
    measurementId: "G-4JDE7VM0MC"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Game Constants
const GAME_CYCLE_DURATION = 30;
const MAX_BET_AMOUNT = 10000;
const MIN_BET_AMOUNT = 10;

// Global Variables
let currentUser = null;
let userData = {};
let userBalance = 0;
let currentBet = null;
let bettingEnabled = false;
let gameTimerInterval = null;

// Simple Page Navigation - FIXED
function showPage(pageId) {
    console.log("Showing page:", pageId);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error("Page not found:", pageId);
    }
}

// Simple Loading Functions
function showLoading(message = 'लोड हो रहा है...') {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = loadingScreen.querySelector('p');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    showPage('loading-screen');
}

function hideLoading() {
    showPage('login-page');
}

// Simple Authentication - FIXED
async function signInWithGoogle() {
    try {
        alert("Google login clicked - This will work in actual app");
        // For demo - directly go to dashboard
        showPage('dashboard-page');
        
    } catch (error) {
        console.error('Google login error:', error);
        alert('Google लॉगिन विफल: ' + error.message);
    }
}

async function loginWithEmailPassword() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('कृपया ईमेल और पासवर्ड दर्ज करें');
        return;
    }
    
    try {
        showLoading('लॉगिन हो रहा है...');
        
        // Simulate login - remove this in production
        setTimeout(() => {
            hideLoading();
            showPage('dashboard-page');
            initializeDemoData();
        }, 1000);
        
    } catch (error) {
        hideLoading();
        alert('लॉगिन विफल: ' + error.message);
    }
}

// Demo Data for Testing
function initializeDemoData() {
    userBalance = 1000;
    updateBalanceDisplay();
    startGameTimer();
}

function updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll('#current-balance, #profile-balance, #withdraw-balance');
    balanceElements.forEach(element => {
        if (element) {
            element.textContent = userBalance;
        }
    });
}

// Game Functions - SIMPLIFIED
function startGameTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    let timeLeft = GAME_CYCLE_DURATION;
    updateTimerDisplay(timeLeft);
    
    gameTimerInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            timeLeft = GAME_CYCLE_DURATION;
            simulateGameResult();
        }
        
        updateTimerDisplay(timeLeft);
        
    }, 1000);
}

function updateTimerDisplay(timeLeft) {
    const timerElement = document.getElementById('timer');
    const progressElement = document.getElementById('progress-bar');
    const statusElement = document.getElementById('game-status');
    
    if (timerElement) timerElement.textContent = timeLeft + 's';
    if (progressElement) {
        const progress = (timeLeft / GAME_CYCLE_DURATION) * 100;
        progressElement.style.width = progress + '%';
    }
    
    // Enable betting in last 25 seconds
    bettingEnabled = timeLeft <= 25;
    
    if (statusElement) {
        if (timeLeft > 25) {
            statusElement.textContent = 'बेटिंग जल्द शुरू...';
            statusElement.style.color = '#ff9800';
        } else if (timeLeft > 5) {
            statusElement.textContent = 'बेटिंग चालू है';
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.textContent = 'बेटिंग बंद';
            statusElement.style.color = '#f44336';
        }
    }
}

function simulateGameResult() {
    const results = ['green', 'blue'];
    const result = results[Math.floor(Math.random() * results.length)];
    const resultText = result === 'green' ? 'हरा' : 'नीला';
    
    const currentResult = document.getElementById('current-result');
    if (currentResult) {
        currentResult.textContent = `🎉 ${resultText} जीता!`;
        currentResult.style.color = result === 'green' ? '#4CAF50' : '#2196F3';
    }
    
    // Process user's bet if any
    if (currentBet) {
        processBetResult(result);
    }
    
    // Reset for next round
    currentBet = null;
    resetBetDisplays();
}

function processBetResult(winningColor) {
    if (currentBet && currentBet.color === winningColor) {
        // User won - 2x payout
        const winAmount = currentBet.amount * 2;
        userBalance += winAmount;
        alert(`🎉 बधाई हो! आपने ₹${winAmount} जीते!`);
    } else if (currentBet) {
        // User lost
        alert(`😔 आपका बेट हार गया। ₹${currentBet.amount} कट गए।`);
    }
    updateBalanceDisplay();
}

// Betting Functions
function adjustBetAmount(change) {
    const betInput = document.getElementById('bet-amount');
    if (!betInput) return;
    
    let currentAmount = parseInt(betInput.value) || MIN_BET_AMOUNT;
    currentAmount += change;
    
    if (currentAmount < MIN_BET_AMOUNT) currentAmount = MIN_BET_AMOUNT;
    if (currentAmount > MAX_BET_AMOUNT) currentAmount = MAX_BET_AMOUNT;
    if (currentAmount > userBalance) currentAmount = userBalance;
    
    betInput.value = currentAmount;
}

function setBetAmount(amount) {
    const betInput = document.getElementById('bet-amount');
    if (betInput) {
        betInput.value = amount;
    }
}

function placeBet(color) {
    if (!bettingEnabled) {
        alert('बेटिंग बंद है! कृपया टाइमर का इंतज़ार करें');
        return;
    }
    
    if (currentBet) {
        alert('आप पहले ही बेट लगा चुके हैं');
        return;
    }
    
    const betInput = document.getElementById('bet-amount');
    if (!betInput) return;
    
    const amount = parseInt(betInput.value);
    
    if (amount > userBalance) {
        alert('पर्याप्त बैलेंस नहीं है');
        return;
    }
    
    if (amount < MIN_BET_AMOUNT || amount > MAX_BET_AMOUNT) {
        alert(`कृपया वैध राशि दर्ज करें (₹${MIN_BET_AMOUNT} - ₹${MAX_BET_AMOUNT})`);
        return;
    }
    
    // Deduct balance immediately
    userBalance -= amount;
    currentBet = { color, amount, timestamp: Date.now() };
    
    // Update UI
    updateBalanceDisplay();
    updateBetDisplay(color, amount);
    
    // Show confirmation
    showBetConfirmation(color, amount);
}

function updateBetDisplay(color, amount) {
    const betAmountElement = document.getElementById(`${color}-bet-amount`);
    if (betAmountElement) {
        betAmountElement.textContent = `₹${amount}`;
        betAmountElement.parentElement.classList.add('pulse');
    }
}

function resetBetDisplays() {
    document.getElementById('green-bet-amount').textContent = '₹0';
    document.getElementById('blue-bet-amount').textContent = '₹0';
    
    document.getElementById('green-btn').classList.remove('pulse');
    document.getElementById('blue-btn').classList.remove('pulse');
}

function showBetConfirmation(color, amount) {
    const colorText = color === 'green' ? 'हरा' : 'नीला';
    alert(`✅ बेट सफल! ₹${amount} ${colorText} पर लगे`);
}

// Money Management
function selectAddAmount(amount) {
    const customAmount = document.getElementById('custom-add-amount');
    if (customAmount) {
        customAmount.value = amount;
    }
}

function selectWithdrawAmount(amount) {
    const customAmount = document.getElementById('custom-withdraw-amount');
    if (customAmount) {
        customAmount.value = amount;
    }
}

function submitAddMoneyRequest() {
    const amountInput = document.getElementById('custom-add-amount');
    const transactionId = document.getElementById('transaction-id');
    
    if (!amountInput || !transactionId) return;
    
    const amount = parseInt(amountInput.value);
    const transaction = transactionId.value.trim();
    
    if (!amount || amount < 100 || amount > 100000) {
        alert('कृपया ₹100 - ₹1,00,000 के बीच राशि दर्ज करें');
        return;
    }
    
    if (!transaction) {
        alert('कृपया UTR/Transaction ID दर्ज करें');
        return;
    }
    
    userBalance += amount;
    updateBalanceDisplay();
    alert(`✅ ₹${amount} सफलतापूर्वक जोड़े गए!`);
    showPage('dashboard-page');
}

function submitWithdrawRequest() {
    const amountInput = document.getElementById('custom-withdraw-amount');
    if (!amountInput) return;
    
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount < 100 || amount > 50000) {
        alert('कृपया ₹100 - ₹50,000 के बीच राशि दर्ज करें');
        return;
    }
    
    if (amount > userBalance) {
        alert('पर्याप्त बैलेंस नहीं है');
        return;
    }
    
    userBalance -= amount;
    updateBalanceDisplay();
    alert(`✅ निकासी अनुरोध सफल! ₹${amount}\nपैसा 2-4 घंटे में आ जाएगा।`);
    showPage('dashboard-page');
}

// Profile Management
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('display-password');
    const eyeIcon = document.querySelector('.eye-icon');
    
    if (!passwordInput || !eyeIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

function saveBankDetails() {
    const accountHolder = document.getElementById('account-holder');
    const accountNumber = document.getElementById('account-number');
    const ifscCode = document.getElementById('ifsc-code');
    const bankName = document.getElementById('bank-name');
    
    if (!accountHolder || !accountNumber || !ifscCode || !bankName) return;
    
    const holder = accountHolder.value.trim();
    const number = accountNumber.value.trim();
    const ifsc = ifscCode.value.trim();
    const bank = bankName.value.trim();
    
    if (!holder || !number || !ifsc || !bank) {
        alert('कृपया सभी बैंक विवरण भरें');
        return;
    }
    
    if (number.length < 9 || number.length > 18) {
        alert('कृपया वैध बैंक अकाउंट नंबर दर्ज करें');
        return;
    }
    
    if (ifsc.length !== 11) {
        alert('कृपया वैध IFSC कोड दर्ज करें (11 अक्षर)');
        return;
    }
    
    alert('✅ बैंक डिटेल्स सफलतापूर्वक सेव हुए!');
}

// Admin Functions
function loginToAdminPanel() {
    const password = document.getElementById('admin-password');
    if (!password) return;
    
    if (password.value === 'Winner@#2008') {
        alert('Admin login successful! Redirecting...');
        // For demo, just show message
    } else {
        alert('❌ गलत पासवर्ड!');
    }
}

// Utility Functions
function contactSupport() {
    alert('सपोर्ट के लिए संपर्क करें: support@fundmoney.game');
}

// Initialize App - SIMPLIFIED
function initializeApp() {
    console.log("Initializing app...");
    
    // Show login page after short delay
    setTimeout(() => {
        hideLoading();
    }, 2000);
    
    // Add event listeners for better navigation
    setupEventListeners();
}

function setupEventListeners() {
    // Back buttons
    const backButtons = document.querySelectorAll('.back-button, .back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            showPage('dashboard-page');
        });
    });
    
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('onclick');
            if (targetPage) {
                // Extract page name from onclick attribute
                const pageMatch = targetPage.match(/showPage\('([^']+)'\)/);
                if (pageMatch && pageMatch[1]) {
                    showPage(pageMatch[1]);
                    
                    // Update active state
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    initializeApp();
});

// Fallback - if still stuck, force show login page after 5 seconds
setTimeout(() => {
    if (document.querySelector('.page.active')?.id === 'loading-screen') {
        console.log("Force showing login page");
        showPage('login-page');
    }
}, 5000);
