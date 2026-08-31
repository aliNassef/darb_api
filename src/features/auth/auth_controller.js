const asyncWrapper = require('../../middleware/async_wrapper');
const sendOtp = asyncWrapper(
    async (req, res, next) => {
        const r = await fetch('https://api.akedly.io/api/v1.2/transactions/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-end-user-ip': req.ip,
            },
            body: JSON.stringify({}),
        });
        res.status(r.status).json(await r.json());
    }
);


module.exports = {
    sendOtp,
};