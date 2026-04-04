document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById('greeting-target');
    const hour = new Date().getHours();
    let message = "";

    // 時間帯によってメッセージを変える
    if (hour >= 5 && hour < 11) {
        message = "おはようございます";
    } else if (hour >= 11 && hour < 18) {
        message = "こんにちは";
    } else {
        message = "こんばんは";
    }

    // タイピングエフェクトの実装
    let i = 0;
    target.innerText = ""; // 初期化

    function typeWriter() {
        if (i < message.length) {
            target.innerText += message.charAt(i);
            i++;
            setTimeout(typeWriter, 150); // 打鍵速度（ミリ秒）
        }
    }

    typeWriter();
});

    // --- 2. メニュー項目の動的生成 (拡張対応) ---
    const menuItems = [
        {
            title: "統合版サーバー地図",
            desc: "マイクラサーバーの状況を毎日更新。",
            url: "/bedrockmap",
            icon: "🗺️"
        },
        {
            title: "統合版サーバーネザー地図",
            desc: "ネザーの地図はこちら",
            url: "/bedrocknethermap",
            icon: "🗺️"
        },
        {
            title: "ミニゲーム",
            desc: "ブラウザで遊べるちょっとしたゲーム",
            url: "/sites/minigames",
            icon: "🎮"
        },
        /*{
            title: "PCレビュー",
            desc: "自作PCパーツや周辺機器の正直な感想をまとめています。",
            url: "/sites/pcreview",
            icon: "💻"
        }*/
    ];

    const navGrid = document.getElementById('nav-grid');

    menuItems.forEach(item => {
        const card = document.createElement('a');
        card.href = item.url;
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <div class="card-icon">${item.icon}</div>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
            </div>
        `;
        navGrid.appendChild(card);
    });
;