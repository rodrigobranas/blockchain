import { ec as EC } from "elliptic";
import Block from "./Block";
import Transaction from "./Transaction";
import UTXO from "./UTXO";
const ec = new EC("secp256k1");

export default class Blockchain {
	chain: Block[];
	difficulty = 2;
	mempool: Transaction[] = [];
	miningReward = 100;
	utxos: Set<UTXO> = new Set();
	transactionFee = 0.01;

	constructor (timestamp: number) {
		this.chain = [this.createGenesis(timestamp)];
	}

	createGenesis (timestamp: number) {
		return new Block("", 0, timestamp, [], "");
	}

	getLastBlock () {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransactions (rewardAddress: string) {
		// including coinbase in the local mempool
		const coinbase = new Transaction(null, rewardAddress, this.miningReward);
		this.createTransaction(coinbase);
		//
		const previousBlock = this.chain[this.chain.length - 1];
		const block = new Block(rewardAddress, this.miningReward, Date.now(), this.mempool, previousBlock.hash);
		block.mine(this.difficulty);
		this.chain.push(block);
		console.log("Block successfully mined!", this.chain.indexOf(block));
		for (const transaction of this.mempool) {
			if (transaction.fromAddress) this.utxos.add(new UTXO(rewardAddress, this.transactionFee));
		}
		this.mempool = [];
	}

	createTransaction (transaction: Transaction) {
		if (!transaction.toAddress) throw new Error();
		if (!transaction.isValid()) throw new Error();
		let totalUTXOs = 0;
		for (const utxo of this.utxos) {
			if (utxo.owner === transaction.fromAddress) {
				transaction.inputs.push(utxo);
				totalUTXOs += utxo.amount;
				if (totalUTXOs >= (transaction.amount + this.transactionFee)) break;
			}
		}
		if (transaction.fromAddress && totalUTXOs < (transaction.amount + this.transactionFee)) throw new Error();
		transaction.outputs.push(new UTXO(transaction.toAddress, transaction.amount));
		const change = totalUTXOs - transaction.amount;
		if (transaction.fromAddress && change > 0) transaction.outputs.push(new UTXO(transaction.fromAddress, change));
		// apply utxos to local state
		for (const utxo of transaction.inputs) {
			this.utxos.delete(utxo);
		}
		for (const utxo of transaction.outputs) {
			this.utxos.add(utxo);
		}
		this.mempool.push(transaction);
	}

	getBalanceOfAddress (address: string) {
		let balance = 0;
		for (const utxo of this.utxos) {
			if (utxo.owner === address) {
				balance += utxo.amount;
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