document.addEventListener('DOMContentLoaded', () => {
    const gameItems = [
        {
            title: "障害物回避ジャンプゲーム",
            desc: "ジャンプで障害物をよけろ！",
            url: "/sites/minigames/jumpgame/",
            tag: "単純アクション",
            image: "🏃"
        },
        {
            title: "ブロック崩し",
            desc: "HTML5 Canvasで作ったシンプルなブロック崩し。",
            url: "/sites/minigames/blockbreaker/",
            tag: "アクション",
            image: "🧱"
        },
        {
            title: "経営シミュレーションゲーム",
            desc: "経営シミュレーション",
            url: "/sites/minigames/storesimu/",
            tag: "シミュレーション",
            image: "🏪"
        }
        // 今後ゲームを増やしたい時は、ここにカンマ区切りで追加するだけ！
    ];

    const gameGrid = document.getElementById('game-grid');

    gameItems.forEach(game => {
        const card = document.createElement('a');
        card.href = game.url;
        card.className = 'card game-card';
        card.innerHTML = `
            <div class="card-content">
                <span class="game-tag">${game.tag}</span>
                <div class="card-icon">${game.image}</div>
                <h3>${game.title}</h3>
                <p>${game.desc}</p>
            </div>
        `;
        gameGrid.appendChild(card);
    });
});