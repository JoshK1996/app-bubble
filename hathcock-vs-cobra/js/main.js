// Game initialization and main loop
let scene, camera, renderer;
let player, enemy;
let gameLoop;
let isGameRunning = false;

// Game state
const gameState = {
    ammo: {
        chamber: 1,
        reserve: 5
    },
    isReloading: false
};

// DOM Elements
const gameContainer = document.getElementById('game-container');
const menu = document.getElementById('menu');
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.getElementById('loading-progress');
const startButton = document.getElementById('start-button');
const gameOver = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const menuButton = document.getElementById('menu-button');
const ammoCounter = document.getElementById('ammo-counter');
const chamberDisplay = document.getElementById('chamber-display');
const reserveDisplay = document.getElementById('reserve-display');
const reloadText = document.getElementById('reload-text');

// Initialize game objects and start the game loop
function init() {
    setupScene();
    setupPlayer();
    setupEnemy();
    setupEventListeners();
    animate();
}

// Scene setup
function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameContainer.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Set camera position
    camera.position.z = 5;
}

// Player setup
function setupPlayer() {
    player = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        health: 100,
        isAiming: false,
        isHoldingBreath: false
    };
}

// Enemy setup
function setupEnemy() {
    enemy = {
        position: new THREE.Vector3(10, 0, 0),
        health: 100,
        isMoving: false,
        lastMoveTime: 0
    };
}

// Event listeners
function setupEventListeners() {
    // Mouse movement for aiming
    document.addEventListener('mousemove', (event) => {
        if (!isGameRunning) return;
        
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;
        
        player.rotation.y -= movementX * 0.002;
        player.rotation.x -= movementY * 0.002;
        
        // Clamp vertical rotation
        player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, player.rotation.x));
    });

    // Shooting
    document.addEventListener('mousedown', (event) => {
        if (event.button === 0 && isGameRunning && !gameState.isReloading) {
            shoot();
        }
    });

    // Reload
    document.addEventListener('keydown', (event) => {
        if (event.key === 'r' && isGameRunning && !gameState.isReloading) {
            reload();
        }
    });

    // Hold breath
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Shift' && isGameRunning) {
            player.isHoldingBreath = true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift') {
            player.isHoldingBreath = false;
        }
    });

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Shooting mechanics
function shoot() {
    if (gameState.ammo.chamber <= 0) {
        reload();
        return;
    }

    gameState.ammo.chamber--;
    updateAmmoDisplay();

    // Calculate shot accuracy based on player state
    const accuracy = calculateAccuracy();
    
    // Ray casting for hit detection
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const hit = intersects[0];
        if (hit.object === enemy) {
            const damage = calculateDamage(accuracy);
            enemy.health -= damage;
            
            if (enemy.health <= 0) {
                gameOver();
            }
        }
    }
}

// Reload mechanics
function reload() {
    if (gameState.ammo.reserve <= 0) {
        // Out of ammo
        return;
    }

    gameState.isReloading = true;
    reloadText.style.display = 'block';

    setTimeout(() => {
        gameState.ammo.chamber = 1;
        gameState.ammo.reserve--;
        gameState.isReloading = false;
        reloadText.style.display = 'none';
        updateAmmoDisplay();
    }, 2000);
}

// Calculate shot accuracy
function calculateAccuracy() {
    let accuracy = 1.0;
    
    if (player.isHoldingBreath) {
        accuracy *= 0.5; // Better accuracy when holding breath
    }
    
    if (player.isMoving) {
        accuracy *= 2.0; // Worse accuracy while moving
    }
    
    return accuracy;
}

// Calculate damage based on accuracy
function calculateDamage(accuracy) {
    const baseDamage = 25;
    return baseDamage * (1 / accuracy);
}

// Update ammo display
function updateAmmoDisplay() {
    chamberDisplay.textContent = gameState.ammo.chamber;
    reserveDisplay.textContent = gameState.ammo.reserve;
}

// Game over
function gameOver() {
    isGameRunning = false;
    gameOver.style.display = 'block';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (isGameRunning) {
        updateGame();
    }
    
    renderer.render(scene, camera);
}

// Update game state
function updateGame() {
    // Update enemy AI
    updateEnemyAI();
    
    // Update player movement
    updatePlayerMovement();
}

// Enemy AI
function updateEnemyAI() {
    const now = Date.now();
    if (now - enemy.lastMoveTime > 3000) { // Move every 3 seconds
        enemy.isMoving = true;
        enemy.position.x += (Math.random() - 0.5) * 2;
        enemy.position.z += (Math.random() - 0.5) * 2;
        enemy.lastMoveTime = now;
        enemy.isMoving = false;
    }
}

// Player movement
function updatePlayerMovement() {
    // Add WASD movement here
    // This will be implemented in the next update
}

// Start the game when the page loads
window.addEventListener('load', init); 