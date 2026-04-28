const walletRepository = require('./wallet.repository');
const AppError = require('../../utils/AppError');
const { withTransaction } = require('../../utils/transaction');
const { sendToUser } = require('../../utils/socket');

class WalletService {
    async credit(userId, amount, credits, remarks, referenceId = null, externalClient = null) {
        const action = async (client) => {
            const balance = await walletRepository.creditBalance(userId, credits, client);
            if (balance === null) {
                throw new AppError('User not found.', 404);
            }

            const transaction = await walletRepository.createTransaction({
                user_id: userId,
                type: 'CREDIT',
                amount,
                credits,
                remarks,
                reference_id: referenceId
            }, client);

            transaction.wallet_balance = balance;
            return transaction;
        };

        if (externalClient) {
            return action(externalClient);
        }

        const transaction = await withTransaction(action);
        this.emitBalanceUpdate(userId, transaction.wallet_balance);
        return transaction;
    }

    async debit(userId, credits, remarks, referenceId = null, externalClient = null) {
        const action = async (client) => {
            const balance = await walletRepository.debitBalance(userId, credits, client);
            if (balance === null) {
                throw new AppError('Insufficient wallet balance.', 400);
            }

            const transaction = await walletRepository.createTransaction({
                user_id: userId,
                type: 'DEBIT',
                amount: 0,
                credits,
                remarks,
                reference_id: referenceId
            }, client);

            transaction.wallet_balance = balance;
            return transaction;
        };

        if (externalClient) {
            return action(externalClient);
        }

        const transaction = await withTransaction(action);
        this.emitBalanceUpdate(userId, transaction.wallet_balance);
        return transaction;
    }

    async getBalance(userId) {
        return walletRepository.getBalance(userId);
    }

    emitBalanceUpdate(userId, knownBalance = null) {
        return Promise.resolve()
            .then(async () => {
                const balance = knownBalance ?? await this.getBalance(userId);
                sendToUser(userId, 'wallet_update', { wallet_balance: balance });
            })
            .catch((error) => {
                console.error('[SOCKET ERROR] Failed to send balance update:', error.message);
            });
    }
}

module.exports = new WalletService();
