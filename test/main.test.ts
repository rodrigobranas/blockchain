import Blockchain from "../src/Blockchain";
import Transaction from "../src/Transaction";
import Wallet from "../src/Wallet";

test("Should test the blockchain", function () {
	// creating wallets
	const walletA = Wallet.setup();
	const walletB = Wallet.setup();
	const walletC = Wallet.setup();
	// creating blockchain
	const timestamp = (new Date("2024-01-01T10:00:00Z")).getTime();
	const branasCoin = new Blockchain(timestamp);
	// creating transaction 1
	const transaction1 = new Transaction(walletA.publicKey, walletB.publicKey, 100);
	walletA.sign(transaction1);
	branasCoin.createTransaction(transaction1);
	// creating transaction 2
	const transaction2 = new Transaction(walletB.publicKey, walletA.publicKey, 50);
	walletB.sign(transaction2);
	branasCoin.createTransaction(transaction2);
	// mining
	branasCoin.minePendingTransactions(walletC.publicKey);
	expect(branasCoin.getBalanceOfAddress(walletA.publicKey)).toBe(-50);
	expect(branasCoin.getBalanceOfAddress(walletB.publicKey)).toBe(50);
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(0);
	// mining
	branasCoin.minePendingTransactions(walletC.publicKey);
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(100);
	expect(branasCoin.isValid()).toBe(true);
});
