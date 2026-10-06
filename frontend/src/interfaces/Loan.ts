export type LoanStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE'

export interface Loan {
    id: number,
    userName: string,
    itemId: number,
    itemName: string,
    quantity: number,
    checkoutDate: string,
    expectedReturnDate: string,
    actualReturnDate: string,
    status: LoanStatus
}

export interface CreateLoanRequest {
    itemId: number,
    quantity: number,
    expectedReturnDate: string
}