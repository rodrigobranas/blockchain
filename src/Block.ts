import crypto from "crypto";

export default class Block {
	hash: string;
	nonce = 0;

	constructor (readonly timestamp: number, readonly transactions: any[], public previousHash: string) {
		this.hash = this.calculateHash();
	}

	calculateHash () {
		const value = this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce;
		return crypto.createHash("sha256").update(value).digest("hex");
	}

	mine (difficulty: number) {
		while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
		console.log("block mined: " + this.hash);
	}

	hasValidTransactions () {
		for (const tx of this.transactions) {
			if (!tx.isValid()) return false;
		}
		return true;
	}
}