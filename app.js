class SplitEasy {
    constructor() {
        this.users = [];
        this.expenses = [];
        this.settlements = [];
        this.githubToken = '';
        this.gistId = '';
        this.currentTab = 'users';
        
        // Color palette for user avatars
        this.colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        
    }
    
    async init() {
        this.loadFromLocalStorage();
        this.loadSampleData();
        this.initializeTheme();

        document.body.classList.add('loading');
        if (this.githubToken && this.gistId) {
            await this.syncData();
        }
        document.body.classList.remove('loading');
        
        // Wait for DOM to be fully ready, then setup
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.switchTab('users');
            });
        } else {
            this.setupEventListeners();
            this.switchTab('users');
        }
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Tab navigation - Use event delegation to ensure reliability
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            navTabs.addEventListener('click', (e) => {
                const tabButton = e.target.closest('.nav-tab');
                if (tabButton) {
                    e.preventDefault();
                    const tabName = tabButton.getAttribute('data-tab');
                    console.log('Tab clicked:', tabName);
                    if (tabName) {
                        this.switchTab(tabName);
                    }
                }
            });
        }
        
        // GitHub sync
        const syncBtn = document.getElementById('syncData');
        const createBtn = document.getElementById('createGist');
        if (syncBtn) syncBtn.addEventListener('click', () => this.syncData());
        if (createBtn) createBtn.addEventListener('click', () => this.createNewGist());
        
        // User management
        const addUserBtn = document.getElementById('addUser');
        const userNameInput = document.getElementById('userName');
        
        if (addUserBtn) {
            addUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }
        
        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addUser();
                }
            });
        }
        
        // Expense management
        const addExpenseBtn = document.getElementById('addExpense');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addExpense();
            });
        }
        
        // Load GitHub credentials
        this.loadGitHubCredentials();
        
        // Save GitHub credentials on change
        const tokenInput = document.getElementById('githubToken');
        const gistInput = document.getElementById('gistId');
        
        if (tokenInput) {
            tokenInput.addEventListener('input', (e) => {
                this.githubToken = e.target.value;
                localStorage.setItem('githubToken', this.githubToken);
            });
        }
        
        if (gistInput) {
            gistInput.addEventListener('input', (e) => {
                this.gistId = e.target.value;
                localStorage.setItem('gistId', this.gistId);
            });
        }

        // Settlement management
        const simplifySettlementsCheckbox = document.getElementById('simplifySettlements');
        if (simplifySettlementsCheckbox) {
            simplifySettlementsCheckbox.addEventListener('change', () => {
                this.renderSettlements();
            });
        }
    }
    
    loadGitHubCredentials() {
        const savedToken = localStorage.getItem('githubToken');
        const savedGistId = localStorage.getItem('gistId');
        
        if (savedToken) {
            const tokenInput = document.getElementById('githubToken');
            if (tokenInput) {
                tokenInput.value = savedToken;
                this.githubToken = savedToken;
            }
        }
        
        if (savedGistId) {
            const gistInput = document.getElementById('gistId');
            if (gistInput) {
                gistInput.value = savedGistId;
                this.gistId = savedGistId;
            }
        }
    }
    
    loadSampleData() {
        // Only load sample data if no existing data
        if (this.users.length === 0) {
            this.users = [
                // {id: '1', name: 'Alex', color: '#FF6B6B'},
                // {id: '2', name: 'Maya', color: '#4ECDC4'},
                // {id: '3', name: 'Sam', color: '#45B7D1'}
            ];
        }
        
        if (this.expenses.length === 0) {
            this.expenses = [
                // {id: '1', description: 'Dinner at Restaurant', amount: 120, payer: '1', participants: ['1', '2', '3'], date: '2025-08-20'},
                // {id: '2', description: 'Groceries', amount: 80, payer: '2', participants: ['1', '2'], date: '2025-08-21'},
                // {id: '3', description: 'Movie tickets', amount: 60, payer: '3', participants: ['2', '3'], date: '2025-08-22'}
            ];
        }
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
    
    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Ensure we have valid tab name
        const validTabs = ['users', 'expenses', 'history', 'settlements', 'sync'];
        if (!validTabs.includes(tabName)) {
            console.error('Invalid tab name:', tabName);
            return;
        }
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to current tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        } else {
            console.error('Could not find tab button for:', tabName);
        }
        
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show active content
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
            console.log('Activated content for:', tabName);
        } else {
            console.error('Could not find content for tab:', tabName);
        }
        
        // Update current tab
        this.currentTab = tabName;
        
        // Update content for the active tab
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        console.log('Updating content for tab:', tabName);
        
        switch(tabName) {
            case 'users':
                this.renderUsers();
                break;
            case 'expenses':
                this.renderExpenses();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'settlements':
                this.renderSettlements();
                break;
            case 'sync':
                // Sync tab doesn't need dynamic rendering, just ensure credentials are loaded
                this.loadGitHubCredentials();
                break;
        }
    }
    
    async addUser() {
        const nameInput = document.getElementById('userName');
        if (!nameInput) {
            this.showNotification('User name input not found', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        console.log('Adding user:', name);
        
        if (!name) {
            this.showNotification('Please enter a user name', 'error');
            return;
        }
        
        if (this.users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('User already exists', 'error');
            return;
        }
        
        const user = {
            id: Date.now().toString(),
            name: name,
            color: this.colorPalette[this.users.length % this.colorPalette.length]
        };
        
        this.users.push(user);
        nameInput.value = '';
        
        // Force re-render
        this.renderUsers();
        this.updateExpenseForm();
        this.saveToLocalStorage();
        await this.autoSync();
        this.showNotification(`${name} added successfully!`, 'success');
    }
    
    async removeUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        // Check if user has expenses
        const hasExpenses = this.expenses.some(expense => 
            expense.payer === userId || expense.participants.some(p => p.id === userId)
        );
        
        if (hasExpenses) {
            this.showNotification('Cannot remove user with existing expenses', 'error');
            return;
        }
        
        this.users = this.users.filter(u => u.id !== userId);
        this.renderUsers();
        this.updateExpenseForm();
        this.saveToLocalStorage();
        await this.autoSync();
        this.showNotification(`${user.name} removed successfully!`, 'success');
    }
    
    renderUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        
        console.log('Rendering users:', this.users);
        
        if (this.users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-title">No users yet</div>
                    <div class="empty-state-description">Add your first user to get started</div>
                </div>
            `;
            return;
        }
        
        const balances = this.calculateBalances();
        
        usersList.innerHTML = this.users.map(user => {
            const balance = balances[user.id] || 0;
            const balanceText = balance === 0 ? 'Settled' : 
                               balance > 0 ? `Owes ₹${Math.abs(balance).toFixed(2)}` : 
                               `Owed ₹${Math.abs(balance).toFixed(2)}`;
            const balanceClass = balance === 0 ? 'balanced' : balance > 0 ? 'owes' : 'owed';
            
            return `
                <div class="user-card">
                    <div class="user-avatar" style="background-color: ${user.color}">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h3 class="user-name">${user.name}</h3>
                        <p class="user-balance ${balanceClass}">${balanceText}</p>
                    </div>
                    <div class="user-actions">
                        <button class="btn-icon danger" onclick="window.app.removeUser('${user.id}')" title="Remove user">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateExpenseForm() {
        const payerSelect = document.getElementById('expensePayer');
        const participantsList = document.getElementById('participantsList');
        
        if (!payerSelect || !participantsList) return;
        
        // Update payer dropdown
        payerSelect.innerHTML = '<option value="">Select payer</option>' +
            this.users.map(user => `<option value="${user.id}">${user.name}</option>`).join('');
        
        // Update participants list
        participantsList.innerHTML = this.users.map(user => `
            <div class="participant-item">
                <input type="checkbox" class="participant-checkbox" value="${user.id}" id="participant-${user.id}">
                <div class="participant-avatar" style="background-color: ${user.color}">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <label class="participant-name" for="participant-${user.id}">${user.name}</label>
                <input type="number" class="participant-amount-input" style="width: 80px; margin-left: auto;" placeholder="Split">
            </div>
        `).join('');
    }
    
    async addExpense() {
        const description = document.getElementById('expenseDescription')?.value?.trim();
        const amount = parseFloat(document.getElementById('expenseAmount')?.value || '0');
        const payer = document.getElementById('expensePayer')?.value;
        const participants = Array.from(document.querySelectorAll('.participant-checkbox:checked')).map(cb => {
            const amountInput = cb.closest('.participant-item').querySelector('.participant-amount-input');
            const amount = parseFloat(amountInput.value);
            return {
                id: cb.value,
                amount: isNaN(amount) ? null : amount
            };
        });
        
        if (!description) {
            this.showNotification('Please enter a description', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        if (!payer) {
            this.showNotification('Please select who paid', 'error');
            return;
        }
        
        if (participants.length === 0) {
            this.showNotification('Please select at least one participant', 'error');
            return;
        }

        const customSplitParticipants = participants.filter(p => p.amount !== null);
        if (customSplitParticipants.length > 0 && customSplitParticipants.length === participants.length) {
            const customSplitTotal = customSplitParticipants.reduce((sum, p) => sum + p.amount, 0);
            if (Math.abs(customSplitTotal - amount) > 0.01) { // Use a tolerance for float comparison
                this.showNotification(`The sum of split amounts (₹${customSplitTotal.toFixed(2)}) does not match the total expense amount (₹${amount.toFixed(2)}).`, 'error');
                return;
            }
        }
        
        const expense = {
            id: Date.now().toString(),
            description,
            amount,
            payer,
            participants,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.expenses.push(expense);
        
        // Clear form
        const descInput = document.getElementById('expenseDescription');
        const amountInput = document.getElementById('expenseAmount');
        const payerSelect = document.getElementById('expensePayer');
        
        if (descInput) descInput.value = '';
        if (amountInput) amountInput.value = '';
        if (payerSelect) payerSelect.value = '';
        
        document.querySelectorAll('.participant-checkbox').forEach(cb => cb.checked = false);
        
        this.renderExpenses();
        this.saveToLocalStorage();
        await this.autoSync();
        this.showNotification('Expense added successfully!', 'success');
    }

    async deleteExpense(expenseId) {
        this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
        this.renderExpenses();
        this.saveToLocalStorage();
        await this.autoSync();
        this.showNotification('Expense deleted successfully!', 'success');
    }

    editExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expensePayer').value = expense.payer;

        document.querySelectorAll('.participant-checkbox').forEach(cb => {
            const participant = expense.participants.find(p => p.id === cb.value);
            cb.checked = !!participant;
            const amountInput = cb.closest('.participant-item').querySelector('.participant-amount-input');
            if (participant && participant.amount !== null) {
                amountInput.value = participant.amount;
            } else {
                amountInput.value = '';
            }
        });

        this.expenses = this.expenses.filter(e => e.id !== expenseId);

        document.querySelector('.add-expense-form').scrollIntoView({ behavior: 'smooth' });
        this.showNotification('Editing expense. Make changes and click "Add Expense".', 'info');
    }
    
    renderExpenses() {
        const expensesList = document.getElementById('expensesList');
        if (!expensesList) return;
        
        this.updateExpenseForm();
        
        if (this.expenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💰</div>
                    <div class="empty-state-title">No expenses yet</div>
                    <div class="empty-state-description">Add your first expense to get started</div>
                </div>
            `;
            return;
        }
        
        const sortedExpenses = [...this.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        expensesList.innerHTML = sortedExpenses.map(expense => {
            const payer = this.users.find(u => u.id === expense.payer);
            const participants = expense.participants.map(p => {
                const user = this.users.find(u => u.id === p.id);
                return { ...user, ...p };
            }).filter(Boolean);

            const hasCustomSplit = expense.participants.some(p => p.amount !== null);
            const splitAmountText = hasCustomSplit
                ? 'Uneven split'
                : `₹${(expense.amount / (expense.participants.length || 1)).toFixed(2)} per person`;

            return `
                <div class="expense-card" data-expense-id="${expense.id}">
                    <div class="expense-header">
                        <h3 class="expense-description">${expense.description}</h3>
                        <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                    </div>
                    <div class="expense-details">
                        <div class="expense-payer">
                            <div class="user-avatar" style="background-color: ${payer?.color}; width: 24px; height: 24px; font-size: 12px;">
                                ${payer?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span>Paid by ${payer?.name || 'Unknown'}</span>
                        </div>
                        <div class="expense-participants">
                            ${participants.map(participant => `
                                <div class="expense-participant" style="background-color: ${participant.color}" title="${participant.name}">
                                    ${participant.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="expense-footer">
                        <div style="font-size: 12px; color: var(--color-text-secondary);">
                            ${splitAmountText} • ${expense.date}
                        </div>
                        <div class="expense-actions">
                            <button class="btn-icon" onclick="window.app.editExpense('${expense.id}')" title="Edit expense">✏️</button>
                            <button class="btn-icon danger" onclick="window.app.deleteExpense('${expense.id}')" title="Delete expense">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        // Combine expenses and settlements for history
        const allTransactions = [
            ...this.expenses.map(expense => ({
                ...expense,
                type: 'expense',
                date: expense.date
            })),
            ...this.settlements.map(settlement => ({
                ...settlement,
                type: 'settlement',
                date: settlement.date
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (allTransactions.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-title">No history yet</div>
                    <div class="empty-state-description">Your expense and settlement history will appear here</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = allTransactions.map(transaction => {
            if (transaction.type === 'expense') {
                const payer = this.users.find(u => u.id === transaction.payer);
                const participants = transaction.participants.map(p => this.users.find(u => u.id === p.id)).filter(Boolean);
                
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <h4>${transaction.description}</h4>
                            <div class="history-date">${transaction.date}</div>
                        </div>
                        <div class="expense-details">
                            <div class="expense-payer">
                                <div class="user-avatar" style="background-color: ${payer?.color}; width: 24px; height: 24px; font-size: 12px;">
                                    ${payer?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span>${payer?.name || 'Unknown'} paid ₹${transaction.amount.toFixed(2)}</span>
                            </div>
                            <div class="expense-amount">₹${transaction.amount.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            } else {
                const from = this.users.find(u => u.id === transaction.from);
                const to = this.users.find(u => u.id === transaction.to);
                
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <h4>Settlement</h4>
                            <div class="history-date">${transaction.date}</div>
                        </div>
                        <div class="settlement-info">
                            <div class="settlement-parties">
                                <div class="user-avatar" style="background-color: ${from?.color}; width: 24px; height: 24px; font-size: 12px;">
                                    ${from?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span>${from?.name || 'Unknown'} paid ${to?.name || 'Unknown'}</span>
                                <div class="user-avatar" style="background-color: ${to?.color}; width: 24px; height: 24px; font-size: 12px;">
                                    ${to?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </div>
                            <div class="settlement-amount">₹${transaction.amount.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }
    
    calculateBalances() {
        const balances = {};
        this.users.forEach(user => balances[user.id] = 0);

        this.expenses.forEach(expense => {
            balances[expense.payer] -= expense.amount;

            const participantsWithCustomSplit = expense.participants.filter(p => p.amount !== null);
            const participantsWithEqualSplit = expense.participants.filter(p => p.amount === null);

            if (participantsWithCustomSplit.length > 0) {
                const customSplitTotal = participantsWithCustomSplit.reduce((sum, p) => sum + p.amount, 0);

                participantsWithCustomSplit.forEach(p => {
                    balances[p.id] += p.amount;
                });

                if (participantsWithEqualSplit.length > 0) {
                    const remainingAmount = expense.amount - customSplitTotal;
                    const equalSplitAmount = remainingAmount / (participantsWithEqualSplit.length || 1);
                    participantsWithEqualSplit.forEach(p => {
                        balances[p.id] += equalSplitAmount;
                    });
                }
            } else {
                const splitAmount = expense.amount / (expense.participants.length || 1);
                expense.participants.forEach(participant => {
                    balances[participant.id] += splitAmount;
                });
            }
        });

        // Apply completed settlements
        this.settlements.filter(s => s.completed).forEach(settlement => {
            balances[settlement.from] -= settlement.amount;
            balances[settlement.to] += settlement.amount;
        });

        return balances;
    }
    
    calculateSettlements() {
        const simplify = document.getElementById('simplifySettlements')?.checked;
        if (simplify) {
            return this.calculateSimplifiedSettlements();
        } else {
            return this.calculateDetailedSettlements();
        }
    }

    calculateSimplifiedSettlements() {
        const balances = this.calculateBalances();
        const settlements = [];
        
        // Get who owes money and who is owed money
        const debtors = [];
        const creditors = [];
        
        Object.entries(balances).forEach(([userId, balance]) => {
            if (balance > 0.01) { // They owe money
                debtors.push({ userId, amount: balance });
            } else if (balance < -0.01) { // They are owed money
                creditors.push({ userId, amount: Math.abs(balance) });
            }
        });
        
        // Create settlements
        let debtorIndex = 0;
        let creditorIndex = 0;
        
        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];
            
            const settlementAmount = Math.min(debtor.amount, creditor.amount);
            
            if (settlementAmount > 0.01) {
                settlements.push({
                    id: `${debtor.userId}-${creditor.userId}-${Date.now()}`,
                    from: debtor.userId,
                    to: creditor.userId,
                    amount: settlementAmount,
                    completed: false,
                    date: new Date().toISOString().split('T')[0]
                });
            }
            
            debtor.amount -= settlementAmount;
            creditor.amount -= settlementAmount;
            
            if (debtor.amount < 0.01) debtorIndex++;
            if (creditor.amount < 0.01) creditorIndex++;
        }
        
        return settlements;
    }

    calculateDetailedSettlements() {
        const detailedDebts = [];
        this.expenses.forEach(expense => {
            const payer = expense.payer;
            const amount = expense.amount;
            const participants = expense.participants;

            const participantsWithCustomSplit = participants.filter(p => p.amount !== null);
            const participantsWithEqualSplit = participants.filter(p => p.amount === null);

            if (participantsWithCustomSplit.length > 0) {
                const customSplitTotal = participantsWithCustomSplit.reduce((sum, p) => sum + p.amount, 0);

                participantsWithCustomSplit.forEach(p => {
                    if (p.id !== payer) {
                        detailedDebts.push({
                            from: p.id,
                            to: payer,
                            amount: p.amount
                        });
                    }
                });

                if (participantsWithEqualSplit.length > 0) {
                    const remainingAmount = amount - customSplitTotal;
                    const equalSplitAmount = remainingAmount / participantsWithEqualSplit.length;
                    participantsWithEqualSplit.forEach(p => {
                        if (p.id !== payer) {
                            detailedDebts.push({
                                from: p.id,
                                to: payer,
                                amount: equalSplitAmount
                            });
                        }
                    });
                }
            } else {
                const splitAmount = amount / (participants.length || 1);
                participants.forEach(participant => {
                    if (participant.id !== payer) {
                        detailedDebts.push({
                            from: participant.id,
                            to: payer,
                            amount: splitAmount
                        });
                    }
                });
            }
        });

        const netDebts = {}; // Using an object as a map

        detailedDebts.forEach(debt => {
            const key = [debt.from, debt.to].sort().join('-');
            if (!netDebts[key]) {
                netDebts[key] = {
                    user1: debt.from < debt.to ? debt.from : debt.to,
                    user2: debt.from < debt.to ? debt.to : debt.from,
                    balance: 0 // positive if user1 owes user2, negative if user2 owes user1
                };
            }

            if (debt.from < debt.to) {
                netDebts[key].balance += debt.amount;
            } else {
                netDebts[key].balance -= debt.amount;
            }
        });

        const settlements = [];
        for (const key in netDebts) {
            const netDebt = netDebts[key];
            if (Math.abs(netDebt.balance) > 0.01) {
                if (netDebt.balance > 0) {
                    settlements.push({
                        from: netDebt.user1,
                        to: netDebt.user2,
                        amount: netDebt.balance
                    });
                } else {
                    settlements.push({
                        from: netDebt.user2,
                        to: netDebt.user1,
                        amount: -netDebt.balance
                    });
                }
            }
        }

        return settlements;
    }
    
    renderSettlements() {
        const settlementsList = document.getElementById('settlementsList');
        if (!settlementsList) return;
        
        const pendingSettlements = this.calculateSettlements();
        const completedSettlements = this.settlements.filter(s => s.completed);
        const allSettlements = [...pendingSettlements, ...completedSettlements];
        
        if (allSettlements.length === 0) {
            settlementsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤝</div>
                    <div class="empty-state-title">All settled up!</div>
                    <div class="empty-state-description">No pending settlements</div>
                </div>
            `;
            return;
        }
        
        settlementsList.innerHTML = allSettlements.map(settlement => {
            const from = this.users.find(u => u.id === settlement.from);
            const to = this.users.find(u => u.id === settlement.to);
            
            return `
                <div class="settlement-card ${settlement.completed ? 'completed' : ''}">
                    <div class="settlement-info">
                        <div class="settlement-parties">
                            <div class="user-avatar" style="background-color: ${from?.color}">
                                ${from?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span>${from?.name || 'Unknown'}</span>
                            <div class="settlement-arrow">→</div>
                            <span>${to?.name || 'Unknown'}</span>
                            <div class="user-avatar" style="background-color: ${to?.color}">
                                ${to?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        </div>
                        <div class="settlement-amount">₹${settlement.amount.toFixed(2)}</div>
                    </div>
                    ${!settlement.completed ? `
                        <div class="settlement-actions">
                            <button class="btn btn--primary" onclick="window.app.settleUp('${settlement.from}', '${settlement.to}', ${settlement.amount})">
                                Mark as Settled
                            </button>
                        </div>
                    ` : `
                        <div style="text-align: center; color: var(--color-success); font-weight: 500;">
                            ✅ Settled on ${settlement.date}
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }
    
    async settleUp(fromId, toId, amount) {
        const settlement = {
            id: `${fromId}-${toId}-${Date.now()}`,
            from: fromId,
            to: toId,
            amount: amount,
            completed: true,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.settlements.push(settlement);
        this.renderSettlements();
        this.renderUsers(); // Update balances
        this.saveToLocalStorage();
        await this.autoSync();
        
        const fromUser = this.users.find(u => u.id === fromId);
        const toUser = this.users.find(u => u.id === toId);
        this.showNotification(`${fromUser?.name} settled with ${toUser?.name}!`, 'success');
    }
    
    // GitHub Integration
    async createNewGist() {
        if (!this.githubToken) {
            this.showNotification('Please enter a GitHub token', 'error');
            return;
        }
        
        this.updateSyncStatus('syncing', 'Creating gist...');
        
        const gistData = {
            description: 'SplitEasy Expense Data',
            public: false,
            files: {
                'splitease-data.json': {
                    content: JSON.stringify({
                        users: this.users,
                        expenses: this.expenses,
                        settlements: this.settlements,
                        lastUpdated: new Date().toISOString()
                    }, null, 2)
                }
            }
        };
        
        try {
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gistData)
            });
            
            if (response.ok) {
                const gist = await response.json();
                this.gistId = gist.id;
                const gistInput = document.getElementById('gistId');
                if (gistInput) gistInput.value = this.gistId;
                localStorage.setItem('gistId', this.gistId);
                this.updateSyncStatus('success', 'Gist created!');
                this.showNotification('New Gist created successfully!', 'success');
            } else {
                throw new Error('Failed to create gist');
            }
        } catch (error) {
            console.error('Error creating gist:', error);
            this.updateSyncStatus('error', 'Create failed');
            this.showNotification('Failed to create gist', 'error');
        }
    }
    
    async syncData() {
        if (!this.githubToken || !this.gistId) {
            this.showNotification('Please enter GitHub token and Gist ID', 'error');
            return;
        }
        
        this.updateSyncStatus('syncing', 'Syncing...');
        
        try {
            // First try to get existing data
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.githubToken}`
                }
            });
            
            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['splitease-data.json']?.content;
                
                if (fileContent) {
                    const data = JSON.parse(fileContent);
                    this.users = data.users || [];
                    this.expenses = data.expenses || [];
                    this.settlements = data.settlements || [];
                    this.updateUI();
                    this.saveToLocalStorage();
                }
                
                // Then update with current data
                // await this.updateGist();
                this.updateSyncStatus('success', 'Synced!');
                // this.showNotification('Data synced successfully!', 'success');
                console.log('Github Data synced successfully!');
            } else {
                throw new Error('Failed to fetch gist');
            }
        } catch (error) {
            console.error('Error syncing data:', error);
            this.updateSyncStatus('error', 'Sync failed');
            this.showNotification('Failed to sync data', 'error');
        }
    }
    
    async updateGist() {
        const gistData = {
            files: {
                'splitease-data.json': {
                    content: JSON.stringify({
                        users: this.users,
                        expenses: this.expenses,
                        settlements: this.settlements,
                        lastUpdated: new Date().toISOString()
                    }, null, 2)
                }
            }
        };
        
        const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.githubToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update gist');
        }
    }
    
    async autoSync() {
        if (this.githubToken && this.gistId) {
            try {
                await this.updateGist();
                this.updateSyncStatus('success', 'Auto-synced');
                setTimeout(() => {
                    this.updateSyncStatus('ready', 'Ready');
                }, 2000);
            } catch (error) {
                console.error('Auto-sync failed:', error);
            }
        }
    }
    
    updateSyncStatus(status, text) {
        // const syncStatus = document.getElementById('syncStatus');
        // if (syncStatus) {
        //     syncStatus.className = `sync-status ${status}`;
        //     const syncText = syncStatus.querySelector('.sync-text');
        //     if (syncText) syncText.textContent = text;
        // }
    }
    
    // Local Storage
    saveToLocalStorage() {
        localStorage.setItem('spliteasy-users', JSON.stringify(this.users));
        localStorage.setItem('spliteasy-expenses', JSON.stringify(this.expenses));
        localStorage.setItem('spliteasy-settlements', JSON.stringify(this.settlements));
    }
    
    loadFromLocalStorage() {
        try {
            const users = localStorage.getItem('spliteasy-users');
            const expenses = localStorage.getItem('spliteasy-expenses');
            const settlements = localStorage.getItem('spliteasy-settlements');
            
            if (users) this.users = JSON.parse(users);
            if (expenses) {
                this.expenses = JSON.parse(expenses).map(expense => {
                    if (expense.participants.length > 0 && typeof expense.participants[0] === 'string') {
                        expense.participants = expense.participants.map(id => ({ id, amount: null }));
                    }
                    return expense;
                });
            }
            if (settlements) this.settlements = JSON.parse(settlements);

            this.githubToken = localStorage.getItem('githubToken') || '';
            this.gistId = localStorage.getItem('gistId') || '';
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    // UI Updates
    updateUI() {
        this.updateTabContent(this.currentTab);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        const notificationText = notification.querySelector('.notification-text');
        if (notificationText) {
            notificationText.textContent = message;
        }
        
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
}

async function main() {
    window.app = new SplitEasy();
    await window.app.init();
}

main();