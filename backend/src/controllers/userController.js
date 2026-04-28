const userController = require('../modules/user/user.controller');

module.exports = {
    getDashboardStats: userController.getDashboardStats.bind(userController),
    getMyLeads: userController.getMyLeads.bind(userController),
    getProfile: userController.getProfile.bind(userController),
    updateProfile: userController.updateProfile.bind(userController),
    getReferralStats: userController.getReferralStats.bind(userController),
    getNews: userController.getNews.bind(userController),
    getBanners: userController.getBanners.bind(userController),
    getPosters: userController.getPosters.bind(userController),
    getPosterTemplates: userController.getPosterTemplates.bind(userController),
    generatePoster: userController.generatePoster.bind(userController),
    submitLeadFeedback: userController.submitLeadFeedback.bind(userController)
};
