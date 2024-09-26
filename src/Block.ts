import crypto from "crypto";

export default class Block {
	hash: string = "";
	nonce: number = 0;
	merkleRoot: string;

	constructor (readonly producerAddress: string, readonly miningReward: number, readonly timestamp: number, readonly transactions: any[], public previousHash: string) {
		this.merkleRoot = crypto.createHash("sha256").update(JSON.stringify(this.transactions)).digest("hex");
	}

	calculateHash () {
		const value = this.previousHash + this.merkleRoot + this.nonce;
		return crypto.createHash("sha256").update(value).digest("hex");
	}

	mine (difficulty: number) {
		while (true) {
			this.hash = this.calculateHash();
			if (this.hash.substring(0, difficulty) === Array(difficulty + 1).join("0")) {
				console.log("block mined: " + this.hash);
				break;
			} else {
				this.nonce++;
			}
		}
	}

	hasValidTransactions () {
		for (const tx of this.transactions) {
			if (!tx.isValid()) return false;
		}
		return true;
	}
}