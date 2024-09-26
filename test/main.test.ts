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
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(0);
	branasCoin.minePendingTransactions(walletC.publicKey); // 100 reward
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(100);
	branasCoin.minePendingTransactions(walletC.publicKey); // 100 reward
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(200);
	branasCoin.minePendingTransactions(walletC.publicKey); // 100 reward
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(300);
	// creating transaction 1
	const transaction1 = new Transaction(walletC.publicKey, walletA.publicKey, 50); // A earn 50 from C
	walletC.sign(transaction1);
	branasCoin.createTransaction(transaction1);
	// creating transaction 2
	const transaction2 = new Transaction(walletC.publicKey, walletB.publicKey, 50); // B earn 50 from C
	walletC.sign(transaction2);
	branasCoin.createTransaction(transaction2);
	// mining
	branasCoin.minePendingTransactions(walletC.publicKey); // 100 reward
	expect(branasCoin.getBalanceOfAddress(walletA.publicKey)).toBe(50); // 0.01 reward
	expect(branasCoin.getBalanceOfAddress(walletB.publicKey)).toBe(50); // 0.01 reward
	expect(branasCoin.getBalanceOfAddress(walletC.publicKey)).toBe(300.02);
	expect(branasCoin.isValid()).toBe(true);
});

test("Should test wallet recover", function () {
	const walletA = Wallet.setup();
	const walletB = Wallet.restore(walletA.seed);
	console.log("walletA", walletA);
	console.log("walletB", walletB);
	expect(walletA.privateKey).toBe(walletB.privateKey);
});
