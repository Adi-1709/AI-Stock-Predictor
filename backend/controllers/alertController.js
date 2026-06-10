import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

// In-memory fallback arrays for sandbox operations
export const sandboxAlerts = [
  { _id: 'a1', user: '1', symbol: 'AAPL', type: 'price_above', value: '190.00', isTriggered: false },
  { _id: 'a2', user: '1', symbol: 'RELIANCE.NS', type: 'rsi_above', value: '70', isTriggered: false }
];

export const sandboxNotifications = [
  { _id: 'n1', user: '1', title: 'ML Signal Alert', message: 'NVDA triggered BUY signal with 94% confidence.', type: 'success', isRead: false, createdAt: new Date() },
  { _id: 'n2', user: '1', title: 'Price Threshold Crossed', message: 'AAPL price crossed above $180.00.', type: 'info', isRead: true, createdAt: new Date(Date.now() - 3600000) }
];

/**
 * @desc    Get user alerts
 * @route   GET /api/alerts
 * @access  Private
 */
export const getAlerts = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  try {
    if (isDBConnected) {
      const alerts = await Alert.find({ user: userId });
      return res.json(alerts);
    }
    const alerts = sandboxAlerts.filter(a => a.user.toString() === userId.toString());
    res.json(alerts);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Create new smart alert
 * @route   POST /api/alerts
 * @access  Private
 */
export const createAlert = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  const { symbol, type, value } = req.body;

  if (!symbol || !type || !value) {
    return res.status(400).json({ error: 'Stock symbol, parameter type, and comparison value are required.' });
  }

  const upperSymbol = symbol.toUpperCase();

  try {
    let newAlert;
    if (isDBConnected) {
      newAlert = await Alert.create({
        user: userId,
        symbol: upperSymbol,
        type,
        value: value.toString(),
        isTriggered: false
      });
    } else {
      newAlert = {
        _id: `a-${Date.now()}`,
        user: userId,
        symbol: upperSymbol,
        type,
        value: value.toString(),
        isTriggered: false
      };
      sandboxAlerts.push(newAlert);
    }
    res.json(newAlert);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Delete custom alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
export const deleteAlert = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (isDBConnected) {
      await Alert.deleteOne({ _id: id });
    } else {
      const idx = sandboxAlerts.findIndex(a => a._id === id);
      if (idx !== -1) sandboxAlerts.splice(idx, 1);
    }
    res.json({ message: 'Alert successfully removed.' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get user notifications
 * @route   GET /api/alerts/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  try {
    if (isDBConnected) {
      const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
      return res.json(notifications);
    }
    const notifications = [...sandboxNotifications]
      .filter(n => n.user.toString() === userId.toString())
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json(notifications);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/alerts/notifications/:id
 * @access  Private
 */
export const markNotificationRead = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (isDBConnected) {
      await Notification.updateOne({ _id: id }, { isRead: true });
    } else {
      const item = sandboxNotifications.find(n => n._id === id);
      if (item) item.isRead = true;
    }
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Clear all user notifications
 * @route   DELETE /api/alerts/notifications
 * @access  Private
 */
export const clearNotifications = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  try {
    if (isDBConnected) {
      await Notification.deleteMany({ user: userId });
    } else {
      // Splice all matching items
      for (let i = sandboxNotifications.length - 1; i >= 0; i--) {
        if (sandboxNotifications[i].user.toString() === userId.toString()) {
          sandboxNotifications.splice(i, 1);
        }
      }
    }
    res.json({ message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * Helper utility to insert triggered alerts from client updates securely
 */
export const insertTriggeredNotification = async (userId, title, message, type) => {
  try {
    if (isDBConnected) {
      await Notification.create({ user: userId, title, message, type, isRead: false });
    } else {
      sandboxNotifications.push({
        _id: `n-${Date.now()}`,
        user: userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date()
      });
    }
  } catch (err) {
    console.error("Failed to save triggered notification:", err);
  }
};
