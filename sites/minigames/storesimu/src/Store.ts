export interface Item {
    id: string;
    name: string;
    basePrice: number; // 市場価値
    playerPrice: number; // プレイヤーの売価
}

export class Store {
    inventory: number = 0; // バックヤードの在庫
    shelfCount: number = 0; // 棚に出ている数
    maxShelf: number = 10; // 棚の最大容量

    itemData: Item = {
        id: 'raw_ebi',
        name: '生エビ',
        basePrice: 600,
        playerPrice: 800
    };

    buyStock(money: number, cost: number): number {
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