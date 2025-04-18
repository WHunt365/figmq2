// Added special skill effects and improved arrow indicators

const characters = [
    { name: 'Knight', hp: 100, maxHp: 100, specialUsed: false, buffActive: false },
    { name: 'Wizard', hp: 80, maxHp: 80, specialUsed: false, buffActive: false },
    { name: 'Archer', hp: 90, maxHp: 90, specialUsed: false, buffActive: false }
];

const enemies = [
    { name: 'Enemy 1', hp: 100, maxHp: 100 },
    { name: 'Enemy 2', hp: 100, maxHp: 100 },
    { name: 'Enemy 3', hp: 100, maxHp: 100 }
];

let floor = 1;
let currentCharacterIndex = 0;
let currentEnemyIndex = 0;
let gameActive = true;
let awaitingCodeInput = false;
let currentAction = null;
let currentQuestionIndex = null;

const floorNumberEl = document.getElementById('floorNumber');
const statusEl = document.getElementById('status');
const attackButton = document.getElementById('attackButton');
const specialButton = document.getElementById('specialButton');
const resetButton = document.getElementById('resetButton');
const codeInputContainer = document.querySelector('.code-input-container');
const questionInput = document.getElementById('questionInput');
const codeInput = document.getElementById('codeInput');
const submitCodeButton = document.getElementById('submitCodeButton');
const gameLog = document.getElementById('gameLog');
// code question
const codeQuestions = [
    {
        question: `function add(a, b) {
    return a + ___;
}`,
        answer: `function add(a, b) {
    return a + b;
}`
    },
    {
        question: `const arr = [1, 2, 3];
arr.push(4);
console.log(arr.length); // Should print ___`,
        answer: `4`
    },
    {
        question: `for(let i = 0; i < 5; i++) {
    console.log(i);
}`,
        answer: `for(let i = 0; i < 5; i++) {
    console.log(i);
}`
    },
    {
        question: `let x = 5;
if (x === ___) {
    console.log("x is five");
}`,
        answer: `let x = 5;
if (x === 5) {
    console.log("x is five");
}`
    },
    {
        question: `function greet(name) {
    console.log("Hello, " + name);
}`,
        answer: `
greet("World");`
    },
    {
        question: `let total = 0;
for(let i = 1; i <= 10; i++) {
    total += i;
}`,
        answer: `let total = 0;
for(let i = 1; i <= 10; i++) {
    total += i;
}
console.log(total);`
    },
    {
        question: `const person = {
    name: "Alice",
    age: 25
};
console.log(person.____);`,
        answer: `const person = {
    name: "Alice",
    age: 25
};
console.log(person.name);`
    },
    {
        question: `function multiply(a, b) {
    return a * b;
}
console.log(multiply(3, ___));`,
        answer: `function multiply(a, b) {
    return a * b;
}
console.log(multiply(3, 4));`
    },
    {
        question: `let fruits = ["apple", "banana", "cherry"];
fruits.____("date");
console.log(fruits.length);`,
        answer: `let fruits = ["apple", "banana", "cherry"];
fruits.push("date");
console.log(fruits.length);`
    },
    {
        question: `if (true) {
    console.log("This is true");
} else {
    console.log("This is false");
}`,
        answer: `if (true) {
    console.log("This is true");
} else {
    console.log("This is false");
}`
    }
];
// game log
function logMessage(message) {
    gameLog.textContent += message + '\n';
    gameLog.scrollTop = gameLog.scrollHeight;
}

