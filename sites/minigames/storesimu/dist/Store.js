export class Store {
    constructor() {
        this.inventory = 0; // バックヤードの在庫
        this.shelfCount = 0; // 棚に出ている数
        this.maxShelf = 10; // 棚の最大容量
        this.itemData = {
            id: 'raw_ebi',
            name: '生エビ',
            basePrice: 600,
            playerPrice: 800
        };
    }
    buyStock(money, cost) {
        if (money >= cost) {
            this.inventory++;
            return money - cost;
        }
        return money;
    }
    restockShelf() {
        // バックヤードから棚へ移動
        while (this.inventory > 0 && this.shelfCount < this.maxShelf) {
            this.inventory--;
            this.shelfCount++;
        }
    }
}
