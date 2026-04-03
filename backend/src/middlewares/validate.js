const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        console.log('Validation Error:', errorMessage);
        return res.status(400).json({ success: false, message: errorMessage });
    }
    next();
};

module.exports = validate;
