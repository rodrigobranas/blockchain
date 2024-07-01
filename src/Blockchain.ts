import crypto from "crypto";
import { ec as EC } from "elliptic";
import Block from "./Block";
import Transaction from "./Transaction";
const ec = new EC("secp256k1");

export default class Blockchain {
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