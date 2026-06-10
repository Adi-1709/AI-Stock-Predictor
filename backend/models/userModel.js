import bcrypt from 'bcryptjs';

// Seed initial user
const initialPasswordHash = await bcrypt.hash('password123', 10);

const users = [
  {
    id: '1',
    name: 'Alex Mercer',
    email: 'alex@alpha.ai',
    password: initialPasswordHash,
    plan: 'Pro Elite',
    avatar: 'AM',
    bio: 'Fintech Analyst & Quantitative Developer.',
    company: 'Alpha AI Capital',
    phone: '+1 (555) 019-2834',
    location: 'New York, NY',
    watchlist: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'TCS', 'RELIANCE'],
    createdAt: new Date('2026-01-15T09:00:00Z'),
  }
];

/**
 * Find a user by their email address.
 */
export const findUserByEmail = async (email) => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Find a user by their ID.
 */
export const findUserById = async (id) => {
  return users.find(u => u.id === id);
};

/**
 * Create a new user with hashed password.
 */
export const createUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password: hashedPassword,
    plan: 'Free Trial',
    avatar: name.substring(0, 2).toUpperCase(),
    bio: 'Premium Stock Platform member.',
    company: 'Independent Trader',
    phone: '',
    location: 'Global',
    watchlist: ['AAPL', 'MSFT', 'NVDA'],
    createdAt: new Date(),
  };

  users.push(newUser);
  return newUser;
};

/**
 * Update user profile details.
 */
export const updateUserProfile = async (id, profileData) => {
  const user = await findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }

  // Allow updating specific fields
  if (profileData.name) user.name = profileData.name;
  if (profileData.bio !== undefined) user.bio = profileData.bio;
  if (profileData.company !== undefined) user.company = profileData.company;
  if (profileData.phone !== undefined) user.phone = profileData.phone;
  if (profileData.location !== undefined) user.location = profileData.location;
  if (profileData.avatar) user.avatar = profileData.avatar;
  if (profileData.plan) user.plan = profileData.plan;

  return user;
};

/**
 * Get user watchlist.
 */
export const getUserWatchlist = async (id) => {
  const user = await findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user.watchlist;
};

/**
 * Add ticker to user watchlist.
 */
export const addToUserWatchlist = async (id, symbol) => {
  const user = await findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const upperSymbol = symbol.toUpperCase();
  if (!user.watchlist.includes(upperSymbol)) {
    user.watchlist.push(upperSymbol);
  }
  return user.watchlist;
};

/**
 * Remove ticker from user watchlist.
 */
export const removeFromUserWatchlist = async (id, symbol) => {
  const user = await findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const upperSymbol = symbol.toUpperCase();
  user.watchlist = user.watchlist.filter(s => s !== upperSymbol);
  return user.watchlist;
};

/**
 * Verify user password.
 */
export const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
