from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Table, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Create engine and base
Base = declarative_base()

# Define association table for many-to-many relationship
post_tag = Table('post_tag', Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

# Define User model
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"

# Define Post model
class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=post_tag, back_populates="posts")
    
    def __repr__(self):
        return f"<Post(title='{self.title}')>"

# Define Comment model
class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    
    def __repr__(self):
        return f"<Comment(content='{self.content[:20]}...')>"

# Define Tag model
class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    
    posts = relationship("Post", secondary=post_tag, back_populates="tags")
    
    def __repr__(self):
        return f"<Tag(name='{self.name}')>"

# Database initialization function
def init_db(db_url='sqlite:///app_bubble.db'):
    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Create sample data if the database is empty
    if session.query(User).count() == 0:
        # Create users
        user1 = User(username='user1', email='user1@example.com', password_hash='hashed_password_1')
        user2 = User(username='user2', email='user2@example.com', password_hash='hashed_password_2')
        session.add_all([user1, user2])
        session.commit()
        
        # Create tags
        tag1 = Tag(name='technology')
        tag2 = Tag(name='programming')
        tag3 = Tag(name='web development')
        session.add_all([tag1, tag2, tag3])
        session.commit()
        
        # Create posts
        post1 = Post(user_id=user1.id, title='First Post', content='This is the content of the first post')
        post2 = Post(user_id=user1.id, title='Second Post', content='This is the content of the second post')
        post3 = Post(user_id=user2.id, title='Another Post', content='This is a post from another user')
        
        # Add tags to posts
        post1.tags = [tag1, tag2]
        post2.tags = [tag2, tag3]
        post3.tags = [tag1]
        
        session.add_all([post1, post2, post3])
        session.commit()
        
        # Create comments
        comment1 = Comment(post_id=post1.id, user_id=user2.id, content='Great post!')
        comment2 = Comment(post_id=post1.id, user_id=user1.id, content='Thanks for the feedback!')
        comment3 = Comment(post_id=post2.id, user_id=user2.id, content='Interesting thoughts')
        
        session.add_all([comment1, comment2, comment3])
        session.commit()
        
        print("Sample data created successfully")
    
    session.close()
    return engine

if __name__ == '__main__':
    init_db()