function updateUI() {
    floorNumberEl.textContent = floor;

    characters.forEach((char, index) => {
        const charEl = document.getElementById(char.name.toLowerCase());
        charEl.querySelector('.hp').textContent = char.hp;
        // Update HP bar fill width
        const hpBarFill = charEl.querySelector('.hp-bar-fill');
        if (hpBarFill) {
            const hpPercent = (char.hp / char.maxHp) * 100;
            hpBarFill.style.width = hpPercent + '%';
            if (hpPercent > 60) {
                hpBarFill.style.backgroundColor = '#4caf50'; // green
            } else if (hpPercent > 30) {
                hpBarFill.style.backgroundColor = '#ff9800'; // orange
            } else {
                hpBarFill.style.backgroundColor = '#f44336'; // red
            }
        }
        const arrow = charEl.querySelector('.arrow');
        if (index === currentCharacterIndex) {
            charEl.classList.add('active');
            arrow.style.display = 'block';
            arrow.textContent = '\u003C'; // left arrow for selected character
        } else {
            charEl.classList.remove('active');
            arrow.style.display = 'none';
        }
    });

    enemies.forEach((enemy, index) => {
        const enemyEl = document.getElementById('enemy' + index);
        enemyEl.querySelector('.hp').textContent = enemy.hp;
        // Update HP bar fill width
        const hpBarFill = enemyEl.querySelector('.hp-bar-fill');
        if (hpBarFill) {
            const hpPercent = (enemy.hp / enemy.maxHp) * 100;
            hpBarFill.style.width = hpPercent + '%';
            if (hpPercent > 60) {
                hpBarFill.style.backgroundColor = '#4caf50'; // green
            } else if (hpPercent > 30) {
                hpBarFill.style.backgroundColor = '#ff9800'; // orange
            } else {
                hpBarFill.style.backgroundColor = '#f44336'; // red
            }
        }
        const arrow = enemyEl.querySelector('.arrow');
        if (index === currentEnemyIndex) {
            enemyEl.classList.add('active');
            arrow.style.display = 'block';
            arrow.textContent = '\u003E'; // right arrow for selected enemy
        } else {
            enemyEl.classList.remove('active');
            arrow.style.display = 'none';
        }
    });

    if (!gameActive) {
        attackButton.disabled = true;
        specialButton.disabled = true;
        codeInputContainer.style.display = 'none';
    } else if (awaitingCodeInput) {
        attackButton.disabled = true;
        specialButton.disabled = true;
        codeInputContainer.style.display = 'block';
    } else {
        attackButton.disabled = false;
        specialButton.disabled = false;
        codeInputContainer.style.display = 'none';
    }

    statusEl.textContent = gameActive
        ? "Player turn: " + characters[currentCharacterIndex].name
        : 'Game Over';
}

function selectCharacter(index) {
    if (!gameActive || awaitingCodeInput) return;
    currentCharacterIndex = index;
    updateUI();
}

function selectEnemy(index) {
    if (!gameActive || awaitingCodeInput) return;
    currentEnemyIndex = index;
    updateUI();
}

function startAttack(isSpecial) {
    if (!gameActive || awaitingCodeInput) return;
    if (isSpecial && characters[currentCharacterIndex].specialUsed) {
        logMessage(`${characters[currentCharacterIndex].name} has already used their special skill.`);
        return;
    }
    awaitingCodeInput = true;
    // Pick a random question for the attack
    currentQuestionIndex = Math.floor(Math.random() * codeQuestions.length);
    questionInput.textContent = codeQuestions[currentQuestionIndex].question;
    codeInput.value = '';
    codeInput.focus();
    updateUI();
    logMessage(`${characters[currentCharacterIndex].name} is attempting to ${isSpecial ? 'use special skill' : 'attack'} on ${enemies[currentEnemyIndex].name}`);
    currentAction = isSpecial ? 'special' : 'attack';
}

function validateCode(code) {
    // Validate player's answer against the correct answer for the current question
    if (currentQuestionIndex === null) return false;
    const correctAnswer = codeQuestions[currentQuestionIndex].answer;
    // Normalize whitespace and case for comparison
    const normalize = str => str.replace(/\s+/g, ' ').trim().toLowerCase();
    return normalize(code) === normalize(correctAnswer);
}

function applyDamage(target, damage) {
    target.hp = Math.max(0, target.hp - damage); // Ensures hp doesn't go below 0
}

function applyBuff(character) {
    character.buffActive = true;
    logMessage(`${character.name} is buffed and will deal double damage next turn!`);
}

function applyShield(character) {
    character.shieldActive = true;
    logMessage(`${character.name} is shielded and will take less damage from the next enemy attack!`);
}

function specialSkillEffect(character) {
    switch (character.name) {
        case 'Knight':
            applyShield(character);
            break;
        case 'Wizard':
            enemies.forEach(enemy => {
                applyDamage(enemy, 20);
                logMessage(`Wizard's AoE hits ${enemy.name} for 20 damage!`);
            });
            break;
        case 'Archer':
            applyBuff(character);
            break;
    }
    character.specialUsed = true;
}

