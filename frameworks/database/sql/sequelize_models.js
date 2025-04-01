const { Sequelize, DataTypes } = require('sequelize');

// Database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Post model
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Comment model
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Tag model
const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false
});

// Define relationships
User.hasMany(Post, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'user_id' });

Post.hasMany(Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

User.hasMany(Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Post.belongsToMany(Tag, { through: 'PostTag', foreignKey: 'post_id' });
Tag.belongsToMany(Post, { through: 'PostTag', foreignKey: 'tag_id' });

// Sync models with database
const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
    
    // Create sample data
    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password_hash: 'hashed_password_1'
    });
    
    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password_hash: 'hashed_password_2'
    });
    
    const post1 = await Post.create({
      title: 'First Post',
      content: 'This is the content of the first post',
      user_id: user1.id
    });
    
    const post2 = await Post.create({
      title: 'Second Post',
      content: 'This is the content of the second post',
      user_id: user1.id
    });
    
    const post3 = await Post.create({
      title: 'Another Post',
      content: 'This is a post from another user',
      user_id: user2.id
    });
    
    await Comment.create({
      content: 'Great post!',
      post_id: post1.id,
      user_id: user2.id
    });
    
    await Comment.create({
      content: 'Thanks for the feedback!',
      post_id: post1.id,
      user_id: user1.id
    });
    
    await Comment.create({
      content: 'Interesting thoughts',
      post_id: post2.id,
      user_id: user2.id
    });
    
    const tag1 = await Tag.create({ name: 'technology' });
    const tag2 = await Tag.create({ name: 'programming' });
    const tag3 = await Tag.create({ name: 'web development' });
    
    await post1.addTags([tag1, tag2]);
    await post2.addTags([tag2, tag3]);
    await post3.addTags([tag1]);
    
    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Tag,
  initDatabase
};
