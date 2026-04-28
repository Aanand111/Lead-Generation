const authService = require('./auth.service');

class AuthController {
    async register(req, res, next) {
        try {
            const user = await authService.register(req.body);

            res.status(201).json({
                success: true,
                message: user.role === 'vendor' 
                    ? 'Registration successful. Please wait for admin approval.' 
                    : 'User registered successfully.',
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { token, user } = await authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    name: user.full_name,
                    profile_pic: user.profile_pic,
                    status: user.status,
                    referred_by: user.referred_by
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
