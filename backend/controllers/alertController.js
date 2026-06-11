import { db } from '../config/firebase.js';

export const getAlerts = async (req, res, next) => {
  try {
    const snapshot = await db.collection('alerts')
      .where('userId', '==', req.user.id)
      .get();
      
    const items = [];
    snapshot.forEach(doc => {
      items.push({ _id: doc.id, ...doc.data() });
    });
    
    res.json(items);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const createAlert = async (req, res, next) => {
  const { symbol, type, value } = req.body;

  if (!symbol || !type || !value) {
    res.status(400);
    return next(new Error('Please provide symbol, type, and value'));
  }

  try {
    const newItem = {
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      type,
      value: String(value),
      isTriggered: false,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('alerts').add(newItem);

    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'ALERT_CREATE',
      details: `Created alert for ${newItem.symbol}: ${type} ${value}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ _id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const docRef = db.collection('alerts').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      return next(new Error('Alert not found'));
    }
    
    if (doc.data().userId !== req.user.id) {
      res.status(401);
      return next(new Error('Not authorized to delete this alert'));
    }

    await docRef.delete();

    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'ALERT_DELETE',
      details: `Deleted alert`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Alert removed' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();
      
    const items = [];
    snapshot.forEach(doc => {
      items.push({ _id: doc.id, ...doc.data() });
    });
    
    res.json(items);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const docRef = db.collection('notifications').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      res.status(404);
      return next(new Error('Notification not found'));
    }

    if (doc.data().userId !== req.user.id) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    await docRef.update({ isRead: true });
    
    const updated = await docRef.get();
    res.json({ _id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.user.id)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

// Expose internal function to allow system to trigger notifications directly
export const insertTriggeredNotification = async (userId, title, message, type = 'info') => {
  const newItem = {
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  await db.collection('notifications').add(newItem);
};
