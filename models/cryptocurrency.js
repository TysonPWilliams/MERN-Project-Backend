import { model, Schema } from "mongoose";

const cryptocurrencySchema = new Schema({
    symbol: {
        type: String,
        required: [true, 'Symbol is required'],
        maxLength: 5,
        minLength: 3,
        uppercase: true,
        match: [/^[A-Z]+$/, 'Symbol must contain only uppercase letters']
    },
    name: {
        type: String,
        maxLength: 50,
        required: true,
        trim: true
    }
});

const Cryptocurrency = model('Cryptocurrency', cryptocurrencySchema)


export default Cryptocurrency