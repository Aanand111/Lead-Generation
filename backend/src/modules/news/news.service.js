const newsRepository = require('./news.repository');
const notificationsService = require('../notifications/notifications.service');
const AppError = require('../../utils/AppError');

class NewsService {
    async createNews(newsData, userId) {
        const news = await newsRepository.create({ ...newsData, created_by: userId });

        if (news.is_push_notification) {
            // Trigger global broadcast
            notificationsService.broadcast(news.title, news.content, {
                type: 'NEWS',
                news_id: news.id
            });
        }

        return news;
    }

    async getNews(filters) {
        return await newsRepository.findAll(filters);
    }

    async getNewsById(id) {
        const news = await newsRepository.findById(id);
        if (!news) throw new AppError('News item not found.', 404);
        return news;
    }

    async updateNews(id, newsData) {
        const news = await newsRepository.update(id, newsData);
        if (!news) throw new AppError('News item not found.', 404);
        return news;
    }

    async deleteNews(id) {
        await newsRepository.delete(id);
    }
}

module.exports = new NewsService();
