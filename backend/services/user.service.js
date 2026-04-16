const { User, ROLES } = require('../models/User');

/**
 * Get paginated user list with search and filters
 */
const getUsers = async ({ page = 1, limit = 10, search = '', role = '', isActive = '', sort = '-createdAt' }) => {
  const query = { isDeleted: false };

  if (role) query.role = role;
  if (isActive !== '') query.isActive = isActive === 'true';

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-password -refreshToken -__v');

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNext: skip + users.length < total,
      hasPrev: parseInt(page) > 1,
    },
  };
};

/**
 * Get single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: false })
    .populate('createdBy', 'name email role')
    .populate('updatedBy', 'name email role')
    .populate('deletedBy', 'name email role')
    .select('-password -refreshToken -__v');

  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

/**
 * Create a new user (Admin only)
 */
const createUser = async (userData, requesterId) => {
  const { name, email, password, role = ROLES.USER, isActive = true } = userData;

  const existing = await User.findOne({ email });
  if (existing) {
    throw { statusCode: 409, message: 'A user with this email already exists' };
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    isActive,
    createdBy: requesterId,
    updatedBy: requesterId,
  });

  // Populate audit fields for response
  await user.populate('createdBy', 'name email');
  await user.populate('updatedBy', 'name email');

  return user.toSafeObject();
};

/**
 * Update a user
 * Managers cannot change role or update admins
 * Users can only update their own name/password
 */
const updateUser = async (targetId, updateData, requester) => {
  const target = await User.findOne({ _id: targetId, isDeleted: false });
  if (!target) throw { statusCode: 404, message: 'User not found' };

  // Manager restrictions
  if (requester.role === ROLES.MANAGER) {
    if (target.role === ROLES.ADMIN) {
      throw { statusCode: 403, message: 'Managers cannot modify admin users' };
    }
    // Managers cannot change roles
    delete updateData.role;
    delete updateData.isActive;
  }

  // Regular user restrictions
  if (requester.role === ROLES.USER) {
    const allowedFields = ['name', 'password'];
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) delete updateData[key];
    });
  }

  const { name, email, password, role, isActive } = updateData;

  if (name !== undefined) target.name = name;
  if (email !== undefined) {
    const emailExists = await User.findOne({ email, _id: { $ne: targetId } });
    if (emailExists) throw { statusCode: 409, message: 'Email already in use by another account' };
    target.email = email;
  }
  if (password !== undefined) target.password = password; // pre-save will hash
  if (role !== undefined && requester.role === ROLES.ADMIN) target.role = role;
  if (isActive !== undefined && requester.role === ROLES.ADMIN) target.isActive = isActive;

  target.updatedBy = requester._id;

  await target.save();

  return getUserById(targetId);
};

/**
 * Soft delete a user (Admin only)
 */
const softDeleteUser = async (targetId, requesterId) => {
  const target = await User.findOne({ _id: targetId, isDeleted: false });
  if (!target) throw { statusCode: 404, message: 'User not found' };

  if (targetId === requesterId.toString()) {
    throw { statusCode: 400, message: 'You cannot delete your own account' };
  }

  target.isDeleted = true;
  target.isActive = false;
  target.deletedAt = new Date();
  target.deletedBy = requesterId;
  target.updatedBy = requesterId;

  await target.save({ validateBeforeSave: false });

  return { message: 'User has been deactivated successfully' };
};

module.exports = { getUsers, getUserById, createUser, updateUser, softDeleteUser };