function enemyAttack() {
    const enemy = enemies[currentEnemyIndex];
    const character = characters[currentCharacterIndex];
    let damage = Math.floor(Math.random() * 20) + 10; // Damage varies from 10 to 30
    if (character.shieldActive) {
        damage = Math.floor(damage / 2); // Reduce damage by half if shield is active
        character.shieldActive = false; // Shield is consumed after one attack
        logMessage(`${character.name}'s shield reduces damage to ${damage}!`);
    }
    applyDamage(character, damage);
    logMessage(`${enemy.name} attacks ${character.name} for ${damage} damage!`);

    if (character.hp <= 0) {
        logMessage(`${character.name} has been defeated!`);
        const aliveCharacters = characters.filter(c => c.hp > 0);
        if (aliveCharacters.length === 0) {
            gameActive = false;
            statusEl.textContent = 'All characters defeated! Game Over.';
        } else {
            do {
                currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
            } while (characters[currentCharacterIndex].hp <= 0);
            logMessage(`Next character: ${characters[currentCharacterIndex].name}`);
        }
    }
}

function submitCode() {
    if (!awaitingCodeInput) return;
    const code = codeInput.value;
    if (validateCode(code)) {
        if (currentAction === 'special') {
            specialSkillEffect(characters[currentCharacterIndex]);
        } else {
            let damage = 15;
            if (characters[currentCharacterIndex].buffActive) {
                damage *= 2;
                characters[currentCharacterIndex].buffActive = false;
            }
            applyDamage(enemies[currentEnemyIndex], damage);
            logMessage(`${characters[currentCharacterIndex].name} successfully attacked ${enemies[currentEnemyIndex].name} for ${damage} damage!`);
            if (enemies[currentEnemyIndex].hp <= 0) {
                logMessage(`${enemies[currentEnemyIndex].name} defeated!`);
                enemies.splice(currentEnemyIndex, 1);
                if (enemies.length === 0) {
                    floor++;
                    logMessage(`Floor ${floor} reached! Enemies are stronger now.`);
                    for (let i = 0; i < 3; i++) {
                        enemies.push({ name: `Enemy ${i + 1}`, hp: 100 + floor * 20, maxHp: 100 + floor * 20 });
                    }
                }
                currentEnemyIndex = 0;
            } else {
                currentEnemyIndex = (currentEnemyIndex + 1) % enemies.length;
            }
        }
        do {
            currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
        } while (characters[currentCharacterIndex].hp <= 0);
    } else {
        logMessage('Code validation failed! Enemy counterattacks!');
        enemyAttack();
    }
    awaitingCodeInput = false;
    updateUI();
}

function resetGame() {
    characters.forEach(char => {
        char.hp = char.maxHp;
        char.specialUsed = false;
        char.buffActive = false;
    });
    enemies.length = 0;
    for (let i = 0; i < 3; i++) {
        enemies.push({ name: `Enemy ${i + 1}`, hp: 100, maxHp: 100 });
    }
    floor = 1;
    currentCharacterIndex = 0;
    currentEnemyIndex = 0;
    gameActive = true;
    awaitingCodeInput = false;
    gameLog.textContent = '';
    updateUI();
}

// Event Listeners
document.querySelectorAll('.character-button').forEach((button) => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(button.getAttribute('data-index'));
        selectCharacter(index);
        updateSelectedButtons();
    });
});

document.querySelectorAll('.enemy-button').forEach((button) => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(button.getAttribute('data-index'));
        selectEnemy(index);
        updateSelectedButtons();
    });
});

function updateSelectedButtons() {
    document.querySelectorAll('.character-button').forEach((button) => {
        const index = parseInt(button.getAttribute('data-index'));
        if (index === currentCharacterIndex) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
    document.querySelectorAll('.enemy-button').forEach((button) => {
        const index = parseInt(button.getAttribute('data-index'));
        if (index === currentEnemyIndex) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
    updateHpStats();
}

function updateHpStats() {
    const characterHpValue = document.getElementById('characterHpValue');
    const enemyHpValue = document.getElementById('enemyHpValue');
    if (characters[currentCharacterIndex]) {
        characterHpValue.textContent = characters[currentCharacterIndex].hp;
    } else {
        characterHpValue.textContent = '-';
    }
    if (enemies[currentEnemyIndex]) {
        enemyHpValue.textContent = enemies[currentEnemyIndex].hp;
    } else {
        enemyHpValue.textContent = '-';
    }
}

attackButton.addEventListener('click', () => startAttack(false));
specialButton.addEventListener('click', () => startAttack(true));
submitCodeButton.addEventListener('click', submitCode);
resetButton.addEventListener('click', resetGame);

// Enable tab key support in codeInput textarea
codeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        // Insert 4 spaces for tab
        const tab = '    ';
        this.value = this.value.substring(0, start) + tab + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + tab.length;
    }
});

// Initialize the game
resetGame();
