document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameoverScreen = document.getElementById('gameover-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scoreDisplay = document.getElementById('score-display');
    const finalScoreDisplay = document.getElementById('final-score');

    let player = {
        x: 50,
        y: canvas.height - 50,
        width: 30,
        height: 30,
        velocityY: 0,
        isJumping: false,
        draw() {
            ctx.fillStyle = 'red'; // プレイヤーの色
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    let ground = {
        x: 0,
        y: canvas.height - 20,
        width: canvas.width,
        height: 20,
        draw() {
            ctx.fillStyle = 'green'; // 地面の色
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    let enemies = [];
    let obstacles = []; // 障害物も追加
    let score = 0;
    let gameFrame = 0;
    let isGameOver = false;

    const gravity = 0.6;
    const jumpPower = -12;
    const scrollSpeed = 3;

    function initGame() {
        player.y = canvas.height - player.height - ground.height;
        player.velocityY = 0;
        player.isJumping = false;
        enemies = [];
        obstacles = [];
        score = 0;
        gameFrame = 0;
        isGameOver = false;
        scoreDisplay.textContent = `スコア: ${score}`;

        startScreen.classList.remove('active');
        gameoverScreen.classList.remove('active');
        gameScreen.classList.add('active');

        gameLoop(); // ゲームループ開始
    }

    function generateObstacle() {
        const type = Math.random() < 0.5 ? 'enemy' : 'obstacle'; // 敵か障害物か
        const size = 20 + Math.random() * 20; // ランダムなサイズ
        const yPos = ground.y - size; // 地面の上に配置
        
        if (type === 'enemy') {
            enemies.push({
                x: canvas.width,
                y: yPos,
                width: size,
                height: size,
                draw() {
                    ctx.fillStyle = 'purple'; // 敵の色
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            });
        } else {
            obstacles.push({
                x: canvas.width,
                y: yPos,
                width: size,
                height: size,
                draw() {
                    ctx.fillStyle = 'brown'; // 障害物の色
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            });
        }
    }

    function update() {
        if (isGameOver) return;

        // プレイヤーの更新
        player.velocityY += gravity;
        player.y += player.velocityY;

        // 地面との衝突判定
        if (player.y + player.height > ground.y) {
            player.y = ground.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }

        // 敵と障害物の更新
        enemies.forEach(enemy => {
            enemy.x -= scrollSpeed;
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                gameOver(); // 衝突でゲームオーバー
            }
        });
        enemies = enemies.filter(enemy => enemy.x + enemy.width > 0); // 画面外に出た敵を削除

        obstacles.forEach(obstacle => {
            obstacle.x -= scrollSpeed;
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                gameOver(); // 衝突でゲームオーバー
            }
        });
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0); // 画面外に出た障害物を削除


        // スコア更新
        gameFrame++;
        if (gameFrame % 10 === 0) { // 10フレームごとにスコア加算
            score++;
            scoreDisplay.textContent = `スコア: ${score}`;
        }

        // 敵と障害物の生成
        if (gameFrame % 100 === 0) { // 100フレームごとに新しい敵か障害物を生成
            generateObstacle();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア

        ground.draw();
        player.draw();
        enemies.forEach(enemy => enemy.draw());
        obstacles.forEach(obstacle => obstacle.draw());
    }

    function gameLoop() {
        update();
        draw();
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    function gameOver() {
        isGameOver = true;
        gameScreen.classList.remove('active');
        gameoverScreen.classList.add('active');
        finalScoreDisplay.textContent = `最終スコア: ${score}`;
    }

    // イベントリスナー
    startButton.addEventListener('click', initGame);
    restartButton.addEventListener('click', initGame);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !player.isJumping && !isGameOver) {
            player.velocityY = jumpPower;
            player.isJumping = true;
        }
    });

    // 初期表示
    startScreen.classList.add('active');
});