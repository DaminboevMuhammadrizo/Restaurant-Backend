export interface BranchAnalytics {
    branchId: string;
    branchName: string;
    income: number;
    expense: number;
    profit: number;
    growth: string;
}

export interface OverallAnalytics {
    totalIncome: number;
    totalExpense: number;
    profit: number;
    incomePercent: number;
    expensePercent: number;
}

export interface AnalyticsResponse {
    overall: OverallAnalytics;
    branches: BranchAnalytics[];
}
