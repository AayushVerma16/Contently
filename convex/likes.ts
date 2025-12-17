// convex/likes.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if current user has liked a post
export const hasUserLiked = query({
  args: { 
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Get current user from auth, not from args
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false; // Not authenticated, so can't have liked
    }

    // Get the Convex user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return false;
    }

    // Check if like exists
    const like = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    return !!like;
  },
});

// Toggle like on a post
export const toggleLike = mutation({
  args: { 
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to like posts");
    }

    // Get the Convex user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    if (existingLike) {
      // Unlike: delete the like
      await ctx.db.delete(existingLike._id);
      
      // Decrement like count
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });

      return { liked: false };
    } else {
      // Like: create the like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: user._id,
        createdAt: Date.now(),
      });

      // Increment like count
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });

      return { liked: true };
    }
  },
});

// Get all users who liked a post
export const getPostLikes = query({
  args: { 
    postId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .take(limit);

    // Get user details for each like
    const likesWithUsers = await Promise.all(
      likes.map(async (like) => {
        if (!like.userId) return null;
        
        const user = await ctx.db.get(like.userId);
        if (!user) return null;

        return {
          _id: like._id,
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
          },
          createdAt: like.createdAt,
        };
      })
    );

    return likesWithUsers.filter((like) => like !== null);
  },
});