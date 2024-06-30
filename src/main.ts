import crypto from "crypto";
import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");

class Transaction {
	signature?: string;

	constructor (readonly fromAddress: string | null, readonly toAddress: string, readonly amount: number) {
	}

	calculateHash () {
		return crypto.createHash("sha256").update(this.fromAddress + this.toAddress + this.amount).digest("hex");
	}

	sign (key: any) {
		if (key.getPublic("hex") !== this.fromAddress) throw new Error();
		const hashTx = this.calculateHash();
		this.signature = (key.sign(hashTx, "base64")).toDER("hex");
	}

	isValid () {
		if (this.fromAddress === null) return true;
		if (!this.signature || this.signature.length === 0) return false;
		const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}

class Block {
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

class Blockchain {
	chain: Block[];
	difficulty = 2;
	pendingTransactions: Transaction[] = [];
	miningReward = 100;

	constructor (timestamp: number) {
		this.chain = [this.createGenesis(timestamp)];
	}

	createGenesis (timestamp: number) {
		return new Block(timestamp, [], "");
	}

	getLastBlock () {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransactions (rewardAddress: string) {
		const previousBlock = this.chain[this.chain.length - 1];
		const block = new Block(Date.now(), this.pendingTransactions, previousBlock.hash);
		block.mine(this.difficulty);
		console.log("Block successfully mined!");
		this.chain.push(block);
		this.pendingTransactions = [
			new Transaction(null, rewardAddress, this.miningReward)
		];
	}

	createTransaction (transaction: Transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) throw new Error();
		if (!transaction.isValid()) throw new Error();
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress (address: string) {
		let balance = 0;
		for (const block of this.chain) {
			for (const transaction of block.transactions) {
				if (transaction.fromAddress === address) {
					balance -= transaction.amount;
				}
				if (transaction.toAddress === address) {
					balance += transaction.amount;
				}
			}
		}
		return balance;
	}

	isValid () {
		for (const [index, block ] of this.chain.entries()) {
			if (index === 0) continue;
			const previousBlock = this.chain[index - 1];
			if (!block.hasValidTransactions()) {
				console.log("invalid transactions");
				return false;
			}
			if (block.hash !== block.calculateHash()) {
				console.log("invalid block hash");
				return false;
			}
			if (previousBlock.hash !== block.previousHash) {
				console.log("invalid previous block hash");
				return false;
			}
		}
		return true;
	}
}

const keyA = ec.genKeyPair();
const publicKeyA = keyA.getPublic("hex");
const privateKeyA = keyA.getPrivate("hex");
const keyB = ec.genKeyPair();
const publicKeyB = keyB.getPublic("hex");
const privateKeyB = keyB.getPrivate("hex");
const keyC = ec.genKeyPair();
const publicKeyC = keyC.getPublic("hex");
const privateKeyC = keyC.getPrivate("hex");

const timestamp = (new Date("2024-01-01T10:00:00Z")).getTime();
const branasCoin = new Blockchain(timestamp);

const transaction1 = new Transaction(publicKeyA, publicKeyB, 100);
transaction1.sign(keyA);
branasCoin.createTransaction(transaction1);

const transaction2 = new Transaction(publicKeyB, publicKeyA, 50);
transaction2.sign(keyB);
branasCoin.createTransaction(transaction2);

branasCoin.minePendingTransactions(publicKeyC);

console.log(JSON.stringify(branasCoin, undefined, 4));

console.log("balance a: ", branasCoin.getBalanceOfAddress(publicKeyA));
console.log("balance b: ", branasCoin.getBalanceOfAddress(publicKeyB));
console.log("balance c: ", branasCoin.getBalanceOfAddress(publicKeyC));

branasCoin.minePendingTransactions(publicKeyC);

console.log("balance c: ", branasCoin.getBalanceOfAddress(publicKeyC));

console.log(branasCoin.isValid());
