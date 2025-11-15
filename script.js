// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3dy4RR4llP2lW3gNZJ8l-nsfvLVaszi4",
    authDomain: "fund-money-ba9f3.firebaseapp.com",
    projectId: "fund-money-ba9f3",
    storageBucket: "fund-money-ba9f3.firebasestorage.app",
    messagingSenderId: "938568753521",
    appId: "1:938568753521:web:b81a067fd15632661b16d0",
    measurementId: "G-0QL08NTY1V"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Game Constants
const GAME_CYCLE_DURATION = 30;
const MAX_BET_AMOUNT = 10000;

// Global Variables
let currentUser = null;
let userData = {};
let userBalance = 0;
let currentBet = null;
let bettingEnabled = false;
let gameTimerInterval = null;

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Authentication Functions
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (!userDoc.exists) {
            // New Google user - show password setup
            showPage('setup-password-page');
        } else {
            // Existing user - go to dashboard
            userData = userDoc.data();
            userBalance = userData.balance || 1000;
            initializeDashboard();
            showPage('dashboard-page');
        }
    } catch (error) {
        alert('Google login failed: ' + error.message);
    }
}

async function setupPassword() {
    const password = document.getElementById('setup-password').value;
    const confirmPassword = document.getElementById('setup-confirm-password').value;
    
    if (password.length < 6) {
        alert('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('पासवर्ड मेल नहीं खा रहे');
        return;
    }
    
    try {
        // Create user with email/password
        await currentUser.updatePassword(password);
        
        // Save user data to Firestore
        await db.collection('users').doc(currentUser.uid).set({
            userId: generateUserId(),
            name: currentUser.displayName,
            email: currentUser.email,
            balance: 1000,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        userBalance = 1000;
        initializeDashboard();
        showPage('dashboard-page');
        
    } catch (error) {
        alert('Password setup failed: ' + error.message);
    }
}

function generateUserId() {
    return 'USER' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Game Functions
function initializeDashboard() {
    updateBalanceDisplay();
    startGameTimer();
    listenToGameUpdates();
}

function updateBalanceDisplay() {
    document.getElementById('current-balance').textContent = userBalance;
    document.getElementById('profile-balance').textContent = userBalance;
}

function startGameTimer() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    
    gameTimerInterval = setInterval(() => {
        // Simulate timer for demo
        const timerElement = document.getElementById('timer');
        const progressElement = document.getElementById('progress-bar');
        
        let timeLeft = parseInt(timerElement.textContent) || GAME_CYCLE_DURATION;
        
        if (timeLeft <= 0) {
            timeLeft = GAME_CYCLE_DURATION;
            simulateGameResult();
        } else {
            timeLeft--;
        }
        
        timerElement.textContent = timeLeft + 's';
        const progress = (timeLeft / GAME_CYCLE_DURATION) * 100;
        progressElement.style.width = progress + '%';
        
        // Enable betting in last 25 seconds
        bettingEnabled = timeLeft <= 25;
        
    }, 1000);
}

function simulateGameResult() {
    const results = ['green', 'blue'];
    const result = results[Math.floor(Math.random() * results.length)];
    
    document.getElementById('result-box').textContent = 
        result === 'green' ? '🎉 हरा जीता!' : '🎉 नीला जीता!';
    document.getElementById('result-box').style.background = 
        result === 'green' ? '#4CAF50' : '#2196F3';
    
    // Reset bets
    currentBet = null;
}

function adjustBetAmount(change) {
    const betInput = document.getElementById('bet-amount');
    let currentAmount = parseInt(betInput.value) || 10;
    currentAmount += change;
    
    if (currentAmount < 1) currentAmount = 1;
    if (currentAmount > MAX_BET_AMOUNT) currentAmount = MAX_BET_AMOUNT;
    if (currentAmount > userBalance) currentAmount = userBalance;
    
    betInput.value = currentAmount;
}

function setBetAmount(amount) {
    document.getElementById('bet-amount').value = amount;
}

async function placeBet(color) {
    if (!bettingEnabled) {
        alert('बेटिंग बंद है! कृपया टाइमर का इंतज़ार करें');
        return;
    }
    
    if (currentBet) {
        alert('आप पहले ही बेट लगा चुके हैं');
        return;
    }
    
    const amount = parseInt(document.getElementById('bet-amount').value);
    
    if (amount > userBalance) {
        alert('पर्याप्त बैलेंस नहीं है');
        return;
    }
    
    if (amount < 1 || amount > MAX_BET_AMOUNT) {
        alert('कृपया वैध राशि दर्ज करें (₹1 - ₹10,000)');
        return;
    }
    
    try {
        // Deduct balance
        userBalance -= amount;
        currentBet = { color, amount, timestamp: Date.now() };
        
        // Update UI
        updateBalanceDisplay();
        document.getElementById('bet-count-' + color).textContent = '₹' + amount;
        
        alert('बेट सफलतापूर्वक लगा! ₹' + amount + ' ' + color + ' पर');
        
    } catch (error) {
        alert('बेट लगाने में त्रुटि: ' + error.message);
    }
}

function listenToGameUpdates() {
    // Listen for real-time game updates
    db.collection('gameControl').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const gameData = doc.data();
                // Update game state based on Firestore data
            }
        });
}

// Money Management
function selectAmount(amount) {
    document.getElementById('custom-amount').value = amount;
}

async function submitAddMoney() {
    const amount = parseInt(document.getElementById('custom-amount').value);
    const transactionId = document.getElementById('transaction-id').value.trim();
    
    if (!amount || amount < 100 || amount > 10000) {
        alert('कृपया ₹100 - ₹10,000 के बीच राशि दर्ज करें');
        return;
    }
    
    if (!transactionId) {
        alert('कृपया UTR/Transaction ID दर्ज करें');
        return;
    }
    
    try {
        // Save add money request
        await db.collection('addMoneyRequests').add({
            userId: currentUser.uid,
            userName: currentUser.displayName,
            amount: amount,
            transactionId: transactionId,
            status: 'pending',
            requestTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('अनुरोध सफलतापूर्वक भेजा गया! ₹' + amount);
        showPage('dashboard-page');
        
    } catch (error) {
        alert('अनुरोध भेजने में त्रुटि: ' + error.message);
    }
}

// Profile Management
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('display-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

async function saveBankDetails() {
    const accountHolder = document.getElementById('account-holder').value;
    const accountNumber = document.getElementById('account-number').value;
    const ifscCode = document.getElementById('ifsc-code').value;
    const bankName = document.getElementById('bank-name').value;
    
    if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
        alert('कृपया सभी बैंक विवरण भरें');
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            bankDetails: {
                accountHolder: accountHolder,
                accountNumber: accountNumber,
                ifscCode: ifscCode,
                bankName: bankName
            }
        });
        
        alert('बैंक डिटेल्स सफलतापूर्वक सेव हुए!');
    } catch (error) {
        alert('बैंक डिटेल्स सेव करने में त्रुटि: ' + error.message);
    }
}

// Initialize App
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserData();
    } else {
        showPage('login-page');
    }
});

async function loadUserData() {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
        userData = userDoc.data();
        userBalance = userData.balance || 1000;
        
        // Update profile page
        document.getElementById('profile-user-id').textContent = userData.userId || 'N/A';
        document.getElementById('profile-name').textContent = userData.name || 'N/A';
        document.getElementById('profile-email').textContent = userData.email || 'N/A';
        
        initializeDashboard();
        showPage('dashboard-page');
    }
}

function logout() {
    auth.signOut();
    showPage('login-page');
}

// Demo initialization
window.onload = function() {
    showPage('login-page');
};
