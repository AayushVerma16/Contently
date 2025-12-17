// convex/comments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get comments for a post
export const getPostComments = query({
  args: { 
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_status", (q) =>
        q.eq("postId", args.postId).eq("status", "approved")
      )
      .order("desc")
      .collect();

    // Get author details for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        let author = null;
        
        if (comment.authorId) {
          const user = await ctx.db.get(comment.authorId);
          if (user) {
            author = {
              _id: user._id,
              name: user.name,
              username: user.username,
              imageUrl: user.imageUrl,
            };
          }
        }

        return {
          _id: comment._id,
          postId: comment.postId,
          authorId: comment.authorId,
          content: comment.content,
          status: comment.status,
          createdAt: comment.createdAt,
          author,
        };
      })
    );

    return commentsWithAuthors;
  },
});

// Add a comment to a post
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to comment");
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

    // Validate content
    if (!args.content.trim()) {
      throw new Error("Comment cannot be empty");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment is too long (max 1000 characters)");
    }

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
      content: args.content.trim(),
      status: "approved", // Auto-approve for now
      createdAt: Date.now(),
    });

    return { commentId };
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to delete comments");
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

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Get the post to check if user is the post author
    const post = await ctx.db.get(comment.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user is comment author or post author
    if (comment.authorId !== user._id && post.authorId !== user._id) {
      throw new Error("Not authorized to delete this comment");
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});

// Update comment status (for moderation)
export const updateCommentStatus = mutation({
  args: {
    commentId: v.id("comments"),
    status: v.union(
      v.literal("approved"),
      v.literal("pending"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
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

    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Get the post to check if user is the post author
    const post = await ctx.db.get(comment.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Only post author can moderate comments
    if (post.authorId !== user._id) {
      throw new Error("Not authorized to moderate this comment");
    }

    // Update status
    await ctx.db.patch(args.commentId, {
      status: args.status,
    });

    return { success: true };
  },
});