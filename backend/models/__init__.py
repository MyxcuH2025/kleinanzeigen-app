"""
Models package for Kleinanzeigen API
"""

# Import all models for easy access
from .enums import ListingStatus, UserRole, VerificationState, NotificationType
from .user import User, SellerVerification
from .listing import Listing, ListingCreate, ListingUpdate, ListingResponse
from .favorite import Favorite
from .event import Event
from .template import TemplateFolder, Template, TemplateCreate, TemplateUpdate, TemplateFolderCreate, TemplateFolderUpdate
from .chat import Conversation, Message
from .report import Report, Rating, ReportCreate, RatingCreate
from .verification import (
    SellerVerificationCreate, SellerVerificationResponse, VerificationDecision,
    EmailVerificationRequest, ResendVerificationRequest
)
from .shop import (
    Shop, ShopCreate, ShopUpdate, ShopResponse, ShopReview, 
    ShopReviewCreate, ShopReviewResponse
)
from .follow import Follow, FollowCreate, FollowResponse, FollowStats
from .notification import (
    Notification, NotificationCreate, NotificationResponse, NotificationStats,
    NotificationPreferences, NotificationPreferencesUpdate
)
from .category import (
    Category, Subcategory, CategoryItem, CategoryCreate, CategoryUpdate,
    CategoryResponse, SubcategoryCreate, SubcategoryResponse, CategoryWithSubcategories
)
from .user_requests import UserCreate, LoginRequest, ProfileUpdate
from .story import (
    Story, StoryCreate, StoryUpdate, StoryResponse, StoryView, StoryReaction, StoryComment,
    StoryReactionType, StoriesFeedResponse, StoryStatsResponse
)

# Re-export commonly used models
__all__ = [
    # Enums
    "ListingStatus", "UserRole", "VerificationState", "NotificationType",
    
    # Core models
    "User", "Listing", "Favorite", "Event",
    
    # Request/Response models
    "ListingCreate", "ListingUpdate", "ListingResponse",
    "UserCreate", "LoginRequest", "ProfileUpdate",
    
    # Template models
    "TemplateFolder", "Template", "TemplateCreate", "TemplateUpdate",
    "TemplateFolderCreate", "TemplateFolderUpdate",
    
    # Chat models
    "Conversation", "Message",
    
    # Report models
    "Report", "Rating", "ReportCreate", "RatingCreate",
    
    # Verification models
    "SellerVerification", "SellerVerificationCreate", "SellerVerificationResponse",
    "VerificationDecision", "EmailVerificationRequest", "ResendVerificationRequest",
    
    # Shop models
    "Shop", "ShopCreate", "ShopUpdate", "ShopResponse",
    "ShopReview", "ShopReviewCreate", "ShopReviewResponse",
    
    # Follow models
    "Follow", "FollowCreate", "FollowResponse", "FollowStats",
    
    # Notification models
    "Notification", "NotificationCreate", "NotificationResponse", "NotificationStats",
    "NotificationPreferences", "NotificationPreferencesUpdate",
    
    # Category models
    "Category", "Subcategory", "CategoryItem", "CategoryCreate", "CategoryUpdate",
    "CategoryResponse", "SubcategoryCreate", "SubcategoryResponse", "CategoryWithSubcategories",
    
    # Story models
    "Story", "StoryCreate", "StoryUpdate", "StoryResponse", "StoryView", "StoryReaction", "StoryComment",
    "StoryReactionType", "StoriesFeedResponse", "StoryStatsResponse"
]
