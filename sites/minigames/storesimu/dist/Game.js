export class GameState {
    constructor() {
        this.money = 5000;
        this.day = 1;
        this.rank = 1;
        this.staffCount = 0;
        this.tick = 0;
        this.isGameOver = false;
        // 経費パラメータ
        this.dailyRent = 2000;
        this.staffWage = 1000;
    }
    updateTime() {
        if (this.isGameOver)
            return;
        this.tick++;
        // 約60フレーム = 1秒。60秒(3600フレーム)で1日経過とする
        if (this.tick >= 3600) {
            this.tick = 0;
            this.day++;
            this.payExpenses();
        }
    }
    payExpenses() {
        const totalExpenses = this.dailyRent + (this.staffCount * this.staffWage);
        this.money -= totalExpenses;
        console.log(`${this.day}日目: 経費 ${totalExpenses}円を支払いました。`);
        if (this.money < 0) {
            this.isGameOver = true;
            alert("資金が底をつきました…。倒産です。\nゲームオーバー！");
        }
    }
    hireStaff() {
        if (this.money >= 3000) { // 採用コスト
            this.money -= 3000;
            this.staffCount++;
            return true;
        }
        return false;
    }
}
