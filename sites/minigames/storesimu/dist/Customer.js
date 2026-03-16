export class Customer {
    constructor() {
        this.x = 640;
        this.y = 300;
        this.speed = 2;
        this.state = 'WALKING_IN';
        this.willBuy = false;
    }
    update(registerX) {
        if (this.state === 'WALKING_IN') {
            this.x -= this.speed;
            if (this.x <= registerX) {
                this.x = registerX;
                this.state = 'WAITING';
            }
        }
        else if (this.state === 'LEAVING') {
            this.x += this.speed;
        }
    }
    // 価格による購買判定
    decideToBuy(store) {
        const ratio = store.itemData.playerPrice / store.itemData.basePrice;
        // 市場価格より高すぎると買わない（1.5倍で確率ほぼ0）
        let buyChance = 1.0 - ((ratio - 1.0) * 2);
        if (buyChance > 1)
            buyChance = 1;
        if (buyChance < 0)
            buyChance = 0;
        this.willBuy = Math.random() < buyChance;
        return this.willBuy;
    }
}
