"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, UserPlus, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import PostCard from "@/components/post-card";
import PublicHeader from "./_components/public-header";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  // Unwrap params Promise using React.use()
  const { username } = use(params);
  const { user: currentUser } = useUser();

  // Prevent reserved routes from being treated as usernames
  const reservedRoutes = ['feed', 'dashboard', 'sign-in', 'sign-up', 'api'];
  if (reservedRoutes.includes(username.toLowerCase())) {
    notFound();
  }

  // Get user profile
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useConvexQuery(api.users.getByUsername, { username });

  // Get user's posts
  const { data: postsData, isLoading: postsLoading } = useConvexQuery(
    api.public.getPublishedPostsByUsername,
    { username, limit: 20 }
  );

  // Get follower count - only query if user exists
  const { data: followerCount } = useConvexQuery(
    api.follows.getFollowerCount,
    user ? { userId: user._id } : { userId: undefined }
  );

  // Check if current user is following this profile - only query if both users exist
  const { data: isFollowing } = useConvexQuery(
    api.follows.isFollowing,
    user ? { followingId: user._id } : { followingId: undefined }
  );

  // Follow mutation
  const { mutate: toggleFollowMutate, isLoading: isToggling } = useConvexMutation(
    api.follows.toggleFollow
  );

  if (userLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    notFound();
  }

  const posts = postsData?.posts || [];
  const isOwnProfile =
    currentUser && currentUser.publicMetadata?.username === user.username;

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      const result = await toggleFollowMutate({ followingId: user._id });
      if (result?.following) {
        toast.success("Successfully followed!");
      } else {
        toast.success("Successfully unfollowed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update follow status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <PublicHeader link="/" title="Back to Home" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.name}
                fill
                className="rounded-full object-cover border-2 border-slate-700"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-2 gradient-text-primary">
            {user.name}
          </h1>

          <p className="text-xl text-slate-400 mb-4">@{user.username}</p>

          {/* Follow Button */}
          {!isOwnProfile && currentUser && (
            <Button
              onClick={handleFollowToggle}
              disabled={isToggling}
              variant={isFollowing ? "outline" : "default"}
              className="mb-4"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          )}

          <div className="flex items-center justify-center text-sm text-slate-500">
            <Calendar className="h-4 w-4 mr-2" />
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{posts.length}</div>
            <div className="text-sm text-slate-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {followerCount || 0}
            </div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {posts
                .reduce((acc, post) => acc + post.viewCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {posts
                .reduce((acc, post) => acc + post.likeCount, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Likes</div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Posts</h2>

          {posts.length === 0 ? (
            <Card className="card-glass">
              <CardContent className="text-center py-12">
                <p className="text-slate-400 text-lg">No posts yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  Check back later for new content!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={false}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}