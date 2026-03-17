import { GameState } from './Game.js';
import { Store } from './Store.js';
import { Customer } from './Customer.js';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const game = new GameState();
const store = new Store();
let customers = [];
// 視点管理
let currentView = 'STOCK';
// アセット管理
const images = {};
const assetNames = [
    'bg_store_side', 'bg_store_register',
    'item_ebi_raw', 'char_customer', 'char_staff'
];
const assetBaseUrl = new URL('../assets/images/', import.meta.url).href;
// 初期化
function init() {
    // 画像の読み込み
    assetNames.forEach(name => {
        const img = new Image();
        img.src = `${assetBaseUrl}${name}.png`;
        images[name] = img;
    });
    setupUI();
    requestAnimationFrame(gameLoop);
}
// UIイベントのバインド
function setupUI() {
    const btnStockView = document.getElementById('btn-stock-view');
    const btnRegisterView = document.getElementById('btn-register-view');
    const panelStock = document.getElementById('panel-stock');
    const panelRegister = document.getElementById('panel-register');
    // 視点切り替え
    btnStockView.addEventListener('click', () => {
        currentView = 'STOCK';
        btnStockView.classList.add('active');
        btnRegisterView.classList.remove('active');
        panelStock.classList.add('active');
        panelRegister.classList.remove('active');
    });
    btnRegisterView.addEventListener('click', () => {
        currentView = 'REGISTER';
        btnRegisterView.classList.add('active');
        btnStockView.classList.remove('active');
        panelRegister.classList.add('active');
        panelStock.classList.remove('active');
    });
    // 仕入れ・価格
    document.getElementById('btn-buy-raw')?.addEventListener('click', () => {
        game.money = store.buyStock(game.money, 500);
        updateHUD();
    });
    document.getElementById('price-raw')?.addEventListener('change', (e) => {
        const target = e.target;
        store.itemData.playerPrice = parseInt(target.value) || 0;
    });
    document.getElementById('btn-restock')?.addEventListener('click', () => {
        store.restockShelf();
    });
    // レジ・雇用
    document.getElementById('btn-checkout')?.addEventListener('click', () => {
        processCheckout();
    });
    document.getElementById('btn-hire')?.addEventListener('click', () => {
        if (game.hireStaff()) {
            document.getElementById('staff-count').innerText = game.staffCount.toString();
            updateHUD();
        }
    });
}
// レジ処理
function processCheckout() {
    if (customers.length > 0 && customers[0].state === 'WAITING') {
        const customer = customers.shift();
        if (store.shelfCount > 0 && customer.decideToBuy(store)) {
            store.shelfCount--;
            game.money += store.itemData.playerPrice;
            console.log("売れました！");
        }
        else {
            console.log("高すぎる、または在庫切れで帰りました。");
        }
        customer.state = 'LEAVING';
    }
}
function updateHUD() {
    document.getElementById('money-display').innerText = game.money.toString();
    document.getElementById('day-display').innerText = game.day.toString();
}
// メインループ
function gameLoop() {
    if (game.isGameOver)
        return;
    game.updateTime();
    // お客さんのランダム生成
    if (Math.random() < 0.01 && customers.length < 3) {
        customers.push(new Customer());
    }
    // お客さんの更新
    customers.forEach(c => c.update(300));
    // スタッフによる自動レジ
    if (game.staffCount > 0 && game.tick % 60 === 0) {
        processCheckout();
    }
    updateHUD();
    draw();
    requestAnimationFrame(gameLoop);
}
// 描画処理
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentView === 'STOCK') {
        // 品出しビュー（サイドビュー）
        if (images.bg_store_side && images.bg_store_side.complete) {
            ctx.drawImage(images.bg_store_side, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // 棚と在庫の簡易描画
        ctx.fillStyle = '#fff';
        ctx.font = '20px Courier New';
        ctx.fillText(`バックヤード在庫: ${store.inventory} 個`, 50, 100);
        ctx.fillText(`棚の陳列数: ${store.shelfCount} / ${store.maxShelf}`, 50, 150);
    }
    else {
        // レジビュー（トップダウン）
        if (images.bg_store_register && images.bg_store_register.complete) {
            ctx.drawImage(images.bg_store_register, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // レジカウンター
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(250, 280, 100, 50);
        // お客さんの描画
        customers.forEach(c => {
            if (images.char_customer && images.char_customer.complete) {
                ctx.drawImage(images.char_customer, c.x, c.y, 30, 30);
            } else {
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(c.x, c.y, 30, 30);
            }
            if (c.state === 'WAITING') {
                ctx.fillStyle = '#fff';
                ctx.fillText('💭', c.x, c.y - 10);
            }
        });
        // スタッフの描画
        if (game.staffCount > 0) {
            if (images.char_staff && images.char_staff.complete) {
                ctx.drawImage(images.char_staff, 285, 240, 30, 30);
            } else {
                ctx.fillStyle = '#3498db';
                ctx.fillRect(285, 240, 30, 30); // レジの奥に立つ
            }
        }
    }
}
// 起動
init();
