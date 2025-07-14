// tests/models/deal.test.js
import mongoose from 'mongoose'
import Deal from '../../models/deal.js'
import User from '../../models/user.js'
import LoanRequest from '../../models/loan_request.js'
import InterestTerm from '../../models/interest_term.js' // adjust if needed
import Cryptocurrency from '../../models/cryptocurrency.js'

let mongo

beforeAll(async () => {
    const uri = process.env.DATABASE_URL

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    await mongoose.connection.db.dropDatabase()
    await Deal.syncIndexes()
    await LoanRequest.syncIndexes()
    await InterestTerm.syncIndexes()
    await User.syncIndexes()
})

beforeEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})


afterAll(async () => {
    await mongoose.connection.close()
})

afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

describe('Deal model', () => {
    test('Should create a deal and compute expectedCompletionDate', async () => {

        const interestTerm = await InterestTerm.create({
            interest_rate: 6,
            loan_length: 6
        })

        const borrower = await User.create({
            email: 'borrower@example.com',
            password: 'Password123'
        })

        const crypto = await Cryptocurrency.create({
            name: 'Bitcoin',
            symbol: 'BTC'
        })

        const loanRequest = await LoanRequest.create({
            cryptocurrency: crypto._id,
            request_amount: 1000,
            borrower_id: borrower._id,
            interest_term: interestTerm._id
        })
        
        const lender = await User.create({
            email: 'lender@example.com',
            password: 'Password123'
        })

        const deal = await Deal.create({
            lenderId: lender._id,
            loanDetails: loanRequest._id
        })

        await deal.save()

        expect(deal).toBeDefined()
        expect(deal.expectedCompletionDate).toBeDefined()
        expect(deal.isComplete).toBe(false)
    })

    test('throws an error when loanDetails is missing interest_term', async () => {
        const user = await User.create({ email: 'fail@example.com', password: 'Password123' })
        const crypto = await Cryptocurrency.create({ name: 'Bitcoin', symbol: 'BTC' })

        let error
        try {
            const loanRequest = await LoanRequest.create({
                borrower_id: user._id,
                cryptocurrency: crypto._id,
                request_amount: 1000
                // missing interest_term
            })

            const deal = new Deal({
                lenderId: user._id,
                loanDetails: loanRequest._id
            })


            await deal.save()

        } catch (err) {
            error = err
        }

        expect(error).toBeDefined()
        expect(error.message).toMatch(/LoanRequest validation failed: interest_term: Path `interest_term` is required./)
    })
})
