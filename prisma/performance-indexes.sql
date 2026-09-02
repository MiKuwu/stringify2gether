-- Apply once to an existing database after reviewing the target DATABASE_URL:
-- npx prisma db execute --file prisma/performance-indexes.sql --schema prisma/schema.prisma

CREATE INDEX IF NOT EXISTS "Follows_followingId_idx" ON "Follows"("followingId");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "Post_status_createdAt_idx" ON "Post"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_categoryId_status_createdAt_idx" ON "Post"("categoryId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Media_postId_idx" ON "Media"("postId");
CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "CommentVote_commentId_idx" ON "CommentVote"("commentId");
CREATE INDEX IF NOT EXISTS "Like_postId_idx" ON "Like"("postId");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
