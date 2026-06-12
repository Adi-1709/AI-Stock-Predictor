import { db } from '../config/firebase.js';

// Get alerts
export const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'guest-user';

    const snapshot = await db
      .collection('alerts')
      .where('userId', '==', userId)
      .get();

    const items = [];

    snapshot.forEach((doc) => {
      items.push({
        _id: doc.id,
        ...doc.data()
      });
    });

    res.json(items);

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500);
    next(error);
  }
};

// Create alert
export const createAlert = async (req, res, next) => {
  const { symbol, type, value } = req.body;

  if (!symbol || !type || !value) {
    res.status(400);
    return next(
      new Error(
        'Please provide symbol, type, and value'
      )
    );
  }

  try {
    const userId = req.user?.id || 'guest-user';

    const newItem = {
      userId,
      symbol: symbol.toUpperCase(),
      type,
      value: String(value),
      isTriggered: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db
      .collection('alerts')
      .add(newItem);

    await db.collection('activityLogs').add({
      userId,
      action: 'ALERT_CREATE',
      details: `Created alert for ${newItem.symbol}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      _id: docRef.id,
      ...newItem
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500);
    next(error);
  }
};

// Delete alert
export const deleteAlert = async (
  req,
  res,
  next
) => {
  try {
    const docRef = db
      .collection('alerts')
      .doc(req.params.id);

    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404);
      return next(
        new Error('Alert not found')
      );
    }

    await docRef.delete();

    res.json({
      message: 'Alert removed'
    });

  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500);
    next(error);
  }
};

// Notifications
export const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications = [
      {
        id: 1,
        title: 'Market Update',
        message:
          'NASDAQ opened with positive momentum',
        type: 'market',
        read: false,
        createdAt: new Date()
      },
      {
        id: 2,
        title: 'Stock Alert',
        message: 'AAPL moved more than 2%',
        type: 'stock',
        read: false,
        createdAt: new Date()
      }
    ];

    return res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error(
      'Notification fetch error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch notifications'
    });
  }
};

// Mark notification read
export const markNotificationRead =
  async (req, res) => {
    try {
      return res.json({
        success: true,
        message:
          'Notification marked as read'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

// Clear notifications
export const clearNotifications =
  async (req, res) => {
    try {
      return res.json({
        success: true,
        message:
          'Notifications cleared'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

// Insert notification
export const insertTriggeredNotification =
  async (
    userId,
    title,
    message,
    type = 'info'
  ) => {
    try {
      const newItem = {
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt:
          new Date().toISOString()
      };

      await db
        .collection('notifications')
        .add(newItem);

    } catch (error) {
      console.error(
        'Insert notification error:',
        error
      );
    }
  };

