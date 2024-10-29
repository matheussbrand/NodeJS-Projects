// External Module
import inquirer from "inquirer";
import chalk from "chalk";

// Internal module
import fs from "fs";

function operation() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'Create a new account',
                    'Check balance',
                    'Deposit',
                    'Withdraw',
                    'Logout'
                ],
            },
        ])
        .then((answer) => {
            const action = answer['action'];

            if (action === 'Create a new account') {
                createAccount();
            } else if (action === 'Check balance') {
                getAccountBalance();
            } else if (action === 'Deposit') {
                deposit();
            } else if (action === 'Withdraw') {
                withdraw();
            } else if (action === 'Logout') {
                console.log(chalk.bgBlue.black('Thanks for using Accounts!'));
                process.exit();
            }
        })
        .catch((err) => console.log(err));
}

// Create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Account creation initiated!'));
    buildAccount();
}

function buildAccount() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Enter your account name:',
            },
        ])
        .then((answer) => {
            const accountName = answer['accountName'];

            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts');
            }

            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('This account already exists.'));
                return buildAccount();
            }

            fs.writeFileSync(
                `accounts/${accountName}.json`,
                '{"balance": 0}',
                (err) => {
                    if (err) console.log(err);
                }
            );

            console.log(chalk.green('Congratulations! Your account has been created!'));
            operation();
        })
        .catch((err) => console.log(err));
}

// Deposit amount to an account
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Enter your account name:',
        }
    ])
        .then((answer) => {
            const accountName = answer['accountName'];

            // Verify if account exists 
            if (!checkAccount(accountName)) {
                return deposit();
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Enter the amount you want to deposit:',
                },
            ])
                .then((answer) => {
                    const amount = answer['amount'];
                    addAmount(accountName, amount);
                    operation();
                })
                .catch((err) => console.log(err));

        })
        .catch(err => console.log(err));
}

// Check if account exists
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Account does not exist, enter another name.'));
        return false;
    }
    return true;
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black('Please try again.'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            if (err) console.log(err);
        }
    );

    console.log(chalk.green(`Successfully deposited $${amount}!`));
    operation();
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    });

    return JSON.parse(accountJSON);
}

// Show account balance
function getAccountBalance() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Enter your account name:'
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName'];

            if (!checkAccount(accountName)) {
                return getAccountBalance();
            }

            const accountData = getAccount(accountName);

            console.log(chalk.bgBlue.black(
                `Your balance is $${accountData.balance}.`
            ));
            operation();
        })
        .catch((err) => console.log(err));
}

// Withdraw an amount
function withdraw() {
    inquirer
        .prompt([
            {
                name: 'accountName',
                message: 'Enter your account name:',
            }
        ])
        .then((answer) => {
            const accountName = answer['accountName'];

            if (!checkAccount(accountName)) {
                return withdraw();
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Enter the amount you want to withdraw:',
                }
            ])
                .then((answer) => {
                    const amount = answer['amount'];
                    removeAmount(accountName, amount);
                    operation();
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount || isNaN(amount)) {
        console.log(chalk.bgRed.black('An error occurred, please try again.'));
        return withdraw();
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Insufficient funds.'));
        return withdraw();
    }

    accountData.balance -= parseFloat(amount);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            if (err) console.log(err);
        }
    );

    console.log(chalk.green(`You withdrew $${amount} from your account.`));
}

operation();
