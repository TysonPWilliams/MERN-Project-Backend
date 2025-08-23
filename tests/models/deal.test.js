// tests/models/deal.test.js
import 'dotenv/config'
import mongoose from 'mongoose'
import Deal from '../../models/deal.js'
import User from '../../models/user.js'
import LoanRequest from '../../models/loan_request.js'
import InterestTerm from '../../models/interest_term.js' // adjust if needed
import Cryptocurrency from '../../models/cryptocurrency.js'

beforeAll(async () => {
    // Ensure clean state before connecting
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
    }
    
    const uri = process.env.DATABASE_URL
    await mongoose.connect(uri)
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
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
    }
})

describe('Deal model', () => {
    test('creates a valid deal with proper loanDetails', async () => {
        const user = await User.create({ email: 'test@example.com', password: 'Password123' })
        const crypto = await Cryptocurrency.create({ name: 'Bitcoin', symbol: 'BTC' })
        const interestTerm = await InterestTerm.create({
            loan_length: 12,
            interest_rate: 5.5
        })

        const loanRequest = await LoanRequest.create({
            borrower_id: user._id,
            cryptocurrency: crypto._id,
            request_amount: 1000,
            interest_term: interestTerm._id
        })

        const deal = await Deal.create({
            lenderId: user._id,
            loanDetails: loanRequest._id
        })

        expect(deal).toBeDefined()
        expect(deal.lenderId).toEqual(user._id)
        expect(deal.loanDetails).toEqual(loanRequest._id)
        expect(deal.isComplete).toBe(false)
        expect(deal.expectedCompletionDate).toBeDefined()
    })

    test('validates required fields', async () => {
        let error
        try {
            await Deal.create({
                // missing required fields
            })
        } catch (err) {
            error = err
        }

        expect(error).toBeDefined()
        expect(error.errors.lenderId).toBeDefined()
        expect(error.errors.loanDetails).toBeDefined()
    })
})
